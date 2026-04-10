from decimal import Decimal

from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class User(AbstractUser):
    class RiskAppetite(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    email = models.EmailField(unique=True)
    income = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    savings = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    liabilities = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    monthly_loan_obligation = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    risk_appetite = models.CharField(
        max_length=10,
        choices=RiskAppetite.choices,
        default=RiskAppetite.MEDIUM,
    )
    trust_score = models.PositiveSmallIntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
