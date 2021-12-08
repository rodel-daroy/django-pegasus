from django.urls import path
from django.views.generic import TemplateView

from . import views

""" handler404 = 'mail.views.handler404'
handler500 = 'mail.views.handler500' """

app_name = "web"
urlpatterns = [
    path(r'', views.home, name='home'),

    path(r'a/<slug:team_slug>', views.team_home, name='team_home'),
    path(r'a/<slug:team_slug>/manage/', views.team_admin_home, name='team_admin'),
    path(r'privacy', TemplateView.as_view(
        template_name="web/privacy.html"), name='privacy'),
    path(r'404', TemplateView.as_view(
        template_name="404.html"), name='not_found'),

    path('.well-known/microsoft-identity-association.json', views.msfile),
]
