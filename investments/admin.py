from django.contrib import admin

from investments.models import Investment, MarketPriceSnapshot


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ("user", "symbol", "asset_type", "buy_price", "quantity", "purchase_date")
    list_filter = ("asset_type",)
    search_fields = ("symbol", "name", "user__email")


@admin.register(MarketPriceSnapshot)
class MarketPriceSnapshotAdmin(admin.ModelAdmin):
    list_display = ("symbol", "asset_type", "price", "source", "captured_at")
    list_filter = ("asset_type", "source")
