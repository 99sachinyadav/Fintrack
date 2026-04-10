from decimal import Decimal

from rest_framework import generics, permissions
from rest_framework.response import Response

from investments.models import MarketPriceSnapshot
from services.indicators import ema, rsi, sma


class RecommendationListView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        symbols = (
            MarketPriceSnapshot.objects.values_list("symbol", flat=True).distinct().order_by("symbol")
        )
        recommendations = []
        for symbol in symbols:
            prices = list(
                MarketPriceSnapshot.objects.filter(symbol=symbol)
                .order_by("captured_at")
                .values_list("price", flat=True)
            )
            if len(prices) < 20:
                continue
            decimal_prices = [Decimal(str(price)) for price in prices]
            sma_10 = sma(decimal_prices, 10)
            ema_10 = ema(decimal_prices, 10)
            rsi_14 = rsi(decimal_prices, 14)
            last_price = decimal_prices[-1]

            signal = "HOLD"
            confidence = Decimal("50")
            if sma_10 and ema_10 and rsi_14:
                if last_price > sma_10 and rsi_14 < Decimal("70"):
                    signal = "BUY"
                    confidence = min(Decimal("95"), Decimal("55") + (rsi_14 / Decimal("2")))
                elif last_price < ema_10 and rsi_14 > Decimal("30"):
                    signal = "SELL"
                    confidence = min(Decimal("95"), Decimal("55") + ((Decimal("100") - rsi_14) / Decimal("2")))

            recommendations.append(
                {
                    "symbol": symbol,
                    "signal": signal,
                    "confidence": round(float(confidence), 2),
                    "indicators": {
                        "sma_10": sma_10,
                        "ema_10": ema_10,
                        "rsi_14": rsi_14,
                        "last_price": last_price,
                    },
                }
            )

        return Response(recommendations)


from services.market_data import get_historical_asset_data, get_current_asset_price
from investments.models import Investment

class MarketTimingView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        featured_assets = []
        import urllib.request
        import json
        from django.conf import settings
        
        try:
            url = f"{settings.COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1"
            req_obj = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req_obj, timeout=10) as response:
                markets = json.loads(response.read().decode('utf-8'))
                for coin in markets:
                    featured_assets.append({
                        "symbol": coin["id"], 
                        "asset_type": Investment.AssetType.CRYPTO, 
                        "label": coin["name"],
                        "image": coin.get("image"),
                        "real_time_price": float(coin.get("current_price", 0)) if coin.get("current_price") else None,
                        "price_change_24h": float(coin.get("price_change_percentage_24h", 0)) if coin.get("price_change_percentage_24h") else None
                    })
        except Exception as e:
            featured_assets = [
                {
                    "symbol": "bitcoin", "asset_type": Investment.AssetType.CRYPTO, "label": "Bitcoin", 
                    "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                    "real_time_price": None, "price_change_24h": None
                }
            ]
            
        featured_assets.extend([
            {"symbol": "AAPL", "asset_type": Investment.AssetType.STOCK, "label": "Apple Inc.", "image": "https://logo.clearbit.com/apple.com", "real_time_price": None, "price_change_24h": None},
            {"symbol": "XAU", "asset_type": Investment.AssetType.GOLD, "label": "Gold", "image": "https://cdn-icons-png.flaticon.com/512/3135/3135805.png", "real_time_price": None, "price_change_24h": None},
        ])
        
        rows = []
        for asset in featured_assets:
            history = get_historical_asset_data(asset["asset_type"], asset["symbol"], days=60)
            if not history or len(history) < 14:
                continue

            prices = [item["price"] for item in history]
            rsi_14 = rsi(prices, 14)
            
            latest = history[-1]
            best_buy_day = min(history, key=lambda item: item["price"])["date"]
            best_sell_day = max(history, key=lambda item: item["price"])["date"]
            
            action = "HOLD"
            if rsi_14 is not None and rsi_14 < Decimal("35"):
                action = "BUY"
            elif rsi_14 is not None and rsi_14 > Decimal("65"):
                action = "SELL"

            rt_price = asset.get("real_time_price")
            if not rt_price:
                current_data = get_current_asset_price(asset["asset_type"], asset["symbol"])
                rt_price = float(current_data["price"]) if current_data and float(current_data["price"]) > 0 else float(latest["price"])
                
            rows.append(
                {
                    "symbol": asset["label"], 
                    "asset_type": asset["asset_type"],
                    "image": asset.get("image"),
                    "latest_price": rt_price,
                    "price_change_24h": asset.get("price_change_24h"),
                    "currency": "USD",
                    "rsi_14": float(rsi_14) if rsi_14 is not None else None,
                    "action": action,
                    "best_buy_day": best_buy_day,
                    "best_sell_day": best_sell_day,
                    "history": [{"date": item["date"], "price": float(item["price"])} for item in history]
                }
            )
        return Response(rows)
