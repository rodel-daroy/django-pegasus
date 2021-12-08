import logging
import math
import random
from datetime import datetime

import pytz
import pyzmail
from django.core import mail
from django.core.mail.backends.smtp import EmailBackend
from django.db import IntegrityError
from imapclient import IMAPClient, SEEN, ANSWERED
from imapclient.exceptions import LoginError
from sentry_sdk import capture_exception

from apps.mailaccounts.models import (
    EmailAccount,
    WarmingLog,
    WarmingMailTemplate,
    WarmingStatus,
    WarmingMailReport,
)
from mail.settings import (
    DEFAULT_PREFIX_EMAIL_FOLDER,
    DEFAULT_RAMPUP_INCREMENT,
    DEFAULT_WARMUP_FOLDER,
    DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX,
    DEFAULT_WARMUP_MAX_CNT,
    DEFAULT_WARMUP_REPLAY_MAX_CNT
)

from .smtp import send_mail_with_smtp, disable_email_account

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# ignore pattern and key lists
ignore_pattern_list = ["deleted", "all", "trash",
                       "draft", "sent", "@", "✔", "Enviados"]
ignore_key_list = ["[gmail]", "outbox", "notes", DEFAULT_WARMUP_FOLDER]
spam_folder_pattern_list = ["junk", "spam"]

flags_not_reply_warming = ANSWERED


def is_spam_folder(folder_name):
    print(f"========FOLDER NAME: {folder_name}")
    return any(
        ignore_key.lower() in folder_name.lower()
        for ignore_key in spam_folder_pattern_list
    )


def validate_for_scan(folder: str):
    """matches the folder name with the ignore patterns and keys and validates

    Args:
        folder (str): Mailbox folder name

    Returns:
        (bool): True if folder is not in ignore pattern and key list
    """
    return not any(
        ignore_key.lower() in folder.lower()
        for ignore_key in ignore_pattern_list
    ) and not (folder.lower() in ignore_key_list)


def email_warming_process():
    """This method triggers the warming emails"""

    logger.debug(f"Email warming process started..........................")

    # Get warming enabled accounts
    enabled_accounts = WarmingStatus.objects.filter(
        warming_enabled=True, mail_account__has_error=False
    ).select_related("mail_account")

    for item in enabled_accounts:
        mail_account = item.mail_account

        # get / create-get stat object for current date
        try:
            wes, _ = WarmingMailReport.objects.get_or_create(
                mail_account_id=mail_account.id,
                created_date=datetime.today(),
                type_report=WarmingMailReport.TYPE_REPORT_OPTIONS.RECEIVE,
            )
        except IntegrityError as error:
            logger.debug(
                f"Found IntegrityError : {mail_account} {error}")
            wes = WarmingMailReport.objects.filter(
                mail_account_id=mail_account.id,
                created_date=datetime.today(),
                type_report=WarmingMailReport.TYPE_REPORT_OPTIONS.RECEIVE,
            ).first()

        if not wes:
            # if WarmingMailReport not found then skip
            logger.debug(
                f"Enable to found WarmingMailReport : {mail_account}")
            capture_exception(Exception(f"Enable to found WarmingMailReport : {mail_account}"))
            continue

        # calculating number of emails to send, (daily ramp-up and max emails
        # per day) which is lower
        cnt_to_send = min(
            DEFAULT_RAMPUP_INCREMENT * (item.days_passed + 1),
            DEFAULT_WARMUP_MAX_CNT,
        )

        # calculate time span for today's warmup emails
        timespan = math.floor(20 * 60 / cnt_to_send)

        # time interval between 2 adjacent mails; notice the total time
        # range is 20 hours
        timespan += random.randint(-10, 10)

        logs = WarmingLog.objects.filter(
            mail_account_id=mail_account.id, sent_at__day=datetime.today().day,
        ).order_by("-sent_at")

        # if it exceeded today's limit (already sent emails), then continue to
        # next email account
        if len(logs) >= cnt_to_send:
            continue

        # if there is any logs available, then check when the last email was sent.
        if len(logs) > 0:
            # calculating time in minutes when last email was sent.
            timediff_minutes = (
                datetime.utcnow()
                - logs[0].sent_at.astimezone(pytz.utc).replace(tzinfo=None)
            ).total_seconds() / 60

            # if it's too early to send warm email, skip for now and continue to next email account
            if timediff_minutes < timespan:
                continue

        # creating a list of email accounts (excluding itself)
        account_list = [
            tmp
            for tmp in enabled_accounts
            if tmp.mail_account_id != mail_account.id
        ]
        # picking a random email account to send warming email
        dest_account = random.choice(account_list).mail_account
        logger.debug("Sending email to: {}".format(dest_account))

        # picking a warming email template from database
        template = WarmingMailTemplate.objects.order_by("?").first()

        mail_subject = template.subject.replace('\n', ' ')
        mail_content = template.content

        # send email to dest_account (TO BE DONE SOME BETTER WAY)
        warmup_email_subject = (
            mail_subject + " " + DEFAULT_WARMUP_MAIL_SUBJECT_SUFFIX
        )
        warmup_email_body = "Dear "
        if dest_account.first_name:
            warmup_email_body += dest_account.first_name + ","
        elif dest_account.last_name:
            warmup_email_body += dest_account.last_name + ","
        else:
            warmup_email_body = "Hello,"
        warmup_email_body += "\n\n" + mail_content + "\n\nYours sincerely,\n\n"
        if mail_account.first_name:
            warmup_email_body += mail_account.first_name
        elif mail_account.last_name:
            warmup_email_body += mail_account.last_name
        else:
            warmup_email_body = "Thank you"

        try:
            send_mail_with_smtp(
                host=mail_account.smtp_host,
                port=mail_account.smtp_port,
                username=mail_account.smtp_username,
                password=mail_account.smtp_password,
                use_tls=mail_account.use_smtp_ssl,
                from_email=mail_account.email,
                to_email=[dest_account.email],
                subject=warmup_email_subject,
                body=warmup_email_body,
                uuid=None,
                track_opens=False,
                track_linkclick=False,
            )
            # update sent count for warming email stats
            wes.sent = wes.sent + 1
        except LoginError as e:
            disable_email_account(mail_account)
            logger.debug(
                f"Mail account has wrong credentials : {mail_account}")
            capture_exception(e)
        except OSError as e:
            logger.debug(f"Mail account is invalid : {mail_account}")
            capture_exception(e)
        except ConnectionError as e:
            logger.debug(f"Connection aborted : {mail_account}")
            capture_exception(e)
        except Exception as error:
            logger.debug(
                f"General error with the mail account:{mail_account}: {error}"
            )
            capture_exception(error)

        wes.save()

        # log into the DB
        WarmingLog.objects.create(mail_account_id=mail_account.id)


def update_warming_report(ws, folder):
    if folder == "INBOX":
        ws.saved_from_inbox = ws.saved_from_inbox + 1
    elif is_spam_folder(folder):
        ws.saved_from_spam = ws.saved_from_spam + 1
    else:
        ws.saved_from_other_categories = ws.saved_from_other_categories + 1


def is_able_to_replay(FLAGS_EMAIL) -> bool:
    return not any(FLAG == flags_not_reply_warming for FLAG in FLAGS_EMAIL)


def how_many_can_replay(replies, lastTimeReplied, item: WarmingStatus) -> int:
    cnt_to_send = min(
        DEFAULT_RAMPUP_INCREMENT * (item.days_passed + 1),
        DEFAULT_WARMUP_MAX_CNT,
    )

    # calculate time span for today's warmup emails
    timespan = math.floor(20 * 60 / cnt_to_send)
    # time interval between 2 adjacent mails; notice the total time
    # range is 20 hours
    timespan += random.randint(-10, 10)
    if replies >= cnt_to_send:
        return 0

    # if there is any logs available, then check when the last email was sent.
    if replies > 0:
        # calculating time in minutes when last email was sent.
        timediff_minutes = (
            datetime.utcnow()
            - lastTimeReplied.astimezone(pytz.utc).replace(tzinfo=None)
        ).total_seconds() / 60

        # if it's too early to send warm email, skip for now and continue to next email account
        if timediff_minutes < timespan:
            return 0
    return min(cnt_to_send - replies, DEFAULT_WARMUP_REPLAY_MAX_CNT)


def valid_folder(flags):
    invalid_folders_flags = [b"\\Noselect", b"\Noselect", b"Noselect", "\\Noselect", "Noselect"]
    valid = True
    for flag in invalid_folders_flags:
        if flag in flags:
            valid = False
            break
    return valid
