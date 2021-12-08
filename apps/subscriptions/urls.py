from django.urls import path

from . import views


app_name = 'subscriptions'
urlpatterns = [
    path('api/active-products/',
         views.ProductWithMetadataAPI.as_view(), name='products_api'),

    path('api/invoices/',
         views.get_invoices, name='products_api'),

    # team-specific URLs
    # todo: it would be better if these matched the /a/team-slug/subscription pattern of other pages
    path('team/<slug:team_slug>/', views.team_subscription,
         name='team_subscription_details'),
    path('team/<slug:team_slug>/subscription_success/',
         views.team_subscription_success, name='team_subscription_success'),
    path('team/<slug:team_slug>/demo/',
         views.team_subscription_demo, name='team_subscription_demo'),
    path('team/<slug:team_slug>/subscription-gated-page/',
         views.team_subscription_gated_page, name='team_subscription_gated_page'),
    path('team/<slug:team_slug>/stripe-portal/', views.team_create_stripe_portal_session,
         name='team_create_stripe_portal_session'),
    path('team/<slug:team_slug>/api/create_customer/',
         views.team_create_customer, name='team_create_customer'),

    # Team admin subscription
    path('api/stripe-info/', views.stripe_info, name='stripe-info'),
    path('api/subscription-details/', views.subscription_details,
         name='subscription-details'),
    path('api/upgrade-subscription/', views.upgrade_subscription,
         name='upgrade-subscription'),
    path('api/create_customer/', views.create_customer, name='create_customer'),
    path('api/create_stripe_portal_session/',
         views.create_stripe_portal_session, name='create_stripe_portal_session'),
    path('api/approve_creation_of_asset/', views.aprrove_creation_of_asset,
         name='create_stripe_portal_session'),
    path('api/change_subscription/', views.change_subscription,
         name='change_subscription'),
    path('api/coupon/', views.create_coupon,
         name='create_coupon'),
    path('api/coupon/validate/', views.validateCoupon,
         name='validate_coupon'),


]
