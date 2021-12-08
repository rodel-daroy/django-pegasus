from django.db.models import Sum, Q
from rest_framework import serializers

from .models import (
    Audience,
    AudienceTag,
    Campaign,
    CampaignLabel,
    CampaignLeadCatcher,
    CampaignRecipient,
    DripEmailModel,
    EmailInbox,
    EmailOnLinkClick,
    EmailOutbox,
    Emails,
    FollowUpEmail,
    LeadSettings,
    LeadsLog,
    Recipient,
)
from apps.mailaccounts.serializers import EmailAccountSerializer


class LeadReplySerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=100)
    body = serializers.CharField(
        max_length=None,
        min_length=None,
        allow_blank=False,
        trim_whitespace=True,
    )

    class Meta:
        fields = ["body", "subject"]


class RecipientsCheckSerializer(serializers.Serializer):
    csvfile = serializers.FileField()

    class Meta:
        fields = ["csvfile"]


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = "__all__"


class CampaignDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = ["is_deleted", "id"]
        read_only_fields = ("id",)

    def update(self, instance, validated_data):
        instance.is_deleted = validated_data.get(
            "is_deleted", instance.is_deleted
        )
        instance.save()
        return instance


class CampaignEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignRecipient
        fields = "__all__"


class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUpEmail
        fields = "__all__"


class OnclickSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailOnLinkClick
        fields = "__all__"


class DripEmailSerilizer(serializers.ModelSerializer):
    class Meta:
        model = DripEmailModel
        fields = "__all__"


class CampaignLeadCatcherSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignLeadCatcher
        fields = "__all__"


class CampaignLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignLabel
        fields = "__all__"


class CampaignListSerializer(serializers.ModelSerializer):
    assigned = serializers.CharField(source="assigned.full_name")
    from_emails = serializers.SerializerMethodField()
    created = serializers.DateTimeField(
        source="created_date_time", format="%B %d %Y"
    )
    recipients = serializers.IntegerField(read_only=True)
    sent = serializers.IntegerField(read_only=True)
    opens = serializers.IntegerField(read_only=True)
    leads = serializers.IntegerField(read_only=True)
    replies = serializers.IntegerField(read_only=True)
    bounces = serializers.IntegerField(read_only=True)

    class Meta:
        model = Campaign
        fields = [
            "id",
            "title",
            "created",
            "campaign_status",
            "assigned",
            "recipients",
            "sent",
            "opens",
            "leads",
            "replies",
            "bounces",
            "from_emails",
            "assigned_id",
        ]

    def get_from_emails(self, parent):
        return EmailAccountSerializer(parent.from_address.all(), many=True).data

class ProspectsSerializer(serializers.ModelSerializer):
    sent_count = serializers.IntegerField(read_only=True)
    open_count = serializers.IntegerField(read_only=True)
    click_count = serializers.IntegerField(read_only=True)
    reply_count = serializers.IntegerField(read_only=True)
    lead_count = serializers.IntegerField(read_only=True)
    status = serializers.CharField(default="Not contacted")

    class Meta:
        model = Recipient
        fields = [
            "email",
            "sent_count",
            "open_count",
            "click_count",
            "reply_count",
            "lead_count",
            "status",
        ]


class EmailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emails
        fields = "__all__"


class CampaignDetailsSerializer(serializers.ModelSerializer):
    emails = EmailsSerializer(
        many=True, read_only=True, source="current_emails"
    )

    class Meta:
        model = Campaign
        exclude = ("csvfile",)


class RecipientSerializer(serializers.ModelSerializer):
    campaign_id = serializers.IntegerField(
        source="campaign.id", required=False
    )
    campaign_title = serializers.CharField(
        source="campaign.title", required=False
    )
    assigned_name = serializers.CharField(
        source="campaign.assigned.full_name", required=False
    )
    created = serializers.DateTimeField(
        source="created_date_time", required=False
    )

    class Meta:
        model = Recipient
        fields = "__all__"


class RecipientUpdateStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipient
        fields = "__all__"
        read_only_fields = (
            "id",
            "bounces",
            "campaign",
            "clicked",
            "created_date_time",
            "email",
            "full_name",
            "is_delete",
            "is_unsubscribe",
            "lead_status",
            "leads",
            "opens",
            "replacement",
            "replies",
            "sent",
            "update_date_time",
        )


class RecipientDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipient
        fields = [
            "is_delete",
            "id",
        ]
        read_only_fields = ("id",)


class LeadSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadSettings
        fields = ["campaign_id", "click_any_link", "clicks_specific_link"]


class EmailInboxSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailInbox
        fields = "__all__"


class EmailOutboxSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailOutbox
        fields = "__all__"


class LeadsLogSerializer(serializers.ModelSerializer):
    inbox = EmailInboxSerializer(read_only=True, required=False)
    outbox = EmailOutboxSerializer(read_only=True, required=False)

    class Meta:
        model = LeadsLog
        fields = "__all__"


class ProspectsCountSerializer(serializers.Serializer):
    total = serializers.IntegerField(read_only=True)
    in_campaign = serializers.IntegerField(read_only=True)
    engaged = serializers.IntegerField(read_only=True)
    leads = serializers.IntegerField(read_only=True)
    bounces = serializers.IntegerField(read_only=True)
    unsubscribes = serializers.IntegerField(read_only=True)

    class Meta:
        fields = [
            "total",
            "in_campaign",
            "engaged",
            "leads",
            "bounces",
            "unsubscribes",
        ]

    def get(self, user_id):
        q = Q(campaign__assigned=user_id, is_delete=False)

        self.total = Recipient.objects.filter(q).count()
        self.in_campaign = Recipient.objects.filter(q).count()
        self.engaged = 0
        self.leads = Recipient.objects.filter(q).aggregate(Sum("leads"))["leads__sum"]
        self.bounces = Recipient.objects.filter(q).aggregate(Sum("bounces"))["bounces__sum"]
        self.unsubscribes = Recipient.objects.filter(
            campaign__assigned=user_id, is_delete=False, is_unsubscribe=True
        ).count()


class CampaignOverviewFunnelSerializer(serializers.ModelSerializer):
    recipient_count = serializers.IntegerField(read_only=True)
    opened_count = serializers.IntegerField(read_only=True)
    clicked_count = serializers.IntegerField(read_only=True)
    replied_count = serializers.IntegerField(read_only=True)
    bounced_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Emails
        fields = [
            "id",
            "email_type",
            "email_order",
            "email_subject",
            "recipient_count",
            "opened_count",
            "clicked_count",
            "replied_count",
            "bounced_count",
        ]
        ordering = ["email_type", "email_order"]


class CampaignOverviewTotalsSerializer(serializers.ModelSerializer):
    recipient_count = serializers.IntegerField(read_only=True)
    in_campaign_count = serializers.IntegerField(read_only=True)
    opened_count = serializers.IntegerField(read_only=True)
    clicked_count = serializers.IntegerField(read_only=True)
    replied_count = serializers.IntegerField(read_only=True)
    bounced_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = EmailOutbox
        fields = [
            "recipient_count",
            "in_campaign_count",
            "opened_count",
            "clicked_count",
            "replied_count",
            "bounced_count",
        ]


class CampaignOverviewSerializer(serializers.Serializer):
    funnel = CampaignOverviewFunnelSerializer(many=True)
    totals = CampaignOverviewTotalsSerializer(many=False)
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(read_only=True)

    class Meta:
        fields = ["id", "title", "funnel", "totals"]


class AudienceTagListSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudienceTag
        fields = ["id", "name"]


class AudienceSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Audience
        fields = "__all__"

    def get_tags(self, obj):
        return list(obj.tags.all().values_list('name', flat=True))
