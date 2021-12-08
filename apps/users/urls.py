from django.urls import path
from . import views


app_name = "users"
urlpatterns = [
    path("profile/", views.ProfileView.as_view(), name="user_profile"),
    # path('profile/', views.profile, name='user_profile'),
    path(
        "profile/upload-image/",
        views.upload_profile_image,
        name="upload_profile_image",
    ),
    path("aboutyou/", views.UserSettingsView.as_view(), name="aboutyou"),
    path(
        "update-tracking-domain/",
        views.UpdateTrackingDomainView.as_view(),
        name="update-tracking-domain",
    ),
    path(
        "change-password/",
        views.ChangePasswordView.as_view(),
        name="change_password",
    ),
    path(
        "reset_password/",
        views.PasswordResetLink.as_view(),
        name="reset_password",
    ),  # done
    path("token/<str:token_data>/", views.ForgotPassword.as_view()),
    path(
        "google-oauth/",
        views.GoogleAuthSettingsView.as_view(),
        name="google-auth-settings",
    ),
]
