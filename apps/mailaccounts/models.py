import datetime
from datetime import timezone, timedelta
import pytz

from django.db import models

from apps.users.models import CustomUser

SMTP_PORTS = (
    ("587", "587"),
    ("25", "25"),
    ("465", "465"),
    ("2525", "2525"),
)

IMAP_PORTS = (
    ("993", "993"),
    ("143", "143"),
    ("995", "995"),
)

EMAIL_PROVIDERS = (
    ("SMTP", "SMTP"),
    ("Google", "Google"),
    ("Microsoft", "Microsoft"),
)


class EmailAccount(models.Model):
    # Common fields
    email_provider = models.CharField(
        max_length=100,
        choices=EMAIL_PROVIDERS,
        default="SMTP",
        null=True,
        blank=True,
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    email = models.EmailField()

    first_name = models.CharField(
        max_length=200, default="", null=True, blank=True
    )
    last_name = models.CharField(
        max_length=200, default="", null=True, blank=True
    )

    # Google, Microsoft fields
    password = models.CharField(
        max_length=200, default="", null=True, blank=True
    )

    # SMTP fields
    smtp_host = models.CharField(max_length=200, blank=True, null=True)
    smtp_port = models.CharField(
        max_length=20, choices=SMTP_PORTS, default="587", blank=True, null=True
    )
    smtp_username = models.CharField(max_length=200, blank=True, null=True)
    smtp_password = models.CharField(max_length=200, blank=True, null=True)
    use_smtp_ssl = models.BooleanField(default=False)

    imap_host = models.CharField(max_length=200, blank=True, null=True)
    imap_port = models.CharField(
        max_length=20, choices=IMAP_PORTS, default="993", blank=True, null=True
    )
    imap_username = models.CharField(max_length=200, blank=True, null=True)
    imap_password = models.CharField(max_length=200, blank=True, null=True)
    use_imap_ssl = models.BooleanField(default=False)
    spam_folder = models.CharField(max_length=20, blank=True, null=True)
    has_error = models.BooleanField(default=False)
    error_was_notified = models.BooleanField(default=False)
    bounce_last_sync = models.DateTimeField(null=True, blank=True, default=None)
    send_from_name = models.CharField(max_length=255, blank=True, null=True, default=None)
    signature = models.TextField(null=True, blank=True, default=None)

    def __str__(self):
        return self.email
    
    def get_sending_calendar(self):
        # get/create-get sending calendar for each mailing account
        sending_calendar,_ = SendingCalendar.objects.get_or_create(
            mail_account_id=self.id
        )
        return sending_calendar


class SMTPManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(email_provider="SMTP")


class SMTPAccount(EmailAccount):
    objects = SMTPManager()

    class Meta:
        proxy = True


class GoogleManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(email_provider="Google")


class GoogleAccount(EmailAccount):
    objects = GoogleManager()

    class Meta:
        proxy = True


class MicrosoftManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(email_provider="Microsoft")


class MicrosoftAccount(EmailAccount):
    objects = MicrosoftManager()

    class Meta:
        proxy = True


# Sending calendar
class SendingCalendar(models.Model):
    TIMEZONE_CHOICES = zip(pytz.all_timezones, pytz.all_timezones)

    mail_account = models.OneToOneField(EmailAccount, on_delete=models.CASCADE)
    block_days = models.PositiveIntegerField(default=96)
    start_time = models.TimeField(
        auto_now=False, default=datetime.time(9, 0, 0)
    )
    end_time = models.TimeField(
        auto_now=False, default=datetime.time(17, 0, 0)
    )
    time_zone = models.CharField(
        choices=TIMEZONE_CHOICES,
        blank=True,
        default="US/Eastern",
        max_length=50,
    )
    max_emails_per_day = models.PositiveIntegerField(default=20)
    minutes_between_sends = models.PositiveIntegerField(default=12)
    min_emails_to_send = models.PositiveIntegerField(default=1)
    max_emails_to_send = models.PositiveIntegerField(default=1)


    def get_calendar_status(self):
        # get/create-get calendar status for sending calendar
        calendar_status, _ = CalendarStatus.objects.get_or_create(
            sending_calendar_id=self.id,
            defaults={
                "updated_datetime": datetime.datetime.now(timezone.utc) - timedelta(days=1)
            },
        )
        return calendar_status

class CalendarStatus(models.Model):
    sending_calendar = models.OneToOneField(
        SendingCalendar, on_delete=models.CASCADE
    )
    updated_datetime = models.DateTimeField(auto_now=False)
    sent_count = models.PositiveIntegerField(default=0)


class WarmingStatus(models.Model):
    mail_account = models.ForeignKey(EmailAccount, on_delete=models.CASCADE)
    email_for_day = models.IntegerField(default=1)
    ramp_up_increment = models.IntegerField(default=1)
    warming_enabled = models.BooleanField(default=False, db_index=True)
    days_passed = models.IntegerField(default=0)
    status_updated_at = models.DateTimeField(auto_now_add=True)


class WarmingLog(models.Model):
    mail_account = models.ForeignKey(EmailAccount, on_delete=models.CASCADE)

    sent_at = models.DateTimeField(auto_now_add=True)


class WarmingMailTemplate(models.Model):
    subject = models.CharField(max_length=100, blank=True, null=True)
    content = models.CharField(max_length=1024, blank=True, null=True)


class WarmingMailReport(models.Model):
    class TYPE_REPORT_OPTIONS(models.TextChoices):
        SENT = "SENT", "SENT"
        RECEIVE = "RECEIVE", "RECEIVE"

    mail_account = models.ForeignKey(EmailAccount, on_delete=models.CASCADE)
    type_report = models.CharField(
        choices=TYPE_REPORT_OPTIONS.choices,
        default=TYPE_REPORT_OPTIONS.SENT,
        max_length=100,
    )
    sent = models.IntegerField(default=0)
    saved_from_spam = models.IntegerField(default=0)
    saved_from_other_categories = models.IntegerField(default=0)
    saved_from_inbox = models.IntegerField(default=0)
    replies = models.IntegerField(default=0)
    last_reply = models.DateTimeField(auto_now=True)
    created_date = models.DateField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['mail_account', 'type_report', 'created_date'],
                                    name='unique mail report constraints')
        ]
