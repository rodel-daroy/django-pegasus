from django.core.management.base import BaseCommand, CommandError
from apps.mailaccounts.tasks import warming_days_counter


class Command(BaseCommand):

    def handle(self, **options):
        print("Warming Days Counter trigger started")
        warming_days_counter.delay()
        print("Warming Days Counter trigger finished")
