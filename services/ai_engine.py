from decimal import Decimal

from investments.models import MarketPriceSnapshot


def moving_average(values):
    if not values:
        return Decimal("0.00")
    return sum(values, Decimal("0.00")) / Decimal(len(values))


def build_signal_for_investment(investment, short_window=5, long_window=14):
    snapshots = list(
        MarketPriceSnapshot.objects.filter(
            symbol=investment.symbol,
            asset_type=investment.asset_type,
        )
        .order_by("-captured_at")
        .values_list("price", flat=True)[:long_window]
    )
    if len(snapshots) < short_window:
        return {
            "action": "HOLD",
            "reason": "Not enough historical data for moving average analysis.",
        }

    short_avg = moving_average(snapshots[:short_window])
    long_avg = moving_average(snapshots[:long_window])
    current_price = snapshots[0]
    if short_avg > long_avg and current_price >= short_avg:
        action = "BUY"
    elif short_avg < long_avg and current_price <= short_avg:
        action = "SELL"
    else:
        action = "HOLD"

    return {
        "action": action,
        "current_price": current_price,
        "short_moving_average": short_avg,
        "long_moving_average": long_avg,
    }
