from django.core.management.base import BaseCommand, CommandError
from apps.campaign.tasks import save_recipient_reply_to_lead


class Command(BaseCommand):

    def handle(self, **options):
        print("Save Recipient Reply To Lead trigger started")
        save_recipient_reply_to_lead.delay()
        print("Save Recipient Reply To Lead trigger finished")
