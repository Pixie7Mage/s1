"""Financial calculation helpers for report generation."""

from __future__ import annotations


def _num(value) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def format_inr(value: float) -> str:
    if value >= 10_000_000:
        return f"₹{value / 10_000_000:.2f} Cr"
    if value >= 100_000:
        return f"₹{value / 100_000:.2f} L"
    return f"₹{value:,.0f}"


def income_annual(item: dict) -> float:
    amount = _num(item.get("amount"))
    return amount * 12 if item.get("period") == "monthly" else amount


def total_annual_income(income: dict) -> float:
    return sum(
        income_annual(income.get(k, {}))
        for k in ("salary", "business", "rental", "interest", "other")
    )


def total_annual_expenses(expenses: dict) -> float:
    return (
        _num(expenses.get("monthly_household")) * 12
        + _num(expenses.get("annual_lifestyle"))
        + _num(expenses.get("existing_emis"))
        + _num(expenses.get("other_expenses"))
    )


def sum_values(data: dict, keys: list[str]) -> float:
    return sum(_num(data.get(k)) for k in keys)


def recommended_term_cover(total_income: float, total_liabilities: float) -> float:
    return max(total_income * 10, total_liabilities + total_income * 5)


def recommended_health_cover(family_count: int) -> float:
    return 500_000 + max(0, family_count - 1) * 300_000


def emergency_fund_required(annual_expenses: float, months: float) -> float:
    return (annual_expenses / 12) * _num(months or 6)
