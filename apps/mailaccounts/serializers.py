from rest_framework import serializers

from .models import (
    EmailAccount,
    SendingCalendar,
    WarmingMailReport,
    WarmingStatus,
)


class EmailAccountSerializer(serializers.ModelSerializer):
    warming_status = serializers.SerializerMethodField()

    class Meta:
        model = EmailAccount
        fields = (
            "id",
            "email_provider",
            "user",
            "email",
            "first_name",
            "last_name",
            "password",
            "smtp_host",
            "smtp_port",
            "smtp_username",
            "smtp_password",
            "use_smtp_ssl",
            "imap_host",
            "imap_port",
            "imap_username",
            "imap_password",
            "use_imap_ssl",
            "spam_folder",
            "has_error",
            "error_was_notified",
            "warming_status",
            "signature",
            "send_from_name"
        )

    def get_warming_status(self, obj):
        try:
            warming_status = WarmingStatus.objects.get(mail_account_id=obj.id)
            return warming_status.warming_enabled
        except (
            WarmingStatus.DoesNotExist
        ):
            return False
        except WarmingStatus.MultipleObjectsReturned:
            return None


class SendingCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = SendingCalendar
        fields = "__all__"


class WarmingMailReportSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="mail_account.email", read_only=True)

    class Meta:
        model = WarmingMailReport
        fields = "__all__"
