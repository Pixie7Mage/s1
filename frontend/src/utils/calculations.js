import { parseAmount } from './currency';

export function toAnnual(amount, period) {
  const value = parseAmount(amount);
  return period === 'monthly' ? value * 12 : value;
}

function getIncomeAnnual(item) {
  const annualOverride = item.annual;
  if (annualOverride !== undefined && annualOverride !== null && String(annualOverride).trim() !== '') {
    return parseAmount(annualOverride);
  }
  return toAnnual(item.amount, item.period);
}

export function calcTotalAnnualIncome(income) {
  if (!income) return 0;
  return Object.values(income).reduce((sum, item) => {
    if (Array.isArray(item)) {
      return sum + item.reduce((subSum, row) => subSum + getIncomeAnnual(row), 0);
    }
    return sum + getIncomeAnnual(item);
  }, 0);
}

export function calcAnnualExpenses(expenses) {
  if (!expenses) return 0;
  const monthly = parseAmount(expenses.monthlyHousehold) * 12;
  const extraAnnual = (expenses.extra || []).reduce(
    (sum, item) => sum + parseAmount(item.annual),
    0,
  );
  return (
    monthly +
    parseAmount(expenses.annualLifestyle) +
    parseAmount(expenses.existingEmis) +
    parseAmount(expenses.otherExpenses) +
    extraAnnual
  );
}

export function calcAnnualSavings(totalIncome, annualExpenses) {
  return totalIncome - annualExpenses;
}

export function calcTotalAssets(assets) {
  if (!assets) return 0;
  return Object.values(assets).reduce((sum, val) => sum + parseAmount(val), 0);
}

export function calcTotalLiabilities(liabilities) {
  if (!liabilities) return 0;
  return Object.values(liabilities).reduce((sum, val) => sum + parseAmount(val), 0);
}

export function calcNetWorth(assets, liabilities) {
  return calcTotalAssets(assets) - calcTotalLiabilities(liabilities);
}

export function calcGoalMetrics(goal, assumptions = {}) {
  const currentCost = parseAmount(goal.currentCost);
  const existingInvestment = parseAmount(goal.existingInvestment);
  const inflationRate = parseAmount(goal.inflationRate || assumptions.inflation || 6);
  const targetYear = parseAmount(goal.targetYear);
  const currentYear = new Date().getFullYear();
  const years = Math.max(0, targetYear - currentYear);

  const futureCost =
    years === 0 ? currentCost : currentCost * (1 + inflationRate / 100) ** years;
  const targetCorpus = futureCost;
  const fundingPct = futureCost > 0 ? (existingInvestment / futureCost) * 100 : 0;
  const corpusGap = Math.max(0, futureCost - existingInvestment);

  let status = 'Not Started';
  if (futureCost === 0) status = 'Not Started';
  else if (fundingPct >= 80) status = 'On Track';
  else if (fundingPct >= 50) status = 'Needs Attention';
  else status = 'Critical';

  return { futureCost, targetCorpus, fundingPct, corpusGap, status, years };
}

export function calcStockCurrentValue(stock) {
  return parseAmount(stock.quantity) * parseAmount(stock.currentMarketPrice);
}

export function calcStockProfitLoss(stock) {
  const current = calcStockCurrentValue(stock);
  const invested = parseAmount(stock.quantity) * parseAmount(stock.avgBuyPrice);
  return current - invested;
}

export function calcMfProfitLoss(mf) {
  return parseAmount(mf.currentValue) - parseAmount(mf.investedAmount);
}

export function calcPortfolioCagr(investments) {
  const items = [];
  const today = new Date();

  (investments?.mutualFunds || []).forEach((mf) => {
    const invested = parseAmount(mf.investedAmount);
    const current = parseAmount(mf.currentValue);
    const date = mf.investmentDate ? new Date(mf.investmentDate) : null;
    if (invested > 0 && current > 0 && date && !Number.isNaN(date.getTime())) {
      const years = (today - date) / (365.25 * 24 * 60 * 60 * 1000);
      if (years > 0) items.push({ invested, current, years });
    }
  });

  (investments?.stocks || []).forEach((stock) => {
    const qty = parseAmount(stock.quantity);
    const invested = qty * parseAmount(stock.avgBuyPrice);
    const current = qty * parseAmount(stock.currentMarketPrice);
    if (invested > 0 && current > 0) {
      items.push({ invested, current, years: 3 });
    }
  });

  if (items.length === 0) return null;

  const totalInvested = items.reduce((s, i) => s + i.invested, 0);
  const totalCurrent = items.reduce((s, i) => s + i.current, 0);
  const avgYears = items.reduce((s, i) => s + i.years * i.invested, 0) / totalInvested;

  if (avgYears <= 0 || totalInvested <= 0) return null;
  return ((totalCurrent / totalInvested) ** (1 / avgYears) - 1) * 100;
}

export function calcRecommendedTermCover(totalAnnualIncome, totalLiabilities) {
  return Math.max(totalAnnualIncome * 10, totalLiabilities + totalAnnualIncome * 5);
}

export function calcRecommendedHealthCover(familyMemberCount) {
  const base = 500000;
  return base + Math.max(0, familyMemberCount - 1) * 300000;
}

export function calcEmergencyFundAvailable(emergencyFund) {
  if (!emergencyFund) return 0;
  return Object.values(emergencyFund).reduce((sum, val) => sum + parseAmount(val), 0);
}

export function calcEmergencyFundRequired(annualExpenses, months) {
  return (annualExpenses / 12) * parseAmount(months || 6);
}

export function calcInvestmentTotals(investments) {
  const mfInvested = (investments?.mutualFunds || []).reduce(
    (s, m) => s + parseAmount(m.investedAmount),
    0,
  );
  const mfCurrent = (investments?.mutualFunds || []).reduce(
    (s, m) => s + parseAmount(m.currentValue),
    0,
  );
  const stockInvested = (investments?.stocks || []).reduce(
    (s, st) => s + parseAmount(st.quantity) * parseAmount(st.avgBuyPrice),
    0,
  );
  const stockCurrent = (investments?.stocks || []).reduce(
    (s, st) => s + calcStockCurrentValue(st),
    0,
  );

  return {
    mfInvested,
    mfCurrent,
    stockInvested,
    stockCurrent,
    totalInvested: mfInvested + stockInvested,
    totalCurrent: mfCurrent + stockCurrent,
    totalProfitLoss: mfCurrent + stockCurrent - (mfInvested + stockInvested),
  };
}
