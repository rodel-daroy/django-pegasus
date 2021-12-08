from apps.utils.utils import CustomPageNumberPagination
from apps.teams import roles
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import CharField, Q
from django.db.models.functions import Lower

from apps.teams.decorators import login_and_team_required, team_admin_required
from .invitations import (
    send_invitation,
    process_invitation,
    clear_invite_from_session,
)
from .forms import TeamChangeForm
from .models import Membership, Team, Invitation
from .serializers import (
    MembershipSerializer,
    TeamSerializer,
    InvitationSerializer,
)
from ..users.models import CustomUser


@login_required
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_team(request):
    new_team = TeamSerializer(data=request.data)
    if new_team.is_valid(raise_exception=True):
        new_team.save()
        return Response(
            {"result": "created successfully", "success": True},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def send_invite(request):
    data = request.data
    new_invite = InvitationSerializer(data=data)
    if new_invite.is_valid(raise_exception=True):
        invite = new_invite.save()
        send_invitation(request, invite)
        return Response({"success": True}, status=status.HTTP_200_OK)

    else:
        return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)


@login_required
def manage_teams(request):
    return render(request, "teams/teams.html", {})


@login_required
def list_teams(request):
    teams = request.user.teams.all()
    return render(
        request,
        "teams/list_teams.html",
        {
            "teams": teams,
        },
    )


@login_required
def create_team_demo(request):
    if request.method == "POST":
        form = TeamChangeForm(request.POST)
        if form.is_valid():
            team = form.save()
            team.members.add(request.user, through_defaults={"role": "admin"})
            team.save()
            return HttpResponseRedirect(reverse("teams:list_teams"))
    else:
        form = TeamChangeForm()
    return render(
        request,
        "teams/manage_team.html",
        {
            "form": form,
            "create": True,
        },
    )


@login_and_team_required
def manage_team(request, team_slug):
    team = request.team
    if request.method == "POST":
        form = TeamChangeForm(request.POST, instance=team)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse("teams:list_teams"))
    else:
        form = TeamChangeForm(instance=team)
    return render(
        request,
        "teams/manage_team.html",
        {
            "team": team,
            "form": form,
        },
    )


def accept_invitation(request, invitation_id):
    invitation = get_object_or_404(Invitation, id=invitation_id)
    if not invitation.is_accepted:
        # set invitation in the session in case needed later
        request.session["invitation_id"] = invitation_id
    else:
        clear_invite_from_session(request)

    account_exists = CustomUser.objects.filter(
        email__exact=invitation.email
    ).exists()

    return render(
        request,
        "teams/accept_invite.html",
        {
            "invitation": invitation,
            "account_exists": account_exists,
        },
    )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_invitation_confirm(request, invitation_id):
    invitation = get_object_or_404(Invitation, id=invitation_id)
    if invitation.is_accepted:
        messages.error(
            request,
            _(
                "Sorry, it looks like that invitation link has expired."
            ),  # noqa: E501
        )
        return HttpResponseRedirect(reverse("web:home"))
    else:
        process_invitation(invitation, request.user)
        clear_invite_from_session(request)
        messages.success(
            request,
            _("You successfully joined {}").format(invitation.team.name),
        )
        serialized_team = TeamSerializer(invitation.team)
        admin = Membership.objects.filter(
            team_id=invitation.team.id, role=roles.ROLE_ADMIN
        ).get()

        return Response(
            {
                "success": True,
                "team": serialized_team.data,
                "team_admin_id": admin.user_id,
            },
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def delete_user_from_team(request):
    id = request.data.get('id')
    Membership.objects.filter(
        user_id=id
    ).delete()

    return Response(
        {
            "success": True,
        },
        status=status.HTTP_200_OK,
    )


@team_admin_required
def resend_invitation(request, team, invitation_id):
    invitation = get_object_or_404(Invitation, id=invitation_id)
    if invitation.team != request.team:
        raise ValueError(
            _(
                "Request team {team} did not match invitation team {invite_team}"  # noqa: E501
            ).format(
                team=request.team.slug,
                invite_team=invitation.team.slug,
            )
        )
    send_invitation(request, invitation)
    return HttpResponse("Ok")


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    pagination_class = None
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # filter queryset based on logged in user
        queryset = self.request.user.teams.all().prefetch_related('members', 'invitations')

        return queryset

    def perform_create(self, serializer):
        # ensure logged in user is set on the model during creation
        team = serializer.save()
        team.members.add(
            self.request.user,
            through_defaults={"role": "admin", "permission": "update"},
        )


class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer

    def get_queryset(self):
        # filter queryset based on logged in user
        return self.queryset.filter(team__id__in=list(self.request.user.teams.all().values_list('id', flat=True)))

    def perform_create(self, serializer):
        # ensure logged in user is set on the model during creation
        invitation = serializer.save(invited_by=self.request.user)
        send_invitation(self.request, invitation)


class TeamView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TeamSerializer

    def get_object(self, queryset=None):
        try:
            queryset = self.request.user.teams.get()

        except Team.DoesNotExist:
            return None

        return queryset


class MembersListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MembershipSerializer
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        CharField.register_lookup(Lower, "lower")

        team_id = self.kwargs["team_id"]
        filter_by = self.request.query_params.get("filter", "all")
        search_term = self.request.GET.get("search_term", "")
        sort_field = self.request.query_params.get(
            "sort_field", "user__first_name"
        )
        sort_dir = self.request.query_params.get("sort_direction", "asc")
        sort_term = "-" + sort_field if sort_dir == "desc" else sort_field
        if filter_by != "all":
            qs = Membership.objects.filter(
                Q(team_id=team_id)
                & Q(role=filter_by)
                & Q(user__first_name__lower__contains=search_term)
            ).order_by(sort_term)
        else:
            qs = Membership.objects.filter(
                Q(team_id=team_id)
                & Q(user__first_name__lower__contains=search_term)
            ).order_by(sort_term)
        return qs
