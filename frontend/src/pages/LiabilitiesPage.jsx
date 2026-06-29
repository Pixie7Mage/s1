import { Alert, Grid, Snackbar, Stack } from '@mui/material';
import CurrencyField from '../components/CurrencyField';
import SummaryCard, { SummaryGrid } from '../components/SummaryCard';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import {
  calcNetWorth,
  calcTotalAssets,
  calcTotalLiabilities,
} from '../utils/calculations';
import { getStepIndex } from '../utils/wizardRoutes';

const LIABILITY_FIELDS = [
  { key: 'homeLoan', label: 'Home Loan' },
  { key: 'carLoan', label: 'Car Loan' },
  { key: 'personalLoan', label: 'Personal Loan' },
  { key: 'goldLoan', label: 'Gold Loan' },
  { key: 'creditCard', label: 'Credit Card Outstanding' },
  { key: 'bankOverdraft', label: 'Bank Overdraft' },
];

export default function LiabilitiesPage() {
  const { formState, updateLiabilities } = useClientForm();
  const { assets, liabilities } = formState;
  const { snackbar, handleNext, closeSnackbar } = useWizardStep('/liabilities');

  const totalLiabilities = calcTotalLiabilities(liabilities);
  const totalAssets = calcTotalAssets(assets);
  const netWorth = calcNetWorth(assets, liabilities);

  return (
    <WizardLayout
      activeStep={getStepIndex('/liabilities')}
      title="Liabilities"
      subtitle="Enter outstanding loan and credit balances."
    >
      <SummaryGrid>
        <SummaryCard label="Total Liabilities" value={totalLiabilities} />
        <SummaryCard label="Total Assets" value={totalAssets} />
        <SummaryCard
          label="Net Worth"
          value={netWorth}
          color={netWorth >= 0 ? 'secondary.main' : 'error.main'}
        />
      </SummaryGrid>

      <Stack spacing={2.5}>
        <Grid container spacing={2.5}>
          {LIABILITY_FIELDS.map(({ key, label }) => (
            <Grid size={{ xs: 12, sm: 6 }} key={key}>
              <CurrencyField
                label={label}
                value={liabilities[key]}
                onChange={(e) => updateLiabilities(key, e.target.value)}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>

      <WizardNav currentPath="/liabilities" onNext={() => handleNext(formState)} />

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
