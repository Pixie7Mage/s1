import {
  Alert,
  Grid,
  Snackbar,
  Stack,
} from '@mui/material';
import CurrencyField from '../components/CurrencyField';
import SummaryCard, { SummaryGrid } from '../components/SummaryCard';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import {
  calcAnnualExpenses,
  calcEmergencyFundAvailable,
  calcEmergencyFundRequired,
} from '../utils/calculations';
import { getStepIndex } from '../utils/wizardRoutes';

const FUND_FIELDS = [
  { key: 'cash', label: 'Cash' },
  { key: 'savingsAccount', label: 'Savings Account' },
  { key: 'liquidMutualFunds', label: 'Liquid Mutual Funds' },
  { key: 'fixedDeposits', label: 'Fixed Deposits' },
];

export default function EmergencyFundPage() {
  const { formState, updateEmergencyFund } = useClientForm();
  const { emergencyFund, expenses, assumptions } = formState;
  const { snackbar, handleNext, closeSnackbar } = useWizardStep('/emergency-fund');

  const available = calcEmergencyFundAvailable(emergencyFund);
  const annualExpenses = calcAnnualExpenses(expenses);
  const required = calcEmergencyFundRequired(annualExpenses, assumptions.emergencyFundMonths);
  const gap = Math.max(0, required - available);

  return (
    <WizardLayout
      activeStep={getStepIndex('/emergency-fund')}
      title="Emergency Fund"
      subtitle={`Required fund is based on ${assumptions.emergencyFundMonths} months of expenses (from Assumptions step).`}
    >
      <SummaryGrid>
        <SummaryCard label="Available" value={available} />
        <SummaryCard label="Required" value={required} color="secondary.main" />
        <SummaryCard
          label="Gap"
          value={gap}
          color={gap > 0 ? 'error.main' : 'success.main'}
        />
      </SummaryGrid>

      <Stack spacing={2.5}>
        <Grid container spacing={2.5}>
          {FUND_FIELDS.map(({ key, label }) => (
            <Grid size={{ xs: 12, sm: 6 }} key={key}>
              <CurrencyField
                label={label}
                value={emergencyFund[key]}
                onChange={(e) => updateEmergencyFund(key, e.target.value)}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>

      <WizardNav currentPath="/emergency-fund" onNext={() => handleNext(formState)} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </WizardLayout>
  );
}
