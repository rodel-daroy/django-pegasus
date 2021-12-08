from django.db import models

default_app_config = "apps.mailaccounts.apps.MailAccountsAppConfig"


class SessionType(models.TextChoices):
    PERSONAL = "personal"
    TEAM = "team"
