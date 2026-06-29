import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const createIncomeItem = () => ({ id: crypto.randomUUID(), name: '', amount: '', period: 'annual', annual: '' });

const createEmptyGoal = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: '',
  templateKey: '',
  currentCost: '',
  targetYear: String(new Date().getFullYear() + 10),
  inflationRate: '6',
  existingInvestment: '',
  ...overrides,
});

const createEmptyMutualFund = () => ({
  id: crypto.randomUUID(),
  schemeName: '',
  investedAmount: '',
  currentValue: '',
  investmentDate: '',
});

const createEmptyStock = () => ({
  id: crypto.randomUUID(),
  name: '',
  quantity: '',
  avgBuyPrice: '',
  currentMarketPrice: '',
});

export const GOAL_TEMPLATES = [
  { key: 'retirement', name: 'Retirement', targetYearOffset: 25 },
  { key: 'child_education', name: 'Child Education', targetYearOffset: 15 },
  { key: 'child_marriage', name: 'Child Marriage', targetYearOffset: 20 },
  { key: 'parents_support', name: 'Parents Support', targetYearOffset: 10 },
  { key: 'house', name: 'House', targetYearOffset: 7 },
  { key: 'car', name: 'Car', targetYearOffset: 3 },
  { key: 'vacation', name: 'Vacation', targetYearOffset: 2 },
  { key: 'business', name: 'Business', targetYearOffset: 5 },
  { key: 'other', name: 'Other', targetYearOffset: 10 },
];

export const initialFormState = {
  personal: {
    fullName: '',
    dobOrAgeMode: 'dob',
    dateOfBirth: '',
    age: '',
    gender: '',
    maritalStatus: '',
    retirementAge: '',
    occupation: '',
  },
  familyMembers: [],
  income: {
    salary: { ...createIncomeItem(), name: 'Salary' },
    business: { ...createIncomeItem(), name: 'Business Income' },
    rental: { ...createIncomeItem(), name: 'Rental Income' },
    interest: { ...createIncomeItem(), name: 'Interest Income' },
    other: { ...createIncomeItem(), name: 'Other Income' },
    extra: [],
  },
  expenses: {
    monthlyHousehold: '',
    annualLifestyle: '',
    existingEmis: '',
    otherExpenses: '',
    extra: [],
  },
  assets: {
    mutualFunds: '',
    stocks: '',
    epf: '',
    nps: '',
    gold: '',
    realEstate: '',
    esops: '',
    fd: '',
    cash: '',
    savingsAccount: '',
  },
  liabilities: {
    homeLoan: '',
    carLoan: '',
    personalLoan: '',
    goldLoan: '',
    creditCard: '',
    bankOverdraft: '',
  },
  goals: [],
  investments: {
    mutualFunds: [],
    stocks: [],
  },
  insurance: {
    termCover: '',
    healthCover: '',
    lic: '',
    ulip: '',
    endowment: '',
    others: '',
  },
  emergencyFund: {
    cash: '',
    savingsAccount: '',
    liquidMutualFunds: '',
    fixedDeposits: '',
  },
  assumptions: {
    inflation: '6',
    equity: '12',
    debt: '7',
    gold: '8',
    lifeExpectancy: '85',
    emergencyFundMonths: '6',
  },
};

const ClientFormContext = createContext(null);

export function calculateAgeFromDob(dateOfBirth) {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return '';

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? String(age) : '';
}

const createEmptyFamilyMember = () => ({
  id: crypto.randomUUID(),
  name: '',
  relationship: '',
  age: '',
  financiallyDependent: '',
});

const createExpenseItem = () => ({
  id: crypto.randomUUID(),
  name: '',
  annual: '',
});

export function ClientFormProvider({ children }) {
  const [formState, setFormState] = useState(initialFormState);

  const updatePersonal = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  }, []);

  const setDobOrAgeMode = useCallback((mode) => {
    setFormState((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        dobOrAgeMode: mode,
        ...(mode === 'dob'
          ? { age: calculateAgeFromDob(prev.personal.dateOfBirth) }
          : { dateOfBirth: '' }),
      },
    }));
  }, []);

  const setDateOfBirth = useCallback((dateOfBirth) => {
    setFormState((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        dateOfBirth,
        age: calculateAgeFromDob(dateOfBirth),
      },
    }));
  }, []);

  const addFamilyMember = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, createEmptyFamilyMember()],
    }));
  }, []);

  const removeFamilyMember = useCallback((id) => {
    setFormState((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((member) => member.id !== id),
    }));
  }, []);

  const updateFamilyMember = useCallback((id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member,
      ),
    }));
  }, []);

  const updateIncome = useCallback((field, subField, value) => {
    setFormState((prev) => ({
      ...prev,
      income: {
        ...prev.income,
        [field]: { ...prev.income[field], [subField]: value },
      },
    }));
  }, []);

  const addIncomeItem = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      income: {
        ...prev.income,
        extra: [...prev.income.extra, createIncomeItem()],
      },
    }));
  }, []);

  const removeIncomeItem = useCallback((id) => {
    setFormState((prev) => ({
      ...prev,
      income: {
        ...prev.income,
        extra: prev.income.extra.filter((item) => item.id !== id),
      },
    }));
  }, []);

  const updateIncomeItem = useCallback((id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      income: {
        ...prev.income,
        extra: prev.income.extra.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      },
    }));
  }, []);

  const updateExpenses = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      expenses: { ...prev.expenses, [field]: value },
    }));
  }, []);

  const addExpenseItem = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        extra: [...prev.expenses.extra, createExpenseItem()],
      },
    }));
  }, []);

  const removeExpenseItem = useCallback((id) => {
    setFormState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        extra: prev.expenses.extra.filter((item) => item.id !== id),
      },
    }));
  }, []);

  const updateExpenseItem = useCallback((id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        extra: prev.expenses.extra.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      },
    }));
  }, []);

  const updateAssets = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      assets: { ...prev.assets, [field]: value },
    }));
  }, []);

  const updateLiabilities = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      liabilities: { ...prev.liabilities, [field]: value },
    }));
  }, []);

  const addGoal = useCallback((template = null) => {
    const year = new Date().getFullYear();
    const overrides = template
      ? {
          name: template.name,
          templateKey: template.key,
          targetYear: String(year + template.targetYearOffset),
        }
      : {};
    setFormState((prev) => ({
      ...prev,
      goals: [...prev.goals, createEmptyGoal(overrides)],
    }));
  }, []);

  const removeGoal = useCallback((id) => {
    setFormState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  }, []);

  const updateGoal = useCallback((id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    }));
  }, []);

  const addMutualFund = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        mutualFunds: [...prev.investments.mutualFunds, createEmptyMutualFund()],
      },
    }));
  }, []);

  const removeMutualFund = useCallback((id) => {
    setFormState((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        mutualFunds: prev.investments.mutualFunds.filter((m) => m.id !== id),
      },
    }));
  }, []);

  const updateMutualFund = useCallback((id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        mutualFunds: prev.investments.mutualFunds.map((m) =>
          m.id === id ? { ...m, [field]: value } : m,
        ),
      },
    }));
  }, []);

  const addStock = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        stocks: [...prev.investments.stocks, createEmptyStock()],
      },
    }));
  }, []);

  const removeStock = useCallback((id) => {
    setFormState((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        stocks: prev.investments.stocks.filter((s) => s.id !== id),
      },
    }));
  }, []);

  const updateStock = useCallback((id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        stocks: prev.investments.stocks.map((s) =>
          s.id === id ? { ...s, [field]: value } : s,
        ),
      },
    }));
  }, []);

  const updateInsurance = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      insurance: { ...prev.insurance, [field]: value },
    }));
  }, []);

  const updateEmergencyFund = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      emergencyFund: { ...prev.emergencyFund, [field]: value },
    }));
  }, []);

  const updateAssumptions = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      assumptions: { ...prev.assumptions, [field]: value },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(initialFormState);
  }, []);

  const value = useMemo(
    () => ({
      formState,
      updatePersonal,
      setDobOrAgeMode,
      setDateOfBirth,
      addFamilyMember,
      removeFamilyMember,
      updateFamilyMember,
      updateIncome,
      addIncomeItem,
      removeIncomeItem,
      updateIncomeItem,
      updateExpenses,
      addExpenseItem,
      removeExpenseItem,
      updateExpenseItem,
      updateAssets,
      updateLiabilities,
      addGoal,
      removeGoal,
      updateGoal,
      addMutualFund,
      removeMutualFund,
      updateMutualFund,
      addStock,
      removeStock,
      updateStock,
      updateInsurance,
      updateEmergencyFund,
      updateAssumptions,
      resetForm,
    }),
    [
      formState,
      updatePersonal,
      setDobOrAgeMode,
      setDateOfBirth,
      addFamilyMember,
      removeFamilyMember,
      updateFamilyMember,
      updateIncome,
      addIncomeItem,
      removeIncomeItem,
      updateIncomeItem,
      updateExpenses,
      addExpenseItem,
      removeExpenseItem,
      updateExpenseItem,
      updateAssets,
      updateLiabilities,
      addGoal,
      removeGoal,
      updateGoal,
      addMutualFund,
      removeMutualFund,
      updateMutualFund,
      addStock,
      removeStock,
      updateStock,
      updateInsurance,
      updateEmergencyFund,
      updateAssumptions,
      resetForm,
    ],
  );

  return (
    <ClientFormContext.Provider value={value}>{children}</ClientFormContext.Provider>
  );
}

export function useClientForm() {
  const context = useContext(ClientFormContext);
  if (!context) {
    throw new Error('useClientForm must be used within ClientFormProvider');
  }
  return context;
}
