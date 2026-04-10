from decimal import Decimal

from rest_framework import serializers

from investments.models import Investment, MarketPriceSnapshot
from services.ai_engine import build_signal_for_investment
from services.market_data import get_current_asset_price


class InvestmentSerializer(serializers.ModelSerializer):
    current_value = serializers.SerializerMethodField()
    invested_value = serializers.SerializerMethodField()
    profit_loss = serializers.SerializerMethodField()
    profit_loss_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = (
            "id",
            "asset_type",
            "symbol",
            "name",
            "buy_price",
            "quantity",
            "purchase_date",
            "current_price_cache",
            "price_currency",
            "metadata",
            "current_value",
            "invested_value",
            "profit_loss",
            "profit_loss_percentage",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "current_price_cache",
            "price_currency",
            "created_at",
            "updated_at",
        )

    def get_current_value(self, obj):
        return obj.current_price_cache * obj.quantity

    def get_invested_value(self, obj):
        return obj.buy_price * obj.quantity

    def get_profit_loss(self, obj):
        return self.get_current_value(obj) - self.get_invested_value(obj)

    def get_profit_loss_percentage(self, obj):
        invested = self.get_invested_value(obj)
        if invested == 0:
            return Decimal("0.00")
        return (self.get_profit_loss(obj) / invested) * Decimal("100")

    def create(self, validated_data):
        price_data = get_current_asset_price(
            asset_type=validated_data["asset_type"],
            symbol=validated_data["symbol"],
        )
        validated_data["current_price_cache"] = price_data["price"]
        validated_data["price_currency"] = price_data["currency"]
        return super().create(validated_data)


class InvestmentSuggestionSerializer(serializers.ModelSerializer):
    signal = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = ("id", "symbol", "asset_type", "name", "signal")

    def get_signal(self, obj):
        return build_signal_for_investment(obj)


class MarketPriceSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketPriceSnapshot
        fields = "__all__"
