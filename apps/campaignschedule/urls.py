from django.urls import path

from . import views

urlpatterns = [

    path('schedule/', views.CampaignScheduleAdd.as_view(), name='schedule'),
    path('updateschedulemail/', views.UpdateScheduleMail.as_view(),
         name='updateschedulemail'),
    # path('Mailschedule/',views.MailSendimgtask.as_view(), name ='Mailschedule'),
    path('posttoschedule/', views.PostToSchedule.as_view(), name='posttoschedule'),


]
