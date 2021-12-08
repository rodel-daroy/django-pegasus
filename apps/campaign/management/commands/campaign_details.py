from csv import DictReader

import pytz
from datetime import datetime, timezone
from django.core.management.base import BaseCommand
from apps.mailaccounts.utils.smtp import get_emails_to_send
from apps.mailaccounts.utils.sending_calendar import can_send_email

from apps.campaign.models import Campaign
from apps.mailaccounts.models import CalendarStatus, SendingCalendar
from apps.campaignschedule.models import Schedule


class Command(BaseCommand):

    def can_send_email_debug(self, sending_calendar, calendar_status):
        print(f'\t..............DEBUGING..............')
        current_time = datetime.now(
            pytz.timezone(sending_calendar.time_zone)
        ).time()
        print(f'\t DEBUG : Calendar start_time is less than the current_time -> '
              f'{sending_calendar.start_time < current_time}')
        print(f'\t DEBUG : Calendar end_time is greater than the current_time -> '
              f'{sending_calendar.end_time > current_time}')

        print(f'\t DEBUG : Can send email today -> '
              f'{not bool(sending_calendar.block_days & (1 << datetime.today().weekday()))}')

        print(f'\t DEBUG : Daily Limit exceed -> '
              f'{calendar_status.sent_count > sending_calendar.max_emails_per_day}')

        print(f'\t DEBUG : Can sand email (time gap) -> '
              f'{(datetime.now(timezone.utc) - calendar_status.updated_datetime).total_seconds() / 60.0 >= sending_calendar.minutes_between_sends} ')

    def handle(self, *args, **kwargs):
      
#         campaigns = Campaign.objects.filter(campaign_status=True, is_draft=False, is_deleted=False)

        print('|| Campaigns ||')
        print()
        print('---------------------------------------------------------------')
        print()

        for campaign in Campaign.objects.all().prefetch_related('from_address').iterator():
            
            print(f'Campaign -> {campaign.title} (ID = {campaign.id})')
            print(f'Campaign Status -> {campaign.campaign_status}')
            print(f'Campaign is_draft -> {campaign.is_draft}')
            print(f'Campaign is_deleted -> {campaign.is_deleted}')

            print()
            print(f'\t || All Assigned Email Addresses ||')
            print()

            for from_mail in campaign.from_address.all():
                print()
                print(f'\t EmailAccount -> {from_mail}')
                print(f'\t Account Disabled? -> {from_mail.has_error}')
                print(
                    f'\t Does it have SendingCalendar entry? -> '
                    f'{SendingCalendar.objects.filter(mail_account_id=from_mail.id).exists()}')
                print(
                    f'\t Does it have CalenderStatus? -> '
                    f'{CalendarStatus.objects.filter(sending_calendar__mail_account_id=from_mail.id).exists()}')
                if CalendarStatus.objects.filter(sending_calendar__mail_account_id=from_mail.id).exists():
                    calender_status = CalendarStatus.objects.filter(
                        sending_calendar__mail_account_id=from_mail.id).first()
                    sending_calendar = SendingCalendar.objects.filter(mail_account_id=from_mail.id).first()
                    print(f'\t Last Mail Send on? -> {calender_status.updated_datetime}')
                    up_coming_emails = get_emails_to_send(from_mail.id,
                                                          sending_calendar.max_emails_per_day -
                                                          calender_status.sent_count,
                                                          campaign)
                    can_send = can_send_email(sending_calendar, calender_status)
                    print(f'\t Can send Email? -> {can_send}')
                    print(f'\t Does have any Up-coming email? -> {bool(up_coming_emails)}')
                    print(
                        f'\t Does it have Schedule entry? -> '
                        f'{Schedule.objects.filter(mail_account_id=from_mail.id).exists()}')
                    if up_coming_emails:
                        self.can_send_email_debug(sending_calendar, calender_status)

                print()

            print()
            print('---------------------------------------------------------------')
            print()
