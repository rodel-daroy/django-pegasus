from re import T
from typing import Optional

from django.core.exceptions import ValidationError
from apps.teams.models import Team
from apps.utils.utils import CustomPageNumberPagination
from apps.campaign.exceptions import FieldsDoesNotMatch
import json
import logging
import re
from collections import namedtuple
from io import StringIO

import pandas as pd
import pytracking
from django.conf import settings
from django.db.models import (
    Case,
    Count,
    F,
    IntegerField,
    Q,
    Sum,
    When,
    CharField,
)
from django.db.models.functions import Coalesce, Lower
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status, filters, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.mailaccounts.utils.smtp import convert_template, send_mail_with_smtp
from apps.unsubscribes.serializers import UnsubscribeEmailSerializers
from apps.campaign.tasks import createAllRecipientData
from ..unsubscribes.models import UnsubscribeEmail

from ..users.models import CustomUser

from .models import (
    Audience,
    AudienceFile,
    AudienceTag,
    Campaign,
    CampaignLabel,
    CampaignLeadCatcher,
    CampaignRecipient,
    DripEmailModel,
    EmailOnLinkClick,
    EmailOutbox,
    Emails,
    FollowUpEmail,
    LeadSettings,
    LeadsLog,
    Recipient,
)
from .serializers import (
    AudienceSerializer,
    AudienceTagListSerializer,
    CampaignDeleteSerializer,
    CampaignDetailsSerializer,
    CampaignEmailSerializer,
    CampaignLabelSerializer,
    CampaignLeadCatcherSerializer,
    CampaignListSerializer,
    CampaignOverviewSerializer,
    CampaignSerializer,
    DripEmailSerilizer,
    EmailsSerializer,
    FollowUpSerializer,
    LeadSettingsSerializer,
    LeadsLogSerializer,
    OnclickSerializer,
    ProspectsCountSerializer,
    ProspectsSerializer,
    RecipientDeleteSerializer,
    RecipientSerializer,
    RecipientUpdateStatusSerializer,
)
from django.db import transaction

from ..mailaccounts import SessionType

logger = logging.getLogger(__name__)


class CreateCampaignStartView(APIView):
    """An endpoint to campaign start view (DEPRECATED)"""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        return Response(
            {
                "message": "Your account is not active",
                "status": status.HTTP_200_OK,
            }
        )


class CreateCampaignRecipientsView(APIView):
    """An endpoint to campaign recipients view (DEPRECATED)"""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):

        return Response({"message": "error", "success": False})


class CreateCampaignMessageView(APIView):
    """An endpoint for campaign message view (DEPRECATED)"""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        return Response({"message": "Saved Successfully"})


class CreateCampaignSendView(APIView):
    """An endpoint to  campaign send message view (DEPRECATED)"""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk, format=None):
        resp = {}

        return Response(resp)

    def put(self, request, pk, format=None):

        return Response({"message": "Updated Successfully", "success": True})


class CampaignGetAllEmailsPreview(generics.ListAPIView):
    """An endpoint to retrieve all emails for the campaign (DEPRECATED)"""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk, *args, **kwargs):
        resp = {}

        return Response(resp)

    def put(self, request, pk, *args, **kwargs):

        return Response({"message": "Updated Successfully", "success": "True"})


class CreateCampaignOptionView(APIView):
    """An endpoint to retrieve available campaign options (DEPRECATED)"""

    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, format=None):

        return Response(
            {"message": "Please agree to the terms.", "success": "false"}
        )


class CampaignCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        """
        An endpoint to create compaign with uploaded CSV file or audience.
        """
        if request.user.is_active:
            post_data = request.data
            campaign = json.loads(post_data["campaign"])
            session_type = campaign.get("session_type", SessionType.PERSONAL)
            if session_type == SessionType.TEAM:
                admin_id = campaign.get("admin_id", None)
                campaign["assigned"] = admin_id
            else:
                campaign["assigned"] = request.user.id

            csvfile = post_data.get("csvfile", None)
            if csvfile and csvfile != "null":
                campaign["csvfile"] = post_data["csvfile"]
                campaign["csvfile_name"] = post_data["csvfile"].name
            
            if not type(campaign['emails']) == list or campaign['emails'] == []:
                raise exceptions.NotAcceptable('Audience entry is required..')

            camp = CampaignSerializer(data=campaign)
            
            if camp.is_valid():
                new_camp = camp.save()

                intro_email = Emails(
                    campaign=new_camp,
                    email_subject=campaign["email_subject"],
                    email_body=campaign["email_body"],
                    email_type=0,
                )
                intro_email.save()
                try:
                    team = Team.objects.filter(
                        members__in=[new_camp.assigned]
                    ).get()
                except Team.DoesNotExist:
                    team = None
                campaign.pop('csvfile', None)

                self.createDefaultLead(new_camp)
                createAllRecipientData(
                    new_camp.id, campaign, intro_email.id, team.id if team else None)

                return Response(
                    {
                        "message": "Created new campaign successfully",
                        "success": True,
                    },
                    status=status.HTTP_200_OK,
                )
            logger.error(camp.errors)
            return Response(
                {"message": "Failed to create campaign", "errors": camp.errors, "success": False},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def createDefaultLead(self, camp: Campaign):
        setting_item = LeadSettings(campaign_id=camp.id)
        setting_item.replies = 1
        setting_item.open = 0
        setting_item.click_any_link = 0
        setting_item.clicks_specific_link = 0
        setting_item.save()


class CampaignDeleteView(generics.UpdateAPIView):
    """An endpoint to mark the campaign as deleted"""

    serializer_class = CampaignDeleteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Campaign.objects.filter(assigned=self.request.user.id)

    def update(self, request, *args, **kwargs):
        EmailOutbox.objects.filter(campaign_id=kwargs.get("pk")).delete()
        return super(CampaignDeleteView, self).update(request, *args, **kwargs)


class CampaignSequenceUpdateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        """An endpoint to update campaign sequence"""
        emails = request.data
        for index, email in enumerate(emails):
            if "id" in email:
                instance = Emails.objects.get(pk=email["id"])
                serializer = EmailsSerializer(instance, data=email)
            else:
                serializer = EmailsSerializer(data=email)
            serializer.is_valid(raise_exception=True)
            email_obj = serializer.save()

            # Save the EmailOutbox
            if hasattr(email_obj, "campaign"):
                if "email_type" in email and email["email_type"] == 1:
                    self.save_emailoutbox(email_obj, email)
                if "email_type" in email and email["email_type"] == 2:
                    self.save_emailoutbox(email_obj, email)
        return Response(status=status.HTTP_200_OK)

    def save_emailoutbox(self, email_obj, email_data):
        """ Method save/update the EmailOutbox info"""
        if email_obj.emailoutbox_set.exists():

            # updated the emailoutbox info
            email_obj.emailoutbox_set.update(**{"email_subject": convert_template(
                    email_data["email_subject"], None
                ),
                "email_body": convert_template(
                    email_data["email_body"], None
                )})
        else:
            try:
                team = Team.objects.filter(
                    members__in=[email_obj.campaign.assigned]
                ).get()
            except Team.DoesNotExist:
                team = None
            # save the emailoutbox info
            for recipient in email_obj.campaign.recipient_set.all():

                outbox = {
                    "email": email_obj,
                    "campaign": email_obj.campaign,
                    "from_email": recipient.attending_email,
                    "recipient": recipient,
                    "email_subject": convert_template(
                        email_data["email_subject"], None
                    ),
                    "email_body": convert_template(
                        email_data["email_body"], None
                    ),
                    "bcc_mail": team.bcc_email if team else "",
                    "status": 0,
                }
                EmailOutbox.objects.create(**outbox)


class CampaignWithLeadsListView(generics.ListAPIView):
    """An endpoint to retrieve list of campaigns"""

    queryset = Campaign.objects.all()

    serializer_class = CampaignListSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):

        session_type = self.request.query_params.get("session_type")
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            return (
                super()
                .get_queryset()
                .prefetch_related('from_address')
                .filter(
                    assigned=admin_id, is_deleted=False, recipient__leads__gt=0
                )
                .distinct()
            )
        else:
            return (
                super()
                .get_queryset()
                .prefetch_related('from_address')
                .filter(
                    assigned=self.request.user.id,
                    is_deleted=False,
                    recipient__leads__gt=0,
                )
                .distinct()
            )


class CampaignListView(generics.ListAPIView):
    """An endpoint to retrieve list of campaigns"""

    queryset = Campaign.objects.annotate(
        recipients=Count("recipient"),
        sent=Coalesce(Sum("recipient__sent"), 0),
        opens=Coalesce(Sum("recipient__opens"), 0),
        leads=Coalesce(Sum("recipient__leads"), 0),
        replies=Coalesce(Sum("recipient__replies"), 0),
        bounces=Coalesce(Sum("recipient__bounces"), 0),
    )

    serializer_class = CampaignListSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = CustomPageNumberPagination

    filter_backends = [filters.SearchFilter]
    search_fields = [
        "title",
        "assigned__full_name",
        "from_address__email",
    ]

    def get_queryset(self):
        session_type = self.request.query_params.get("session_type")
        sort_field = self.request.query_params.get("sort_field", "-id")
        sort_dir = self.request.query_params.get("sort_direction", "asc")
        filter = self.request.query_params.get("filter", "all")
        sort_term = "-" + sort_field if sort_dir == "desc" else sort_field
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            qs = (
                super()
                .get_queryset()
                .prefetch_related('from_address')
                .filter(assigned=admin_id, is_deleted=False)
                .order_by(sort_term)
            )
        else:
            qs = (
                super()
                .get_queryset()
                .prefetch_related('from_address')
                .filter(assigned=self.request.user.id, is_deleted=False)
                .order_by(sort_term)
            )

        if filter != "all":
            qs = qs.filter(created_date_time__gte=filter)

        return qs


class CampaignView(generics.ListAPIView):
    """
    For Get all Campaign by user
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        """An endpoint to get campaign object"""
        campaigns = Campaign.objects.filter(assigned=request.user.id)
        allData = []
        for camp in campaigns.iterator():
            campEmail = CampaignRecipient.objects.filter(campaign=camp.id)
            campEmailserializer = CampaignEmailSerializer(campEmail, many=True)
            resp = {
                "id": camp.pk,
                "camp_title": camp.title,
                "camp_created_date_time": camp.created_date_time.strftime(
                    "%B %d"
                ),
                "assigned": camp.assigned.full_name,
                "recipientCount": campEmail.count(),
                "sentCount": 0,
                "leadCount": 0,
                "opensCount": 0,
                "openLeadCount": 0,
                "wonLeadCount": 0,
                "lostLeadCount": 0,
                "ignoredLeadCount": 0,
                "forwardedLeadCount": 0,
            }
            for campData in campEmailserializer.data:
                if campData["sent"]:
                    resp["sentCount"] = resp["sentCount"] + 1

                if campData["opens"]:
                    resp["opensCount"] = resp["opensCount"] + 1

                if campData["leads"]:
                    resp["leadCount"] = resp["leadCount"] + 1

                    if campData["lead_status"] == "openLead":
                        resp["openLeadCount"] = resp["openLeadCount"] + 1
                    if campData["lead_status"] == "wonLead":
                        resp["wonLeadCount"] = resp["wonLeadCount"] + 1
                    if campData["lead_status"] == "lostLead":
                        resp["lostLeadCount"] = resp["lostLeadCount"] + 1
                    if campData["lead_status"] == "ignoredLead":
                        resp["ignoredLeadCount"] = resp["ignoredLeadCount"] + 1
                    if campData["lead_status"] == "forwardedLead":
                        resp["forwardedLeadCount"] = (
                            resp["forwardedLeadCount"] + 1
                        )

            allData.append(resp)
        return Response(allData)


class TrackEmailOpen(APIView):
    """An endpoint to track Email open event (DEPRECATED)."""

    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None, id=None):
        full_url = settings.SITE_URL + request.get_full_path()
        tracking_result = pytracking.get_open_tracking_result(
            full_url,
            base_open_tracking_url=settings.SITE_URL + "/campaign/email/open/",
        )

        trackData = tracking_result.metadata

        try:
            Campaign.objects.get(id=trackData["campaign"])
        except Campaign.DoesNotExist:
            return Response({"message": "Campaign does not exist"})

        campEmail = CampaignRecipient.objects.get(id=trackData["campEmailId"])
        campEmail.opens = True
        campEmail.leads = True
        campEmail.save(update_fields=['opens', 'leads'])
        return Response({"message": "Saved Successfully"})


class TrackEmailClick(APIView):
    """An endpoint to track Email click (DEPRECATED)."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None, id=None):

        return Response({"message": "Saved Successfully"})


class GetCampaignOverview(APIView):
    """An endpoint to get campaign overview. (DEPRECATED)"""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk, format=None):

        return Response({})


class CampaignOverviewSummary(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignOverviewSerializer

    def get(self, request, pk):
        """An endpoint to get campaign overview summary."""
        stats = namedtuple("Stats", ("id", "title", "funnel", "totals"))

        try:
            campaign = Campaign.objects.get(pk=pk)

            summary = stats(
                id=pk,
                title=campaign.title,
                funnel=Emails.objects.filter(
                    campaign=pk, campaign__assigned=self.request.user.id
                ).annotate(
                    recipient_count=Count(
                        Case(
                            When(
                                emailoutbox__status=1,
                                then="emailoutbox__recipient",
                            ),
                            default=None,
                            output_field=IntegerField(),
                        ),
                        distinct=True,
                    ),
                    opened_count=Sum("emailoutbox__opened"),
                    clicked_count=Sum("emailoutbox__clicked"),
                    replied_count=Sum("emailoutbox__replied"),
                    bounced_count=Sum("emailoutbox__bounced"),
                ),
                totals=EmailOutbox.objects.filter(
                    campaign=pk,
                    campaign__assigned=self.request.user.id,
                    status=1,
                ).aggregate(
                    recipient_count=Count("recipient", distinct=True),
                    in_campaign_count=Count("recipient", distinct=True),
                    opened_count=Sum("opened"),
                    clicked_count=Sum("clicked"),
                    replied_count=Sum("replied"),
                    bounced_count=Sum("bounced"),
                ),
            )

            serializer = CampaignOverviewSerializer(summary)
            return Response(serializer.data)

        except Exception as e:
            logger.error(e)
            return Response("Bad request", status=status.HTTP_400_BAD_REQUEST)


class AllRecipientView(generics.RetrieveUpdateDestroyAPIView):
    """For View  all Recipients"""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk, *args, **kwargs):
        """
        An endpoint to retrieve Recipients


        These filter are pending
        * Recipients with problem,
        * customized message,
        * has clicked,
        * has out-of-office reply,
        * you replied,
        * has not clicked,
        * you have not replied
        """
        search = request.GET.get("search", None)
        tofilter = request.GET.get("tofilter", None)
        choice = request.GET.get("choice", "none")
        queryset = CampaignRecipient.objects.filter(campaign=pk)
        q = Q()

        if tofilter:
            if tofilter == "paused_reciepent":
                q = Q(reciepent_status=False)
            elif tofilter == "leads":
                choice = choice.replace("lead", "Lead")
                q = Q(leads=True, lead_status=choice)
            elif tofilter == "was_sent_message":
                q = Q(sent=True)
            elif tofilter == "has_opened":
                q = Q(opens=True)
            elif tofilter == "has_replied":
                q = Q(replies=True)
            elif tofilter == "has_bounced":
                q = Q(bounces=True)
            elif tofilter == "has_unsubscribed":
                q = Q(unsubscribe=True)
            elif tofilter == "was_not_sent_messagese":
                q = Q(sent=False)
            elif tofilter == "has_not_opened":
                q = Q(opens=False)
            elif tofilter == "has_not_replied":
                q = Q(replies=False)

            queryset = queryset.filter(q)

        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) | Q(full_name__icontains=search)
            )
        campEmailserializer = CampaignEmailSerializer(queryset, many=True)
        return Response(campEmailserializer.data)


class RecipientDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = ""
    serializer_class = CampaignEmailSerializer

    def get_object(self, request, pk):
        try:
            return CampaignRecipient.objects.get(id=pk)
        except CampaignRecipient.DoesNotExist:
            return Response(
                {"message": "Reciepent does not exist", "success": False}
            )

    def put(self, request, pk, format=None):
        """An endpoint to create new / update existing recipient details"""
        queryset = self.get_object(request, pk)
        queryset.leads = True
        queryset.save(update_fields=['leads'])
        CampaignEmailSerializer(queryset)
        return Response(
            {"message": "Lead Updated successfully", "success": True}
        )

    def delete(self, request, pk, format=None):
        """An endpoint to delete recipient object"""
        queryset = self.get_object(request, pk)
        queryset.delete()
        return Response({"success": True, "status": status.HTTP_200_OK})


class CampaignleadCatcher(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignLeadCatcherSerializer

    def post(self, request, format=None):
        """An endpoint to create campaign lead catcher"""
        try:
            CampaignLeadCatcher.objects.get(campaign=request.data["campaign"])
        # if not already_exist_lead_catcher:
        except CampaignLeadCatcher.DoesNotExist:
            request.data["assigned"] = request.user.id
            serializer = CampaignLeadCatcherSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "success": True,
                        "message": "leadcatcher settings created",
                    }
                )
            else:
                return Response(
                    {"success": False, "status": serializer.errors}
                )

        return Response(
            {
                "success": False,
                "message": "leadcatcher for this campaign already exist",
            }
        )


class LeadCatcherView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignLeadCatcherSerializer

    def get(self, request, pk):
        """An endpoint to retrieve list of lead catcher objects"""
        try:
            queryset = CampaignLeadCatcher.objects.get(campaign=pk)
            serializer = CampaignLeadCatcherSerializer(queryset)
            return Response(serializer.data)
        except Exception:
            return Response({"message": "lead catcher not available "})


class LeadCatcherUpdateView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignLeadCatcherSerializer

    def put(self, request, pk, format=None):
        """An endpoint to update campaign lead catcher object"""
        queryset = CampaignLeadCatcher.objects.get(id=pk)
        request.data["assigned"] = request.user.id
        serializer = CampaignLeadCatcherSerializer(queryset, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Data Updated successful", "success": True}
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        """An endpoint to delete campaign lead catcher object"""
        queryset = CampaignLeadCatcher.objects.get(id=pk)
        queryset.delete()
        return Response({"success": True, "status": status.HTTP_200_OK})


class CampaignMessages(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = CampaignRecipient.objects.all()
    serializer_class = CampaignEmailSerializer

    """
    For View subject and email_body of normal/Follow_up/Drip/On_click email.
    """

    def get(self, request, pk, format=None):
        """An endpoint to retrieve campaign message object"""
        alldata = {}
        normallist = []
        # normal = CampaignRecipient.objects.filter(campaign=pk)
        for nrml in CampaignRecipient.objects.filter(campaign=pk).iterator():
            serilizer = CampaignEmailSerializer(nrml)
            normallist.append(
                {
                    "id": serilizer.data["id"],
                    "subject": serilizer.data["subject"],
                    "email_body": serilizer.data["email_body"],
                }
            )
        alldata["normal"] = normallist[0]

        follow_up_list = []
        # followup = FollowUpEmail.objects.filter(campaign=pk)
        for follow_up in FollowUpEmail.objects.filter(campaign=pk).iterator():
            serilizer = FollowUpSerializer(follow_up)
            follow_up_list.append(
                {
                    "id": serilizer.data["id"],
                    "subject": serilizer.data["subject"],
                    "email_body": serilizer.data["email_body"],
                }
            )
        alldata["followup"] = follow_up_list[0]

        drip_list = []
        # drip = DripEmailModel.objects.filter(campaign=pk)
        for drip_mail in DripEmailModel.objects.filter(campaign=pk).iterator():
            serilizer = DripEmailSerilizer(drip_mail)
            drip_list.append(
                {
                    "id": serilizer.data["id"],
                    "subject": serilizer.data["subject"],
                    "email_body": serilizer.data["email_body"],
                }
            )
        alldata["drip"] = drip_list[0]

        onclick_list = []
        # on_click = EmailOnLinkClick.objects.filter(campaign=pk)
        for onclick in EmailOnLinkClick.objects.filter(campaign=pk).iterator():
            serilizer = OnclickSerializer(onclick)
            onclick_list.append(
                {
                    "id": serilizer.data["id"],
                    "subject": serilizer.data["subject"],
                    "email_body": serilizer.data["email_body"],
                }
            )
        alldata["on_click"] = onclick_list[0]

        return Response(alldata)

    def put(self, request, pk, format=None):
        """
        For Update subject and email_body of normal/Follow_up/Drip/On_click
        email.
        """

        normal_mail = CampaignRecipient.objects.filter(
            id=request.data["normal"]["id"]
        ).first()
        if normal_mail:
            # normal_mail = normalemail.first()
            normalemaildata = CampaignEmailSerializer(normal_mail)
            normalemaildata = dict(normalemaildata.data)
            normalemaildata["subject"] = request.data["normal"]["subject"]
            normalemaildata["email_body"] = request.data["normal"][
                "email_body"
            ]
            normalemailserilize = CampaignEmailSerializer(
                normal_mail, data=normalemaildata
            )
            if not normalemailserilize.is_valid():
                return Response({"error": normalemailserilize.errors})
            normalemailserilize.save()

        follow_up = FollowUpEmail.objects.filter(
            id=request.data["followup"]["id"]
        ).first()
        if follow_up:
            # follow_up = followup.first()
            followupdata = FollowUpSerializer(follow_up)
            followupdata = dict(followupdata.data)
            followupdata["subject"] = request.data["followup"]["subject"]
            followupdata["email_body"] = request.data["followup"]["email_body"]
            followupserilize = FollowUpSerializer(follow_up, data=followupdata)
            if not followupserilize.is_valid():
                return Response({"error2": followupserilize.errors})
            followupserilize.save()

        drip_mail = DripEmailModel.objects.filter(id=request.data["drip"]["id"]).first()
        if drip_mail:
            # drip_mail = dripmail.first()
            dripmaildata = DripEmailSerilizer(drip_mail)
            dripmaildata = dict(dripmaildata.data)
            dripmaildata["subject"] = request.data["drip"]["subject"]
            dripmaildata["email_body"] = request.data["drip"]["email_body"]
            dripmailserilize = DripEmailSerilizer(drip_mail, data=dripmaildata)
            if not dripmailserilize.is_valid():
                return Response({"error2": dripmailserilize.errors})
            dripmailserilize.save()

        on_click = EmailOnLinkClick.objects.filter(
            id=request.data["on_click"]["id"]
        ).first()
        if on_click:
            # on_click = onlinkclickmail.first()
            onlinkclickmaildata = OnclickSerializer(on_click)
            onlinkclickmaildata = dict(onlinkclickmaildata.data)
            onlinkclickmaildata["subject"] = request.data["on_click"][
                "subject"
            ]
            onlinkclickmaildata["email_body"] = request.data["on_click"][
                "email_body"
            ]
            onlinkclickserilize = OnclickSerializer(
                on_click, data=onlinkclickmaildata
            )
            if not onlinkclickserilize.is_valid():
                return Response({"error2": onlinkclickserilize.errors})
            onlinkclickserilize.save()
            return Response({"message": "Data updated successfully"})


class ProspectsView(generics.ListAPIView):
    """This view should return a list of all the prospects."""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProspectsSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["leads", "bounces", "is_unsubscribe"]

    def get_queryset(self):

        user = self.request.user

        unsubscribe_emails = UnsubscribeEmail.objects.values_list(
            "email", flat=True
        )

        return (
            Recipient.objects.filter(
                campaign__assigned=user.id, is_delete=False
            )
            .exclude(email__in=unsubscribe_emails)
            .values("email")
            .annotate(
                sent_count=Coalesce(Sum("sent"), 0),
                open_count=Coalesce(Sum("opens"), 0),
                click_count=Coalesce(Sum("clicked"), 0),
                reply_count=Coalesce(Sum("replies"), 0),
                lead_count=Coalesce(Sum("leads"), 0),
            )
        )


class ProspectsDetailView(generics.ListAPIView):
    """An endpoint to retrieve the prospect (campaign recipient)"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = RecipientSerializer
    pagination_class = None

    def get_queryset(self):
        session_type = self.request.query_params.get("session_type")
        email = self.request.query_params.get("email")
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            return Recipient.objects.select_related('campaign').filter(
                campaign__assigned=admin_id,
                is_delete=False,
                email__iexact=email,
            )
        else:
            return Recipient.objects.select_related('campaign').filter(
                campaign__assigned=self.request.user.id,
                is_delete=False,
                email__iexact=email,
            )


class ProspectsCountView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProspectsCountSerializer

    def get(self, request):
        """An endpoint to get prospect stats"""
        
        user = self.request.user
        q = Q(campaign__assigned=user.id, is_delete=False)

        total = Recipient.objects.filter(q).count()
        in_campaign = Recipient.objects.filter(q).count()
        engaged = 0
        leads = Recipient.objects.filter(q).aggregate(Sum("leads"))["leads__sum"]
        bounces = Recipient.objects.filter(q).aggregate(Sum("bounces"))["bounces__sum"]
        unsubscribes = Recipient.objects.filter(
            campaign__assigned=user.id, is_delete=False, is_unsubscribe=True
        ).count()

        return Response(
            {
                "total": total,
                "in_campaign": in_campaign,
                "engaged": engaged,
                "leads": leads,
                "bounces": bounces,
                "unsubscribes": unsubscribes,
            }
        )


# VK-19042021: This view is not being used.
class ProspectsCampaignView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk, *args, **kwargs):
        email_for_campaigns = CampaignRecipient.objects.get(id=pk)

        queryset = CampaignRecipient.objects.filter(
            email=email_for_campaigns.email, is_delete=False
        )
        resp = []

        for queryset in queryset.iterator():
            data = {
                "campaign_id": queryset.campaign.id,
                "reciepent_email": queryset.email,
                "campaign_title": queryset.campaign.title,
                "added": Campaign.objects.filter(id=queryset.campaign.id)
                .values_list("created_date_time")[0][0]
                .strftime("%B %d, %Y"),
                "sent_in_a_camp": CampaignRecipient.objects.filter(
                    campaign=queryset.campaign.id, sent=True
                ).count(),
                "lead_status": queryset.lead_status,
                "opens": CampaignRecipient.objects.filter(
                    campaign=queryset.campaign.id, opens=True
                ).count(),
                "replies": CampaignRecipient.objects.filter(
                    campaign=queryset.campaign.id, replies=True
                ).count(),
            }

            resp.append(data)

        return Response(resp)


class RecipientUnsubcribe(generics.UpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UnsubscribeEmailSerializers

    def put(self, request, format=None):
        """An endpoint to mark recipients as unsubscribed"""
        recipient_id = request.data["recipient_id"]
        for id in recipient_id:
            recipient = CampaignRecipient.objects.get(id=id)
            recipient.unsubscribe = True
            recipient.save(update_fields=['unsubscribe'])
            data = {
                "email": recipient.email,
                "full_name": recipient.full_name,
                "mail_account": recipient.campaign.from_address.email,
                "user": request.user.id,
            }
            serializer = UnsubscribeEmailSerializers(data=data)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors)
        return Response(
            {"message": "unsubscribe update successfully", "status": True}
        )


class RecipientUnassignedView(generics.UpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignEmailSerializer

    def put(self, request, format=None):
        """An endpoint to mark recipients as unassigned"""
        recipient_id = request.data["recipient_id"]
        for id in recipient_id:
            recipient = CampaignRecipient.objects.get(id=id)
            recipient.assigned = False
            recipient.save(update_fields=['assigned'])
            serializer = CampaignEmailSerializer(data=recipient)
            if serializer.is_valid():
                serializer.save()
        return Response({"message": "recipient unassigned successfully"})


# VK-19042021: This view is not being used.
class AddLabelView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignLabelSerializer

    def post(self, request, *args, **kwargs):
        request.data["user"] = request.user.id
        serializer = CampaignLabelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "label added successfully", "success": True}
            )
        return Response({"message": serializer.errors, "success": False})

    def get(self, request, *args, **kwargs):
        queryset = CampaignLabel.objects.all()
        serializer = CampaignLabelSerializer(queryset, many=True)
        return Response({"data": serializer.data, "success": True})


class LeadCatcherStatusUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignEmailSerializer

    def put(self, request, *args, **kwargs):
        """An endpoint to mark recipients as unassigned"""
        eamil_ids = request.data["eamil_ids"]
        lead_status = request.data["lead_status"]
        try:
            CampaignRecipient.objects.filter(id__in=eamil_ids).update(
                lead_status=lead_status
            )
        except Exception:
            Response(
                {
                    "message": "There was a problem updating Lead Catcher",
                    "success": False,
                }
            )

        return Response(
            {"message": "Lead Updated successfully", "success": True}
        )


class CampaignDetailsSequenceView(generics.RetrieveAPIView):
    """An endpoint to retrieve Campaign details"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignDetailsSerializer

    def get_queryset(self):
        session_type = self.request.query_params.get("session_type")
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            return Campaign.objects.filter(assigned=admin_id).prefetch_related('emails')
        else:
            return Campaign.objects.filter(assigned=self.request.user.id).prefetch_related('emails')


class CampaignDetailsRecipientsView(generics.ListAPIView):
    """An endpoint to get campaign recipient details"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = RecipientSerializer

    def get_queryset(self):
        pk = self.kwargs["pk"]
        return Recipient.objects.filter(campaign=pk, is_delete=False)


class CampaignDetailsRecipientsAddView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        """An endpoint to import contact details from CSV file or audience."""

        tag = request.data["tag"]
        campaign = Campaign.objects.filter(pk=pk).get()
        email_accounts = list(campaign.from_address.all().values_list('id', flat=True))

        will_ignore_duplicates = (
            True if request.data["ignore_duplicates"] == "true" else False
        )

        try:
            team = Team.objects.filter(members__in=[campaign.assigned]).get()
        except Team.DoesNotExist:
            team = None

        try:
            if tag == "null":
                recipients = self.createRecipientsByCSV(
                    will_ignore_duplicates, pk, email_accounts, team
                )
            else:
                recipients = self.createRecipientsByTag(
                    will_ignore_duplicates, pk, email_accounts, team
                )
        except FieldsDoesNotMatch:
            return Response(
                "The columns of the new recipients must match with the existing recipients in this campaign.",  # noqa: E501
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(data=recipients, status=status.HTTP_201_CREATED)

    def replacementMatch(self, repl_1, repl_2):
        replacement_1 = json.loads(repl_1)
        replacement_2 = json.loads(repl_2)

        if replacement_1.keys() != replacement_2.keys():
            return False
        else:
            return True

    def createRecipientsByCSV(
        self,
        will_ignore_duplicates: bool,
        campaign_id: int,
        email_accounts: list,
        team: Team,
    ) -> list:
        data = self.request.data
        csv_file = data["csv_file"]
        file_data = csv_file.read().decode("utf-8")
        string_data = StringIO(file_data)

        df_data = pd.read_csv(string_data)
        df_data.drop(
            df_data.columns[
                df_data.columns.str.contains("unnamed", case=False)
            ],
            axis=1,
            inplace=True,
        )
        csv_columns = df_data.columns

        if "Email" in csv_columns:
            df_data.rename(columns={"Email": "email"}, inplace=True)
        df_data.dropna(subset=["email"], inplace=True)
        df_data.drop_duplicates(subset=["email"], inplace=True)

        emails = df_data["email"].values
        replacements = json.loads(df_data.to_json(orient="records"))
        recipient = Recipient.objects.filter(campaign=campaign_id).first()

        repl_match = self.replacementMatch(
            json.dumps(replacements[0]), recipient.replacement
        )

        if not repl_match:
            raise (FieldsDoesNotMatch)

        dup_set = {}
        if will_ignore_duplicates:
            dup = Recipient.objects.filter(
                email__in=emails, campaign=campaign_id, is_delete=False
            ).values_list("email", flat=True)
            dup_set = set(dup)

        recipients = []

        for index, (email, replacement) in enumerate(
            zip(emails, replacements)
        ):
            index_from_email = index % len(email_accounts)
            if will_ignore_duplicates:
                if email in dup_set:
                    continue

            data = {
                "campaign": campaign_id,
                "email": email,
                "replacement": json.dumps(replacement),
                "attending_email": email_accounts[index_from_email],
            }
            serializer = RecipientSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                recipients.append(serializer.data)

                # campaign_emails = Emails.objects.filter(campaign_id=campaign_id)
                email_outbox_ls = []

                for email in Emails.objects.filter(campaign_id=campaign_id).iterator():
                    outbox = {
                        "email_id": email.id,
                        "campaign_id": campaign_id,
                        "from_email_id": email_accounts[index_from_email],
                        "recipient_id": serializer.data["id"],
                        "email_subject": convert_template(
                            email.email_subject, serializer.data["replacement"]
                        ),
                        "email_body": convert_template(
                            email.email_body, serializer.data["replacement"]
                        ),
                        "bcc_mail": team.bcc_email if team else "",
                        "status": 0,
                    }

                    # EmailOutbox.objects.create(**outbox)
                    email_outbox_ls.append(EmailOutbox(**outbox))

                EmailOutbox.bulk_create(email_outbox_ls)

        return recipients

    def createRecipientsByTag(
        self,
        will_ignore_duplicates: bool,
        campaign_id: int,
        email_accounts: list,
        team: Team,
    ):
        tag = self.request.data["tag"]
        tag_obj = AudienceTag.objects.prefetch_related("audience_set").get(
            pk=tag, user=self.request.user
        )
        recipients = []

        recipient = Recipient.objects.filter(campaign=campaign_id).first()
        audience = tag_obj.audience_set.first()

        repl_match = self.replacementMatch(
            audience.replacement, recipient.replacement
        )

        if not repl_match:
            raise (FieldsDoesNotMatch)

        dup_set = {}
        if will_ignore_duplicates:
            dup = Recipient.objects.filter(
                campaign=campaign_id, is_delete=False
            ).values_list("email", flat=True)
            dup_set = set(dup)


        for index, audience in enumerate(tag_obj.audience_set.all().iterator()):
            index_email_account = index % len(email_accounts)
            if will_ignore_duplicates:
                if audience.email in dup_set:
                    continue

            data = {
                "campaign": campaign_id,
                "email": audience.email,
                "replacement": audience.replacement,
                "attending_email": email_accounts[index_email_account],
            }
            serializer = RecipientSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                recipients.append(serializer.data)

                # emails = Emails.objects.filter(campaign_id=campaign_id)
                email_outbox_ls = []

                for email in Emails.objects.filter(campaign_id=campaign_id).iterator():
                    outbox = {
                        "email_id": email.id,
                        "campaign_id": campaign_id,
                        "from_email_id": email_accounts[index_email_account],
                        "recipient_id": serializer.data["id"],
                        "email_subject": convert_template(
                            email.email_subject, audience.replacement
                        ),
                        "email_body": convert_template(
                            email.email_body, audience.replacement
                        ),
                        "bcc_mail": team.bcc_email if team else "",
                        "status": 0,
                    }
                    email_outbox_ls.append(EmailOutbox(**outbox))
                    # EmailOutbox.objects.create(**outbox)

                EmailOutbox.objects.bulk_create(email_outbox_ls)

        return recipients


class CampaignDetailsRecipientsUpdateStatusView(generics.UpdateAPIView):
    """An endpoint to update recipient status"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = RecipientUpdateStatusSerializer

    def get_queryset(self):
        user = self.request.user
        return Recipient.objects.filter(
            campaign__assigned=user.id, is_delete=False
        )


class CampaignDetailsRecipientsDeleteView(generics.UpdateAPIView):
    """An endpoint to mark recipient as deleted (soft delete)"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = RecipientDeleteSerializer

    def get_queryset(self):
        user = self.request.user
        return Recipient.objects.filter(
            campaign__assigned=user.id, is_delete=False
        )


class CampaignDetailsSettingsView(generics.RetrieveAPIView):
    """An endpoint to retrive campaign settings"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignSerializer

    def get_queryset(self):
        session_type = self.request.query_params.get("session_type")
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            return Campaign.objects.filter(assigned=admin_id)
        else:
            return Campaign.objects.filter(assigned=self.request.user.id)


class CampaignDetailsSettingsUpdateView(generics.UpdateAPIView):
    """An endppoint to update campaign detail settings"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CampaignSerializer

    def get_queryset(self):
        user = self.request.user
        return Campaign.objects.filter(assigned=user.id)

    def update(self, request, *args, **kwargs):
        response = super(CampaignDetailsSettingsUpdateView, self).update(
            request, *args, **kwargs
        )
        self.update_recipients(
            kwargs.get("pk"), request.data.get("from_address")
        )
        self.update_email_outbox(
            kwargs.get("pk"), request.data.get("from_address")
        )
        return response

    def update_recipients(self, campaign_id: int, from_address: list):

        for index, recipient in enumerate(
            Recipient.objects.filter(
                campaign_id=campaign_id, is_delete=False
            ).all().iterator()
        ):
            index_recipient = index % len(from_address)
            recipient.attending_email_id = from_address[index_recipient]
            recipient.save(update_fields=['attending_email'])

    def update_email_outbox(self, campaign_id: int, from_address: list):

        for index, outbox in enumerate(
            EmailOutbox.objects.filter(
                campaign_id=campaign_id,
            ).all().iterator()
        ):
            email_account_index = index % len(from_address)
            outbox.from_email_id = from_address[email_account_index]
            outbox.save(update_fields=['from_email'])


class CampaignLeadsView(generics.ListAPIView):
    """An endpoint to retrieve the campaign list."""

    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = CustomPageNumberPagination
    serializer_class = RecipientSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        "email",
        "full_name",
        "campaign__title",
        "campaign__assigned__full_name",
        "lead_status",
    ]

    def paginate_queryset(self, queryset, view=None):
        if "no_page" in self.request.query_params:
            return None
        else:
            return self.paginator.paginate_queryset(
                queryset, self.request, view=self
            )

    def get_queryset(self):
        CharField.register_lookup(Lower, "lower")

        session_type = self.request.query_params.get("session_type")
        sort_field = self.request.query_params.get(
            "sort_field", "update_date_time"
        )
        sort_dir = self.request.query_params.get("sort_direction", "asc")
        filter = self.request.query_params.get("filter", "all")
        campaign_filter = self.request.query_params.get(
            "campaign_filter", "all"
        )
        sort_term = "-" + sort_field if sort_dir == "desc" else sort_field
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            queryset = Recipient.objects.select_related('campaign').filter(
                Q(leads__gt=0) & Q(campaign__assigned=admin_id)
            ).order_by(sort_term)
        else:
            queryset = Recipient.objects.select_related('campaign').filter(
                Q(leads__gt=0) & Q(campaign__assigned=self.request.user.id)
            ).order_by(sort_term)

        if filter != "all":
            queryset = queryset.filter(Q(lead_status=filter))

        if campaign_filter != "all":
            queryset = queryset.filter(Q(campaign__id=campaign_filter))

        return queryset


class CampaignUpdateStatus(APIView):
    """
    An endpoint to update campaign status.

    POST: update campaign status.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        campaign = Campaign.objects.filter(id=pk).first()

        if campaign:
            if not campaign.from_address and request.data["status"]:
                return Response(
                    "Please configure outbound email account.",
                    status=status.HTTP_400_BAD_REQUEST,
                )

            campaign.campaign_status = request.data["status"]
            campaign.save(update_fields=['campaign_status'])
            return Response({"success": True})

        return Response(
            "Campaign doesn't exist!", status=status.HTTP_400_BAD_REQUEST
        )


class CampaignLeadSettingView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = LeadSettingsSerializer

    def get(self, request, campaign_id):
        """An endpoint to retrieve campaign lead object."""
        return Response(
            LeadSettings.objects.filter(campaign_id=campaign_id).values()
        )

    def post(self, request, campaign_id):
        """An endpoint to update campaign lead object."""
        setting_items = LeadSettings.objects.filter(campaign_id=campaign_id)
        if setting_items:
            setting_item = setting_items.first()
            setting_item.replies = 0
            setting_item.open = 0
            setting_item.click_any_link = 0
            setting_item.clicks_specific_link = 0
        else:
            setting_item = LeadSettings(campaign_id=campaign_id)

        for field in request.data:
            if field == "replies":
                setting_item.replies = request.data[field]
            elif field == "open":
                setting_item.open = request.data[field]
            elif field == "click_any_link":
                setting_item.click_any_link = request.data[field]
            elif field == "clicks_specific_link":
                setting_item.clicks_specific_link = request.data[field]
            elif field == "join_operator":
                setting_item.join_operator = request.data[field]
        setting_item.save()

        return Response({"success": True})


class RecipientSequenceView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, camp_id, lead_id):
        """An endpoint to retrieve lead details

        Args:
            request: HTTP Request
            camp_id (int): Campaign Id
            lead_id (int): Lead Id

        Returns:
            Json Object: Json response
        """
        recipient = Recipient.objects.filter(id=lead_id).first()
        if recipient is None:
            return Response({"success": False})

        outbound_emails = (
            EmailOutbox.objects.filter(
                campaign_id=camp_id, recipient_id=lead_id, status=1
            )
            .select_related("from_email")
            .order_by("id")
        )

        outbound_emails = outbound_emails.values(
            from_email_addr=F("from_email__email"),
            from_first_name=F("from_email__first_name"),
            from_last_name=F("from_email__last_name"),
        ).values()

        return Response({"success": True, "content": outbound_emails})


class LeadDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, camp_id, lead_id):
        """An endpoint to retrieve lead details

        Args:
            request: HTTP Request
            camp_id (int): Campaign Id
            lead_id (int): Lead Id

        Returns:
            Json Object: Json response
        """
        recipient = Recipient.objects.filter(id=lead_id).first()
        if recipient is None:
            return Response({"success": False})

        outbound_email = (
            EmailOutbox.objects.filter(
                campaign_id=camp_id, recipient_id=lead_id, email__email_type=0
            )
            .select_related("from_email", "campaign")
            .order_by("id")
        )
        if len(outbound_email) == 0:

            return Response({"success": False})

        outbound_email = outbound_email.values(
            from_email_addr=F("from_email__email"),
            from_first_name=F("from_email__first_name"),
            from_last_name=F("from_email__last_name"),
        ).values()[0]

        '''This following line can consume a lot of time in worst scenario.'''
        # outbound_email["logs"] = []
        # for log in LeadsLog.objects.filter(recipient_id=lead_id).order_by(
        #     "created_date_time"
        # ).iterator():
        #     outbound_email["logs"].append(LeadsLogSerializer(log).data)
        outbound_email["logs"] = LeadsLogSerializer(LeadsLog.objects.select_related('inbox', 'outbox').filter(
            recipient_id=lead_id).order_by("created_date_time"), many=True).data

        return Response({"success": True, "content": outbound_email})


class LeadStatusUpdate(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, lead_id):
        """An endpoint to update lead status

        Args:
            request: HTTP Request
            lead_id (int): Lead Id

        Returns:
            Json Object: Json response
        """
        recipient = Recipient.objects.filter(id=lead_id).first()
        if recipient is None:
            return Response({"success": False, "content": {}})

        lead_status = request.data["status"]
        if lead_status == "reopen":
            recipient.lead_status = "open"
        else:
            recipient.lead_status = lead_status
        recipient.save(update_fields='lead_status')

        if lead_status == "reopen":
            return Response({"success": True})

        log = LeadsLog(lead_action=lead_status, recipient_id=lead_id)
        log.save()

        return Response(
            {"success": True, "content": {"log": LeadsLogSerializer(log).data}}
        )


class LeadReply(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, camp_id, lead_id):
        """An endpoint to trigger an email response to the campaign lead recipient.

        Args:
            request (dict): Request object containing form data
            camp_id (int): Campaign Id
            lead_id (int): Lead Id

        Returns:
            Json Object: Json response
        """
        campaign = Campaign.objects.filter(id=camp_id).first()
        recipient = Recipient.objects.filter(id=lead_id).first()
        if recipient is None or campaign is None:
            return Response({"success": False, "content": {}})

        email_account = recipient.attending_email
        if email_account is None:
            return Response({"success": False, "content": {}})

        template_subject = request.data["subject"]
        template_body = request.data["body"]
        subject = convert_template(template_subject, recipient.replacement)
        body = convert_template(template_body, recipient.replacement)

        email = Emails()
        email.email_type = 3
        email.campaign_id = camp_id
        email.email_subject = template_subject
        email.email_body = template_body
        email.save()

        outbox = EmailOutbox()
        outbox.email_id = email.id
        outbox.campaign_id = camp_id
        outbox.from_email_id = email_account.id
        outbox.recipient_id = recipient.id
        outbox.email_subject = subject
        outbox.email_body = body
        outbox.status = 0
        outbox.save()

        send_mail_with_smtp(
            host=email_account.smtp_host,
            port=email_account.smtp_port,
            username=email_account.smtp_username,
            password=email_account.smtp_password,
            use_tls=email_account.use_smtp_ssl,
            from_email=email_account.email,
            to_email=[recipient.email],
            subject=subject,
            body=body,
            uuid=outbox.id,
            track_opens=None,
            track_linkclick=None,
            tracking_domain=campaign.assigned.tracking_domain,
        )

        log = LeadsLog(
            lead_action="me_replied", recipient_id=lead_id, outbox_id=outbox.id
        )
        log.save()

        return Response(
            {"success": True, "content": {"log": LeadsLogSerializer(log).data}}
        )


class CampaignScheduleView(APIView):
    """(DEPRECATED)"""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        # Moved to mailaccounts > tasks.py
        return Response()


class RecipientsCheck(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        """
        An Endpoint to check duplicate recipients from the uploaded CSV file.
        """
        post_data = request.data

        if post_data["csvfile"] and len(post_data["csvfile"]) > 0:
            csv_file = post_data["csvfile"]
            file_data = csv_file.read().decode("utf-8")
            string_data = StringIO(file_data)
            df_csv = pd.read_csv(string_data)

            df_csv.drop(
                df_csv.columns[
                    df_csv.columns.str.contains("unnamed", case=False)
                ],
                axis=1,
                inplace=True,
            )
            csv_columns = df_csv.columns

            if "Email" in csv_columns:
                df_csv.rename(columns={"Email": "email"}, inplace=True)

            recipients = json.loads(df_csv.to_json(orient="records"))

            df_csv.dropna(subset=["email"], inplace=True)
            df_csv.drop_duplicates(subset=["email"], inplace=True)

            # res_emails = df_csv["email"].to_list()

            seen = []
            duplicates = []
            for recipient in recipients:
                if recipient not in seen:
                    seen.append(recipient)
                else:
                    duplicates.append(recipient)

            """ resp = (
                Recipient.objects.filter(email__in=res_emails)
                .values("email", "replacement")
                .distinct()
            ) """

            return Response({"result": duplicates, "success": True})

        else:
            return Response({"result": "CSV not uploaded", "success": False})


class AudienceTagListView(generics.ListAPIView):
    """An endpoint to retrieve list and filter Audience tags with name"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AudienceTagListSerializer
    pagination_class = None

    def get_queryset(self):
        session_type = self.request.query_params.get("session_type")
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            queryset = AudienceTag.objects.filter(user=admin_id)
        else:
            queryset = AudienceTag.objects.filter(user=self.request.user)

        name = self.request.GET.get("name", None)
        if name:
            queryset = queryset.filter(name__istartswith=name)
        return queryset


class AudienceTagDeleteView(generics.DestroyAPIView):
    """An endpoint to delete Audience tags by passing the id."""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AudienceTagListSerializer

    def get_object(self):
        try:
            # This prevents another user deleting other users' AudienceTag objects.
            qs = AudienceTag.objects.get(id=self.kwargs['pk'], user=self.request.user)
        except AudienceTag.DoesNotExist:
            # Audience does not exist for that particular user.
            raise ValidationError("Audience does not exist.")
        return qs


class AudienceCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        """An endpoint to create audience with uploaded CSV file."""
        post_data = request.data
        tag_name = post_data.get("tag", None)
        admin_id = post_data.get("admin_id", None)
        session_type = post_data.get("session_type", SessionType.PERSONAL)

        if session_type == SessionType.TEAM:
            try:
                user = CustomUser.objects.get(pk=admin_id)
            except (
                CustomUser.DoesNotExist,
                CustomUser.MultipleObjectsReturned,
            ):
                return Response(
                    {
                        "result": "Failed to create an audience",
                        "success": False,
                    }
                )
        else:
            user = request.user

        if post_data["csvfile"] and len(post_data["csvfile"]) > 0 and tag_name:
            tag, _ = AudienceTag.objects.get_or_create(
                user=user, name=tag_name
            )

            csv_file = post_data["csvfile"]
            file_data = csv_file.read().decode("utf-8")
            string_data = StringIO(file_data)
            df_csv = pd.read_csv(string_data)

            audience_file = AudienceFile(
                csv_file=request.data["csvfile"],
                csv_file_name=request.data["csvfile"].name,
            )
            audience_file.save()

            tag.csv_audience_file.add(audience_file)

            df_csv.drop(
                df_csv.columns[
                    df_csv.columns.str.contains("unnamed", case=False)
                ],
                axis=1,
                inplace=True,
            )
            csv_columns = df_csv.columns

            if "Email" in csv_columns:
                df_csv.rename(columns={"Email": "email"}, inplace=True)

            replacements = json.loads(df_csv.to_json(orient="records"))

            df_csv.dropna(subset=["email"], inplace=True)
            df_csv.drop_duplicates(subset=["email"], inplace=True)

            # Replaced this in order to store the replacement dump for every
            # audience record

            for replacement in replacements:
                regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
                if replacement["email"] and re.match(regex, replacement["email"]):
                    audience = Audience.objects.create(
                        email=replacement["email"],
                        replacement=json.dumps(replacement),
                    )
                    audience.tags.add(tag)

            return Response(
                {"message": "Added audience successfully", "success": True},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"result": "CSV file and tag required", "success": False}
            )


class AudienceListView(generics.ListAPIView):
    """An endpoint to retrieve list and filter Audience with tag"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AudienceSerializer
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        CharField.register_lookup(Lower, "lower")

        session_type = self.request.query_params.get("session_type")
        tag_id = self.request.GET.get("tag_id", None)
        search_term = self.request.GET.get("search_term", None)
        sort_field = self.request.GET.get("sort_field", None)
        sort_dir = self.request.GET.get("sort_direction", None)
        sort_term = "-" + sort_field if sort_dir == "desc" else sort_field

        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            if tag_id:
                tags = AudienceTag.objects.filter(
                    user=admin_id, id=tag_id
                ).values_list("id", flat=True)
            else:
                tags = AudienceTag.objects.filter(user=admin_id).values_list(
                    "id", flat=True
                )
        else:
            if tag_id:
                tags = AudienceTag.objects.filter(
                    user=self.request.user, id=tag_id
                ).values_list("id", flat=True)
            else:
                tags = AudienceTag.objects.filter(
                    user=self.request.user
                ).values_list("id", flat=True)

        queryset = (
            Audience.objects.filter(
                Q(email__lower__contains=search_term) & Q(tags__id__in=tags)
            )
            .distinct()
            .order_by(sort_term)
        )
        return queryset


class EmailStatsView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    # serializer_class = RecipientSerializer

    def get(self, request, option, email_id):
        """An endpoint to get email stats filtering by status."""

        filter = {}

        recipients_id_list = EmailOutbox.objects.filter(
            email_id=email_id
        ).values_list("recipient", flat=True)

        if option != "unsubscribes":
            keyword = f"{option}__gt"
            filter[keyword] = 0
            qs = Recipient.objects.filter(**filter, pk__in=recipients_id_list)
        else:
            qs = Recipient.objects.filter(
                is_unsubscribe=True, pk__in=recipients_id_list
            )

        '''Removed following line, becase this logic consume huge time in worst case scenario'''
        # recipients = [RecipientSerializer(item).data for item in qs.all()] 

        recipients = RecipientSerializer(qs, many=True).data
        return Response(recipients)


class CampaignStatsView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    # serializer_class = RecipientSerializer

    def get(self, request, option, campaign_id):
        """An endpoint to get email stats filtering by status."""

        filter = {}
        if option == "all":
            qs = Recipient.objects.filter(campaign_id=campaign_id)
        elif option == "unsubscribes":
            qs = Recipient.objects.filter(
                is_unsubscribe=True, campaign_id=campaign_id
            )
        else:
            keyword = f"{option}__gt"
            filter[keyword] = 0
            qs = Recipient.objects.filter(**filter, campaign_id=campaign_id)

        '''Removed following line, becase this logic consume huge time in worst case scenario'''
        # recipients = [RecipientSerializer(item).data for item in qs.all()]

        recipients = RecipientSerializer(qs, many=True).data
        return Response(recipients)
