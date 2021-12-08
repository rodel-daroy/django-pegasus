from django.core.management.base import BaseCommand, CommandError
from apps.mailaccounts.tasks import warming_trigger


class Command(BaseCommand):

    def handle(self, **options):
        print("Warming Trigger started")
        warming_trigger.delay()
        print("Warming Trigger finished")
