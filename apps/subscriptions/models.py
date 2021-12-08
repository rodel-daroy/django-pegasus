from djstripe.models import Subscription, StripeModel
from typing import Union


class CustomSubscription(Subscription):

    def update(
        self,
        plan: Union[StripeModel, str] = None,
        **kwargs,
    ):
        """
        See `Customer.subscribe() <#djstripe.models.Customer.subscribe>`__

        :param plan: The plan to which to subscribe the customer.
        :type plan: Plan or string (plan ID)

        .. note:: The default value for ``prorate`` is the DJSTRIPE_PRORATION_POLICY \
            setting.

        .. important:: Updating a subscription by changing the plan or quantity \
            creates a new ``Subscription`` in \
            Stripe (and dj-stripe).
        """

        # Convert Plan to id
        if plan is not None and isinstance(plan, StripeModel):
            plan = plan.id
        stripe_subscription = self._api_update(
            plan=plan, **kwargs)

        return Subscription.sync_from_stripe_data(stripe_subscription)
