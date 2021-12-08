import uuid

from django.conf import settings
from django.db import models

from apps.utils.models import BaseModel


class Payment(BaseModel):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True)
    charge_id = models.CharField(max_length=100, help_text='The stripe charge ID associated with this payment.')
    name = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pegasus_payments')
    amount = models.PositiveIntegerField(help_text='In cents')

    @property
    def payment_id(self):
        return str(self.id)

    @property
    def amount_display(self):
        return '${:,.2f}'.format(self.amount / 100.)
