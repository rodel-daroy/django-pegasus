from csv import DictReader

from datetime import datetime
from django.core.management.base import BaseCommand

from apps.campaign.models import *
from apps.mailaccounts.models import *
from apps.campaignschedule.models import *

class Command(BaseCommand):
    def handle(self, *args, **kwargs):

        total_number_of_email_inbox_entries = EmailInbox.objects.count()
        total_number_of_distinct_email_inbox_entries = EmailInbox.objects.all().distinct('outbox', 'recipient_email', 'from_email', 'email_subject', 'email_body').values_list('id', flat=True)

        print(f'Total Count of Email Inbox Entry: {total_number_of_email_inbox_entries}')
        print(f'Distinct Count of Email Inbox Entry: {len(total_number_of_distinct_email_inbox_entries)}')


        print()
        print('|| Email Inbox ||')

        for email_inbox in EmailInbox.objects.filter(id__in=total_number_of_distinct_email_inbox_entries):
            duplicate_count = EmailInbox.objects.filter(
                outbox=email_inbox.outbox,
                recipient_email=email_inbox.recipient_email,
                from_email=email_inbox.from_email,
                email_subject=email_inbox.email_subject,
                email_body=email_inbox.email_body,
            ).count()
            print()
            print(f'---------------------------------------------------------')
            print(f'\t Email Inbox ID: {email_inbox.id}')
            print(f'\t Outbox ID: {email_inbox.outbox.id}')
            print(f'\t Recipient Email: {email_inbox.recipient_email}')
            print(f'\t From Email: {email_inbox.from_email}')
            print(f'\t Email Subject: {email_inbox.email_subject}')
            print(f'\t *** Duplicate Entries Count: {duplicate_count-1} ***')
            print(f'---------------------------------------------------------')
        