from django.db import models
from django.utils.translation import gettext as _

from apps.users.models import CustomUser


# Create your models here.


class UnsubscribeEmail(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    email = models.EmailField(_("Email Account"))
    date = models.DateTimeField(auto_now=True, blank=True)

    @property
    def is_domain(self):
        return self.email.find("*@") > -1

    def __str__(self):
        return self.email
