from django.contrib import admin

from .models import Payment, Employee


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at', 'amount_display']
    list_filter = ['created_at']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'department', 'salary', 'created_at']
    list_filter = ['created_at']
