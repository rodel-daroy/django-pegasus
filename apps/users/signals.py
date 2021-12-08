from allauth.account.signals import email_confirmed, user_signed_up
from django.db.models.signals import post_save
from django.conf import settings
from django.core.mail import mail_admins, send_mail
from django.dispatch import receiver
from django.template.loader import render_to_string

from .models import CustomUser
import requests


@receiver(user_signed_up)
def handle_sign_up(request, user, **kwargs):
    # customize this function to do custom logic on sign up, e.g. send a welcome email
    # or subscribe them to your mailing list.
    # This example notifies the admins, in case you want to keep track of sign ups
    _notify_admins_of_signup(user)
    # and subscribes them to a mailchimp mailing list
    _subscribe_to_mailing_list(user)
    context = {
        "user": user
    }
#     Daniel did not wanted to send this welcome email.
#     send_mail(
#         subject="Wellcome to Mailerrize",
#         message=render_to_string(
#                 "account/email/wellcome/wellcome.txt", context=context
#         ),
#         from_email=settings.DEFAULT_FROM_EMAIL,
#         recipient_list=[user.email],
#         fail_silently=False,
#         html_message=render_to_string(
#             "account/email/wellcome/wellcome.html", context=context
#         ),
#     )


@receiver(email_confirmed)
def update_user_email(sender, request, email_address, **kwargs):
    """
    When an email address is confirmed make it the primary email.
    """
    # This also sets user.email to the new email address.
    # hat tip: https://stackoverflow.com/a/29661871/8207
    email_address.set_as_primary()


def _notify_admins_of_signup(user):
    mail_admins(
        "Yowsers, someone signed up for the site!",
        "Email: {}".format(user.email)
    )


def _subscribe_to_mailing_list(user):
    # todo: better handle all of this or remove it
    try:
        from mailchimp3 import MailChimp
        from mailchimp3.mailchimpclient import MailChimpError
    except ImportError:
        return

    if getattr(settings, 'MAILCHIMP_API_KEY', None) and getattr(settings, 'MAILCHIMP_LIST_ID', None):
        client = MailChimp(mc_api=settings.MAILCHIMP_API_KEY)
        try:
            client.lists.members.create(settings.MAILCHIMP_LIST_ID, {
                'email_address': user.email,
                'status': 'subscribed',
            })
        except MailChimpError as e:
            # likely it's just that they were already subscribed so don't worry about it
            try:
                # but do log to sentry if available
                from sentry_sdk import capture_exception
                capture_exception(e)
            except ImportError:
                pass

@receiver(post_save, sender=CustomUser)
def trigger_zipper_for_new_registered_user(sender, instance, created, **kwargs):
    if created:
        url = f'https://hooks.zapier.com/hooks/catch/10437168/b24wlt3/?email={instance.email}'
        r = requests.get(url)
        print(f'|| Trigger Webhook || Newly Registered User || EMAIL -> {instance.email} || Status Code -> {r.status_code} || Content -> {r.content}')
