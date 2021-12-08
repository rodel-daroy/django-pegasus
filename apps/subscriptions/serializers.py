from djstripe.models import Product, Plan
from rest_framework import serializers

from apps.subscriptions.helpers import get_friendly_currency_amount


class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = ('id', 'name')


class PlanSerializer(serializers.ModelSerializer):
    currency_amount = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = ('id', 'interval', 'amount', 'currency', 'currency_amount')

    def get_currency_amount(self, obj):
        return get_friendly_currency_amount(obj.amount, obj.currency)