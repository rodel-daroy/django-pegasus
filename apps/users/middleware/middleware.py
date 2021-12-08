from apps.users.models import CustomUser
from ...teams.models import Membership, Team
from ...teams import roles


def team_user_middleware(get_response):
    # One-time configuration and initialization.

    def middleware(request):

        session_type = request.headers.get("Session-Type")
        if session_type == "team":
            try:
                team = request.user.teams.get()
                admin_email = team.members.get(
                    membership__role=roles.ROLE_ADMIN
                )
                admin = CustomUser.objects.get(email=admin_email)
                request.user = admin
            except (
                Membership.DoesNotExist,
                Team.DoesNotExist,
                CustomUser.DoesNotExist,
            ):
                pass

        response = get_response(request)

        return response

    return middleware
