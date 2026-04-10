from decimal import Decimal


def sma(values, period):
    if len(values) < period or period <= 0:
        return None
    slice_values = values[-period:]
    return sum(slice_values) / Decimal(str(period))


def ema(values, period):
    if len(values) < period or period <= 0:
        return None
    k = Decimal("2") / (Decimal(str(period)) + Decimal("1"))
    current = values[0]
    for value in values[1:]:
        current = (value * k) + (current * (Decimal("1") - k))
    return current


def rsi(values, period=14):
    if len(values) <= period:
        return None
    gains = []
    losses = []
    for idx in range(1, len(values)):
        diff = values[idx] - values[idx - 1]
        gains.append(max(diff, Decimal("0")))
        losses.append(abs(min(diff, Decimal("0"))))

    avg_gain = sum(gains[-period:]) / Decimal(str(period))
    avg_loss = sum(losses[-period:]) / Decimal(str(period))
    if avg_loss == 0:
        return Decimal("100")
    rs = avg_gain / avg_loss
    return Decimal("100") - (Decimal("100") / (Decimal("1") + rs))
