from apps.utils.utils import CustomPageNumberPagination
import imaplib
from datetime import datetime, timezone

import pytz
from pytracking.django import ClickTrackingView, OpenTrackingView
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView

from mail.settings import DEFAULT_WARMUP_FOLDER

from ..campaign.models import EmailOutbox
from ..campaign.tasks import trigger_lead_catcher, update_leads_log
from . import SessionType
from .models import (
    EmailAccount,
    SendingCalendar,
    WarmingStatus,
    WarmingMailReport,
    WarmingLog,
)
from .serializers import EmailAccountSerializer, SendingCalendarSerializer
from .utils.smtp import check_email


class EmailAccountListView(generics.ListCreateAPIView):
    serializer_class = EmailAccountSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = CustomPageNumberPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["email"]

    def paginate_queryset(self, queryset, view=None):
        if "no_page" in self.request.query_params:
            return None
        else:
            return self.paginator.paginate_queryset(
                queryset, self.request, view=self
            )

    def get_queryset(self):
        session_type = self.request.query_params.get("session_type")
        filter_by = self.request.query_params.get("filter", "all")
        sort_field = self.request.query_params.get("sort_field", "email")
        sort_dir = self.request.query_params.get("sort_direction", "asc")
        sort_term = "-" + sort_field if sort_dir == "desc" else sort_field
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            if filter_by != "all":
                queryset = EmailAccount.objects.filter(
                    user=admin_id, email_provider=filter_by
                ).order_by(sort_term)
            else:
                queryset = EmailAccount.objects.filter(user=admin_id).order_by(
                    sort_term
                )
        else:
            if filter_by != "all":
                queryset = EmailAccount.objects.filter(
                    user=self.request.user.id, email_provider=filter_by
                ).order_by(sort_term)
            else:
                queryset = EmailAccount.objects.filter(
                    user=self.request.user.id
                ).order_by(sort_term)

        return queryset

    def post(self, request, *args, **kwargs):
        """An endpoint to create email account"""
        request.data["user"] = request.user.id

        is_valid, msg = check_email(request=request)
        if not is_valid:
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)
        return self.create(request, *args, **kwargs)


class EmailAccountView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EmailAccount.objects.all()
    serializer_class = EmailAccountSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        """An endpoint to retrieve email account object"""
        return super(EmailAccountView, self).get(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """An endpoint to update email account object"""
        is_valid, msg = check_email(request=request)
        request.data["has_error"] = False
        request.data["error_was_notified"] = False
        if not is_valid:
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)

        return super(EmailAccountView, self).update(request, *args, **kwargs)


class EmailAccountWarmingView(generics.GenericAPIView):
    queryset = EmailAccount.objects.all()
    serializer_class = EmailAccountSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """An endpoint to retrieve list of email warmings"""

        session_type = self.request.query_params.get("session_type")
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            return Response(
                {
                    "status": WarmingStatus.objects.select_related(
                        "mail_account"
                    )
                    .filter(mail_account__user_id=admin_id)
                    .values(),
                    "logs": WarmingLog.objects.select_related("mail_account")
                    .filter(mail_account__user_id=admin_id)
                    .order_by("sent_at")
                    .values(),
                    "reports": WarmingMailReport.objects.select_related(
                        "mail_account"
                    )
                    .filter(mail_account__user_id=admin_id)
                    .order_by("created_date")
                    .values(),
                }
            )
        else:
            return Response(
                {
                    "status": WarmingStatus.objects.select_related(
                        "mail_account"
                    )
                    .filter(mail_account__user_id=self.request.user.id)
                    .values(),
                    "logs": WarmingLog.objects.select_related("mail_account")
                    .filter(mail_account__user_id=self.request.user.id)
                    .order_by("sent_at")
                    .values(),
                    "reports": WarmingMailReport.objects.select_related(
                        "mail_account"
                    )
                    .filter(mail_account__user_id=self.request.user.id)
                    .order_by("created_date")
                    .values(),
                }
            )

    def post(self, request, mail_account_id):
        """An endpoint to create/update email warming"""
        warming_enabled = request.data["warming_enabled"]
        email_for_day = request.data.get('email_for_day', 1)
        ramp_up_increment = request.data.get('ramp_up_increment', 1)
        if warming_enabled:
            # Create 'mailerrize' folder in the email account
            email_account = EmailAccount.objects.get(pk=mail_account_id)
            if (
                not email_account.imap_host
                or not email_account.imap_port
                or not email_account.imap_username
                or not email_account.imap_password
            ):
                return Response(
                    {"message": "IMAP setting is not found.", "success": False}
                )
            try:
                mail = imaplib.IMAP4_SSL(
                    email_account.imap_host, email_account.imap_port
                )

                mail.login(
                    email_account.imap_username, email_account.imap_password
                )
                mail.create(DEFAULT_WARMUP_FOLDER)

            except Exception as e:
                return Response({"message": e, "success": False})

        WarmingStatus.objects.update_or_create(mail_account_id=mail_account_id, defaults={"email_for_day": email_for_day,
                                               "ramp_up_increment": ramp_up_increment, "warming_enabled": warming_enabled})

        return Response({"success": True})


class SendingCalendarListView(generics.ListCreateAPIView):
    queryset = SendingCalendar.objects.all()
    serializer_class = SendingCalendarSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        session_type = self.request.query_params.get("session_type")
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            return SendingCalendar.objects.filter(
                mail_account__user_id__exact=admin_id
            )
        else:
            return SendingCalendar.objects.filter(
                mail_account__user_id__exact=self.request.user.id
            )

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class SendingCalendarView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SendingCalendar.objects.all()
    serializer_class = SendingCalendarSerializer
    permission_classes = (permissions.IsAuthenticated,)


class AvailableTimezonesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """An endpoint for retriving all timezones list."""
        return Response(pytz.all_timezones)


class SendTestEmailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        # NOTE Nothing is happening here, Disabled this feature as per
        # discussion with Omaid
        ########################################
        # mail_account_id = request.data["mailAccountId"]
        # if mail_account_id == 0:
        #     email_sender()
        # elif mail_account_id == 1:
        #     email_receiver()

        ########################################

        return Response("Ok")


class MyOpenTrackingView(OpenTrackingView):
    def notify_tracking_event(self, tracking_result):
        uuid = tracking_result.metadata.get("uuid", None)

        try:
            outbox = EmailOutbox.objects.get(id=uuid)
        except Exception:
            return
        outbox.opened += 1
        outbox.opened_datetime = datetime.now(timezone.utc)
        outbox.save(update_fields=['opened', 'opened_datetime'])

        outbox.recipient.opens += 1
        outbox.recipient.save()

        # Lead checking
        trigger_lead_catcher(outbox.campaign_id, outbox.recipient_id)
        update_leads_log(outbox.recipient_id, "opened")

        print(f"Tracking: Email {outbox.recipient.email} is opened.")


class MyClickTrackingView(ClickTrackingView):
    def notify_tracking_event(self, tracking_result):
        uuid = tracking_result.metadata["uuid"]

        try:
            outbox = EmailOutbox.objects.get(id=uuid)
        except Exception:
            return

        outbox.clicked += 1
        outbox.clicked_datetime = datetime.now(timezone.utc)
        outbox.save()

        outbox.recipient.clicked += 1
        outbox.recipient.save()

        # Lead checking
        trigger_lead_catcher(outbox.campaign_id, outbox.recipient_id)
        update_leads_log(outbox.recipient_id, "clicked")

        print(f"Tracking: Email {outbox.recipient.email} is clicked.")
