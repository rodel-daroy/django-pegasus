import datetime

from celery import shared_task
from sentry_sdk import capture_exception
from apps.mailaccounts.models import EmailAccount
from apps.mailaccounts.utils.smtp import receive_mail_with_imap
from .utils.accpet_datetime import accept_email_datetime_format

from .models import *


@shared_task
def trigger_lead_catcher(campaign_id, recipient_id):
    print("Lead Catcher triggered")

    # TODO-DONE:
    lead_setting = LeadSettings.objects.filter(campaign_id=campaign_id).first()
    if not lead_setting:
        return

    # lead_setting = lead_setting[0]
    recipient = Recipient.objects.get(id=recipient_id)

    fits = []
    if lead_setting.open > 0:
        if recipient.opens >= lead_setting.open:
            fits.append(True)
        else:
            fits.append(False)
    if lead_setting.replies > 0:
        if recipient.replies >= lead_setting.replies:
            fits.append(True)
        else:
            fits.append(False)
    if lead_setting.click_any_link > 0:
        if recipient.clicked >= lead_setting.click_any_link:
            fits.append(True)
        else:
            fits.append(False)

    can_be_lead = False
    if len(fits) > 0:
        can_be_lead = fits[0]
    for item in fits:
        if lead_setting.join_operator == "and":
            can_be_lead = can_be_lead and item
        else:
            can_be_lead = can_be_lead or item

    if can_be_lead:
        recipient.leads = 1
        recipient.lead_status = "open"
        recipient.save()


@shared_task
def update_leads_log(recipient_id, action, inbox_id=None, outbox_id=None):
    if recipient_id is None or not recipient_id:
        return
    try:
        log = LeadsLog(
            recipient_id=recipient_id,
            lead_action=action,
            inbox_id=inbox_id,
            outbox_id=outbox_id,
        )
        log.save()
    except Exception as e:
        capture_exception(e)
        # print(e)
        return


@shared_task
def createAllRecipientData(campaign_id, campaign, intro_email_id, team_id):
    new_camp = Campaign.objects.filter(pk=campaign_id).get()
    intro_email = Emails.objects.filter(pk=intro_email_id).get()
    team = Team.objects.filter(pk=team_id).get() if team_id else None

    if (not new_camp or not intro_email):
        return
    new_camp.createOutboxEmails(
        campaign["emails"], intro_email, team
    )

    if len(campaign["follow_up"]) > 0:
        new_camp.createFollowUps(campaign["follow_up"], team)

    if len(campaign["drips"]) > 0:
        new_camp.createDrips(campaign["drips"], team)
    return None


@shared_task
def save_recipient_reply_to_lead():
    print("Save recipient reply to leads - TRIGGER")
    # TODO-DONE:
    # campaigns = Campaign.objects.all()
    for campaign in Campaign.objects.all().iterator():
        print(f"Checking for campaign : {campaign} ")

        # TODO-DONE:
        # leads = Recipient.objects.filter(leads__gt=0, campaign=campaign) # REMOVED by Farid
        if not Recipient.objects.filter(leads__gt=0, campaign=campaign).exists():
            print("Leads not found")
            continue

        # TODO-DONE:
        print("Leads found")
        for lead in Recipient.objects.filter(leads__gt=0, campaign=campaign).iterator():

            account = campaign.from_address.filter(has_error=False).first()
            if account is None:
                # Not reason to check again the account if was already searched, less send error
                """ try:
                    account = campaign.from_address.filter(has_error=False).get()
                except EmailAccount.DoesNotExist as e:
                    capture_exception(e)
                    print(f"Email account does not exist for lead : {lead} ") """
                continue

            print("Email account exist")

            date = (datetime.date.today() -
                    datetime.timedelta(1)).strftime("%d-%b-%Y")
            query = [None, "(SENTSINCE {0})".format(date)]

            imap_details = {
                "host": account.imap_host,
                "port": account.imap_port,
                "username": account.imap_username,
                "password": account.imap_password,
                "use_tls": account.use_imap_ssl,
                "mark_seen": False,
                "query": query,
            }

            inbox_emails = receive_mail_with_imap(**imap_details)

            if not inbox_emails:
                print("No email found in inbox")
                continue

            print(f"{len(inbox_emails)} emails found")
            latest_email_inbox = EmailInbox.objects.last()
            last_email_dt = datetime.datetime.combine(
                latest_email_inbox.receive_date, latest_email_inbox.receive_time
            )
            last_email_dt = last_email_dt.replace(tzinfo=None)

            for inbox_email in inbox_emails:
                email_dt_str = inbox_email["datetime"]
                email_dt = accept_email_datetime_format(email_dt_str)
                # try:
                #     email_dt = datetime.datetime.strptime(
                #         email_dt_str, "%a, %d %b %Y %H:%M:%S %Z"
                #     )
                # except ValueError:
                #     email_dt = datetime.datetime.strptime(
                #         email_dt_str, "%a, %d %b %Y %H:%M:%S %z"
                #     )

                email_dt = email_dt.replace(tzinfo=None)
                if email_dt <= last_email_dt:
                    continue
                email_outbox = EmailOutbox.objects.filter(
                    campaign=campaign, recipient=lead, status=1
                ).last()
                email_inbox_dict = {
                    "from_email": account,
                    "email_subject": inbox_email["subject"],
                    "email_body": inbox_email["content"],
                    "recipient_email": lead,
                    "status": 1,  # email received in inbox
                    "receive_date": email_dt.date(),
                    "receive_time": email_dt.time(),
                    "outbox": email_outbox,
                }
                email_inbox = EmailInbox.objects.create(**email_inbox_dict)
                LeadsLog.objects.create(
                    recipient=lead,
                    lead_action="replied",
                    inbox=email_inbox,
                    outbox=email_outbox,
                )
                print(f"Saving email inbox for lead : {lead}")
    print("Save recipient reply to leads - FINISHED")
    return True
