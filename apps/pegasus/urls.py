from django.urls import path
from django.views.generic import TemplateView
from rest_framework import routers

from . import views

app_name = 'pegasus'

urlpatterns = [
    path(r'', views.ReactObjectLifecycleView.as_view(), name='react_object_lifecycle'),
    path(r'<path:path>', views.ReactObjectLifecycleView.as_view(), name='react_object_lifecycle'),
    path(r'payments', views.PaymentView.as_view(), name='payments'),
    # path(r'payments/create_payment_intent/', views.create_payment_intent, name='create_payment_intent'),
    # path(r'payments/create/', views.accept_payment, name='accept_payment'),
    # path(r'payments/confirm/<slug:payment_id>/', views.payment_confirm, name='payment_confirm'),
    # path(r'landing_page/', TemplateView.as_view(template_name='pegasus/examples/example_landing_page.html'),
    # name='landing_page'), path(r'pricing_page/', TemplateView.as_view(
    # template_name='pegasus/examples/example_pricing_page.html'), name='pricing_page'), path(r'objects/react/',
    # views.ReactObjectLifecycleView.as_view(), name='react_object_lifecycle'), path(r'objects/react/<path:path>',
    # views.ReactObjectLifecycleView.as_view(), name='react_object_lifecycle_w_path'), path(r'objects/vue/',
    # views.VueObjectLifecycleView.as_view(), name='vue_object_lifecycle'), path(r'charts/',
    # views.ChartsView.as_view(), name='charts'), path(r'tasks/', views.TasksView.as_view(), name='tasks'),
    # path(r'tasks/api/', views.tasks_api, name='tasks_api'),

    #     path(r'api/employee-data/', views.EmployeeDataAPIView.as_view(), name='employee_data'),
]

# drf config
router = routers.DefaultRouter()
router.register(r'api/employees', views.EmployeeViewSet)

urlpatterns += router.urls
