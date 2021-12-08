from django.contrib import admin

# Register your models here.
from .models import Team,SalesForceDetails



admin.site.register(Team)
admin.site.register(SalesForceDetails)