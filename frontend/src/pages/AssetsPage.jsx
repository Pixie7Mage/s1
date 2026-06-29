import { Alert, Grid, Snackbar, Stack } from '@mui/material';
import CurrencyField from '../components/CurrencyField';
import SummaryCard, { SummaryGrid } from '../components/SummaryCard';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import { calcTotalAssets } from '../utils/calculations';
import { getStepIndex } from '../utils/wizardRoutes';

const ASSET_FIELDS = [
  { key: 'mutualFunds', label: 'Mutual Funds' },
  { key: 'stocks', label: 'Stocks' },
  { key: 'epf', label: 'EPF' },
  { key: 'nps', label: 'NPS' },
  { key: 'gold', label: 'Gold' },
  { key: 'realEstate', label: 'Real Estate' },
  { key: 'esops', label: 'ESOPs' },
  { key: 'fd', label: 'Fixed Deposits' },
  { key: 'cash', label: 'Cash' },
  { key: 'savingsAccount', label: 'Savings Account' },
];

export default function AssetsPage() {
  const { formState, updateAssets } = useClientForm();
  const { assets } = formState;
  const { snackbar, handleNext, closeSnackbar } = useWizardStep('/assets');

  const totalAssets = calcTotalAssets(assets);

  return (
    <WizardLayout
      activeStep={getStepIndex('/assets')}
      title="Assets"
      subtitle="Enter the current value of all your assets."
    >
      <SummaryGrid>
        <SummaryCard label="Total Assets" value={totalAssets} color="secondary.main" />
      </SummaryGrid>

      <Stack spacing={2.5}>
        <Grid container spacing={2.5}>
          {ASSET_FIELDS.map(({ key, label }) => (
            <Grid size={{ xs: 12, sm: 6 }} key={key}>
              <CurrencyField
                label={label}
                value={assets[key]}
                onChange={(e) => updateAssets(key, e.target.value)}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>

      <WizardNav currentPath="/assets" onNext={() => handleNext(formState)} />

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
