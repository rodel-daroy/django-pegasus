from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import ugettext_lazy as _
from .storage import OverwriteStorage
from .managers import UserManager
from ..subscriptions.helpers import SubscriptionModelMixin
from apps.subscriptions.models import CustomSubscription


class CustomUser(SubscriptionModelMixin, AbstractUser):
    """
    Add additional fields to the user model here.
    """

    subscription = models.ManyToManyField(
        CustomSubscription,
        help_text=_("The user's Stripe Subscription object, if it exists"),
        related_name="subscription",
    )
    username = None
    email = models.EmailField(unique=True, max_length=500)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=12, null=False, blank=False)
    company_name = models.CharField(max_length=500, null=False, blank=False)
    mailsaas_type = models.CharField(max_length=100, null=False, blank=False)
    avatar = models.FileField(
        upload_to="profile-pictures/",
        storage=OverwriteStorage(),
        null=True,
        blank=True,
    )
    avatar_url = models.TextField(blank=True, null=True)
    tracking_domain = models.CharField(max_length=255, blank=True)
    admin = models.BooleanField(default=False)
    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    # class Meta:
    # ordering = ['-date_joined']
