from rest_framework import serializers

from investments.models import MarketPriceSnapshot


class MarketSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketPriceSnapshot
        fields = ("id", "asset_type", "symbol", "price", "currency", "source", "captured_at")
