from django.contrib import admin

from .models import (
    Campaign,
    CampaignLeadCatcher,
    CampaignRecipient,
    DripEmailModel,
    EmailOnLinkClick,
    FollowUpEmail,
    CampaignLabel,
    AudienceTag,
    Audience,
)


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = (
        "assigned",
        "title",
        "csvfile",
        "created_date_time",
        "track_opens",
        "track_linkclick",
        "terms_and_laws",
        "campaign_status",
        "id",
    )


@admin.register(CampaignRecipient)
class CampaignRecipientAdmin(admin.ModelAdmin):
    list_display = (
        "campaign",
        "email",
        "subject",
        "email_body",
        "sent",
        "leads",
        "replies",
        "opens",
        "bounces",
        "engaged",
        "lead_status",
        "reciepent_status",
        "unsubscribe",
        "is_delete",
        "id",
        "assigned",
    )


@admin.register(FollowUpEmail)
class CampaignFollowUpEmailAdmin(admin.ModelAdmin):
    list_display = ("campaign", "waitDays", "subject", "email_body")


@admin.register(DripEmailModel)
class CampaignDripEmailModelAdmin(admin.ModelAdmin):
    list_display = ("campaign", "waitDays", "subject", "email_body")


@admin.register(EmailOnLinkClick)
class EmailOnLinkClickAdmin(admin.ModelAdmin):
    list_display = ("campaign", "waitDays", "url", "subject", "email_body")


@admin.register(CampaignLeadCatcher)
class CampaignLeadCatcher(admin.ModelAdmin):
    list_display = ("campaign", "assigned",
                    "leadcatcher_recipient", "of_times")


@admin.register(CampaignLabel)
class CampaignLabelAdmin(admin.ModelAdmin):
    list_display = ("label_name", "created_date_time", "id")


@admin.register(AudienceTag)
class AudienceTagAdmin(admin.ModelAdmin):
    list_display = ("name", "user")


@admin.register(Audience)
class AudienceAdmin(admin.ModelAdmin):
    list_display = ("email", "replacement", "get_tags")

    def get_tags(self, obj):
        return list(obj.tags.all().values_list('name', flat=True))
