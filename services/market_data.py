import json
import logging
from decimal import Decimal
from urllib import parse, request

from django.conf import settings

from investments.models import Investment, MarketPriceSnapshot

logger = logging.getLogger(__name__)


def _fetch_json(url, headers=None):
    req = request.Request(url, headers=headers or {})
    with request.urlopen(req, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def get_current_asset_price(asset_type, symbol):
    symbol_value = symbol.strip().lower()
    try:
        if asset_type == Investment.AssetType.CRYPTO:
            url = (
                f"{settings.COINGECKO_BASE_URL}/simple/price?"
                f"ids={parse.quote(symbol_value)}&vs_currencies=usd"
            )
            payload = _fetch_json(url)
            price = Decimal(str(payload.get(symbol_value, {}).get("usd", "0")))
            source = "coingecko"
        elif asset_type == Investment.AssetType.STOCK:
            source = "alpha_vantage" if settings.ALPHA_VANTAGE_API_KEY else "fallback"
            if settings.ALPHA_VANTAGE_API_KEY:
                url = (
                    "https://www.alphavantage.co/query?function=GLOBAL_QUOTE"
                    f"&symbol={parse.quote(symbol.upper())}&apikey={settings.ALPHA_VANTAGE_API_KEY}"
                )
                payload = _fetch_json(url)
                quote = payload.get("Global Quote", {})
                price = Decimal(str(quote.get("05. price", "0")))
            else:
                payload = {"message": "Missing Alpha Vantage API key."}
                price = Decimal("0")
        else:
            source = "gold_api" if settings.GOLD_API_URL else "fallback"
            if settings.GOLD_API_URL:
                headers = {"x-access-token": settings.GOLD_API_KEY} if settings.GOLD_API_KEY else {}
                payload = _fetch_json(settings.GOLD_API_URL, headers=headers)
                price = Decimal(str(payload.get("price", "0")))
            else:
                payload = {"message": "Missing gold API configuration."}
                price = Decimal("0")
    except Exception as exc:
        logger.warning("Market data fetch failed for %s: %s", symbol, exc)
        payload = {"error": str(exc)}
        price = Decimal("0")
        source = "fallback"

    return {
        "price": price,
        "currency": settings.DEFAULT_CURRENCY,
        "source": source,
        "payload": payload,
    }


def refresh_investment_price(investment):
    price_data = get_current_asset_price(investment.asset_type, investment.symbol)
    investment.current_price_cache = price_data["price"]
    investment.price_currency = price_data["currency"]
    investment.save(update_fields=["current_price_cache", "price_currency", "updated_at"])
    MarketPriceSnapshot.objects.create(
        asset_type=investment.asset_type,
        symbol=investment.symbol,
        price=price_data["price"],
        currency=price_data["currency"],
        source=price_data["source"],
        raw_payload=price_data["payload"],
    )
    return investment
