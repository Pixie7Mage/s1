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
  const targetCorpus = parseAmount(goal.targetCorpus);
  const interest = parseAmount(goal.interest);

  return { currentCost, targetCorpus, interest };
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

export function calcPortfolioCagr() {
  return null;
}

export function calcRecommendedTermCover(totalAnnualIncome, totalLiabilities) {
  return Math.max(totalAnnualIncome * 10, totalLiabilities + totalAnnualIncome * 5);
}

export function calcRecommendedHealthCover(familyMemberCount) {
  const base = 500000;
  return base + Math.max(0, familyMemberCount - 1) * 300000;
}

export function calcEmergencyFundAvailable(assets) {
  if (!assets) return 0;
  return (
    parseAmount(assets.savingsAccount) +
    parseAmount(assets.cash) +
    parseAmount(assets.sweepInFd) +
    parseAmount(assets.liquidMutualFund) +
    parseAmount(assets.moneyMarketFund) +
    parseAmount(assets.overnightMutualFund)
  );
}

export function calcEmergencyFundRequired(emergencyFund) {
  if (!emergencyFund) return 0;
  return parseAmount(emergencyFund.requiredFund);
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

export function getDerivedAssets(formState) {
  if (!formState) return {};
  const assets = formState.assets || {};
  const investments = formState.investments || {};
  const totals = calcInvestmentTotals(investments);
  
  const stocks = (assets.stocks !== undefined && assets.stocks !== null && assets.stocks !== '')
    ? assets.stocks
    : String(totals.stockCurrent || '0');
    
  const mutualFunds = (assets.mutualFunds !== undefined && assets.mutualFunds !== null && assets.mutualFunds !== '')
    ? assets.mutualFunds
    : String(totals.mfCurrent || '0');

  return {
    ...assets,
    stocks,
    mutualFunds,
  };
}
