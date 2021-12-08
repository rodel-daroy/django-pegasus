ROLE_ADMIN = "admin"
ROLE_MEMBER = "member"

PERMISSION_READ = "read"
PERMISSION_CREATE = "create"
PERMISSION_UPDATE = "update"

ROLE_CHOICES = (
    # customize roles here
    (ROLE_ADMIN, "admin"),
    (ROLE_MEMBER, "member"),
)

MEMBER_PERMISSION = (
    (PERMISSION_READ, "Read Campaign"),
    (PERMISSION_CREATE, "Create Campaign"),
    (PERMISSION_UPDATE, "Update Campaign"),
)


def user_can_access_team(user, team):
    return user.is_superuser or is_member(user, team)


def user_can_administer_team(user, team):
    return user.is_superuser or is_admin(user, team)


def is_member(user, team):
    return team.members.filter(id=user.id).exists()


def is_admin(user, team):
    from .models import Membership

    return Membership.objects.filter(
        team=team, user=user, role=ROLE_ADMIN
    ).exists()
