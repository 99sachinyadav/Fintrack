import hashlib
import hmac
from datetime import datetime, timezone
from decimal import Decimal

from django.conf import settings

from transactions.models import Transaction, WebhookEvent
from users.models import User


def _verify_signature(signature, body, secret):
    if not secret:
        return True
    digest = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature or "", digest)


def _get_default_user():
    return User.objects.order_by("id").first()


def handle_stripe_webhook(headers, body, payload):
    event_id = payload.get("id", "")
    signature = headers.get("Stripe-Signature", "")
    if not _verify_signature(signature, body, settings.STRIPE_WEBHOOK_SECRET):
        raise ValueError("Invalid Stripe signature.")
    _, created = WebhookEvent.objects.get_or_create(
        provider="stripe",
        event_id=event_id,
        defaults={"payload": payload},
    )
    if not created:
        return {"message": "Duplicate Stripe event ignored.", "event_id": event_id}
    data = payload.get("data", {}).get("object", {})
    user = _get_default_user()
    if user and payload.get("type") == "payment_intent.succeeded":
        Transaction.objects.create(
            user=user,
            provider=Transaction.Provider.STRIPE,
            external_id=data.get("id", event_id),
            amount=Decimal(str(data.get("amount_received", 0))) / Decimal("100"),
            category=data.get("metadata", {}).get("category", "payment"),
            transaction_type=Transaction.TransactionType.DEBIT,
            status=Transaction.Status.SUCCESS,
            currency=(data.get("currency") or "usd").upper(),
            description="Stripe webhook transaction",
            occurred_at=datetime.now(timezone.utc),
            metadata=payload,
        )
    return {"message": "Stripe webhook processed.", "event_id": event_id}


def handle_razorpay_webhook(headers, body, payload):
    event_id = payload.get("payload", {}).get("payment", {}).get("entity", {}).get("id", "")
    signature = headers.get("X-Razorpay-Signature", "")
    if not _verify_signature(signature, body, settings.RAZORPAY_WEBHOOK_SECRET):
        raise ValueError("Invalid Razorpay signature.")
    _, created = WebhookEvent.objects.get_or_create(
        provider="razorpay",
        event_id=event_id,
        defaults={"payload": payload},
    )
    if not created:
        return {"message": "Duplicate Razorpay event ignored.", "event_id": event_id}
    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    user = _get_default_user()
    if user and payload.get("event") == "payment.captured":
        Transaction.objects.create(
            user=user,
            provider=Transaction.Provider.RAZORPAY,
            external_id=entity.get("id", event_id),
            amount=Decimal(str(entity.get("amount", 0))) / Decimal("100"),
            category=entity.get("notes", {}).get("category", "payment"),
            transaction_type=Transaction.TransactionType.DEBIT,
            status=Transaction.Status.SUCCESS,
            currency=(entity.get("currency") or "INR").upper(),
            description="Razorpay webhook transaction",
            occurred_at=datetime.now(timezone.utc),
            metadata=payload,
        )
    return {"message": "Razorpay webhook processed.", "event_id": event_id}
