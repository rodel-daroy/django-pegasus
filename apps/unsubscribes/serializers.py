from rest_framework import serializers

from .models import UnsubscribeEmail


class UnsubscribeEmailSerializers(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    created_datetime = serializers.DateTimeField(
        source="date", format="%B %d %Y", required=False
    )

    class Meta:
        model = UnsubscribeEmail
        fields = "__all__"
