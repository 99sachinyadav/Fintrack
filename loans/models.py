from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class LoanProvider(models.Model):
    name = models.CharField(max_length=120)
    interest_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    reliability_factor = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    processing_fee = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0.00"))
    max_tenure_months = models.PositiveIntegerField(default=60)
    active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["interest_rate", "-reliability_factor"]
        indexes = [
            models.Index(fields=["active", "interest_rate"]),
        ]


class LoanRecommendation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="loan_recommendations",
    )
    provider = models.ForeignKey(
        LoanProvider,
        on_delete=models.CASCADE,
        related_name="recommendations",
    )
    eligible_amount = models.DecimalField(max_digits=14, decimal_places=2)
    emi = models.DecimalField(max_digits=14, decimal_places=2)
    tenure_months = models.PositiveIntegerField()
    trust_score = models.PositiveSmallIntegerField()
    status = models.CharField(max_length=20, default="eligible")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-trust_score", "emi"]
