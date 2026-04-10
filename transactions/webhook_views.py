import json

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from services.payment_webhooks import handle_razorpay_webhook, handle_stripe_webhook


class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = json.loads(request.body.decode("utf-8") or "{}")
        result = handle_stripe_webhook(request.headers, request.body, payload)
        return Response(result, status=status.HTTP_200_OK)


class RazorpayWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = json.loads(request.body.decode("utf-8") or "{}")
        result = handle_razorpay_webhook(request.headers, request.body, payload)
        return Response(result, status=status.HTTP_200_OK)
