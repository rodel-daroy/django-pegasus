import logging
from django.http import JsonResponse
from stripe.error import CardError, StripeError
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)

class catch_stripe_errors(object):
    """
    Meant to be used with django views only.
    """
    def __init__(self, f):
        self.f = f

    def __call__(self, *args, **kwargs):
        try:
            return self.f(*args, **kwargs)
        except CardError as e:
            return JsonResponse({
                'error': {
                    'message': e._message,
                }
            }, status=400)


def catch_stripe_errors_decorator(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except CardError as e:
            logger.debug('Stripe returned a card error while processing payment data: ', e)
            return Response(
                {"message": e.user_message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except StripeError as e:
            # Display a very generic error to the user.
            logger.error('Stripe returned an error while processing payment data: ', e)
            return Response(
                {"message": "An error was encountered while processing your payment information."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return wrapper
