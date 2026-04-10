from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Transaction(models.Model):
    class Provider(models.TextChoices):
        STRIPE = "stripe", "Stripe"

    class TransactionType(models.TextChoices):
        INCOME = "income", "Income"
        EXPENSE = "expense", "Expense"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    provider = models.CharField(max_length=20, choices=Provider.choices)
    external_id = models.CharField(max_length=120, blank=True)
    stripe_payment_id = models.CharField(max_length=120, blank=True)
    amount = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    category = models.CharField(max_length=80)
    transaction_type = models.CharField(
        max_length=10,
        choices=TransactionType.choices,
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SUCCESS)
    currency = models.CharField(max_length=10, default="USD")
    description = models.CharField(max_length=255, blank=True)
    occurred_at = models.DateTimeField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-occurred_at", "-created_at"]
        indexes = [
            models.Index(fields=["user", "occurred_at"]),
            models.Index(fields=["provider", "external_id"]),
            models.Index(fields=["stripe_payment_id"]),
            models.Index(fields=["user", "category"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "external_id"],
                condition=~models.Q(external_id=""),
                name="unique_provider_external_transaction",
            )
        ]


class WebhookEvent(models.Model):
    provider = models.CharField(max_length=20)
    event_id = models.CharField(max_length=120, unique=True)
    payload = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)
