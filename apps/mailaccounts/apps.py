from django.apps import AppConfig


class MailAccountsAppConfig(AppConfig):
    name = "apps.mailaccounts"

    def ready(self):
        from apps.mailaccounts import signals
