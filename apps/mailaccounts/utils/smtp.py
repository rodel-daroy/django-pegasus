from apps.users.models import CustomUser
from typing import Optional
from itertools import chain
import watchtower
from django.db.models.query import QuerySet
from ...mailaccounts.models import EmailAccount
import email
import imaplib
import json
import re
import smtplib
from django.template.loader import render_to_string
from datetime import timedelta, datetime
import functools
import logging
from django.core.mail import send_mail

from django.conf import settings
from django.core import mail
from django.core.mail.backends.smtp import EmailBackend
from sentry_sdk import capture_exception

from apps.campaign.models import (
    Campaign,
    EmailOutbox,
)
from apps.mailaccounts.utils.tracking import add_tracking
from mail.settings import (
    DEFAULT_WARMUP_FOLDER,
    DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX,
)

from apps.unsubscribes.models import UnsubscribeEmail

logger = logging.getLogger(__name__)
pattern_uid = re.compile(r".*\d+ \(UID (?P<uid>\d+)\).*")

GOOGLE_SMTP_HOST = "smtp.gmail.com"
GOOGLE_SMTP_PORT = "587"
GOOGLE_SMTP_USE_TLS = True
GOOGLE_IMAP_HOST = "imap.gmail.com"
GOOGLE_IMAP_PORT = "993"
GOOGLE_IMAP_USE_TLS = True

MICROSOFT_SMTP_HOST = "smtp.office365.com"
MICROSOFT_SMTP_PORT = "587"
MICROSOFT_SMTP_USE_TLS = True
MICROSOFT_IMAP_HOST = "outlook.office365.com"
MICROSOFT_IMAP_PORT = "993"
MICROSOFT_IMAP_USE_TLS = True


def generate_providers_data(data) -> dict:
    if type(data) == dict:
        if data["email_provider"] == "Google":
            data["smtp_host"] = GOOGLE_SMTP_HOST
            data["smtp_port"] = GOOGLE_SMTP_PORT
            data["use_smtp_ssl"] = GOOGLE_SMTP_USE_TLS
            data["smtp_username"] = data["email"]
            data["smtp_password"] = data["password"]

            data["imap_host"] = GOOGLE_IMAP_HOST
            data["imap_port"] = GOOGLE_IMAP_PORT
            data["use_imap_ssl"] = GOOGLE_IMAP_USE_TLS
            data["imap_username"] = data["email"]
            data["imap_password"] = data["password"]
        elif data["email_provider"] == "Microsoft":
            data["smtp_host"] = MICROSOFT_SMTP_HOST
            data["smtp_port"] = MICROSOFT_SMTP_PORT
            data["use_smtp_ssl"] = MICROSOFT_SMTP_USE_TLS
            data["smtp_username"] = data["email"]
            data["smtp_password"] = data["password"]

            data["imap_host"] = MICROSOFT_IMAP_HOST
            data["imap_port"] = MICROSOFT_IMAP_PORT
            data["use_imap_ssl"] = MICROSOFT_IMAP_USE_TLS
            data["imap_username"] = data["email"]
            data["imap_password"] = data["password"]
    elif type(data) == EmailAccount:

        if data.email_provider == "Google":
            data.smtp_host = GOOGLE_SMTP_HOST
            data.smtp_port = GOOGLE_SMTP_PORT
            data.use_smtp_ssl = GOOGLE_SMTP_USE_TLS
            data.smtp_username = data.email
            # data['smtp_password']

            data.imap_host = GOOGLE_IMAP_HOST
            data.imap_port = GOOGLE_IMAP_PORT
            data.use_imap_ssl = GOOGLE_IMAP_USE_TLS
            data.imap_username = data.email
            data.imap_password = data.password
        elif data.email_provider == "Microsoft":
            data.smtp_host = MICROSOFT_SMTP_HOST
            data.smtp_port = MICROSOFT_SMTP_PORT
            data.use_smtp_ssl = MICROSOFT_SMTP_USE_TLS
            data.smtp_username = data.email
            data.smtp_password = data.password

            data.imap_host = MICROSOFT_IMAP_HOST
            data.imap_port = MICROSOFT_IMAP_PORT
            data.use_imap_ssl = MICROSOFT_IMAP_USE_TLS
            data.imap_username = data.email
            data.imap_password = data.password


def check_email(request):
    generate_providers_data(request.data)
    print(request.data)
    # Check SMTP
    if request.data["smtp_host"]:
        if not check_smtp(
            server=request.data["smtp_host"],
            port=request.data["smtp_port"],
            use_tls=request.data["use_smtp_ssl"],
            user=request.data["smtp_username"],
            password=request.data["smtp_password"],
        ):
            return False, "SMTP test failed."

    # Check IMAP
    if request.data["imap_host"]:
        if not check_imap(
            server=request.data["imap_host"],
            port=request.data["imap_port"],
            use_tls=request.data["use_imap_ssl"],
            user=request.data["imap_username"],
            password=request.data["imap_password"],
        ):
            return False, "IMAP test failed."

    return True, "Success"


def check_smtp(server, port, use_tls, user, password):
    try:
        server = smtplib.SMTP(server, port)
        if use_tls:
            server.starttls()
        server.ehlo()
        server.login(user, password)
        server.quit()
        return True
    except Exception as e:
        capture_exception(e)
        logger.info(f"Error validating smtp email: {user} -> {e}")
        return False


def check_imap(server, port, use_tls, user, password):
    imaplib.info = 4

    server = imaplib.IMAP4_SSL(server, port)

    try:
        rv, data = server.login(user, password)
    except Exception as e:
        capture_exception(e)
        logger.info(f"Error validating imap email: {user} -> {e}")
        return False

    server.logout()
    return True


def send_mail_with_smtp(
    host,
    port,
    username,
    password,
    use_tls,
    from_email,
    to_email,
    subject,
    body,
    uuid,
    track_opens,
    track_linkclick,
    bcc=None,
    tracking_domain=None,
):
    body = f'<html><body>{body}<table><tr><td style="opacity: {uuid};"></td></tr></table></body></html>'  # noqa: E501
    tracking_body = add_tracking(
        body, uuid, track_opens, track_linkclick, tracking_domain
    )
    try:
        eb = EmailBackend(
            host=host,
            port=port,
            username=username,
            password=password,
            use_tls=use_tls,
            use_ssl=False,
            timeout=20,
        )
        eb.open()

        logger.info("Django connected to the SMTP server")
        msg = mail.EmailMultiAlternatives(
            subject=subject,
            body=tracking_body,
            from_email=from_email,  # noqa: E501
            to=to_email,
            reply_to=[from_email],
            bcc=bcc,
        )
        msg.attach_alternative(tracking_body, "text/html")

        eb.send_messages([msg])

        logger.info("Email has been sent.")

        eb.close()
        logger.info("SMTP server closed")

        return True

    except Exception as _error:
        capture_exception(_error)

        logger.error("Error in sending mail >> {}".format(_error))

    return False


def receive_mail_with_imap(
    host, port, username, password, use_tls, mark_seen=False, query=None
):
    if use_tls:
        mail = imaplib.IMAP4_SSL(host, port)
    else:
        mail = imaplib.IMAP4_SSL(host, port)

    try:
        mail.login(username, password)
    except Exception as e:
        capture_exception(e)
        return False

    mail.select("inbox")
    if query:
        status, data = mail.search(*query)
    else:
        status, data = mail.search(None, "(UNSEEN)")

    mail_ids = []
    for block in data:
        mail_ids += block.split()

    emails = []
    for num in mail_ids:
        status, data = mail.fetch(num, "(RFC822)")

        for response_part in data:
            if isinstance(response_part, tuple):
                # we go for the content at its second element
                # skipping the header at the first and the closing
                # at the third
                message = email.message_from_bytes(response_part[1])

                mail_from = message["from"]
                mail_subject = message["subject"]
                mail_datetime = message["date"]

                if message.is_multipart():
                    mail_content = ""

                    for part in message.get_payload():
                        if part.get_content_type() == "text/plain":
                            mail_content += part.get_payload()
                else:
                    mail_content = message.get_payload()

                email_item = {
                    "from": mail_from,
                    "subject": mail_subject,
                    "content": mail_content,
                    "datetime": mail_datetime,
                }
                emails.append(email_item)

        # status, data = mail.store(
        #     num, "+FLAGS" if mark_seen else "-FLAGS", "\\Seen"
        # )

    return emails


def parse_uid(data):
    match = pattern_uid.match(data)
    return match.group("uid")


def move_warmups_from_spam_to_inbox(host, port, username, password, use_tls):
    if use_tls:
        mail = imaplib.IMAP4_SSL(host, port)
    else:
        mail = imaplib.IMAP4_SSL(host, port)

    try:
        mail.login(username, password)
    except Exception as e:
        capture_exception(e)
        return False

    # Check if mailerrize folder exists
    mail.select(DEFAULT_WARMUP_FOLDER)
    if mail.state == "AUTH":
        mail.create(DEFAULT_WARMUP_FOLDER)

    # Select spam folder
    mail.select("spam")
    if mail.state == "AUTH":
        mail.select("junk")
    if mail.state == "AUTH":
        return False

    status, data = mail.search(None, "(UNSEEN)")
    mail_ids = []
    for block in data:
        mail_ids += block.split()

    for num in mail_ids:
        status, data = mail.fetch(num, "(RFC822)")

        is_warmup_email = False

        for response_part in data:
            if isinstance(response_part, tuple):
                # we go for the content at its second element
                # skipping the header at the first and the closing
                # at the third
                message = email.message_from_bytes(response_part[1])

                mail_subject = message["subject"]
                if mail_subject.endswith(
                    DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX
                ) or mail_subject.endswith(
                    f"{DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX}?="
                ):
                    is_warmup_email = True
                break

        mail.store(num, "-FLAGS", "\\Seen")
        if is_warmup_email:
            resp, data = mail.fetch(num, "(UID)")
            msg_uid = parse_uid(f"{data[0]}")

            try:
                result = mail.uid("COPY", msg_uid, DEFAULT_WARMUP_FOLDER)
                if result[0] == "OK":
                    mov, data = mail.uid(
                        "STORE", msg_uid, "+FLAGS", "(\Deleted)"  # noqa: W605
                    )

                    mail.expunge()
            except Exception as e:
                capture_exception(e)
                None


def get_emails_to_send(
    available_email_id: int, email_limit: int, campaing: Campaign
):
    """Function that returns emails to send

    Args:
        available_email_ids (int): id of mails that are going to send emails
        email_limits (int): int that represent if the mail have reached the
        limit of emails by day

    Returns:
        list<{
            camp_id: int,
            from_mail_id: int,
            to_email_id: int,
            email_subject: str,
            email_body:str
            }>: list of dict with the information of the mail to send emails
    """

    result_calculation = schedule_per_email_account(
        available_email_id, email_limit, campaing
    )

    if not result_calculation:
        return result_calculation

    email_sending_limit = getattr(settings, "EMAIL_SENDING_LIMIT", 10)

    return result_calculation[:email_sending_limit]


def get_all_emails(campaign_id: int, email_id: int) -> QuerySet:
    """Return all the mails to from the campaign to send

    Args:
        campaign_id (int): id to campaing to search
        email_id (int): id to email to is going to send the invitation

    Returns:
        outbox_emails: A list of all the outbox emails from the
        current campaign.
    """
    outbox_emails = EmailOutbox.objects.filter(
        campaign_id=campaign_id, status=0, from_email_id=email_id, bounced=0
    ).select_related("campaign", "recipient", "email")

    return outbox_emails


def get_followup_emails(
    outbox_emails: QuerySet,
    followup_emails_count: int,
    email_id: int,
    campaign_id: int,
):
    """get the mails to followup (mails that don't answer the first email)

    Args:
        outbox_emails (QuerySet): list to emails to check if they have to send
        a followup

        followup_emails_count ([type]): [description]

    Returns:
        [EmailOutbox]: List of EmailOutbox
    """
    all_followup_emails = outbox_emails.filter(
        email__email_type=1,
        recipient__leads=0,
    )

    followup_emails = []
    for followup_email in all_followup_emails:
        main_emails = EmailOutbox.objects.filter(
            campaign_id=campaign_id,
            status=1,
            from_email_id=email_id,
            email__email_type=0,
            recipient__email=followup_email.recipient.email,
        ).order_by("-sent_date", "-sent_time")

        if not main_emails.exists() or not main_emails[0].sent_date:
            continue

        last_sent_time = datetime.combine(
            main_emails[0].sent_date, main_emails[0].sent_time
        )

        if followup_email.email.email_order >= 1:
            previous_email_order = followup_email.email.email_order - 1
            previous_follow_email = all_followup_emails.filter(
                recipient__email=followup_email.recipient.email,
                email__email_order=previous_email_order,
            ).order_by("-sent_date", "-sent_time")

            if (
                not previous_follow_email.exists()
                or not previous_follow_email[0].sent_date
            ):
                continue

            last_sent_time = datetime.combine(
                previous_follow_email[0].sent_date,
                previous_follow_email[0].sent_time,
            )

        should_send_time = last_sent_time + timedelta(
            days=followup_email.email.wait_days
        )
        now = datetime.now()
        if should_send_time > now:
            continue

        followup_emails.append(followup_email)

    followup_emails = followup_emails[:followup_emails_count]

    return followup_emails


def get_main_emails(outbox_emails: QuerySet, main_emails_count):
    main_emails = outbox_emails.filter(email__email_type=0)
    main_emails = main_emails[:main_emails_count]

    return main_emails


def get_drip_emails(
    outbox_emails: QuerySet,
    email_id: int,
    campaign_id: int,
):
    """get the drip emails to send

    Args:
        outbox_emails (QuerySet): QuerySet containing every unsent email of
        the current campaign

    Returns:
        [EmailOutbox]: List of EmailOutbox
    """

    all_drip_emails = outbox_emails.filter(
        email__email_type=2,
    )

    drip_emails = []
    for drip_email in all_drip_emails:
        main_emails = EmailOutbox.objects.filter(
            campaign_id=campaign_id,
            status=1,
            from_email_id=email_id,
            email__email_type=0,
            recipient__email=drip_email.recipient.email,
        ).order_by("-sent_date", "-sent_time")

        if not main_emails.exists() or not main_emails[0].sent_date:
            continue

        last_sent_time = datetime.combine(
            main_emails[0].sent_date, main_emails[0].sent_time
        )

        if drip_email.email.email_order >= 1:
            previous_email_order = drip_email.email.email_order - 1
            previous_drip_email = all_drip_emails.filter(
                recipient__email=drip_email.recipient.email,
                email__email_order=previous_email_order,
            ).order_by("-sent_date", "-sent_time")

            if (
                not previous_drip_email.exists()
                or not previous_drip_email[0].sent_date
            ):
                continue

            last_sent_time = datetime.combine(
                previous_drip_email[0].sent_date,
                previous_drip_email[0].sent_time,
            )

        should_send_time = last_sent_time + timedelta(
            days=drip_email.email.wait_days
        )
        now = datetime.now()
        if should_send_time > now:
            continue

        drip_emails.append(drip_email)

    return drip_emails


def convert_template(template, replacement):
    if not replacement:
        return template

    if type(replacement) == str:
        replacement = json.loads(replacement)

    for key in replacement.keys():
        key_match = "{{" + key + "}}"
        if key_match in template:
            if replacement[key] is None:
                template = template.replace(key_match, "")
            else:
                template = template.replace(key_match, str(replacement[key]))

    return template


def schedule_per_email_account(
    email_id: int, email_limit: int, campaign: Campaign
) -> list:
    """calculate mail that are going to receive emails from all the campains
    that belongs to mail.
    Args:
        email_id (int): id of the email that is going to send the emails
        email_limit (int): limit of the email

    Returns:
        pd.DataFrame: list of the mails that are going to receive emails
    """

    campaign_limit = email_limit
    campaign_id = campaign.id
    if campaign_limit <= 0:
        return []

    user = campaign.assigned

    sub_emails_per_campaign = schedule_per_campaign(
        campaign_id, campaign_limit, user, email_id
    )

    campaign_limit -= len(sub_emails_per_campaign)

    return sub_emails_per_campaign


def schedule_per_campaign(
    campaign_id: int, campaign_limit: int, user: CustomUser, email_id: int
):
    """calculate the mails that are going to sent by one campaing

    Args:
        campaign_id (int): id of the campaing that the mails are going to be
        searched

        campaign_limit (int): Limit of the campaing

    Returns:
        pd.Dataframe: dataframe with the emails
    """
    all_emails = get_all_emails(campaign_id, email_id)

    followup_emails_count = int(campaign_limit / 2)
    followup_emails = get_followup_emails(
        all_emails, followup_emails_count, email_id, campaign_id
    )

    main_emails_count = campaign_limit - len(followup_emails)
    main_emails = get_main_emails(all_emails, main_emails_count)
    drip_emails = get_drip_emails(all_emails, email_id, campaign_id)

    outbox_emails = list(chain(main_emails, followup_emails, drip_emails))

    outbox_emails = clean_emails(outbox_emails, user)
    return outbox_emails


def clean_emails(outbox_emails: list, user: CustomUser) -> list:
    """clean emails to send

    Args:
        outbox_emails (list): A list containing the mails that are going to be
        sent in the campaign

        user (CustomUser): User that have the unsubscribe mails

    Returns:
        list: A list containing the mails cleaned based if they are in
        the unsubscribe list
    """
    unsubscribeEmails = UnsubscribeEmail.objects.filter(user=user).all()
    black_list_emails = list(
        map(
            lambda unsubscribeEmailObject: unsubscribeEmailObject.email,
            filter(
                lambda unsubscribeEmailObject: not unsubscribeEmailObject.is_domain,  # noqa: E501
                unsubscribeEmails,
            ),
        )
    )

    black_list_domains = list(
        map(
            lambda unsubscribeEmailObject: unsubscribeEmailObject.email,
            filter(
                lambda unsubscribeEmailObject: unsubscribeEmailObject.is_domain,  # noqa: E501
                unsubscribeEmails,
            ),
        )
    )

    cleaned_outbox_emails = list(
        filter(
            lambda outbox_email: outbox_email.recipient.email
            not in black_list_emails
            and functools.reduce(
                lambda result, actual: result
                and outbox_email.recipient.email.find(actual.replace("*", ""))
                == -1,
                black_list_domains,
                True,
            ),
            outbox_emails,
        )
    )

    return cleaned_outbox_emails


def get_sending_address(
    sending_address_id: int, campaign_id: int
) -> Optional[EmailAccount]:
    campaign = Campaign.objects.get(pk=campaign_id)
    sending_address = EmailAccount.objects.get(pk=sending_address_id)

    if sending_address.has_error:
        sending_address = campaign.from_address.filter(has_error=False).first()

        if not sending_address:
            campaign.campaign_status = False
            campaign.save(update_fields=["campaign_status"])

            return None

    return sending_address


def handle_failed_email(
    campaign: Campaign, email_account: EmailAccount
) -> EmailAccount:
    email_account.has_error = True

    context = {
        "email_account": email_account,
    }

    if not email_account.error_was_notified:
        send_mail(
            subject="There is a problem with one of your email accounts",
            message=render_to_string(
                "mailaccounts/email/mail_failed.txt", context=context
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[campaign.assigned.email],
            fail_silently=False,
            html_message=render_to_string(
                "mailaccounts/email/mail_failed.html", context=context
            ),
        )

        email_account.error_was_notified = True

    email_account.save(update_fields=["has_error", "error_was_notified"])

    alt_sending_address = campaign.from_address.filter(has_error=False).first()

    return alt_sending_address


def disable_email_account(email_account: EmailAccount) -> None:
    email_account.has_error = True

    context = {
        "email_account": email_account,
    }

    if not email_account.error_was_notified:
        send_mail(
            subject="There is a problem with one of your email accounts",
            message=render_to_string(
                "mailaccounts/email/mail_failed.txt", context=context
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email_account.user.email],
            fail_silently=False,
            html_message=render_to_string(
                "mailaccounts/email/mail_failed.html", context=context
            ),
        )

        email_account.error_was_notified = True

    email_account.save(update_fields=["has_error", "error_was_notified"])


def check_email_format(email):
    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    # pass the regular expression
    # and the string in search() method
    return re.match(regex, email)
