from django.urls import path

from apps.integration.views import ZappierIntegrationsView, user_from_zapier


urlpatterns = [
    path(
        "<int:user__id>/",
        ZappierIntegrationsView.as_view(),
        name="integrations",
    ),
    path(
        "user/",
        user_from_zapier,
        name="user_from_zapier",
    ),
]
