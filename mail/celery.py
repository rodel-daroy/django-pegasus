import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mail.settings")

app = Celery("mail")
app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()

app.conf.beat_schedule = {

    "sender": {
        "task": "apps.mailaccounts.tasks.process_scheduled_campaign_emails",
        "schedule": 240.0,
    },
    "receiver": {
        "task": "apps.mailaccounts.tasks.campaign_emails_responses_lookup",
        "schedule": 360.0,
    },
    "save_recipient_reply_to_lead": {
        "task": "apps.campaign.tasks.save_recipient_reply_to_lead",
        "schedule": 14400.0,  # 4 hours in prod
    },
    "email_warmer_up": {
        "task": "apps.mailaccounts.tasks.warming_trigger",
        "schedule": 360.0,  # 5 mins in Prod
    },
    "email_warmer": {
        "task": "apps.mailaccounts.tasks.email_warmer",
        "schedule": 360.0,
    },
    "warming_days_counter": {
        "task": "apps.mailaccounts.tasks.warming_days_counter",
        "schedule": 86400.0,  # 1 day in Prod
    },
    "bounce_campaign_emails": {
        "task": "apps.mailaccounts.tasks.bounce_campaign_emails",
        "schedule": 360.0,
    },

}
