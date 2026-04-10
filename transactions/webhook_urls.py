from django.urls import path

from transactions.webhook_views import RazorpayWebhookView, StripeWebhookView

urlpatterns = [
    path("stripe", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("razorpay", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
]
