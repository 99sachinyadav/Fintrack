from django.urls import path

from payments.views import (
    PaymentLinkView,
    StripeCheckoutConfirmView,
    StripeCheckoutSessionView,
    StripeWebhookView,
)

urlpatterns = [
    path("checkout-session", StripeCheckoutSessionView.as_view(), name="stripe-checkout-session"),
    path("confirm-session", StripeCheckoutConfirmView.as_view(), name="stripe-confirm-session"),
    path("payment-link", PaymentLinkView.as_view(), name="stripe-payment-link"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
