import {
  calcTotalAnnualIncome,
  calcAnnualExpenses,
  calcTotalAssets,
  calcTotalLiabilities,
  calcGoalMetrics,
} from './calculations';
import { parseAmount } from './currency';

export function validatePersonalFamilyForm(formState) {
  const errors = { personal: {}, familyMembers: {} };
  const { personal, familyMembers } = formState;

  if (!personal.fullName?.trim()) {
    errors.personal.fullName = 'Full name is required';
  }

  if (personal.dobOrAgeMode === 'dob') {
    if (!personal.dateOfBirth) {
      errors.personal.dateOfBirth = 'Date of birth is required';
    } else if (!personal.age) {
      errors.personal.dateOfBirth = 'Enter a valid date of birth';
    }
  } else if (!personal.age?.trim()) {
    errors.personal.age = 'Age is required';
  } else if (Number(personal.age) < 0 || Number(personal.age) > 120) {
    errors.personal.age = 'Enter a valid age (0–120)';
  }

  if (!personal.maritalStatus) {
    errors.personal.maritalStatus = 'Marital status is required';
  }

  if (!personal.retirementAge?.trim()) {
    errors.personal.retirementAge = 'Retirement age is required';
  } else if (Number(personal.retirementAge) < 40 || Number(personal.retirementAge) > 80) {
    errors.personal.retirementAge = 'Enter a retirement age between 40 and 80';
  }

  if (!personal.occupation?.trim()) {
    errors.personal.occupation = 'Occupation is required';
  }

  familyMembers.forEach((member) => {
    const memberErrors = {};
    if (!member.name?.trim()) {
      memberErrors.name = 'Name is required';
    }
    if (!member.relationship) {
      memberErrors.relationship = 'Relationship is required';
    }
    if (!member.age?.trim()) {
      memberErrors.age = 'Age is required';
    } else if (Number(member.age) < 0 || Number(member.age) > 120) {
      memberErrors.age = 'Enter a valid age (0–120)';
    }
    if (!member.financiallyDependent) {
      memberErrors.financiallyDependent = 'Please indicate dependency status';
    }
    if (Object.keys(memberErrors).length > 0) {
      errors.familyMembers[member.id] = memberErrors;
    }
  });

  const hasErrors =
    Object.keys(errors.personal).length > 0 ||
    Object.keys(errors.familyMembers).length > 0;

  return { isValid: !hasErrors, errors };
}

export function validateIncomeForm(formState) {
  const errors = {};
  const total = calcTotalAnnualIncome(formState.income);
  if (total <= 0) {
    errors._form = 'Enter at least one income source with a positive amount';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateExpensesForm(formState) {
  const errors = {};
  const { expenses } = formState;
  if (!expenses.monthlyHousehold?.trim()) {
    errors.monthlyHousehold = 'Monthly household expenses are required';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateAssetsForm() {
  return { isValid: true, errors: {} };
}

export function validateLiabilitiesForm() {
  return { isValid: true, errors: {} };
}

export function validateGoalsForm(formState) {
  const errors = {};
  formState.goals.forEach((goal) => {
    const goalErrors = {};
    if (!goal.name?.trim()) goalErrors.name = 'Goal name is required';
    if (!goal.currentCost?.trim()) goalErrors.currentCost = 'Current cost is required';
    if (!goal.targetYear?.trim()) goalErrors.targetYear = 'Target year is required';
    if (Object.keys(goalErrors).length > 0) errors[goal.id] = goalErrors;
  });
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateInvestmentsForm(formState) {
  const errors = { mutualFunds: {}, stocks: {} };
  formState.investments.mutualFunds.forEach((mf) => {
    const mfErrors = {};
    if (!mf.schemeName?.trim()) mfErrors.schemeName = 'Scheme name is required';
    if (!mf.investedAmount?.trim()) mfErrors.investedAmount = 'Invested amount is required';
    if (Object.keys(mfErrors).length > 0) errors.mutualFunds[mf.id] = mfErrors;
  });
  formState.investments.stocks.forEach((stock) => {
    const stErrors = {};
    if (!stock.name?.trim()) stErrors.name = 'Stock name is required';
    if (!stock.quantity?.trim()) stErrors.quantity = 'Quantity is required';
    if (Object.keys(stErrors).length > 0) errors.stocks[stock.id] = stErrors;
  });
  const hasErrors =
    Object.keys(errors.mutualFunds).length > 0 || Object.keys(errors.stocks).length > 0;
  return { isValid: !hasErrors, errors };
}

export function validateInsuranceForm() {
  return { isValid: true, errors: {} };
}

export function validateEmergencyFundForm() {
  return { isValid: true, errors: {} };
}

export function validateAssumptionsForm(formState) {
  const errors = {};
  const { assumptions } = formState;
  ['inflation', 'equity', 'debt', 'gold', 'lifeExpectancy', 'emergencyFundMonths'].forEach(
    (field) => {
      if (!assumptions[field]?.trim()) errors[field] = 'Required';
    },
  );
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateFullForm(formState) {
  const steps = [
    validatePersonalFamilyForm(formState),
    validateIncomeForm(formState),
    validateExpensesForm(formState),
    validateAssetsForm(formState),
    validateLiabilitiesForm(formState),
    validateGoalsForm(formState),
    validateInvestmentsForm(formState),
    validateInsuranceForm(formState),
    validateEmergencyFundForm(formState),
    validateAssumptionsForm(formState),
  ];
  return { isValid: steps.every((s) => s.isValid) };
}

function mapIncomeItem(item) {
  const overrideAnnual = item.annual?.trim();
  return {
    amount: parseAmount(item.amount),
    period: item.period,
    annual:
      overrideAnnual !== undefined && overrideAnnual !== null && overrideAnnual !== ''
        ? parseAmount(item.annual)
        : item.period === 'monthly'
        ? parseAmount(item.amount) * 12
        : parseAmount(item.amount),
  };
}

export function buildClientPayload(formState) {
  const { personal, familyMembers } = formState;
  const totalIncome = calcTotalAnnualIncome(formState.income);
  const annualExpenses = calcAnnualExpenses(formState.expenses);
  const totalAssets = calcTotalAssets(formState.assets);
  const totalLiabilities = calcTotalLiabilities(formState.liabilities);

  return {
    personal: {
      full_name: personal.fullName.trim(),
      date_of_birth: personal.dobOrAgeMode === 'dob' ? personal.dateOfBirth : null,
      age: Number(personal.age),
      gender: personal.gender || null,
      marital_status: personal.maritalStatus,
      retirement_age: Number(personal.retirementAge),
      occupation: personal.occupation.trim(),
    },
    family_members: familyMembers.map(({ name, relationship, age, financiallyDependent }) => ({
      name: name?.trim() || null,
      relationship,
      age: Number(age),
      financially_dependent: financiallyDependent === 'yes',
    })),
    income: {
      salary: mapIncomeItem(formState.income.salary),
      business: mapIncomeItem(formState.income.business),
      rental: mapIncomeItem(formState.income.rental),
      interest: mapIncomeItem(formState.income.interest),
      other: mapIncomeItem(formState.income.other),
      extra: formState.income.extra.map(mapIncomeItem),
      total_annual: totalIncome,
    },
    expenses: {
      monthly_household: parseAmount(formState.expenses.monthlyHousehold),
      annual_lifestyle: parseAmount(formState.expenses.annualLifestyle),
      existing_emis: parseAmount(formState.expenses.existingEmis),
      other_expenses: parseAmount(formState.expenses.otherExpenses),
      extra: formState.expenses.extra.map((item) => ({
        name: item.name,
        annual: parseAmount(item.annual),
      })),
      total_annual: annualExpenses,
      annual_savings: totalIncome - annualExpenses,
      investment_surplus: totalIncome - annualExpenses,
    },
    assets: {
      ...Object.fromEntries(
        Object.entries(formState.assets).map(([k, v]) => [k, parseAmount(v)]),
      ),
      total: totalAssets,
    },
    liabilities: {
      ...Object.fromEntries(
        Object.entries(formState.liabilities).map(([k, v]) => [k, parseAmount(v)]),
      ),
      total: totalLiabilities,
      net_worth: totalAssets - totalLiabilities,
    },
    goals: formState.goals.map((goal) => {
      const metrics = calcGoalMetrics(goal, formState.assumptions);
      return {
        name: goal.name,
        template_key: goal.templateKey || null,
        current_cost: parseAmount(goal.currentCost),
        target_year: Number(goal.targetYear),
        inflation_rate: parseAmount(goal.inflationRate),
        existing_investment: parseAmount(goal.existingInvestment),
        future_cost: metrics.futureCost,
        target_corpus: metrics.targetCorpus,
        funding_pct: metrics.fundingPct,
        corpus_gap: metrics.corpusGap,
        status: metrics.status,
      };
    }),
    investments: {
      mutual_funds: formState.investments.mutualFunds.map((mf) => ({
        scheme_name: mf.schemeName,
        invested_amount: parseAmount(mf.investedAmount),
        current_value: parseAmount(mf.currentValue),
        investment_date: mf.investmentDate || null,
        profit_loss: parseAmount(mf.currentValue) - parseAmount(mf.investedAmount),
      })),
      stocks: formState.investments.stocks.map((s) => ({
        name: s.name,
        quantity: parseAmount(s.quantity),
        avg_buy_price: parseAmount(s.avgBuyPrice),
        current_market_price: parseAmount(s.currentMarketPrice),
        current_value: parseAmount(s.quantity) * parseAmount(s.currentMarketPrice),
        profit_loss:
          parseAmount(s.quantity) * parseAmount(s.currentMarketPrice) -
          parseAmount(s.quantity) * parseAmount(s.avgBuyPrice),
      })),
    },
    insurance: Object.fromEntries(
      Object.entries(formState.insurance).map(([k, v]) => [k, parseAmount(v)]),
    ),
    emergency_fund: Object.fromEntries(
      Object.entries(formState.emergencyFund).map(([k, v]) => [k, parseAmount(v)]),
    ),
    assumptions: Object.fromEntries(
      Object.entries(formState.assumptions).map(([k, v]) => [
        k,
        k === 'emergencyFundMonths' ? Number(v) : parseAmount(v),
      ]),
    ),
  };
}

export const STEP_VALIDATORS = {
  '/client': validatePersonalFamilyForm,
  '/income': validateIncomeForm,
  '/expenses': validateExpensesForm,
  '/assets': validateAssetsForm,
  '/liabilities': validateLiabilitiesForm,
  '/goals': validateGoalsForm,
  '/investments': validateInvestmentsForm,
  '/insurance': validateInsuranceForm,
  '/emergency-fund': validateEmergencyFundForm,
  '/assumptions': validateAssumptionsForm,
};
