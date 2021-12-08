import json

import stripe
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST
from django.views.generic import TemplateView

from apps.utils.decorators import catch_stripe_errors
from ..models import Payment

EXPECTED_PAYMENT_AMOUNT = 2500  # in cents

@method_decorator(login_required, name='dispatch')
class PaymentView(TemplateView):
    template_name = 'pegasus/payments/payments.html'

    def get_context_data(self, **kwargs):
        return {
            'stripe_key': settings.STRIPE_TEST_PUBLIC_KEY,
            'payments': self.request.user.pegasus_payments.all(),
            'amount': EXPECTED_PAYMENT_AMOUNT,
            'active_tab': 'payments',
        }


@login_required
@require_POST
def create_payment_intent(request):
    stripe.api_key = settings.STRIPE_TEST_SECRET_KEY
    stripe.max_network_retries = 10

    intent = stripe.PaymentIntent.create(
        amount=2500,  # in cents
        currency='usd',
        description=f'A Demo Payment',
    )
    return JsonResponse({
        'client_secret': intent['client_secret'],
    })


@login_required
def payment_confirm(request, payment_id):
    """
    Confirmation page after making a payment.
    """
    payment = get_object_or_404(Payment, user=request.user, id=payment_id)
    return render(request, 'pegasus/payments/payment_confirm.html', {
        'payment': payment,
        'active_tab': 'payments',
    })


@login_required
@require_POST
def accept_payment(request):
    """
    Accept a payment with a token from Stripe
    """
    stripe.api_key = settings.STRIPE_TEST_SECRET_KEY
    stripe.max_network_retries = 10

    name = request.POST['name']
    payment_intent_id = request.POST['paymentIntent']
    payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    if payment_intent.status != 'succeeded':
        raise Exception(f'Unexpected payment intent status: {payment_intent.status}')

    amount = payment_intent['amount']
    if amount != EXPECTED_PAYMENT_AMOUNT:
        raise ValueError(f'Unexpected payment amount {payment_intent["amount"]}')

    charge = payment_intent['charges']['data'][0]

    stripe.api_key = settings.STRIPE_TEST_SECRET_KEY
    stripe.max_network_retries = 10
    
    user = request.user
    payment = Payment.objects.create(
        charge_id=charge.id,
        amount=charge.amount,
        name=name,
        user=user,
    )
    return HttpResponseRedirect(reverse('pegasus:payment_confirm', args=[payment.payment_id]))
