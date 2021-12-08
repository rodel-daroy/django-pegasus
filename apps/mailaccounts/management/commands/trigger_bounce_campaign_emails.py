from django.core.management.base import BaseCommand, CommandError
from apps.mailaccounts.tasks import bounce_campaign_emails


class Command(BaseCommand):

    def handle(self, **options):
        print("Bounce Campaign Email trigger started")
        bounce_campaign_emails.apply_async()
        print("Bounce Campaign Email trigger finished")
