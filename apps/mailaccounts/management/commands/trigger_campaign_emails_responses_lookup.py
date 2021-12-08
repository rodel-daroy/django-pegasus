from django.core.management.base import BaseCommand, CommandError
from apps.mailaccounts.tasks import campaign_emails_responses_lookup


class Command(BaseCommand):

    def handle(self, **options):
        print("Campaign Emails Responses Lookup trigger started")
        campaign_emails_responses_lookup.delay()
        print("Campaign Emails Responses Lookup trigger finished")
