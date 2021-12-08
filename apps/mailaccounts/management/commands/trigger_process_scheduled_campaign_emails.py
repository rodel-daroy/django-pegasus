from django.core.management.base import BaseCommand, CommandError
from apps.mailaccounts.tasks import process_scheduled_campaign_emails


class Command(BaseCommand):

    def handle(self, **options):
        print("Process Scheduled Campaign Emails trigger started")
        process_scheduled_campaign_emails.delay()
        print("Process Scheduled Campaign Emails trigger finished")
