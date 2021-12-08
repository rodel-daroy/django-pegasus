from django.core.management.base import BaseCommand, CommandError
from apps.mailaccounts.models import WarmingMailReport
from django.db.models import Count


class Command(BaseCommand):
    help = 'Correct the entries of the warming reports'

    @staticmethod
    def correct_entries(records):
        if records.count() > 1:
            first_record = records[0]
            for record in records[1:]:
                first_record.sent = first_record.sent + record.sent
                first_record.saved_from_spam = first_record.saved_from_spam + record.saved_from_spam
                first_record.saved_from_other_categories = first_record.saved_from_other_categories + record.saved_from_other_categories
                first_record.saved_from_inbox = first_record.saved_from_inbox + record.saved_from_inbox
                first_record.replies = first_record.replies + record.replies
                first_record.save()
                record.delete()

    def handle(self, **options):
        try:
            print(f"Process start.....")
            reports = WarmingMailReport.objects \
                .values("mail_account_id", "created_date", "type_report") \
                .order_by() \
                .annotate(Count('mail_account_id'), Count('created_date'), Count('type_report')) \
                .exclude(created_date__count__lte=1)

            for report in reports:
                duplicate_reports = WarmingMailReport.objects.filter(mail_account_id=report["mail_account_id"],
                                                                     created_date=report["created_date"],
                                                                     type_report=report["type_report"]) \
                    .order_by("-last_reply")
                self.correct_entries(duplicate_reports)
            print(f"Process completed")
        except Exception as e:
            print(f"Error: Unable to complete he process, having error : {e}")
