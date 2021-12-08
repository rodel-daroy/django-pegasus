from django.urls import path
from . import views

from rest_framework import routers


app_name = "teams"

urlpatterns = [
    path("", views.manage_teams, name="manage_teams"),
    path("list/", views.list_teams, name="list_teams"),
    path("create/", views.create_team, name="create_team"),
    path("get-team/", views.TeamView.as_view(), name="get_team"),
    # path('update/', views.update_team, name='edit_team'),
    path("<slug:team_slug>/manage/", views.manage_team, name="manage_team"),
    path(
        "<slug:team_slug>/resend-invite/<slug:invitation_id>/",
        views.resend_invitation,
        name="resend_invitation",
    ),
    path(
        "invitation/<slug:invitation_id>/confirm/",
        views.accept_invitation_confirm,
        name="accept_invitation_confirm",
    ),

    path(
        "",
        views.delete_user_from_team,
        name="delete_member",
    ),

    path("api/send-invite/", views.send_invite, name="send_invite"),
    path(
        "invitation/<slug:invitation_id>/",
        views.accept_invitation,
        name="accept_invitation",
    ),
    path(
        "get-members/<int:team_id>/",
        views.MembersListView.as_view(),
        name="list_members",
    ),
]

# drf config
router = routers.DefaultRouter()
router.register(r"api/teams", views.TeamViewSet)
# router.register(r'api/invitations', views.InvitationViewSet)
urlpatterns += router.urls
