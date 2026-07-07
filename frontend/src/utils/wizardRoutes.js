export const WIZARD_STEPS = [
  { path: '/client', label: 'Personal & Family' },
  { path: '/income', label: 'Income' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/investments', label: 'Investments' },
  { path: '/assets', label: 'Assets' },
  { path: '/liabilities', label: 'Liabilities' },
  { path: '/goals', label: 'Goals' },
  { path: '/insurance', label: 'Insurance' },
  { path: '/emergency-fund', label: 'Emergency Fund' },
  { path: '/assumptions', label: 'Assumptions' },
  { path: '/review', label: 'Review' },
];

export function getStepIndex(pathname) {
  const index = WIZARD_STEPS.findIndex((step) => step.path === pathname);
  return index >= 0 ? index : 0;
}

export function getPrevPath(pathname) {
  const index = getStepIndex(pathname);
  return index > 0 ? WIZARD_STEPS[index - 1].path : null;
}

export function getNextPath(pathname) {
  const index = getStepIndex(pathname);
  return index < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[index + 1].path : null;
}
