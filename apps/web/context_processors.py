from copy import copy
from django.conf import settings
from .meta import absolute_url


def project_meta(request):
    # modify these values as needed and add whatever else you want globally available here
    project_data = copy(settings.PROJECT_METADATA)
    project_data['TITLE'] = '{} | {}'.format(project_data['NAME'], project_data['DESCRIPTION'])
    return {
        'project_meta': project_data,
        'page_url': absolute_url(request.path),
        'page_title': '',
        'page_description': '',
        'page_image': '',
    }


def google_analytics_id(request):
    """
    Adds google analytics id to all requests
    """
    if settings.GOOGLE_ANALYTICS_ID:
        return {
            'GOOGLE_ANALYTICS_ID': settings.GOOGLE_ANALYTICS_ID,
        }
    else:
        return {}


def facebook_pixel_id(request):
    """
        Adds facebook pixel id to all requests
    """
    if settings.FACEBOOK_PIXEL_ID:
        return {
            'FACEBOOK_PIXEL_ID': settings.FACEBOOK_PIXEL_ID,
        }
    else:
        return {}


def intercom_app_id(request):
    """
        Adds intercom app id to all requests
    """
    if settings.INTERCOM_APP_ID:
        return {
            'INTERCOM_APP_ID': settings.INTERCOM_APP_ID,
        }
    else:
        return {}
