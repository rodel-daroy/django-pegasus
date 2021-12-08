from django.utils import timezone
from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver

from apps.mailaccounts.models import EmailAccount, SendingCalendar, CalendarStatus


@receiver(pre_delete, sender=EmailAccount)
def email_account_pre_delete(sender, instance, **kwargs):
    """
    Updates the campaign_status of all the Campaign instances,
    related to the email account to deleted.
    """
    queryset = instance.campaigns.all()
    queryset.update(campaign_status=False)


@receiver(post_save, sender=EmailAccount)
def email_account_post_save(sender, instance, created, **kwargs):
    """
    Create the SendingCalendar and CalendarStatus default entries
    when newly EmailAccount being created
    """
    if created:
        # get/create-get sending calendar for mailing account
        sending_calendar, _ = SendingCalendar.objects.get_or_create(
            mail_account_id=instance.id
        )

        # get/create-get calendar status for sending calendar
        CalendarStatus.objects.get_or_create(
            sending_calendar_id=sending_calendar.id,
            updated_datetime=timezone.now()
        )
