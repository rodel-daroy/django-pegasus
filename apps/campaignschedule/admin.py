from django.contrib import admin

from .models import EmailSchedule, Schedule, WeekDays

# Register your models here.

admin.site.register(Schedule)
admin.site.register(WeekDays)


@admin.register(EmailSchedule)
class EmailScheduleAdmin(admin.ModelAdmin):
    list_display = ('time', 'date', 'user_id', 'mail_account',
                    'recipient_email', 'subject', 'email_body')
