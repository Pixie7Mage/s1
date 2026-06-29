"""Generate Word financial planning report from client payload."""

from __future__ import annotations

import io
from datetime import date

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt

from client.calculations.helpers import (
    emergency_fund_required,
    format_inr,
    recommended_health_cover,
    recommended_term_cover,
    total_annual_expenses,
    total_annual_income,
)


def _heading(doc: Document, text: str, level: int = 1) -> None:
    doc.add_heading(text, level=level)


def _para(doc: Document, text: str, bold: bool = False) -> None:
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.font.size = Pt(11)


def _table_row(table, label: str, value: str) -> None:
    row = table.add_row()
    row.cells[0].text = label
    row.cells[1].text = value


def generate_report(data: dict) -> bytes:
    doc = Document()

    title = doc.add_heading("Financial Planning Report", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    personal = data.get("personal", {})
    name = personal.get("full_name", "Client")
    _para(doc, f"Prepared for: {name}", bold=True)
    _para(doc, f"Report Date: {date.today().strftime('%d %B %Y')}")
    doc.add_paragraph()

    # Personal
    _heading(doc, "1. Personal & Family Details")
    t = doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    _table_row(t, "Full Name", personal.get("full_name", ""))
    _table_row(t, "Age", str(personal.get("age", "")))
    _table_row(t, "Marital Status", personal.get("marital_status", ""))
    _table_row(t, "Retirement Age", str(personal.get("retirement_age", "")))
    _table_row(t, "Occupation", personal.get("occupation", ""))
    doc.add_paragraph()

    family = data.get("family_members", [])
    if family:
        _para(doc, "Family Members:", bold=True)
        for member in family:
            dep = "Yes" if member.get("financially_dependent") else "No"
            _para(
                doc,
                f"  • {member.get('name', '')} ({member.get('relationship')}) — Age {member.get('age')} (Dependent: {dep})",
            )
    doc.add_paragraph()

    # Income
    _heading(doc, "2. Income Summary")
    income = data.get("income", {})
    total_income = income.get("total_annual") or total_annual_income(income)
    t = doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    for key, label in [
        ("salary", "Salary"),
        ("business", "Business"),
        ("rental", "Rental"),
        ("interest", "Interest"),
        ("other", "Other"),
    ]:
        item = income.get(key, {})
        _table_row(t, label, format_inr(item.get("annual", item.get("amount", 0))))
    for item in income.get("extra", []):
        _table_row(t, item.get("name", "Other"), format_inr(item.get("annual", item.get("amount", 0))))
    _table_row(t, "Total Annual Income", format_inr(total_income))
    doc.add_paragraph()

    # Expenses
    _heading(doc, "3. Expenses & Savings")
    expenses = data.get("expenses", {})
    annual_exp = expenses.get("total_annual") or total_annual_expenses(expenses)
    savings = expenses.get("annual_savings", total_income - annual_exp)
    t = doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    _table_row(t, "Monthly Household (×12)", format_inr(expenses.get("monthly_household", 0) * 12))
    _table_row(t, "Annual Lifestyle", format_inr(expenses.get("annual_lifestyle", 0)))
    _table_row(t, "Existing EMIs", format_inr(expenses.get("existing_emis", 0)))
    _table_row(t, "Other Expenses", format_inr(expenses.get("other_expenses", 0)))
    _table_row(t, "Total Annual Expenses", format_inr(annual_exp))
    _table_row(t, "Annual Savings", format_inr(savings))
    _table_row(t, "Investment Surplus", format_inr(expenses.get("investment_surplus", savings)))
    doc.add_paragraph()

    # Assets & Liabilities
    _heading(doc, "4. Assets & Liabilities")
    assets = data.get("assets", {})
    liabilities = data.get("liabilities", {})
    t = doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    _table_row(t, "Total Assets", format_inr(assets.get("total", 0)))
    _table_row(t, "Total Liabilities", format_inr(liabilities.get("total", 0)))
    _table_row(t, "Net Worth", format_inr(liabilities.get("net_worth", 0)))
    doc.add_paragraph()

    # Goals
    _heading(doc, "5. Financial Goals")
    goals = data.get("goals", [])
    if not goals:
        _para(doc, "No goals specified.")
    else:
        t = doc.add_table(rows=1, cols=6)
        t.style = "Table Grid"
        headers = ["Goal", "Target Year", "Future Cost", "Funding %", "Gap", "Status"]
        for i, h in enumerate(headers):
            t.rows[0].cells[i].text = h
        for goal in goals:
            row = t.add_row()
            row.cells[0].text = goal.get("name", "")
            row.cells[1].text = str(goal.get("target_year", ""))
            row.cells[2].text = format_inr(goal.get("future_cost", 0))
            row.cells[3].text = f"{goal.get('funding_pct', 0):.1f}%"
            row.cells[4].text = format_inr(goal.get("corpus_gap", 0))
            row.cells[5].text = goal.get("status", "")
    doc.add_paragraph()

    # Investments
    _heading(doc, "6. Investment Portfolio")
    investments = data.get("investments", {})
    mfs = investments.get("mutual_funds", [])
    stocks = investments.get("stocks", [])
    if mfs:
        _para(doc, "Mutual Funds:", bold=True)
        for mf in mfs:
            _para(
                doc,
                f"  • {mf.get('scheme_name')}: Invested {format_inr(mf.get('invested_amount', 0))}, "
                f"Current {format_inr(mf.get('current_value', 0))}, P/L {format_inr(mf.get('profit_loss', 0))}",
            )
    if stocks:
        _para(doc, "Stocks:", bold=True)
        for s in stocks:
            _para(
                doc,
                f"  • {s.get('name')}: Qty {s.get('quantity')}, Value {format_inr(s.get('current_value', 0))}, "
                f"P/L {format_inr(s.get('profit_loss', 0))}",
            )
    doc.add_paragraph()

    # Insurance
    _heading(doc, "7. Insurance")
    insurance = data.get("insurance", {})
    family_count = 1 + len(family)
    rec_term = recommended_term_cover(total_income, liabilities.get("total", 0))
    rec_health = recommended_health_cover(family_count)
    t = doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    _table_row(t, "Term Cover (Existing)", format_inr(insurance.get("termCover", insurance.get("term_cover", 0))))
    _table_row(t, "Term Cover (Recommended)", format_inr(rec_term))
    _table_row(t, "Health Cover (Existing)", format_inr(insurance.get("healthCover", insurance.get("health_cover", 0))))
    _table_row(t, "Health Cover (Recommended)", format_inr(rec_health))
    doc.add_paragraph()

    # Emergency Fund
    _heading(doc, "8. Emergency Fund")
    ef = data.get("emergency_fund", {})
    assumptions = data.get("assumptions", {})
    months = assumptions.get("emergencyFundMonths", assumptions.get("emergency_fund_months", 6))
    available = sum(float(ef.get(k, 0) or 0) for k in ef)
    required = emergency_fund_required(annual_exp, months)
    t = doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    _table_row(t, "Available", format_inr(available))
    _table_row(t, f"Required ({months} months)", format_inr(required))
    _table_row(t, "Gap", format_inr(max(0, required - available)))
    doc.add_paragraph()

    # Assumptions
    _heading(doc, "9. Assumptions")
    t = doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    _table_row(t, "Inflation", f"{assumptions.get('inflation', 6)}%")
    _table_row(t, "Equity Return", f"{assumptions.get('equity', 12)}%")
    _table_row(t, "Debt Return", f"{assumptions.get('debt', 7)}%")
    _table_row(t, "Gold Return", f"{assumptions.get('gold', 8)}%")
    _table_row(t, "Life Expectancy", str(assumptions.get("lifeExpectancy", assumptions.get("life_expectancy", 85))))

    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()
