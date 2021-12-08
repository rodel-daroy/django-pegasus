from datetime import timezone, datetime
import pytz
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def can_send_email(sending_calendar, calendar_status):
    """check if a mail still can send emails to recipients

    Args:
        sending_calendar (SendingCalendar): Calendar status object with the
        information about the rules for the mail
        calendar_status (CalendarStatus): [description]

    Returns:
        Boolean: is the mail can send more emails
    """
    can_send = True

    # Check time
    now = datetime.now(pytz.timezone(sending_calendar.time_zone))

    current_time = now.time()

    # NOTE eventually start_time and ending_time are being compared as str
    #       instead of time field
    if sending_calendar.start_time > current_time:
        logger.debug(
            "............Can Not Send sending_calendar.start_time > current_time"
        )
        can_send = False
        return can_send
    if current_time > sending_calendar.end_time:
        logger.debug(
            "............Can Not Send current_time > sending_calendar.end_time"
        )
        can_send = False
        return can_send

    weekday = now.today().weekday()

    if int("{0:07b}".format(sending_calendar.block_days)[::-1][weekday]):
        logger.debug(
            f"............Can Not Send int('{0:07b}'.format(sending_calendar.block_days)[::-1][weekday]) {int('{0:07b}'.format(sending_calendar.block_days)[::-1][weekday])}"
        )
        can_send = False
        return can_send

    # Check max email count per day
    if calendar_status.sent_count >= sending_calendar.max_emails_per_day:
        logger.debug(
            "............Can Not Send calendar_status.sent_count >= sending_calendar.max_emails_per_day"
        )
        can_send = False
        return can_send

    minutes = (
        datetime.now(timezone.utc) - calendar_status.updated_datetime
    ).total_seconds() / 60.0

    logger.debug(
        f"............minutes:{str(minutes)} /  sending_calendar.minutes_between_sends: {str(sending_calendar.minutes_between_sends)}"
    )
    if minutes < sending_calendar.minutes_between_sends:
        logger.debug(
            "............Can Not Send minutes < sending_calendar.minutes_between_sends"
        )
        can_send = False
        return can_send

    return can_send


def calendar_sent(calendar_status):
    """Function that update the count of emails sent by the the account email
    address

    Args:
        calendar_status (CalendarStatus): status to update.
    """
    #   reset the today's count
    if calendar_status.updated_datetime.date() != datetime.today().date():
        calendar_status.sent_count = 0

    #   increase the sent count
    calendar_status.sent_count += 1

    #   update the timestamp
    calendar_status.updated_datetime = datetime.now(timezone.utc)

    #   save
    calendar_status.save()
