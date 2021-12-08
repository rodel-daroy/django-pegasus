import json
from re import sub
import requests
import djstripe
import stripe

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.mail import mail_admins
from django.db import transaction
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.http import require_POST
from django.db.models import Q

from djstripe.models import Subscription, Invoice, Product, Plan, Coupon, Customer
from djstripe import settings as djstripe_settings

from rest_framework import status
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from stripe.api_resources import customer

from apps.utils.decorators import catch_stripe_errors, catch_stripe_errors_decorator
from .decorators import redirect_subscription_errors
from .helpers import get_friendly_currency_amount
from .metadata import get_active_products_with_metadata, \
    get_product_and_metadata_for_subscription, \
    get_product_with_metadata, TEAMMATE_PRODUCT, EMAIL_PRODUCT

from apps.teams.decorators import team_admin_required, login_and_team_required
from apps.teams.models import Membership, Team
from apps.subscriptions.models import CustomSubscription
from ..users.models import CustomUser
from apps.mailaccounts.models import EmailAccount


class ProductWithMetadataAPI(APIView):

    def get(self, request, *args, **kw):
        products_with_metadata = get_active_products_with_metadata()
        return Response(
            data=[p.to_dict() for p in products_with_metadata]
        )


@redirect_subscription_errors
@login_required
def subscription(request, subscription_holder=None):
    subscription_holder = subscription_holder if subscription_holder else request.user
    if subscription_holder.has_active_subscription():
        return _view_subscription(request, subscription_holder)
    else:
        return _upgrade_subscription(request, subscription_holder)


def _get_payment_metadata_from_request(request):
    return {
        'user_id': request.user.id,
        'user_email': request.user.email,
    }


@login_required
def subscription_success(request):
    return _subscription_success(request, request.user)


def _subscription_success(request, subscription_holder):
    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY
    stripe.max_network_retries = 10
    
    if not subscription_holder.has_active_subscription():
        subscription = subscription_holder.subscription
        if not subscription:
            messages.error(
                request,
                "Oops, it looks like there was a problem processing your payment. "
                "Please try again, or get in touch if you think this is a mistake."
            )
        else:
            # 3D-Secure workflow hopefully completed successfully,
            # re-sync the subscription and hopefully it will be active
            subscription.sync_from_stripe_data(subscription.api_retrieve())

    if subscription_holder.has_active_subscription():
        subscription_name = get_product_and_metadata_for_subscription(
            subscription_holder.active_stripe_subscription
        ).metadata.name
        messages.success(request, f"You've successfully signed up for {subscription_name}. "
                                  "Thanks so much for the support!")
        # notify admins when someone signs up
        mail_admins(
            subject=f"Hooray! Someone just signed up for a {subscription_name} subscription!",
            message="Email: {}".format(request.user.email),
            fail_silently=True,
        )

    assert isinstance(subscription_holder, Team)
    redirect = reverse('subscriptions:team_subscription_details', args=[
                       subscription_holder.slug])

    return HttpResponseRedirect(redirect)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@catch_stripe_errors_decorator
# @transaction.atomic
def create_customer(request, subscription_holder=None):
    """
    Create a Stripe Customer and Subscription object and map them onto the subscription_holder

    Expects the inbound POST data to look something like this:
    {
        'email': 'cory@example.com',
        'userId': '23',
        'payment_method': 'pm_1GGgZaIYTEadrA0y0tthZ5UH'
    }
    """
    subscription_holder = subscription_holder if subscription_holder else request.user
    request_body = request.data
    user_id = int(request_body['user_id'])
    email = request_body['user_email']
    coupon = request_body['coupon']
    couponID = request_body['couponID']

    assert request.user.id == user_id
    assert request.user.email == email

    payment_method = request_body['payment_method']
    plans = request_body['plans']

    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY
    stripe.max_network_retries = 10

    # first sync payment method to local DB to workaround https://github.com/dj-stripe/dj-stripe/issues/1125
    payment_method_obj = stripe.PaymentMethod.retrieve(payment_method)
    djstripe.models.PaymentMethod.sync_from_stripe_data(payment_method_obj)

    # create customer objects
    # This creates a new Customer in stripe and attaches the default PaymentMethod in one API call.
    customer = stripe.Customer.create(
        payment_method=payment_method,
        email=email,
        invoice_settings={
            'default_payment_method': payment_method,
        },
    )

    if (coupon):
        promotion_codes = stripe.PromotionCode.list()
        promotion_code_of_user = None
        for promotion_code in promotion_codes:
            if (coupon == promotion_code.get('code')):
                promotion_code_of_user = promotion_code
        if (not promotion_code_of_user):
            return Response({"message": "Coupon doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)
        coupon = promotion_code_of_user.coupon
    subscriptions = []
    for plan in plans:
        # create the local customer object in the DB so the subscription can use it
        djstripe.models.Customer.sync_from_stripe_data(customer)

        # create subscription
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[plan],
            coupon=couponID if couponID else None,
            expand=['latest_invoice.payment_intent', 'pending_setup_intent']

        )
        djstripe_subscription = CustomSubscription.sync_from_stripe_data(
            subscription)
        subscriptions.append(djstripe_subscription)
        # set subscription object on the subscription holder

    data = {
        'customer': customer,
        'subscription': subscription
    }
    subscription_holder.subscription.set(subscriptions)
    subscription_holder.save()
    if (coupon):
        if (coupon.percent_off):
            for subscription in subscription_holder.active_stripe_subscription:
                subscription.update(coupon=coupon)
        else:
            subscription_holder.active_stripe_subscription[0].update(
                coupon=coupon)

    # Trigger Webhook
    url = f'https://hooks.zapier.com/hooks/catch/10437168/b24gkd0/?email={email}'
    r = requests.get(url)
    print(f'Trigger Webhook || Paid || EMAIL -> {email} || Status Code -> {r.status_code} || Content -> {r.content}')
    # END

    return JsonResponse(
        data=data,
    )


def _get_subscription_urls(subscription_holder):
    # get URLs for subscription helpers
    url_bases = [
        'create_customer',
        'create_stripe_portal_session',
    ]

    def _construct_url(base):
        return reverse(f'subscriptions:{base}')

    return {
        url_base: _construct_url(url_base) for url_base in url_bases
    }


@login_required
def subscription_demo(request, subscription_holder=None):
    subscription_holder = subscription_holder if subscription_holder else request.user
    return render(request, 'subscriptions/demo.html', {
        'active_tab': 'subscription_demo',
        'subscription': subscription_holder.active_stripe_subscription,
        'product': get_product_and_metadata_for_subscription(
            subscription_holder.active_stripe_subscription
        ),
        'subscription_urls': _get_subscription_urls(subscription_holder)
    })


@login_required
def subscription_gated_page(request, subscription_holder=None):
    subscription_holder = subscription_holder if subscription_holder else request.user
    if not subscription_holder.has_active_subscription():
        return render(request, 'subscriptions/subscription_required.html')
    else:
        return render(request, 'subscriptions/subscription_gated_page.html')


@team_admin_required
def team_subscription(request, team_slug):
    return subscription(request, subscription_holder=request.team)


@team_admin_required
def team_subscription_success(request, team_slug):
    return _subscription_success(request, subscription_holder=request.team)


@team_admin_required
@require_POST
def team_create_stripe_portal_session(request, team_slug):
    return create_stripe_portal_session(request, request.team)


@team_admin_required
@require_POST
@catch_stripe_errors
@transaction.atomic
def team_create_customer(request, team_slug):
    return create_customer(request, request.team)


@login_and_team_required
def team_subscription_demo(request, team_slug):
    return subscription_demo(request, request.team)


@login_and_team_required
def team_subscription_gated_page(request, team_slug):
    return subscription_gated_page(request, subscription_holder=request.team)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stripe_info(request):
    subscription_holder: CustomUser = request.user

    has_active_subscription = subscription_holder.has_active_subscription()

    data = {
        'stripe_api_key': djstripe_settings.STRIPE_PUBLIC_KEY,
        'has_active_subscription': has_active_subscription,
    }
    return JsonResponse(data=data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def subscription_details(request):
    subscription_holder: CustomUser = request.user

    if not subscription_holder.has_active_subscription():
        data = {
            'error': 'No active subscription.'
        }
        return JsonResponse(data=data)

    active_subscriptions: CustomSubscription = subscription_holder.active_stripe_subscription
    data = []
    coupon = None
    # To make it work without webhook in localhost
    for active_subscription in active_subscriptions:

        active_subscription: CustomSubscription = CustomSubscription.sync_from_stripe_data(
            active_subscription.api_retrieve())
        coupon = active_subscription.customer.coupon
        coupon_raw = None
        if (coupon):
            coupon_raw = {
                "amount_off": coupon.amount_off,
                "currency": coupon.currency,
                "duration": coupon.duration,
                "duration_in_months": coupon.duration_in_months,
                "max_redemptions": coupon.max_redemptions,
                "name": coupon.name,
                "percent_off": coupon.percent_off,
                "redeem_by": coupon.redeem_by,
                "times_redeemed": coupon.times_redeemed,
            }

        plan: Plan = active_subscription.plan
        product: Product = plan.product
        data.append({
            'id': active_subscription.id,
            'friendly_payment_amount': get_friendly_currency_amount(
                active_subscription.plan.amount * active_subscription.quantity,
                active_subscription.plan.currency
            ),
            'quantity': active_subscription.quantity,
            'start_date': active_subscription.start_date.strftime('%B %d, %Y'),
            'current_period_end': active_subscription.current_period_end.strftime('%B %d, %Y'),
            'subscription_urls': _get_subscription_urls(subscription_holder),
            'product': {
                "name": product.name,
                "description": product.description,
                "price": plan.amount

            },
            'discount': active_subscription.discount
        })

    return JsonResponse(data={"response": data, "coupon": coupon_raw})


def _view_subscription(request, subscription_holder):
    """
    Show user's active subscription
    """
    assert subscription_holder.has_active_subscription()
    data = {
        'subscription': subscription_holder.active_stripe_subscription,
        'subscription_urls': _get_subscription_urls(subscription_holder),
        'friendly_payment_amount': get_friendly_currency_amount(
            subscription_holder.active_stripe_subscription.plan.amount,
            subscription_holder.active_stripe_subscription.plan.currency,
        ),
        'product': get_product_and_metadata_for_subscription(subscription_holder.active_stripe_subscription),
    }
    return JsonResponse(data=data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upgrade_subscription(request):
    subscription_holder: CustomUser = request.user

    teammate_product = get_product_with_metadata(TEAMMATE_PRODUCT)
    email_product = get_product_with_metadata(EMAIL_PRODUCT)

    data = {
        'teammate_product': teammate_product.to_dict(),
        'email_product': email_product.to_dict(),
        'subscription_urls': _get_subscription_urls(subscription_holder),
        'payment_metadata': _get_payment_metadata_from_request(request),
    }

    return JsonResponse(data=data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def aprrove_creation_of_asset(request):
    subscription_holder: CustomUser = request.user
    if subscription_holder.admin:
        return JsonResponse(data={
            "status": True,
            "plan":  {
                "id": None,
                "amount": 0
            },
            "quantity": 0
        })
    TYPE_SUBSCRIPTION = request.GET.get('type')
    product = get_product_with_metadata(
        EMAIL_PRODUCT) if TYPE_SUBSCRIPTION == "email" else get_product_with_metadata(TEAMMATE_PRODUCT)

    try:
        subscription = subscription_holder.subscription.filter(
            plan__id=product.monthly_plan.id).get()
        active_subscription = CustomSubscription.sync_from_stripe_data(
            subscription.api_retrieve())
        quantity = subscription.quantity
        plan: Plan = subscription.plan
        _product: Product = plan.product
        response = {
            "status": EmailAccount.objects.filter(user=subscription_holder).count() < quantity if TYPE_SUBSCRIPTION == "email" else subscription_holder.membership_set.all()[0].team.members.count() - 1 < quantity,
            "plan": {
                "id": product.monthly_plan.id,
                "amount": product.monthly_plan.amount
            },
            "subscription": {
                "id": subscription.id,
                'product': {
                    "name": _product.name,
                    "description": _product.description,
                    "price": plan.amount

                },
                'friendly_payment_amount': get_friendly_currency_amount(
                    subscription.plan.amount * subscription.quantity,
                    subscription.plan.currency
                ),
                'quantity': subscription.quantity,
                'start_date': subscription.start_date.strftime('%B %d, %Y'),
                'current_period_end': subscription.current_period_end.strftime('%B %d, %Y'),
            },
            "quantity": quantity,

        }
        return JsonResponse(data=response)
    except Exception as error:
        print(error)
        return JsonResponse(data={"status": False, "plan":  {
            "id": product.monthly_plan.id,
            "amount": product.monthly_plan.amount
        }, "quantity": 0})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_stripe_portal_session(request, subscription_holder=None):
    subscription_holder = subscription_holder if subscription_holder else request.user

    current_url = request.data['current_url']
    subscription_id = request.data['subscription_id']

    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY
    stripe.max_network_retries = 10
    
    if not subscription_holder.subscription.filter(id=subscription_id).exists():
        messages.error(request, _(
            "Whoops, we couldn't find a subscription associated with your account!"))
        data = {
            'error': "Whoops, we couldn't find a subscription associated with your account!"
        }
        return JsonResponse(data=data)

    session = stripe.billing_portal.Session.create(
        customer=subscription_holder.subscription.filter(
            id=subscription_id).get().customer.id,
        return_url=request.build_absolute_uri(current_url),
    )

    data = {
        'session_url': session.url
    }
    return JsonResponse(data=data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_invoices(request, subscription_holder=None):
    subscription_holder: CustomUser = request.user

    if not subscription_holder.has_active_subscription():
        data = []
        return JsonResponse(data=data, safe=False)

    active_subscriptions: Subscription = subscription_holder.active_stripe_subscription
    data = []

    first_active_subscription = active_subscriptions.first()
    invoices = Invoice.objects.filter(
        customer_id=first_active_subscription.customer_id).all()
    response = list(
        map(lambda invoice: {"id": invoice.id, "created_at": invoice.created, "amount": invoice.amount_paid, "pdf": invoice.invoice_pdf}, invoices))
    return JsonResponse(data=response, safe=False)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_subscription(request):
    subscription_holder: CustomUser = request.user

    new_quantity = request.data.get("quantity")
    subscription_id = request.data.get("subscription_id")
    ids_to_delete = request.data.get("ids_to_delete", [])
    couponID = request.data.get("couponID")

    if not subscription_holder.subscription.filter(id=subscription_id).exists():
        messages.error(request, _(
            "Whoops, we couldn't find a subscription associated with your account!"))
        data = {
            'error': "Whoops, we couldn't find a subscription associated with your account!"
        }
        return JsonResponse(data=data)

    subscription: CustomSubscription = subscription_holder.subscription.filter(
        id=subscription_id).get()
    result = validateTheChange(
        new_quantity, subscription, subscription_holder, ids_to_delete)
    if (not result.get("status")):
        return JsonResponse(data=result, safe=False)

    subscription.update(quantity=new_quantity,
                        coupon=couponID if couponID else None)

    return JsonResponse(data={"status": True})


def validateTheChange(new_quantity: int, subscription: CustomSubscription, subscription_holder: CustomUser, ids_to_delete: list) -> dict:

    type_operation = "email" if subscription.plan.product.id == EMAIL_PRODUCT.stripe_id else "team"

    query = EmailAccount.objects.filter(user=subscription_holder) if type_operation == "email" else subscription_holder.membership_set.all()[
        0].team.members.filter(~Q(id=subscription_holder.id))

    actual_quantity = query.count()

    def mapper(element):
        return {
            "id": element.id,
            "email": element.email,
        }

    if (new_quantity < actual_quantity and actual_quantity - len(ids_to_delete) != new_quantity):

        elements = query.all()
        new_elements = list(map(lambda x: mapper(x), elements))

        return {
            "status": False,
            "message": "Sorry you have elements attached to this plan",
            "elements": new_elements,
            "toEliminate": actual_quantity - new_quantity
        }

    elif (actual_quantity - len(ids_to_delete) == new_quantity):

        for id in ids_to_delete:
            if (type_operation == "email"):
                EmailAccount.objects.filter(pk=id).delete()
            else:
                Membership.objects.filter(user_id=id).delete()

        return {"status": True}

    else:
        return {"status": True}


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@catch_stripe_errors_decorator
# @transaction.atomic
def create_coupon(request, subscription_holder=None):

    subscription_holder: CustomUser = subscription_holder if subscription_holder else request.user
    coupon = request.data.get("coupon")
    if (not coupon):
        return Response({"message": "Coupon needed"}, status=status.HTTP_400_BAD_REQUEST)

    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY
    stripe.max_network_retries = 10

    promotion_codes = stripe.PromotionCode.list()
    promotion_code_of_user = None
    for promotion_code in promotion_codes:
        if (coupon == promotion_code.get('code')):
            promotion_code_of_user = promotion_code

    if (not promotion_code_of_user):
        return Response({"message": "Coupon doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

    coupon = promotion_code_of_user.coupon
    subscriptions = subscription_holder.active_stripe_subscription
    for subscription in subscriptions:
        if (not subscription.discount):
            continue
        if (coupon.id == subscription.discount.get('coupon', {}).get('id', None)):
            return Response({"message": "Coupon already redeemed"}, status=status.HTTP_400_BAD_REQUEST)

    for subscription in subscriptions:
        subscription.update(coupon=coupon)

    data = {
        'coupon': "successfully redeemed"
    }
    return JsonResponse(
        data=data,
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@catch_stripe_errors_decorator
# @transaction.atomic
def validateCoupon(request, subscription_holder=None):

    subscription_holder: CustomUser = subscription_holder if subscription_holder else request.user
    coupon = request.data.get("coupon")
    if (not coupon):
        return Response({"message": "Coupon needed"}, status=status.HTTP_400_BAD_REQUEST)

    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY
    stripe.max_network_retries = 10

    promotion_codes = stripe.PromotionCode.list()
    promotion_code_of_user = None
    for promotion_code in promotion_codes:
        if (coupon == promotion_code.get('code')):
            promotion_code_of_user = promotion_code
    if (not promotion_code_of_user):
        return Response({"message": "Coupon doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

    coupon = promotion_code_of_user.coupon
    data = {
        'coupon': {
            "amount_off": coupon.amount_off,
            "currency": coupon.currency,
            "duration": coupon.duration,
            "duration_in_months": coupon.duration_in_months,
            "max_redemptions": coupon.max_redemptions,
            "name": coupon.name,
            "id": coupon.id,
            "percent_off": coupon.percent_off,
            "redeem_by": coupon.redeem_by,
            "times_redeemed": coupon.times_redeemed,
        }
    }

    return JsonResponse(
        data=data,
    )
