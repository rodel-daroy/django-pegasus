from apps.teams.serializers import TeamSerializer
from allauth.account import app_settings as allauth_settings
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from allauth.utils import email_address_exists
from django.utils.translation import gettext as _
from rest_framework import serializers
from rest_auth.serializers import PasswordChangeSerializer
from apps.teams import roles
from apps.teams.models import Membership, Team
from apps.users.models import CustomUser


from django.contrib.auth.forms import PasswordResetForm
from django.conf import settings


class RegisterSerializer(serializers.Serializer):
    username = None
    email = serializers.EmailField(required=allauth_settings.EMAIL_REQUIRED)
    first_name = serializers.CharField(required=True, write_only=True)
    last_name = serializers.CharField(required=True, write_only=True)
    full_name = serializers.CharField(required=True, write_only=True)
    company_name = serializers.CharField(
        required=False, write_only=True, allow_blank=True
    )
    mailsaas_type = serializers.CharField(required=True, write_only=True)
    avatar = serializers.ImageField(required=False, write_only=True)
    password1 = serializers.CharField(required=True, write_only=True)

    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                raise serializers.ValidationError(
                    _("A user is already registered with this e-mail address.")
                )
        return email

    def validate_password1(self, password):
        return get_adapter().clean_password(password)

    def validate(self, data):
        # if data['password1'] != data['password2']:
        #     raise serializers.ValidationError(
        #         _("The two password fields didn't match."))
        return data

    def get_cleaned_data(self):
        return {
            "email": self.validated_data.get("email", ""),
            "avatar": self.validated_data.get("avatar", ""),
            "first_name": self.validated_data.get("first_name", ""),
            "last_name": self.validated_data.get("last_name", ""),
            "full_name": self.validated_data.get("full_name", ""),
            "mailsaas_type": self.validated_data.get("mailsaas_type", ""),
            "password1": self.validated_data.get("password1", ""),
        }

    def custom_signup(self, request, user):
        pass

    def save(self, request, *args, **kwargs):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        adapter.save_user(request, user, self)
        setup_user_email(request, user, [])

        user.save()
        return user


class UserDetailsSerializer(serializers.ModelSerializer):
    """
    User model w/o password
    """

    user_permission = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    team = serializers.SerializerMethodField()
    team_admin_id = serializers.SerializerMethodField()
    has_old_password = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "company_name",
            "avatar",
            "avatar_url",
            "team",
            "is_admin",
            "user_permission",
            "team_admin_id",
            "tracking_domain",
            "has_old_password",
        )
        read_only_fields = ("email",)

    def get_user_permission(self, obj):
        user = Membership.objects.filter(user=obj.id)
        if user.exists():
            user = user.last()
            return str(user.permission)
        return ""

    def get_is_admin(self, obj):
        user_is_admin = (
            Membership.objects.filter(
                user_id=obj.id, role=roles.ROLE_ADMIN
            ).exists()
            # This is just intended to add a default value to is_admin
            or not Team.objects.filter(members=obj).exists()
        )

        return user_is_admin

    def get_team(self, obj):
        try:
            team = Team.objects.only("id", "bcc_email", "name", "slug").get(
                members__in=[obj]
            )
            return TeamSerializer(team).data

        except Team.DoesNotExist:
            return None

    def get_team_admin_id(self, obj):
        try:
            team = obj.teams.get()

            admin = Membership.objects.filter(
                team_id=team.id, role=roles.ROLE_ADMIN
            ).get()
            return admin.user_id
        except Exception:
            return obj.id

    def get_has_old_password(self, obj):
        return obj.has_usable_password()


class TokenSerializer(serializers.Serializer):
    """Token Serializer"""

    token = serializers.CharField(max_length=255)


class UserSettingSerilizer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("full_name", "email")


class ChangePasswordSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_confirm_password = serializers.CharField(required=True)

    class Meta:
        model = CustomUser
        fields = ["old_password", "new_password", "new_confirm_password"]


class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)


class GetEmailSerializer(serializers.Serializer):
    """Serializer for Get Email"""

    email = serializers.CharField(required=True)


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password_reset_form_class = PasswordResetForm

    def validate_email(self, value):
        self.reset_form = self.password_reset_form_class(
            data=self.initial_data
        )
        if not self.reset_form.is_valid():
            raise serializers.ValidationError(_("Error"))

        print("serializer reset password")
        if not CustomUser.objects.filter(email=value).exists():

            raise serializers.ValidationError(_("Invalid e-mail address"))
        return value

    def get_email_options(self):
        """Override this method to change default e-mail options"""
        return {
            "email_template_name": "registration/password_reset_email.html",
            "html_email_template_name": "registration/password_reset_email.html",
        }

    def save(self):
        request = self.context.get("request")
        opts = {
            "use_https": request.is_secure(),
            "from_email": getattr(settings, "DEFAULT_FROM_EMAIL"),
            "email_template_name": "registration/password_reset_email.html",
            "request": request,
            "html_email_template_name": "registration/password_reset_email.html",
        }
        self.reset_form.save(**opts)


class TrackingDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("tracking_domain",)


class CustomPasswordChangeSerializer(PasswordChangeSerializer):

    def __init__(self, *args, **kwargs):
        super(CustomPasswordChangeSerializer, self).__init__(*args, **kwargs)

        if not self.user.has_usable_password():
            self.fields.pop('old_password')
