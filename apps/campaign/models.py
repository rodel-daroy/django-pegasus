from django.db import models
from typing import Optional
from django.db import transaction

from apps.mailaccounts.models import EmailAccount
from apps.users.models import CustomUser
from apps.utils.utils import RandomFileName
from apps.teams.models import Team
import json
CAMPAIGN_LEAD_SETTING_OPERATOR = (
    ("and", "AND"),
    ("or", "OR"),
)

LEAD_TYPE = (
    ("none", "None"),
    ("open", "Open"),
    ("won", "Won"),
    ("lost", "Lost"),
    ("ignored", "Not Interested"),
)

LEAD_ACTION = (
    ("none", "None"),
    ("opened", "Recipient: Opened Email"),
    ("clicked", "Recipient: Clicked Link"),
    ("replied", "Recipient: Replied"),
    ("sent", "Initial mail sent"),
    ("me_replied", "You: Replied"),
    ("open", "Status: Opened"),
    ("won", "Status: Won"),
    ("lost", "Status: Lost"),
    ("ignored", "Status: Not Interested"),
)


def convert_template(template, replacement):
    if not replacement:
        return template

    if type(replacement) == str:
        replacement = json.loads(replacement)

    for key in replacement.keys():
        key_match = "{{" + key + "}}"
        if key_match in template:
            if replacement[key] is None:
                template = template.replace(key_match, "")
            else:
                template = template.replace(key_match, str(replacement[key]))

    return template


class CampaignLabel(models.Model):
    label_name = models.CharField(max_length=500)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    created_date_time = models.DateTimeField(
        auto_now=True, blank=True, null=True
    )

    def __str__(self):
        return self.lable_name


class Campaign(models.Model):
    title = models.CharField(max_length=200)
    from_address = models.ManyToManyField(
        EmailAccount,
        related_name="campaigns",
    )
    full_name = models.CharField(max_length=200, blank=True, null=True)
    csvfile = models.FileField(
        upload_to=RandomFileName("csv_uploads"), blank=True, null=True
    )
    csvfile_name = models.CharField(max_length=100, blank=True, null=True)
    csv_fields = models.TextField(blank=True, null=True, default="")
    assigned = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    track_opens = models.BooleanField(default=False)
    track_linkclick = models.BooleanField(default=False)
    terms_and_laws = models.BooleanField(default=False)

    campaign_status = models.BooleanField(
        default=True,
        db_index=True
    )  # True: Start, False: Pause
    is_deleted = models.BooleanField(default=False, db_index=True)
    is_draft = models.BooleanField(default=False, db_index=True)
    label_name = models.ForeignKey(
        CampaignLabel, on_delete=models.SET_NULL, null=True
    )
    created_date_time = models.DateTimeField(auto_now=True)
    update_date_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def current_emails(self):
        return self.emails.filter(is_deleted=False).order_by('email_order')

    def createOutboxEmails(
        self,
        emails: list,
        raw_email,
        team: Optional[Team] = None,
    ):
        with transaction.atomic():
            emailAccounts = list(self.from_address.all().values_list('id', flat=True))
            for index, email in enumerate(emails):
                recipient = Recipient.getOrCreateRecipient(
                    self,
                    email["recipient"],
                    emailAccounts,
                    index,
                )

                outbox = {
                    "email": raw_email,
                    "campaign": self,
                    "from_email": recipient.attending_email,
                    "recipient": recipient,
                    "email_subject": convert_template(
                        email["email_subject"], email["recipient"]
                    ),
                    "email_body": convert_template(
                        email["email_body"], email["recipient"]
                    ),
                    "bcc_mail": team.bcc_email if team else "",
                    "status": 0,
                }
                EmailOutbox.objects.create(**outbox)

    def createFollowUps(
        self, follow_ups: list, team: Optional[Team]=None
    ):
        """This method is responsible for creating followups

        Args:
            camp (object): campaign
            follow_ups (list): follow up object list
        """
        if len(follow_ups) == 0:
            return
        with transaction.atomic():
            email_order = 0
            for follow_up in follow_ups:
                follow_email = Emails(
                    campaign=self,
                    wait_days=follow_up["wait_days"],
                    email_subject=follow_up["email_subject"],
                    email_body=follow_up["email_body"],
                    email_type=1,
                    email_order=email_order,
                )
                follow_email.save()
                email_order += 1

                self.createOutboxEmails(
                    follow_up["emails"], follow_email, team
                )

    def createDrips(self, drips: list, team: Optional[Team]=None):
        """This method is responsible for creating campaign email drips

        Args:
            camp ([type]): campaign object
            drips (object): drip objects
        """
        if len(drips) == 0:
            return

        email_order = 0
        with transaction.atomic():
            for drip in drips:
                drip_email = Emails(
                    campaign=self,
                    wait_days=drip["wait_days"],
                    email_subject=drip["email_subject"],
                    email_body=drip["email_body"],
                    email_type=2,
                    email_order=email_order,
                )
                drip_email.save()
                email_order += 1

                self.createOutboxEmails(drip["emails"], drip_email, team)


class LeadSettings(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    join_operator = models.CharField(
        max_length=8, choices=CAMPAIGN_LEAD_SETTING_OPERATOR, default="and"
    )
    replies = models.PositiveSmallIntegerField(blank=True, default=0)
    open = models.PositiveSmallIntegerField(blank=True, default=0)
    click_any_link = models.PositiveSmallIntegerField(blank=True, default=0)

    clicks_specific_link = models.PositiveSmallIntegerField(
        blank=True, default=0
    )


class Recipient(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    email = models.CharField(max_length=200, db_index=True)
    full_name = models.CharField(max_length=200, null=True, db_index=True)
    replacement = models.TextField(blank=True, null=True)
    sent = models.PositiveSmallIntegerField(default=0, db_index=True)
    leads = models.PositiveSmallIntegerField(default=0, db_index=True)
    replies = models.PositiveSmallIntegerField(default=0, db_index=True)
    opens = models.PositiveSmallIntegerField(default=0, db_index=True)
    bounces = models.PositiveSmallIntegerField(default=0, db_index=True)
    clicked = models.PositiveSmallIntegerField(default=0, db_index=True)
    lead_status = models.CharField(
        max_length=32, choices=LEAD_TYPE, default="none", null=True, db_index=True
    )
    attending_email = models.ForeignKey(
        EmailAccount,
        on_delete=models.CASCADE,
        related_name="email_account",
        default=None,
        null=True,
    )

    recipient_status = models.BooleanField(
        default=True
    )  # Start or Pause Recipient
    is_unsubscribe = models.BooleanField(default=False, db_index=True)
    is_delete = models.BooleanField(default=False, db_index=True)
    created_date_time = models.DateTimeField(
        auto_now=True, blank=True, null=True
    )
    update_date_time = models.DateTimeField(
        auto_now=True, blank=True, null=True
    )

    def __str__(self):
        return str(self.email)

    @classmethod
    def getOrCreateRecipient(
        cls,
        new_camp: Campaign,
        recipient: dict,
        emailAccounts: list,
        index: int,
    ):
        campaign_id = new_camp.id

        index_email_account = index % len(emailAccounts)
        res_data = {
            "campaign_id": campaign_id,
            "email": recipient["email"],
            "replacement": json.dumps(recipient),
            "attending_email_id": emailAccounts[index_email_account],
        }
        new_recipient, created = cls.objects.get_or_create(**res_data)

        return new_recipient


class AudienceFile(models.Model):
    csv_file = models.FileField(
        upload_to=RandomFileName("csv_audience"), blank=True, null=True
    )
    csv_file_name = models.CharField(max_length=100, blank=True, null=True)


class AudienceTag(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    csv_audience_file = models.ManyToManyField(AudienceFile)
    name = models.CharField(max_length=150)


class Audience(models.Model):
    email = models.CharField(max_length=200)
    tags = models.ManyToManyField(AudienceTag)
    replacement = models.TextField(blank=True, default="")

    def __str__(self):
        return str(self.email)


class Emails(models.Model):
    campaign = models.ForeignKey(
        Campaign, on_delete=models.CASCADE, related_name="emails"
    )
    email_type = models.PositiveSmallIntegerField(default=0, null=True)
    email_subject = models.CharField(max_length=100)
    email_body = models.TextField(blank=True, null=True)
    wait_days = models.PositiveSmallIntegerField(blank=True, null=True)
    email_order = models.PositiveSmallIntegerField(default=0, null=True)
    is_deleted = models.BooleanField(default=False)


class EmailOutbox(models.Model):
    campaign = models.ForeignKey(
        Campaign, on_delete=models.SET_NULL, blank=True, null=True
    )
    from_email = models.ForeignKey(
        EmailAccount, on_delete=models.SET_NULL, blank=True, null=True
    )
    recipient = models.ForeignKey(
        Recipient, on_delete=models.SET_NULL, blank=True, null=True
    )
    email = models.ForeignKey(
        Emails, on_delete=models.SET_NULL, blank=True, null=True
    )
    email_subject = models.CharField(max_length=100)
    email_body = models.TextField(blank=True, null=True)
    is_campaign = models.BooleanField(default=True)

    bcc_mail = models.CharField(max_length=100, blank=True)
    # 0: need to send, 1: sent successfully, 2: failed to send
    status = models.PositiveSmallIntegerField(default=0, null=True, db_index=True)

    sent_date = models.DateField(auto_now=False, blank=True, null=True)
    sent_time = models.TimeField(auto_now=False, blank=True, null=True)

    # Email open tracking
    opened = models.PositiveIntegerField(default=0)
    opened_datetime = models.DateTimeField(null=True)

    # Email click tracking
    clicked = models.PositiveIntegerField(default=0)
    clicked_datetime = models.DateTimeField(null=True)

    # replied (0: no-reply, 1: replied)
    replied = models.PositiveIntegerField(default=0)
    reply_datetime = models.DateTimeField(null=True)

    # bounce (0: no-bounce, 1: bounced)
    bounced = models.PositiveIntegerField(default=0)


class EmailInbox(models.Model):
    outbox = models.ForeignKey(
        EmailOutbox, on_delete=models.SET_NULL, blank=True, null=True
    )
    recipient_email = models.ForeignKey(
        Recipient, on_delete=models.SET_NULL, blank=True, null=True
    )
    from_email = models.ForeignKey(
        EmailAccount, on_delete=models.SET_NULL, blank=True, null=True
    )
    email_subject = models.TextField()
    email_body = models.TextField(blank=True, null=True)

    # 0: received, 1: processed, 2: other
    status = models.PositiveSmallIntegerField(default=0, db_index=True)
    receive_date = models.DateField(auto_now=False, blank=True, null=True)
    receive_time = models.TimeField(auto_now=False, blank=True, null=True)


class LeadsLog(models.Model):
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE)
    lead_action = models.CharField(
        max_length=32, choices=LEAD_ACTION, default="none", null=True
    )
    inbox = models.ForeignKey(
        EmailInbox, on_delete=models.SET_NULL, blank=True, null=True
    )
    outbox = models.ForeignKey(
        EmailOutbox, on_delete=models.SET_NULL, blank=True, null=True
    )
    assigned = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, blank=True, null=True
    )
    created_date_time = models.DateTimeField(
        auto_now=True, blank=True, null=True
    )


class CampaignRecipient(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    replacement = models.TextField(blank=True, null=True)
    full_name = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    email = models.CharField(max_length=200, db_index=True)
    subject = models.CharField(max_length=2000, blank=True, null=True)
    company_name = models.CharField(max_length=1000, blank=True, null=True)
    role = models.CharField(max_length=1000, blank=True, null=True)
    email_body = models.TextField(blank=True, null=True)
    sent = models.BooleanField(default=False)
    leads = models.BooleanField(default=False)
    replies = models.BooleanField(default=False)
    opens = models.BooleanField(default=False)
    has_link_clicked = models.BooleanField(default=False)
    bounces = models.BooleanField(default=False)
    lead_status = models.CharField(
        max_length=32, choices=LEAD_TYPE, default="none", null=True
    )
    reciepent_status = models.BooleanField(
        default=False
    )  # Start Campaign or Pause Reciepent
    unsubscribe = models.BooleanField(default=False)
    is_delete = models.BooleanField(default=False)

    created_date_time = models.DateTimeField(
        auto_now=True, blank=True, null=True
    )
    update_date_time = models.DateTimeField(
        auto_now=True, blank=True, null=True
    )
    assigned = models.BooleanField(default=True)
    engaged = models.BooleanField(default=False)

    def __str__(self):
        return str(self.campaign)


class FollowUpEmail(models.Model):
    campaign = models.ForeignKey(
        Campaign, on_delete=models.CASCADE, related_name="followups"
    )
    waitDays = models.PositiveIntegerField(default=1)
    subject = models.CharField(max_length=2000, blank=True, null=True)
    email_body = models.TextField(blank=True, null=True)

    def __str__(self):
        return str(self.campaign)


class DripEmailModel(models.Model):
    campaign = models.ForeignKey(
        Campaign, on_delete=models.CASCADE, related_name="drips"
    )
    waitDays = models.PositiveIntegerField(default=1)
    subject = models.CharField(max_length=2000, blank=True, null=True)
    email_body = models.TextField(blank=True, null=True)

    def __str__(self):
        return str(self.campaign)


class EmailOnLinkClick(models.Model):
    campaign = models.ForeignKey("Campaign", on_delete=models.CASCADE)
    waitDays = models.PositiveIntegerField()
    url = models.CharField(max_length=2000)
    subject = models.CharField(max_length=2000)
    email_body = models.TextField()

    def __str__(self):
        return str(self.campaign)


RECIPIENT = (
    ("replies", "Replies"),
    ("open", "Open"),
    ("click_any_link", "Clicks any link"),
    ("clicks_specific_link", "Clicks specific link"),
)


class CampaignLeadCatcher(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    assigned = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    leadcatcher_recipient = models.CharField(
        max_length=32, choices=RECIPIENT, default="replies"
    )
    specific_link = models.URLField(max_length=500, null=True, blank=True)
    of_times = models.PositiveIntegerField(null=True, blank=True, default=0)

    def __str__(self):
        return str(self.campaign)
