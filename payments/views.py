from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal

import stripe
from django.conf import settings
from django.db import transaction as db_transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from services.email_service import send_payment_link_email, send_payment_receipt_email
from services.transaction_categorization import categorize_transaction
from transactions.models import Transaction, WebhookEvent
from users.models import User

stripe.api_key = settings.STRIPE_SECRET_KEY


def _amount_from_stripe(obj):
    amount = obj.get("amount_received") or obj.get("amount_total") or obj.get("amount") or 0
    return Decimal(str(amount)) / Decimal("100")


def _resolve_user(metadata, customer_email):
    user_id = metadata.get("user_id")
    if user_id:
        return User.objects.filter(id=user_id).first()
    if customer_email:
        return User.objects.filter(email__iexact=customer_email).first()
    return None


def _build_transaction_payload(event_type, obj):
    metadata = obj.get("metadata") or {}
    description = (
        obj.get("description")
        or obj.get("statement_descriptor")
        or metadata.get("description")
        or "Stripe payment event"
    )
    incoming = str(metadata.get("flow", "")).lower() in {"incoming", "credit", "income"}
    txn_type = Transaction.TransactionType.INCOME if incoming else Transaction.TransactionType.EXPENSE
    category = categorize_transaction(
        description=description,
        merchant_name=obj.get("merchant_name", ""),
        metadata=metadata,
        incoming=incoming,
    )
    return txn_type, category, description


def _upsert_stripe_transaction(user, event_type, obj):
    txn_type, category, description = _build_transaction_payload(event_type, obj)
    amount = _amount_from_stripe(obj)
    if amount <= 0:
        return None, False, "No amount in event."

    stripe_payment_id = obj.get("payment_intent") or obj.get("id")
    external_id = obj.get("id") or stripe_payment_id
    occurred_at = datetime.fromtimestamp(
        obj.get("created", int(datetime.now(tz=timezone.utc).timestamp())),
        tz=timezone.utc,
    )

    with db_transaction.atomic():
        existing_transaction = None
        if stripe_payment_id:
            existing_transaction = Transaction.objects.filter(
                provider=Transaction.Provider.STRIPE,
                stripe_payment_id=stripe_payment_id,
            ).first()

        if existing_transaction:
            transaction_obj = existing_transaction
            inserted = False
            changed_fields = []
            if not transaction_obj.external_id and external_id:
                transaction_obj.external_id = external_id
                changed_fields.append("external_id")
            transaction_obj.metadata = {"event_type": event_type, "stripe": obj}
            changed_fields.append("metadata")
            if changed_fields:
                transaction_obj.save(update_fields=changed_fields)
        else:
            transaction_obj, inserted = Transaction.objects.get_or_create(
                provider=Transaction.Provider.STRIPE,
                external_id=external_id,
                defaults={
                    "user": user,
                    "stripe_payment_id": stripe_payment_id or "",
                    "amount": amount,
                    "category": category,
                    "transaction_type": txn_type,
                    "status": Transaction.Status.SUCCESS,
                    "currency": (obj.get("currency") or "usd").upper(),
                    "description": description,
                    "occurred_at": occurred_at,
                    "metadata": {"event_type": event_type, "stripe": obj},
                },
            )
        if inserted:
            if txn_type == Transaction.TransactionType.INCOME:
                user.savings = (user.savings or Decimal("0.00")) + amount
            else:
                user.savings = (user.savings or Decimal("0.00")) - amount
            user.save(update_fields=["savings"])
            send_payment_receipt_email(user, transaction_obj)

    return transaction_obj, inserted, None


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.headers.get("Stripe-Signature", "")
        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except stripe.error.SignatureVerificationError:
            return Response({"detail": "Invalid Stripe signature."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"detail": "Invalid payload."}, status=status.HTTP_400_BAD_REQUEST)

        event_id = event.get("id")
        _, created = WebhookEvent.objects.get_or_create(
            provider="stripe",
            event_id=event_id,
            defaults={"payload": event},
        )
        if not created:
            return Response({"message": "Duplicate event ignored.", "event_id": event_id})

        event_type = event.get("type")
        if event_type not in {
            "payment_intent.succeeded",
            "charge.succeeded",
            "invoice.paid",
            "checkout.session.completed",
        }:
            return Response({"message": "Event received.", "event_id": event_id})

        obj = event.get("data", {}).get("object", {})
        metadata = obj.get("metadata") or {}
        customer_email = (
            obj.get("customer_email")
            or obj.get("receipt_email")
            or (obj.get("customer_details") or {}).get("email")
        )
        user = _resolve_user(metadata, customer_email)
        if not user:
            return Response({"message": "User not found for event.", "event_id": event_id})

        _, _, error_message = _upsert_stripe_transaction(user, event_type, obj)
        if error_message:
            return Response({"message": error_message, "event_id": event_id})

        return Response({"message": "Stripe webhook processed.", "event_id": event_id})


class StripeCheckoutConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not settings.STRIPE_SECRET_KEY:
            return Response(
                {"detail": "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        session_id = request.data.get("session_id")
        if not session_id:
            return Response({"detail": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except stripe.error.StripeError as exc:
            err = getattr(exc, "user_message", None) or getattr(exc, "message", None) or str(exc)
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)

        metadata = session.get("metadata") or {}
        customer_email = (
            session.get("customer_email")
            or (session.get("customer_details") or {}).get("email")
        )
        resolved_user = _resolve_user(metadata, customer_email)
        if resolved_user and resolved_user.id != request.user.id:
            return Response({"detail": "Session does not belong to the authenticated user."}, status=status.HTTP_403_FORBIDDEN)

        if session.get("payment_status") != "paid":
            return Response(
                {"detail": "Checkout session is not paid yet.", "payment_status": session.get("payment_status")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _, inserted, error_message = _upsert_stripe_transaction(
            request.user,
            "checkout.session.completed",
            session,
        )
        if error_message:
            return Response({"detail": error_message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Stripe checkout confirmed.", "created": inserted})


def _stripe_metadata_for_user(user_id, flow, description):
    """Stripe metadata values must be strings."""
    return {
        "user_id": str(user_id),
        "flow": str(flow or "outgoing"),
        "description": (description or "")[:450],
    }


class StripeCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not settings.STRIPE_SECRET_KEY:
            return Response(
                {"detail": "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        amount = Decimal(str(request.data.get("amount", "0")))
        description = request.data.get("description", "Smart Finance Advisor Payment")
        if amount <= 0:
            return Response({"detail": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        unit_cents = int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        if unit_cents < 50:
            return Response(
                {"detail": "Amount too small for Stripe. Use at least $0.50 USD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            metadata = _stripe_metadata_for_user(
                request.user.id,
                request.data.get("flow", "outgoing"),
                description,
            )
            session = stripe.checkout.Session.create(
                mode="payment",
                success_url=request.data.get(
                    "success_url",
                    f"{settings.FRONTEND_URL}/payments?status=success&session_id={{CHECKOUT_SESSION_ID}}",
                ),
                cancel_url=request.data.get("cancel_url", f"{settings.FRONTEND_URL}/payments?status=cancel"),
                line_items=[
                    {
                        "quantity": 1,
                        "price_data": {
                            "currency": "usd",
                            "product_data": {"name": description[:200]},
                            "unit_amount": unit_cents,
                        },
                    }
                ],
                metadata=metadata,
                payment_intent_data={"metadata": metadata},
                customer_email=request.user.email,
            )
        except stripe.error.StripeError as exc:
            err = getattr(exc, "user_message", None) or getattr(exc, "message", None) or str(exc)
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"checkout_url": session.url, "id": session.id})


class PaymentLinkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not settings.STRIPE_SECRET_KEY:
            return Response(
                {"detail": "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        amount = Decimal(str(request.data.get("amount", "0")))
        description = request.data.get("description", "Smart Finance Advisor Payment")
        flow = request.data.get("flow", "outgoing")
        payer_email = request.data.get("payer_email", "").strip()
        if amount <= 0:
            return Response({"detail": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        unit_cents = int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        if unit_cents < 50:
            return Response(
                {"detail": "Amount too small for Stripe. Use at least $0.50 USD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            metadata = _stripe_metadata_for_user(
                request.user.id,
                request.data.get("flow", "outgoing"),
                description,
            )
            price = stripe.Price.create(
                currency="usd",
                unit_amount=unit_cents,
                product_data={"name": description[:200]},
                metadata=metadata,
            )
            link = stripe.PaymentLink.create(
                line_items=[{"price": price.id, "quantity": 1}],
                metadata=metadata,
                payment_intent_data={"metadata": metadata},
            )
            
            if flow == "incoming" and payer_email:
                send_payment_link_email(request.user, payer_email, str(amount), description, link.url)
                
        except stripe.error.StripeError as exc:
            err = getattr(exc, "user_message", None) or getattr(exc, "message", None) or str(exc)
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"payment_link_url": link.url})
