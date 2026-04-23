def calculate_commission(amount: float, rate_percent: float) -> float:
    if amount < 0:
        raise ValueError("amount must be non-negative")
    if not (0 <= rate_percent <= 100):
        raise ValueError("rate_percent must be between 0 and 100")
    return round(amount * rate_percent / 100, 2)


def calculate_store_payout(amount: float, rate_percent: float) -> float:
    return round(amount - calculate_commission(amount, rate_percent), 2)
