from apps import unsubscribes
from apps.utils.utils import CustomPageNumberPagination
import csv
import io

from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import Http404, HttpResponse, JsonResponse, request
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, serializers, status
from rest_framework.generics import CreateAPIView, ListAPIView, GenericAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import filters
from rest_framework.settings import api_settings
from .models import UnsubscribeEmail
from .serializers import UnsubscribeEmailSerializers
from .mixins import CreateListModelMixin
from apps.campaign.models import Recipient
import pandas as pd
import json
from io import StringIO
from ..mailaccounts import SessionType


# from apps.campaign.serializers CampaignRecipient


class UnsubscribeEmailsListView(ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UnsubscribeEmailSerializers
    filter_backends = [filters.SearchFilter]
    search_fields = ["email"]
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        session_type = self.request.query_params.get("session_type")
        filter_by = self.request.query_params.get("filter", None)
        sort_field = self.request.query_params.get("sort_field", None)
        sort_dir = self.request.query_params.get("sort_direction", None)
        sort_term = "-" + sort_field if sort_dir == "desc" else sort_field
        if session_type == SessionType.TEAM:
            admin_id = self.request.query_params.get("admin_id")
            if filter_by == "domain":
                qs = UnsubscribeEmail.objects.filter(
                    user=admin_id, email__startswith="*@"
                ).order_by(sort_term)
            else:
                qs = (
                    UnsubscribeEmail.objects.filter(user=admin_id)
                    .exclude(email__startswith="*@")
                    .order_by(sort_term)
                )
            return qs
        else:
            if filter_by == "domain":
                qs = UnsubscribeEmail.objects.filter(
                    user=self.request.user.id, email__startswith="*@"
                ).order_by(sort_term)
            else:
                qs = (
                    UnsubscribeEmail.objects.filter(user=self.request.user.id)
                    .exclude(email__startswith="*@")
                    .order_by(sort_term)
                )
            return qs


class AddUnsubscribeEmailsView(CreateListModelMixin, CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UnsubscribeEmailSerializers
    queryset = UnsubscribeEmail.objects.all()
    pagination_class = None

    def post(self, _request, *args, **kwargs):
        data = _request.data
        for unsubscribe in data:
            # recipients = Recipient.objects.filter(
            #     email=unsubscribe["email"], campaign__assigned=_request.user.id
            # )
            q = Q(email=unsubscribe["email"], campaign__assigned=_request.user.id)

            if Recipient.objects.filter(q).exists():
                for recipient in Recipient.objects.filter(q).iterator():
                    recipient.is_unsubscribe = True
                    recipient.save(update_fields=['is_unsubscribe'])
        return self.create(_request, args, kwargs)


class AddUnsubscribeCSVEmailsView(CreateListModelMixin, CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UnsubscribeEmailSerializers
    queryset = UnsubscribeEmail.objects.all()
    pagination_class = None

    def post(self, _request, *args, **kwargs):
        data = _request.data

        csv_file = data["file"]
        file_data = csv_file.read().decode("utf-8")
        string_data = StringIO(file_data)

        csv_data = pd.read_csv(string_data)
        csv_data["user"] = _request.user.id
        json_data = self.to_json(csv_data)
        for unsubscribe in json_data:
            # recipients = Recipient.objects.filter(
            #     email=unsubscribe["email"], campaign__assigned=_request.user.id
            # )
            q = Q(email=unsubscribe["email"], campaign__assigned=_request.user.id)
            if Recipient.objects.filter(q).exists():
                for recipient in Recipient.objects.filter(q).iterator():
                    recipient.is_unsubscribe = True
                    recipient.save()
        return self.create_unsubscribe(json_data)

    def create_csv(self, file):
        obj = UnsubcribeCsv(unscribe_emails=file)
        obj.save()
        return obj

    def to_json(self, csv_data):
        csv_columns = csv_data.columns

        if "Email" in csv_columns and "email" not in csv_columns:
            csv_data.rename(columns={"Email": "email"}, inplace=True)
        if "Name" in csv_columns and "email" not in csv_columns:
            csv_data.rename(columns={"Name": "name"}, inplace=True)

        first_columns = ["first", "first name", "given name"]
        last_columns = ["last", "last name", "family name"]

        if "name" not in csv_columns:
            for column in csv_columns:
                if column.lower() in first_columns:
                    csv_data.rename(columns={column: "first"})
                    break

            for column in csv_columns:
                if column.lower() in last_columns:
                    csv_data.rename(columns={column: "last"})
                    break

            csv_columns = csv_data.columns
            if "first" in csv_columns and "last" in csv_columns:
                csv_data["name"] = csv_data[["first", "last"]].agg(
                    " ".join, axis=1
                )

        csv_columns = csv_data.columns
        if "name" not in csv_columns:
            csv_data["name"] = ""

        email_name_data = csv_data[["email", "name", "user"]]
        email_name_data = email_name_data.dropna(subset=["email"])
        email_name_data.fillna("", inplace=True)
        json_string = email_name_data.to_json(orient="records")
        return json.loads(json_string)

    def create_unsubscribe(self, data):
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class DeleteUnsubscribeEmailsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, _request, *args, **kwargs):
        data = _request.data
        for pk in data:
            try:
                unsubscribe = UnsubscribeEmail.objects.get(pk=pk)
                # recipients = Recipient.objects.filter(
                #     email=unsubscribe.email,
                #     campaign__assigned=_request.user.id,
                # )
                q = Q(email=unsubscribe.email, campaign__assigned=_request.user.id,)

                if Recipient.objects.filter(q).exists():
                    for recipient in Recipient.objects.filter(q).iterator():
                        recipient.is_unsubscribe = False
                        recipient.save(update_fields=['is_unsubscribe'])

                unsubscribe.delete()
            except UnsubscribeEmail.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


# class UnsubscribeEmailAdd(CreateAPIView):
#     serializer_class = UnsubscribeEmailSerializers
#     permission_classes = (permissions.IsAuthenticated,)
#
#     def post(self, request):
#         postdata = request.data
#         print("request.data", postdata)
#         for email in postdata["email"]:
#             recipients = CampaignRecipient.objects.filter(email=email, campaign__assigned=request.user.id).exists()
#             if recipients:
#                 campaign_recipient = CampaignRecipient.objects.filter(email=email, campaign__assigned=request.user.id)
#                 for recipient in campaign_recipient:
#                     recipient.unsubscribe = True
#                     recipient.save()
#
#             data = {
#                 "email": email,
#                 'user': request.user.id
#             }
#
#             data_list = []
#             serializer = UnsubscribeEmailSerializers(data=data)
#             if serializer.is_valid():
#                 serializer.save()
#                 data_list.append(serializer.data)
#         return Response({"message": "Unsubcribe Successfully done", "success": True})
#         # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class UnsubcribeCsvEmailAdd(CreateAPIView):
#     permission_classes = (permissions.IsAuthenticated,)
#
#     def post(self, request):
#         csv_file = request.data['csv_file']
#         csv_obj = UnsubcribeCsv(unscribe_emails=csv_file)
#         csv_obj.save()
#         with open('media/' + str(csv_obj.unscribe_emails)) as csv_file:
#
#             csv_reader = csv.reader(csv_file, delimiter=',')
#             line_count = 0
#             resp = []
#             for row in csv_reader:
#                 if line_count == 0:
#                     line_count += 1
#                 else:
#                     data = {'email': row[0], 'name': row[1], 'user': request.user.id}
#
#                     serializer = UnsubscribeEmailSerializers(data=data)
#                     if serializer.is_valid():
#                         line_count += 1
#                         serializer.save()
#                         recep = CampaignRecipient.objects.get(email=data['email'])
#                         if data['email'] == recep.email:
#                             recep.unsubscribe = True
#                             recep.save()
#                         resp.append(serializer.data)
#
#             resp.append({"success": True})
#             return Response(resp)


# class UnsubcribeEmailView(APIView):
#     permission_classes = (permissions.IsAuthenticated,)
#     serializer_class = UnsubscribeEmailSerializers
#
#     def get(self, request):
#         params = list(dict(request.GET).keys())
#         # print(params)
#         if ["search"] in params:
#             toSearch = request.GET['search']
#             unsubcribe = UnsubscribeEmail.objects.filter(Q(email__contains=toSearch) | Q(name__contains=toSearch),
#                                                          user=request.user.id, on_delete=False)
#         else:
#             unsubcribe = UnsubscribeEmail.objects.filter(user=request.user.id, on_delete=False)
#         serializer = UnsubscribeEmailSerializers(unsubcribe, many=True)
#         return Response(serializer.data)


# class UnsubcribeEmailDelete(APIView):
#     permission_classes = (permissions.IsAuthenticated,)
#     serializer_class = UnsubscribeEmailSerializers
#
#     def get_object(self, pk):
#         return UnsubscribeEmail.objects.get(pk=pk)
#
#     def put(self, request, format=None):
#         data = request.data["data"]
#
#         for pk in data:
#             try:
#                 unsubcribe = self.get_object(pk)
#                 if unsubcribe.on_delete:
#                     return Response("Does Not exist ")
#                 else:
#                     recipients = CampaignRecipient.objects.filter(email=unsubcribe.email,
#                                                                   campaign__assigned=request.user.id).exists()
#                     if recipients:
#                         campaign_recipient = CampaignRecipient.objects.filter(email=unsubcribe.email,
#                                                                               campaign__assigned=request.user.id)
#                         for recipient in campaign_recipient:
#                             recipient.unsubscribe = False
#                             recipient.save()
#
#                     unsubcribe.on_delete = True
#                     unsubcribe.save()
#             except UnsubscribeEmail.DoesNotExist:
#                 return Response("Does Not exist ")
#         return Response("Unsubcribe Recipient Successfully Done ")
