
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from apps.integration.models import ZappierIntegrations
from apps.integration.serializers import ZappierIntegrationsSerializer
from apps.users.models import CustomUser
from apps.users.serializer import UserDetailsSerializer


class ZappierIntegrationsView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ZappierIntegrations.objects.all()
    serializer_class = ZappierIntegrationsSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "user__id"

    def get_queryset(self):
        return ZappierIntegrations.objects.filter(user=self.request.user).all()

    def retrieve(self, request, *args, **kwargs):
        integration = ZappierIntegrations.objects.get_or_create(
            user=self.request.user)
        return super(ZappierIntegrationsView, self).retrieve(request, args, kwargs)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_from_zapier(request):
    user: CustomUser = request.user
    zappierIntegration: ZappierIntegrations = ZappierIntegrations.objects.filter(
        user=user).get()

    zappierIntegration.status = ZappierIntegrations.STATUS_INTEGRATION.SETTED
    zappierIntegration.save(update_fields=['status'])

    return Response(data=UserDetailsSerializer(user).data)
