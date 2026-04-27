import pytest

from app.services.commission import calculate_commission, calculate_store_payout


def test_commission_standard_rate():
    result = calculate_commission(amount=10000.0, rate_percent=2.5)
    assert result == 250.0


def test_commission_zero_amount():
    result = calculate_commission(amount=0.0, rate_percent=2.5)
    assert result == 0.0


def test_commission_rounds_to_two_decimals():
    result = calculate_commission(amount=333.33, rate_percent=2.5)
    assert result == 8.33


def test_store_payout_is_amount_minus_commission():
    payout = calculate_store_payout(amount=10000.0, rate_percent=2.5)
    assert payout == 9750.0


def test_store_payout_with_zero_commission():
    payout = calculate_store_payout(amount=5000.0, rate_percent=0.0)
    assert payout == 5000.0


def test_commission_negative_amount_raises():
    with pytest.raises(ValueError, match="amount must be non-negative"):
        calculate_commission(amount=-100.0, rate_percent=2.5)


def test_commission_invalid_rate_raises():
    with pytest.raises(ValueError, match="rate_percent must be between 0 and 100"):
        calculate_commission(amount=1000.0, rate_percent=150.0)
