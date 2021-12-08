"""Mailerrize URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import debug_toolbar
from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

from rest_framework import permissions
from . import views

schema_view = get_schema_view(
    openapi.Info(
        title="Mailerrize APIs",
        default_version="0.1.0",
        description="Mailerrize API handles all aspects of interaction with the Mailerrize platform for web, client and other interfaces.",  # noqa: E501
        terms_of_service="https://www.mailerrize.com/policies/terms/",
        contact=openapi.Contact(email="contact@mailerrize.com"),
        license=openapi.License(name="All Rights Reserved"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

handler404 = 'mail.views.handler404'
handler500 = 'mail.views.handler500'

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("users/", include("apps.users.urls")),
    path("unsubscribes/", include("apps.unsubscribes.urls")),
    path("subscriptions/", include("apps.subscriptions.urls")),
    path("campaignschedule/", include("apps.campaignschedule.urls")),
    path("campaign/", include("apps.campaign.urls")),
    path("teams/", include("apps.teams.urls")),
    path("integrations/", include("apps.integration.urls")),
    path("app/", include("apps.pegasus.urls")),
    path("celery-progress/", include("celery_progress.urls")),
    # API docs
    url(
        r"api-doc/swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    url(
        r"api-doc/swagger/$",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    url(
        r"api-doc/redoc/$",
        schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
    path("rest-auth/", include("rest_auth.urls")),
    path("rest-auth/registration/", include("rest_auth.registration.urls")),
    path("o/", include("oauth2_provider.urls", namespace="oauth2_provider")),
    path(r"auth/", include("rest_framework_social_oauth2.urls")),
    # djstripe urls - for webhooks
    path("stripe/", include("djstripe.urls", namespace="djstripe")),
    path("mailaccounts/", include("apps.mailaccounts.urls")),
    path(r"^", include("django.contrib.auth.urls")),
    # Front-end
    path("", include("apps.web.urls")),
    path("__debug__/", include(debug_toolbar.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
