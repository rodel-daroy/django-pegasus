import uuid

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _

from apps.subscriptions.helpers import SubscriptionModelMixin
from apps.utils.models import BaseModel
from apps.users.models import CustomUser
from . import roles


class Team(SubscriptionModelMixin, BaseModel):
    """
    A Team, with members.
    """

    name = models.CharField(max_length=100)
    bcc_email = models.CharField(max_length=100, null=True, blank=True)
    slug = models.SlugField(unique=True)

    subscription = models.ForeignKey(
        "djstripe.Subscription",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text=_("The team's Stripe Subscription object, if it exists"),
    )

    members = models.ManyToManyField(
        CustomUser, related_name="teams", through="Membership"
    )
    # mailerrize team customizations go here.

    def __str__(self):
        return self.name

    @property
    def sorted_memberships(self):
        return self.membership_set.order_by("user__email")

    def pending_invitations(self):
        return self.invitations.filter(is_accepted=False)

    @property
    def dashboard_url(self):
        return reverse("web:team_home", args=[self.slug])


class Membership(BaseModel):
    """
    A user's team membership
    """

    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE
    )
    role = models.CharField(
        max_length=100, choices=roles.ROLE_CHOICES, default=roles.ROLE_MEMBER
    )
    permission = models.CharField(
        max_length=100, choices=roles.MEMBER_PERMISSION, null=True, blank=True
    )
    # your additional membership fields go here.


class Invitation(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="invitations"
    )
    email = models.EmailField()
    permission = models.CharField(
        max_length=100,
        choices=roles.MEMBER_PERMISSION,
        default=roles.PERMISSION_READ,
    )
    invited_by = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="sent_invitations",
        null=True,
        blank=True,
    )
    is_accepted = models.BooleanField(default=False)
    accepted_by = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="accepted_invitations",
        null=True,
        blank=True,
    )

    def get_url(self, request):
        return request.build_absolute_uri(
            reverse("teams:accept_invitation", args=[self.id])
        )

    # class Meta:
    #     unique_together = ('team', 'email')
