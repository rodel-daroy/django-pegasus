import logging
import re
from datetime import datetime, timedelta, timezone, date
from django.core import mail
from django.db import IntegrityError
import pyzmail
import quopri

from celery import shared_task
from imap_tools import AND, MailBox, MailBoxFolderManager, H
from apps.teams.models import Team

from sentry_sdk import capture_exception
from apps.campaign.models import Campaign, EmailInbox, EmailOutbox
from apps.campaign.tasks import trigger_lead_catcher, update_leads_log
from django.core.mail.backends.smtp import EmailBackend
from django.utils.timezone import now
from imapclient import IMAPClient, ANSWERED
from imapclient.exceptions import LoginError

from apps.mailaccounts.models import (
    CalendarStatus,
    EmailAccount,
    SendingCalendar,
    WarmingMailTemplate,
    WarmingStatus,
    WarmingStatus,
    WarmingMailReport,
)
from mail.settings import (
    DEFAULT_WARMUP_FOLDER,
    DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX,
    DEFAULT_WARMUP_REPLAY_SEARCH_DAYS,
)

from apps.mailaccounts.utils.email_warmer import (
    email_warming_process,
    # email_warming_response_process,
    validate_for_scan,
    is_able_to_replay,
    how_many_can_replay,
    valid_folder,
)

from apps.mailaccounts.utils.sending_calendar import (
    calendar_sent,
    can_send_email,
)
from apps.mailaccounts.utils.smtp import (
    disable_email_account,
    generate_providers_data,
    get_emails_to_send,
    get_sending_address,
    handle_failed_email,
    send_mail_with_smtp,
    check_email_format,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_bcc_email_address(send_mail: dict) -> list:
    try:
        campaign = Campaign.objects.filter(id=send_mail["camp_id"]).get()
        team = Team.objects.filter(members__in=[campaign.assigned]).get()
        if not team:
            return ""
        return team.bcc_email
    except Exception as e:
        capture_exception(e)
        logger.debug(f"No Email inbox or error in bcc calculation {e}")
        return ""


@shared_task
def email_warmer():
    # email_warming_response_process()
    for account in (
        WarmingStatus.objects.filter(
            warming_enabled=True, mail_account__has_error=False
        )
        .select_related("mail_account")
        .iterator()
    ):
        scan_emails.delay(account.mail_account.id)


@shared_task
def scan_emails(mail_account_id: int):
    from apps.mailaccounts.utils.email_warmer import (
        update_warming_report,
        is_spam_folder,
    )

    """Scans provided email account

    Args:
        mail_account (WarmingStatus): WarmingStatus contains all the data required for the operation like SMTP and IMAP details
    """
    try:
        mail_account: EmailAccount = EmailAccount.objects.get(pk=mail_account_id)
        logger.info(
            f"Scaning emails for {mail_account.imap_username} .........................."
        )
    except Exception as e:
        capture_exception(e)
        logger.debug(f"Error in mail account:{mail_account_id}: {e}")
        return

    try:
        # IMAP client
        client = IMAPClient(
            mail_account.imap_host,
            port=mail_account.imap_port,
            ssl=mail_account.use_imap_ssl,
        )

        # IMAP Client logging in
        client.login(mail_account.imap_username, mail_account.imap_password)
        logger.info(f"...IMAP Logged In")

        # Django default emain backend object
        dj_email_backend = EmailBackend(
            host=mail_account.smtp_host,
            port=mail_account.smtp_port,
            username=mail_account.smtp_username,
            password=mail_account.smtp_password,
            use_tls=mail_account.use_smtp_ssl,
            use_ssl=False,
            timeout=20,
        )
        # SMTP Logging in
        dj_email_backend.open()
        logger.info(f"...SMTP Logged In")

        # get all the accessible folders from the mail account
        folders = client.list_folders()
        # get / create-get stat object for current date

        try:
            wes, _ = WarmingMailReport.objects.get_or_create(
                mail_account_id=mail_account.id,
                created_date=datetime.today(),
                type_report=WarmingMailReport.TYPE_REPORT_OPTIONS.RECEIVE,
            )
        except IntegrityError as error:
            logger.debug(f"Found IntegrityError : {mail_account} {error}")
            wes = WarmingMailReport.objects.filter(
                mail_account_id=mail_account.id,
                created_date=datetime.today(),
                type_report=WarmingMailReport.TYPE_REPORT_OPTIONS.RECEIVE,
            ).first()

        if not wes:
            # if WarmingMailReport not found then return
            logger.debug(f"Enable to found WarmingMailReport : {mail_account}")
            capture_exception(
                Exception(f"Enable to found WarmingMailReport : {mail_account}")
            )
            return

        # warming status
        was, _ = WarmingStatus.objects.get_or_create(mail_account=mail_account)
        # calculate how many can reply to
        number_limit_to_replay = how_many_can_replay(wes.replies, wes.last_reply, was)
        emails_replied = 0
        # Iterating each mainbox
        for folder in folders:
            # skip folder if flags is '\\Noselect'
            if not valid_folder(folder[0]):
                continue

            # folder[2], the third element is the folder name
            f = folder[2]
            # validating folder name before scaning,
            # for example we should not scan DELETED/DRAFT/SENT/mailerrie,
            # or any folder that is mapped to some other SMTP
            if validate_for_scan(f):
                logger.info(f"...Scanning <{f}> folder .......")

                # How many email can sent

                # selecting specific folder to scan
                client.select_folder(f)

                # we're searching for any email in the selected folder
                # that have "mailerrize" in subject but not with "Re:".
                # This to avoid making reply to any email that has been already responded.\
                # Date to filter in the database

                date_filter = (
                    date.today() - timedelta(days=DEFAULT_WARMUP_REPLAY_SEARCH_DAYS)
                ).strftime("%d-%b-%Y")

                emails = client.search(
                    [
                        ["SUBJECT", DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX],
                        ["NOT", ["SUBJECT", "Re:"]],
                        ["SINCE", date_filter],
                    ]
                )
                total_emails_count = len(emails)
                logger.info(f"......found {total_emails_count} emails")
                # Iterating emails and fetching email specific details

                if number_limit_to_replay:
                    for e in emails:

                        logger.info(f".........Extracting details from for {e}")
                        # raw email body
                        rawflags = client.fetch(e, ["FLAGS"])
                        if not is_able_to_replay(rawflags[e][b"FLAGS"]):
                            continue
                        rawmsg = client.fetch(e, ["BODY[]"])
                        # message from raw email body
                        _message = pyzmail.PyzMessage.factory(rawmsg[e][b"BODY[]"])

                        # subject line
                        _subject = " ".join(_message.get_subject().split())
                        _reply_to = _message.get_addresses("from")
                        if (
                            _subject.find("Re:") != -1
                            or _reply_to[0][0] == mail_account.imap_username
                        ):
                            continue
                        try:
                            # reply to (email sent from)
                            _reply_mail_accounts = EmailAccount.objects.filter(
                                email=_reply_to[0][0]
                            ).all()
                            for _reply_to_mail_account in _reply_mail_accounts:
                                wes_sent, _ = WarmingMailReport.objects.get_or_create(
                                    mail_account_id=_reply_to_mail_account.id,
                                    created_date=datetime.today(),
                                    type_report=WarmingMailReport.TYPE_REPORT_OPTIONS.SENT,
                                )
                                update_warming_report(wes_sent, f)
                        except Exception as e:
                            capture_exception(e)
                            # logger.debug(error)
                            logger.debug(f"Don't exits the emails {_reply_to[0][0]}")

                        if emails_replied < number_limit_to_replay:
                            # message id (VERY IMPORTANT) to mimic a reply as threaded mail
                            _message_id = " ".join(
                                _message.get_decoded_header("message-id").split()
                            )
                            # making email reply

                            make_warming_reply(
                                dj_email_backend,
                                mail_account.first_name,
                                mail_account.last_name,
                                mail_account.email,
                                _message,
                                _subject,
                                [_reply_to[0][0]],
                                _message_id,
                            )
                            client.set_flags([e], [ANSWERED])
                            emails_replied += 1
                            wes.last_reply = datetime.now()

                # updating Warming email stats
                if f != "INBOX" and f != DEFAULT_WARMUP_FOLDER:
                    # find all emails moved to inbox recently and moved to INBOX folder
                    emails_in_f_folder = client.search(
                        [["SUBJECT", DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX]]
                    )

                    # Moving email to inbox
                    total_saved = len(emails_in_f_folder)
                    if total_saved > 0:
                        logger.info(f".........Moving email to INBOX")
                        client.move(emails_in_f_folder, "INBOX")

                    if is_spam_folder(f):
                        wes.saved_from_spam = wes.saved_from_spam + total_saved
                    else:
                        wes.saved_from_other_categories = (
                            wes.saved_from_other_categories + total_saved
                        )

                # selecting INBOX folder
                client.select_folder("INBOX")

                # find all emails moved to inbox recently and moved to INBOX folder
                emails_in_inbox = client.search(
                    [["SUBJECT", DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX]]
                )

                # Moving email from INBOX to mailerrize folder
                if len(emails_in_inbox) > 0:
                    logger.info(
                        f".........Moving email to {DEFAULT_WARMUP_FOLDER} {len(emails_in_inbox)}"
                    )
                    client.move(emails_in_inbox, DEFAULT_WARMUP_FOLDER)
                    wes.saved_from_inbox = wes.saved_from_inbox + len(emails_in_inbox)

        wes.replies += number_limit_to_replay
        wes.save()

        # IMAP Client logout
        client.logout()
        # Django Email Backend SMTP logout
        dj_email_backend.close()
    except LoginError as e:
        disable_email_account(mail_account)
        logger.debug(f"Mail account has wrong credentials : {mail_account}")
        capture_exception(e)
    except OSError as e:

        capture_exception(e)
        logger.debug(f"Mail account is invalid : {mail_account}")
    except ConnectionError as e:
        capture_exception(e)
        logger.debug(f"Connection aborted : {mail_account}")
    except Exception as e:
        capture_exception(e)
        logger.debug(f"General error with the mail account:{mail_account}: {e}")


def make_warming_reply(
    eb: EmailBackend,
    first_name: str,
    last_name: str,
    from_address: str,
    org_message: str,
    org_subject: str,
    org_reply_to: str,
    org_message_id: str,
):
    """[summary]

    Args:
        eb (EmailBackend): Django Email Backend object
        first_name (str): SMTP user first name
        last_name (str): SMTP user first name
        from_address (str): SMTP user email address
        org_message (str): Original message that was recieved
        org_subject (str): Original subject that was recieved
        org_reply_to (str): Email sender email address
        org_message_id (str): Original message id that was recieved with the email
    """

    org_reply_to = list(filter(lambda email: check_email_format(email), org_reply_to))

    template = WarmingMailTemplate.objects.order_by("?").first()
    message_body = template.content

    # message to sent
    message_body = f"<html><body>Thank you for your email. <br/><br/>{message_body}<br/><br/>{first_name}</body></html>"

    # creating message with all the parameters and additional headers
    msg = mail.EmailMultiAlternatives(
        subject="Re: " + org_subject,
        body=message_body,
        from_email=from_address,
        to=org_reply_to,
        reply_to=[from_address],
        headers={"In-Reply-To": org_message_id, "References": org_message_id},
    )

    # attaching text messsage
    msg.attach_alternative(message_body, "text/html")

    # sending message
    eb.send_messages([msg])
    logger.info("............Reply has been made.")


@shared_task
def send_email_out(outbox_email_id: int):
    """Celery task for sending emails out"""
    outbox_email = EmailOutbox.objects.select_related(
        "campaign", "recipient", "email"
    ).get(pk=outbox_email_id)

    # also validates calendar because this task is called in different times
    sending_calendar = SendingCalendar.objects.select_related("calendarstatus").get(
        mail_account_id=outbox_email.from_email.id
    )
    if outbox_email.campaign.campaign_status and can_send_email(
        sending_calendar, sending_calendar.calendarstatus
    ):
        outbox_email.from_email = get_sending_address(
            outbox_email.from_email_id, outbox_email.campaign_id
        )
        if not outbox_email.from_email:
            # Delete the EmailOutbox entry that fails
            outbox_email.status = 2
            outbox_email.save()
        else:
            # Send email
            from_email_str = "{0} {1} <{2}>".format(
                outbox_email.from_email.first_name.replace("@", "_at_"),
                outbox_email.from_email.last_name.replace("@", "_at_"),
                outbox_email.from_email.email,
            )
            result = send_mail_with_smtp(
                host=outbox_email.from_email.smtp_host,
                port=outbox_email.from_email.smtp_port,
                username=outbox_email.from_email.smtp_username,
                password=outbox_email.from_email.smtp_password,
                use_tls=outbox_email.from_email.use_smtp_ssl,
                from_email=from_email_str,
                to_email=[outbox_email.recipient.email],
                subject=outbox_email.email_subject,
                body=outbox_email.email_body,
                uuid=outbox_email.id,
                track_opens=outbox_email.campaign.track_opens,
                track_linkclick=outbox_email.campaign.track_linkclick,
                bcc=[outbox_email.bcc_mail] if outbox_email.bcc_mail != "" else None,
                tracking_domain=outbox_email.campaign.assigned.tracking_domain,
            )

            if result:

                logger.debug(
                    f".........Email sent from {from_email_str} to {outbox_email.recipient.email}"  # noqa: E501
                )

                # Increase the Recipient sent number
                outbox_email.recipient.sent += 1
                outbox_email.recipient.save()

                # Update EmailOutbox status
                outbox_email.sent_date = datetime.now(timezone.utc).date()
                outbox_email.sent_time = datetime.now(timezone.utc).time()
                outbox_email.status = 1
                outbox_email.save()

                # calendar_sent(sending_calendar.calendarstatus)

            else:

                logger.error(
                    f".........Failed to send from {outbox_email.from_email.email} to {outbox_email.recipient.email}"  # noqa: E501
                )
                outbox_email.from_email = handle_failed_email(
                    outbox_email.campaign, outbox_email.from_email
                )


# TODO Delete this method
# @shared_task
# def process_outbox_emails():
#     """This shared task prcesses outbox emails"""
#     # # iterating email outbox
#     for outbox in (
#         EmailOutbox.objects.filter(
#             status=0,
#             campaign__campaign_status=True,
#         )
#         .all()
#         .iterator()
#     ):
#         send_email_out(outbox_id=outbox.id)


@shared_task
def process_campaign_separately(campaign_id):
    campaign = Campaign.objects.get(id=campaign_id)

    logger.debug(
        f'......Processing "{campaign.title}" campaign (for {campaign.assigned.get_full_name()})'  # noqa: E501
    )
    # get all mail accounts associated with campaign
    mail_accounts = campaign.from_address.filter(has_error=False)

    # get errors mail accounts count associated with campaign
    total_mail_account_count_having_error = campaign.from_address.filter(
        has_error=True
    ).count()

    if total_mail_account_count_having_error:
        logger.debug(
            f".........Errors: {total_mail_account_count_having_error} mail accounts has errors"
        )

    logger.debug(f".........Found {mail_accounts.count()} mail accounts without errors")
    for mail_account in mail_accounts.iterator():

        sending_calendar = mail_account.get_sending_calendar()
        calendar_status = sending_calendar.get_calendar_status()

        # validate sending schedule with calendar status to
        # check if campaign emails can be sent in turn
        if can_send_email(sending_calendar, calendar_status):

            # calculate how many emails can be sent in this turn
            mail_limit = (
                sending_calendar.max_emails_per_day - calendar_status.sent_count
            )

            if mail_limit > sending_calendar.max_emails_to_send:
                mail_limit = sending_calendar.max_emails_to_send

            logger.debug(f".........Remaining mail-limit {mail_limit} each batch")

            # prepare emails sending list
            sending_objects = get_emails_to_send(mail_account.id, mail_limit, campaign)

            if len(sending_objects) == 0:
                logger.debug(
                    f"...Nothing to process, got {len(sending_objects)} sending objects."  # noqa: E501
                )
                continue

            logger.debug(f"...Got {len(sending_objects)} emails scheduled to send.")
            logger.info(sending_objects)

            for sending_item in sending_objects:
                send_email_out(sending_item.id)

            # update sending calendar timestamps
            for sending_item in sending_objects:
                calendar_status = CalendarStatus.objects.get(
                    sending_calendar__mail_account_id=sending_item.from_email.id  # noqa: E501
                )
                calendar_sent(calendar_status)

        else:
            logging.info(
                f"............Can not send emails in this turn for {mail_account.email}"  # noqa: E501
            )


@shared_task
def process_scheduled_campaign_emails():
    """This method sends scheduled campaign emails"""

    logger.debug(
        "Campaign scheduled emails process started .................................... "  # noqa: E501
    )
    campaigns = Campaign.objects.filter(
        campaign_status=True, is_draft=False, is_deleted=False
    )
    total_campaigns_count = campaigns.count()
    logger.debug(f"...Found {total_campaigns_count} active campaigns")

    # iterating campaigns
    for campaign in campaigns.iterator():
        process_campaign_separately(campaign.id)


def _prase_outbox_id(html):
    try:
        outbox_id = re.findall(r"\<td.+opacity:(\d+)", html)
        outbox_id = (
            outbox_id if outbox_id else re.findall(r"\<td.+opacity: (\d+)", html)
        )
        return outbox_id[0] if outbox_id else None
    except Exception as e:
        capture_exception(e)
        return None


@shared_task
def campaign_emails_responses_lookup():
    logger.debug(
        "Campaign emails responses lookup process started........................."  # noqa: E501
    )

    mail_accounts = (
        EmailAccount.objects.filter(has_error=False)
        .exclude(imap_username__exact="")
        .exclude(imap_username__isnull=True)
    )

    # TODO-DONE:
    for mail_account in (
        EmailAccount.objects.filter(has_error=False)
        .exclude(imap_username__exact="")
        .exclude(imap_username__isnull=True)
        .iterator()
    ):
        if (
            not mail_account.imap_host
            or not mail_account.imap_port
            or not mail_account.imap_username
            or not mail_account.imap_password
        ):
            continue
        try:
            generate_providers_data(mail_account)
            with MailBox(
                host=mail_account.imap_host, port=mail_account.imap_port
            ).login(mail_account.imap_username, mail_account.imap_password) as mailbox:
                mailbox_folders = MailBoxFolderManager(mailbox).list()
                for mailbox_folder in mailbox_folders:
                    # skip folder if flags is '\\Noselect'
                    if not valid_folder(mailbox_folder["flags"]):
                        continue

                    folder_name = mailbox_folder["name"]
                    if validate_for_scan(mailbox_folder["name"]):
                        logger.debug(f"...Scanning <{folder_name}> folder .......")
                        mailbox.folder.set(folder_name)
                        for msg in mailbox.fetch(
                            criteria=AND(seen=False), mark_seen=False
                        ):
                            outbox_id = _prase_outbox_id(msg.html)
                            if not outbox_id:
                                continue
                            try:
                                outbox = EmailOutbox.objects.get(id=outbox_id)
                            except Exception as e:
                                logger.debug(e)
                                continue

                            inbox = EmailInbox()
                            inbox.outbox = outbox
                            inbox.recipient_email_id = inbox.outbox.recipient_id
                            inbox.from_email_id = inbox.outbox.from_email_id

                            inbox.email_subject = msg.subject
                            inbox.email_body = msg.html
                            inbox.status = 0
                            inbox.receive_date = datetime.now().date()
                            inbox.receive_time = datetime.now().time()
                            inbox.save()

                            if inbox.recipient_email:
                                inbox.recipient_email.replies += 1
                                inbox.recipient_email.save()

                            # Lead checking
                            if inbox.outbox:
                                trigger_lead_catcher(
                                    inbox.outbox.campaign_id,
                                    inbox.outbox.recipient_id,
                                )
                                update_leads_log(
                                    inbox.outbox.recipient_id,
                                    "replied",
                                    inbox_id=inbox.id,
                                )

                            logger.debug(f"Email received from {msg.from_} to {msg.to}")

                mail_account.has_error = False
                mail_account.error_was_notified = False
                mail_account.save()
        except LoginError as e:
            disable_email_account(mail_account)
            logger.debug(f"Mail account has wrong credentials : {mail_account}")
            capture_exception(e)
        except OSError:
            capture_exception(e)
            logger.debug(f"Mail account is invalid : {mail_account}")
        except ConnectionError as e:
            capture_exception(e)
            logger.debug(f"Connection aborted : {mail_account}")
        except Exception as e:
            capture_exception(e)
            logger.debug(f"General error with the mail account:{mail_account}: {e}")


@shared_task
def bounce_campaign_emails():
    logger.debug("Bounce Campaign emails process started.........................")

    for mail_account in (
        EmailAccount.objects.filter(has_error=False)
        .exclude(imap_username__exact="")
        .exclude(imap_username__isnull=True)
        .iterator()
    ):
        if (
            not mail_account.imap_host
            or not mail_account.imap_port
            or not mail_account.imap_username
            or not mail_account.imap_password
        ):
            continue
        try:
            generate_providers_data(mail_account)
            with MailBox(
                host=mail_account.imap_host, port=mail_account.imap_port
            ).login(mail_account.imap_username, mail_account.imap_password) as mailbox:
                mailbox_folders = MailBoxFolderManager(mailbox).list()
                for mailbox_folder in mailbox_folders:
                    # skip folder if flags is '\\Noselect'
                    if not valid_folder(mailbox_folder["flags"]):
                        continue
                    # if folder name is invalid
                    if not validate_for_scan(mailbox_folder["name"]):
                        continue
                    folder_name = mailbox_folder["name"]
                    logger.debug(f"...Scanning <{folder_name}> folder .......")
                    mailbox.folder.set(folder_name)
                    condition = AND(header=H("x-failed-recipients", "@"))
                    if mail_account.bounce_last_sync:
                        condition = AND(
                            header=H("x-failed-recipients", "@"),
                            date_gte=mail_account.bounce_last_sync.date(),
                        )
                    for msg in mailbox.fetch(condition, mark_seen=False):
                        if "failure" not in msg.subject.lower():
                            continue
                        # logic of bounce email
                        logger.debug(f".......Bounce Email Found")
                        payloads = "".join(
                            [
                                str(quopri.decodestring(str(payload_data)))
                                for payload_data in msg.obj.get_payload()
                            ]
                        )
                        outbox_id = _prase_outbox_id(payloads)
                        if not outbox_id:
                            continue
                        try:
                            outbox = EmailOutbox.objects.get(id=outbox_id)
                        except Exception as e:
                            logger.debug(
                                f"Unable to found EmailOutbox (Skipping it) : {e}"
                            )
                            continue
                        if outbox.bounced == 0 and outbox.status == 1:
                            outbox.bounced = 1
                            outbox.recipient.bounces = outbox.recipient.bounces + 1
                            outbox.recipient.save()
                            outbox.save()
                            update_drip_and_followup_bounce_email(
                                outbox
                            )  # updated the bounce email
                            logger.debug(
                                f".......Bounce email save {outbox.id} outbox (from {msg.from_} to {msg.to})"
                            )
                mail_account.has_error = False
                mail_account.bounce_last_sync = now()  # set the bounce_last_sync
                mail_account.error_was_notified = False
                mail_account.save()
        except LoginError as e:
            disable_email_account(mail_account)
            logger.debug(f"Mail account has wrong credentials : {mail_account}")
            capture_exception(e)
        except OSError as e:
            capture_exception(e)
            logger.debug(f"Mail account is invalid : {mail_account}")
        except ConnectionError as e:
            capture_exception(e)
            logger.debug(f"Connection aborted : {mail_account}")
        except Exception as e:
            capture_exception(e)
            logger.debug(f"General error with the mail account:{mail_account}: {e}")


def update_drip_and_followup_bounce_email(outbox: EmailOutbox):
    for email_outbox in EmailOutbox.objects.filter(
        campaign=outbox.campaign,
        from_email=outbox.from_email,
        recipient=outbox.recipient,
        status=0,
        bounced=0,
        is_campaign=True,
    ):
        email_outbox.status = 1
        email_outbox.bounced = 1
        # email_outbox.recipient.bounces = email_outbox.recipient.bounces + 1  # it will increase the total
        # email_outbox.recipient.save()
        email_outbox.save()


@shared_task
def warming_trigger():
    email_warming_process()


@shared_task
def warming_days_counter():
    """
    # OLD CODE
    # Get warming enabled accounts
    enabled_accounts = WarmingStatus.objects.filter(
        warming_enabled=True
    ).select_related("mail_account")

    for item in enabled_accounts:
        item.days_passed += 1
        item.save()
    """

    from django.db.models import F

    WarmingStatus.objects.filter(warming_enabled=True).update(
        days_passed=F("days_passed") + 1
    )
