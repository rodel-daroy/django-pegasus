from django.urls import path
from . import views

urlpatterns = [
    path(r"", views.UnsubscribeEmailsListView.as_view(), name="unsubscribe_list"),
    path(r"add-emails", views.AddUnsubscribeEmailsView.as_view(), name="add_emails"),
    path(
        r"add-csv",
        views.AddUnsubscribeCSVEmailsView.as_view(),
        name="add_csv_emails",
    ),
    path(
        r"delete-emails",
        views.DeleteUnsubscribeEmailsView.as_view(),
        name="delete_emails",
    ),
    # path('',views.UnsubscribeEmailAdd.as_view(), name ='unscribe'),
    # path('unsubcribecsv/', views.UnsubcribeCsvEmailAdd.as_view(), name='unsubcribecsv'),
    # # path('unsubcribeview/',views.UnsubcribeEmailView.as_view(), name ='unsubcribeview'),
    # path('unsubcribedelete/', views.UnsubcribeEmailDelete.as_view(), name='unsubcribedelete'),
]
