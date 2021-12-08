import datetime
import random
from datetime import datetime, time, timedelta

import pytz
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.http import Http404, HttpResponse, JsonResponse, request
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from pytz import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaign.models import Campaign, CampaignRecipient
from apps.campaignschedule.serializers import EmailScheduleSerializers
from .models import Schedule, EmailSchedule
from datetime import datetime, time, timedelta
import random


from .models import EmailSchedule, Schedule
from .serializers import CampaignscheduleSerializers, ScheduleUpdateSerializers


def change(times, timezones):
    local = pytz.timezone(timezones)
    naive = datetime.strptime(times, "%H:%M:%S")
    local_dt = local.localize(naive, is_dst=None)
    utc_dt = local_dt.astimezone(pytz.utc)
    convert_time = datetime.strftime(utc_dt, "%H:%M:%S")
    return convert_time


# VK-24042021: This API is linked to URL but never invoked from anywhere in the application.
class CampaignScheduleAdd(CreateAPIView):
    """This endpoint is not in use (TBD)"""

    serializer_class = CampaignscheduleSerializers
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):

        request.data['user'] = request.user.id
        start = request.data['start_time']
        timeset = request.data['time_zone']
        end = request.data['end_time']
        starting_time = change(start, timeset)
        ending_time = change(end, timeset)
        request.data['start_time'] = starting_time
        request.data['end_time'] = ending_time
        if request.data["strategy"] == 'SPACE':
            try:
                if request.data["min_email_send"] == None:
                    pass
            except:
                return Response({"message": "Please enter min_email_send", "success": False})

        serializer = CampaignscheduleSerializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateScheduleMail(generics.GenericAPIView):
    serializer_class = ScheduleUpdateSerializers
    permission_classes = (permissions.IsAuthenticated,)

    def get_objects(self, request):
        try:
            user = request.user.id
            schedule = Schedule.objects.get(user=user)
            if(schedule):
                response = {}
                response["schedule_obj"] = schedule
                response["status_code"] = 200
                return response
        except Schedule.DoesNotExist:
            response = {}
            response["status_code"] = 400
            return response

    def get(self, request):
        """An endpoint to retrieve campaign schedule"""
        queryset = self.get_objects(request)
        if queryset["status_code"] == 400:
            return Response(status=status.HTTP_404_NOT_FOUND)
        elif queryset["status_code"] == 200:

            serializer = ScheduleUpdateSerializers(queryset["schedule_obj"])
            return Response(serializer.data)
        return Response({'response': 'please active user'})

    def put(self, request):
        """An endpoint to create campaign schedule"""
        queryset = self.get_objects(request)
        timeset = request.data['time_zone']
        start = request.data['start_time']
        end = request.data['end_time']
        starting_time = change(start, timeset)
        ending_time = change(end, timeset)
        request.data['start_time'] = starting_time
        request.data['end_time'] = ending_time
        serializer = ScheduleUpdateSerializers(
            queryset["schedule_obj"], data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def tries(self):
    FechaIn = "10:00:00"
    FechaFin = "13:59:00"

    meses = []

    start = now = datetime.datetime.strptime(FechaIn, "%H:%M:%S")
    end = datetime.datetime.strptime(FechaFin, "%H:%M:%S")

    while now != end:
        meses.append(str(now.strftime("%H:%M:%S")))
        now += datetime.timedelta(minutes=10)

    meses.append(FechaFin)
    return "taskss"


# VK-24042021: This API is linked to URL but never invoked from anywhere in the application.
class PostToSchedule(APIView):
    """This endpoint is not in use (TBD)"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        postData = request.data
        schedule = Schedule.objects.get(user=request.user.id)
        next_email_send_at_time = schedule.start_time

        if schedule.strategy == 'SPACE':
            min_mail_at_a_time = schedule.min_email_send
            max_mail_at_a_time = schedule.max_email_send
            random_no_of_mails_at_a_time = random.randint(
                min_mail_at_a_time, max_mail_at_a_time)

        elif schedule.strategy == 'SEND':
            random_no_of_mails_at_a_time = schedule.max_email_send

        post_data = []

        for camp_id in postData["campaign_ids"]:
            print("reqqqqqqqqqqq userrrrrrrrrrrr ", camp_id)

            # camp_email = CampaignRecipient.objects.filter(campaign=camp_id)
            for recipient in CampaignRecipient.objects.filter(campaign=camp_id).iterator():
                data = {
                    "time": next_email_send_at_time,
                    "date": schedule.date,
                    "user_id": schedule.user.id,
                    "mail_account": schedule.mail_account.id,
                    "recipient_email": recipient.email,
                    "subject": recipient.subject,
                    "email_body": recipient.email_body,
                }
                post_data.append(data)

        while len(post_data) != 0:
            mails_to_send_together = post_data[:random_no_of_mails_at_a_time]
            for data in mails_to_send_together:
                schedule_exist_count = EmailSchedule.objects.filter(time=data["time"], date=data["date"], user_id=data["user_id"], mail_account=data[
                    "mail_account"], recipient_email=data["recipient_email"], subject=data["subject"], email_body=data["email_body"]).count()
                schedule_exist_ob = EmailSchedule.objects.filter(time=data["time"], date=data["date"], user_id=data["user_id"], mail_account=data[
                    "mail_account"], recipient_email=data["recipient_email"], subject=data["subject"], email_body=data["email_body"]).count()

                data["time"] = next_email_send_at_time
                email_schedule_serlzr = EmailScheduleSerializers(data=data)
                print(schedule_exist_count, email_schedule_serlzr)
                if email_schedule_serlzr.is_valid():
                    print()
                    print()
                    print()
                    print("vallid")
                    if schedule_exist_count == 0:
                        email_schedule_serlzr.save()

                post_data.remove(data)

            delta = timedelta(minutes=schedule.mint_between_sends)
            next_email_send_at_time_str = next_email_send_at_time.strftime(
                '%H:%M:%S')
            next_email_send_at_time_datetime = datetime.strptime(schedule.date.strftime(
                '%Y-%m-%d')+" "+next_email_send_at_time_str, '%Y-%m-%d %H:%M:%S')
            next_email_send_at_time = (
                next_email_send_at_time_datetime + delta).time()

        return Response("Done")
