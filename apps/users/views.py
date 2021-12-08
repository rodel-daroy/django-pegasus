from allauth.account.utils import send_email_confirmation
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_jwt.settings import api_settings
from django.conf import settings
from django.core.mail import send_mail
import dns.resolver


from apps.users.serializer import (
    ChangePasswordSerializer,
    TrackingDomainSerializer,
    UserSettingSerilizer,
    GetEmailSerializer,
    ResetPasswordSerializer,
    UserDetailsSerializer,
)

from .forms import CustomUserChangeForm, UploadAvatarForm
from .helpers import (
    require_email_confirmation,
    user_has_confirmed_email_address,
)
from .models import CustomUser


class ProfileView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserDetailsSerializer

    def get_object(self, queryset=None):
        return self.request.user


jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
jwt_decode_handler = api_settings.JWT_DECODE_HANDLER


@login_required
def profile(request):
    if request.method == "POST":
        form = CustomUserChangeForm(request.POST, instance=request.user)
        if form.is_valid():
            user = form.save(commit=False)
            user_before_update = CustomUser.objects.get(pk=user.pk)
            need_to_confirm_email = (
                user_before_update.email != user.email
                and require_email_confirmation()
                and not user_has_confirmed_email_address(user, user.email)
            )
            if need_to_confirm_email:
                # don't change it but instead send a confirmation email
                # email will be changed by signal when confirmed
                new_email = user.email
                send_email_confirmation(
                    request, user, signup=False, email=new_email
                )
                user.email = user_before_update.email
                # recreate the form to avoid populating the previous email in
                # the returned page
                form = CustomUserChangeForm(instance=user)
            user.save()
    else:
        form = CustomUserChangeForm(instance=request.user)
    return render(
        request,
        "account/profile.html",
        {"form": form, "active_tab": "profile"},
    )


@login_required
@require_POST
def upload_profile_image(request):
    user = request.user
    form = UploadAvatarForm(request.POST, request.FILES)
    if form.is_valid():
        user.avatar = request.FILES["avatar"]
        user.save(update_fields=['avatar'])
    return HttpResponse("Success!")


class UserSettingsView(generics.RetrieveUpdateAPIView):

    """
    API for updating login recruiter detail or admin can choose recruiter for
    update by username

    PUT : recuriter/update/
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get_objects(self, request):
        try:
            current_user = request.user
            custom_get = CustomUser.objects.get(pk=current_user.pk)
            response = {}
            response["user_obj"] = custom_get
            response["status_code"] = 200
            return response

        except CustomUser.DoesNotExist:
            response = {}
            response["status_code"] = 400
            return response

    def get(self, request):
        queryset = self.get_objects(request)
        serializer = UserSettingSerilizer(queryset["user_obj"])
        return Response(serializer.data)

    def put(self, request):
        new_email = request.data.get("email")
        if CustomUser.objects.filter(email=request.user) != new_email:
            queryset = self.get_objects(request)
            serializer = UserSettingSerilizer(
                queryset["user_obj"], data=request.data
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        return Response({"message": "This email is already exists"})


class ChangePasswordView(generics.RetrieveUpdateAPIView):

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def get_object(self, queryset=None):
        return self.request.user

    def put(self, request, *args, **kwargs):
        queryset = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            old_password = serializer.data.get("old_password")
            new_password = serializer.data.get("new_password")
            new_confirm_password = serializer.data.get("new_confirm_password")
            if new_confirm_password == new_password:
                if not queryset.check_password(old_password):
                    return Response(
                        {"old_password": "Wrong password."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                queryset.set_password(serializer.data.get("new_password"))
                queryset.save()
                return Response(
                    {
                        "status": "success",
                        "response": "Password successfully Updated",
                    }
                )
            else:
                return Response({"message": "confirm password did't match"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetLink(generics.CreateAPIView):
    """
    POST get_token/
    """

    permission_classes = (permissions.AllowAny,)
    serializer_class = GetEmailSerializer
    queryset = CustomUser.objects.all()

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        global jwt_token, user
        if not request.data.get("email"):
            return Response(
                {
                    "message": "please enter your correct email address",
                    "success": False,
                }
            )
        email = request.data.get("email", "")
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {"message": "User does not exists", "success": False}
            )
        try:
            payload = jwt_payload_handler(user)
            jwt_token = jwt_encode_handler(payload)
            user_email = user.email
            current_site = request._get_raw_host()
            # url = 'http://127.0.0.1:8000/auth/token/'+jwt_token
            url = current_site + "/users/token/" + jwt_token
            subject = "change password  link"
            message = f"""your token will be expired in 24 hours..\n {url} """
            sender = settings.EMAIL_HOST_USER
            to = [user_email]
            send_mail(subject, message, sender, to)
            return Response(
                {
                    "email": email,
                    "token": jwt_token,
                    "path": f"{url}{jwt_token}",
                }
            )
        except Exception:
            return Response(status=status.HTTP_404_NOT_FOUND)


class ForgotPassword(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ResetPasswordSerializer

    def post(self, request, token_data):
        jwt_token_data = jwt_decode_handler(token_data)
        users_id = jwt_token_data["user_id"]
        my_user = CustomUser.objects.get(id=users_id)
        if my_user is not None:
            new_password = request.data.get("new_password")
            confirm_new_password = request.data.get("confirm_new_password")
            if new_password == confirm_new_password:
                serializer = ResetPasswordSerializer(data=request.data)
                if serializer.is_valid():
                    my_user.set_password(serializer.data["new_password"])
                    my_user.password_change = True
                    my_user.save()
                    return Response(
                        {
                            "message": "Password updated successfully",
                            "success": True,
                        }
                    )
                return Response(
                    {"message": serializer.errors, "success": False}
                )

            return Response(
                {"message": "password don't match", "success": False}
            )
        else:
            return Response({"message": "signature has expired"})


class GoogleAuthSettingsView(APIView):

    """
    Return the google oauth client id.
    """

    permission_classes = (permissions.AllowAny,)

    def get(self, request):

        return Response(
            {"client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_CLIENT_ID}
        )


class UpdateTrackingDomainView(APIView):

    """
    Update user's tracking domain.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request):
        tracking_domain = request.data.get("tracking_domain")
        if not self.check_cname(tracking_domain):
            return Response(data="Invalid Domain", status=status.HTTP_400_BAD_REQUEST)

        serializer = TrackingDomainSerializer(
            self.request.user, data=request.data
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def check_cname(self, domain):
        domain_name = domain.replace('https://','').replace('http://','')
        result = dns.resolver.resolve(domain_name, 'CNAME')
        flag = True
        if result[0] != 'app.mailerrize.com':
            flag = False

        return flag
