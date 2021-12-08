from rest_framework import serializers

from apps.integration.models import SalesForceDetails, ZappierIntegrations
from mail.settings import ZAPIER_AUTH_URL
import os
import hashlib


class SalesForceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesForceDetails
        fields = "__all__"


class ZappierIntegrationsSerializer(serializers.ModelSerializer):
    url_to_connect = serializers.SerializerMethodField()

    class Meta:
        model = ZappierIntegrations
        fields = "__all__"

    def get_url_to_connect(self, instance):
        return ZAPIER_AUTH_URL
