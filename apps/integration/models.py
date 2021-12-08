from django.db import models
from apps.users.models import CustomUser


class Team(models.Model):
    name = models.CharField(max_length=200)
    team_id = models.CharField(max_length=20)
    bot_user_id = models.CharField(max_length=20)
    bot_access_token = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class SalesForceDetails(models.Model):
    TYPE_PEOPLE = (
        ("Leads", "Lead"),
        ("Contacts", "Contact")
    )
    MISSING_OPTION = (
        ("Create them", "Create them"),
        ("Do nothing", "Do nothing")
    )
    TRACK_EVENT_OPTION = (
        ("All Mailsaas Prospects", "All Mailsaas Prospects"),
        ("Only Mailsaas Leads", "Only Mailsaas Leads")
    )
    LEAD_OPTION = (
        ('none', "None"),
        ("Open-Not Contacted", "Open-Not Contacted"),
        ("Working-Contacted", "Working-Contacted"),
        ("Closed-Converted", "Closed-Converted"),
        ("Closed-Not Converted", "Closed-Not Converted")
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=200, blank=True)
    object_type_people = models.CharField(
        max_length=12, choices=TYPE_PEOPLE, default='Contacts')
    missing = models.CharField(
        max_length=20, choices=MISSING_OPTION, default='Contacts')
    track_event = models.CharField(
        max_length=50, choices=TRACK_EVENT_OPTION, default='Contacts')
    sends = models.BooleanField(default=True)
    opens = models.BooleanField(default=True)
    clicks = models.BooleanField(default=True)
    replies = models.BooleanField(default=True)
    unsubscribed = models.BooleanField(default=True)
    leads = models.BooleanField(default=True)
    tasks = models.BooleanField(default=True)
    phone_calls = models.BooleanField(default=False)

    # On Mailshake actions, set these lead statuses in Salesforce
    lead_opened = models.CharField(
        max_length=90, choices=LEAD_OPTION, default='none')
    lead_ignored = models.CharField(
        max_length=90, choices=LEAD_OPTION, default='none')
    lead_won = models.CharField(
        max_length=90, choices=LEAD_OPTION, default='none')
    lead_lost = models.CharField(
        max_length=90, choices=LEAD_OPTION, default='none')
    lead_unsubcribed = models.CharField(
        max_length=90, choices=LEAD_OPTION, default='none')
    lead_resubscribed = models.CharField(
        max_length=90, choices=LEAD_OPTION, default='none')
    email_bounced = models.CharField(
        max_length=90, choices=LEAD_OPTION, default='none')
    is_delete = models.BooleanField(default=False)


class ZappierIntegrations(models.Model):
    class STATUS_INTEGRATION(models.TextChoices):
        CREATED = "CREATED", "CREATED"
        PAUSED = "PAUSED", "PAUSED"
        ERROR = "ERROR", "ERROR"
        SETTED = "SETTED", "SETTED"

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_date_time = models.DateTimeField(auto_now=True)
    update_date_time = models.DateTimeField(auto_now=True)
    status = models.CharField(choices=STATUS_INTEGRATION.choices,
                              default=STATUS_INTEGRATION.CREATED, max_length=100)
