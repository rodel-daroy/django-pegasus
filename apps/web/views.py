from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from mail.settings import REDIRECT_ROOT_URL

from apps.teams.decorators import login_and_team_required, team_admin_required


def home(request):
    """
    Set home page on django side.
    """

    if request.path == "/":
        return HttpResponseRedirect(REDIRECT_ROOT_URL)

    return HttpResponseRedirect(reverse("pegasus:react_object_lifecycle"))
    # May use letter thats why didn't removed.
    # if request.user.is_authenticated:

    #     team = get_default_team(request)
    #     if team:
    #         return HttpResponseRedirect(reverse('web:team_home', args=[team.slug]))
    #     else:
    #         messages.info(request, _(
    #             'Teams are enabled but you have no teams. '
    #             'Create a team below to access the rest of the dashboard.'
    #         ))
    #         return HttpResponseRedirect(reverse('teams:manage_teams'))

    # else:
    #     return render(request, 'web/landing_page.html')


@login_and_team_required
def team_home(request, team_slug):
    assert request.team.slug == team_slug
    return render(
        request,
        "web/app_home.html",
        context={
            "team": request.team,
            "active_tab": "dashboard",
        },
    )


@team_admin_required
def team_admin_home(request, team_slug):
    assert request.team.slug == team_slug
    return render(
        request,
        "web/team_admin.html",
        context={
            "active_tab": "team-admin",
            "team": request.team,
        },
    )


def msfile(request):
    f = open(".well-known/microsoft-identity-association.json", "r")
    file_content = f.read()
    f.close()
    return HttpResponse(file_content, content_type="application/json")
