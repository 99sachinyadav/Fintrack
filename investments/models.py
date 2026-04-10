from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Investment(models.Model):
    class AssetType(models.TextChoices):
        GOLD = "gold", "Gold"
        STOCK = "stock", "Stock"
        CRYPTO = "crypto", "Crypto"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="investments",
    )
    asset_type = models.CharField(max_length=10, choices=AssetType.choices)
    symbol = models.CharField(max_length=40)
    name = models.CharField(max_length=120)
    buy_price = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    quantity = models.DecimalField(
        max_digits=16,
        decimal_places=6,
        validators=[MinValueValidator(Decimal("0.000001"))],
    )
    purchase_date = models.DateField()
    current_price_cache = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    price_currency = models.CharField(max_length=10, default="USD")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-purchase_date", "-created_at"]
        indexes = [
            models.Index(fields=["user", "asset_type", "symbol"]),
            models.Index(fields=["symbol", "asset_type"]),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.symbol}"


class MarketPriceSnapshot(models.Model):
    asset_type = models.CharField(max_length=10, choices=Investment.AssetType.choices)
    symbol = models.CharField(max_length=40)
    price = models.DecimalField(max_digits=16, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    source = models.CharField(max_length=40)
    captured_at = models.DateTimeField(auto_now_add=True)
    raw_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-captured_at"]
        indexes = [
            models.Index(fields=["symbol", "asset_type", "captured_at"]),
        ]

    def __str__(self):
        return f"{self.symbol}@{self.price}"
