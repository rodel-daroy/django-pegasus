from django.core.management.base import BaseCommand, CommandError
from apps.mailaccounts.tasks import email_warmer


class Command(BaseCommand):

    def handle(self, **options):
        print("Email Warmer trigger started")
        email_warmer.delay()
        print("Email Warmer trigger finished")
