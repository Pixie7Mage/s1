import { Alert, Button, Grid, IconButton, Snackbar, Stack, Typography, Divider, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CurrencyField from '../components/CurrencyField';
import SummaryCard, { SummaryGrid } from '../components/SummaryCard';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import { getStepIndex } from '../utils/wizardRoutes';

const LIABILITY_FIELDS = [
  { key: 'homeLoan', label: 'Home Loan' },
  { key: 'carLoan', label: 'Car Loan' },
  { key: 'personalLoan', label: 'Personal Loan' },
  { key: 'goldLoan', label: 'Gold Loan' },
  { key: 'creditCard', label: 'Credit Card Outstanding' },
  { key: 'bankOverdraft', label: 'Bank Overdraft' },
];

const PREDEFINED_ASSETS_KEYS = [
  'mutualFunds', 'stocks', 'epf', 'nps', 'gold', 'realEstate', 'esops', 'fd', 'cash', 'savingsAccount',
  'postalSavings', 'eps', 'amountReceivable', 'commodity', 'car', 'bike', 'jewellery', 'otherFixed'
];

export default function LiabilitiesPage() {
  const { formState, updateLiabilities } = useClientForm();
  const { assets, liabilities } = formState;
  const { snackbar, handleNext, closeSnackbar } = useWizardStep('/liabilities');

  // Sum predefined assets
  const totalPredefinedAssets = PREDEFINED_ASSETS_KEYS.reduce(
    (sum, k) => sum + (parseFloat(assets[k]) || 0),
    0
  );
  // Sum custom assets
  const totalExtraAssets = 
    ((assets.extraFinancial || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)) +
    ((assets.extraFixed || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0));
  
  const totalAssets = totalPredefinedAssets + totalExtraAssets;

  // Sum predefined liabilities
  const totalPredefinedLiabilities = LIABILITY_FIELDS.reduce(
    (sum, f) => sum + (parseFloat(liabilities[f.key]) || 0),
    0
  );
  // Sum custom liabilities
  const totalExtraLiabilities = (liabilities.extra || []).reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const totalLiabilities = totalPredefinedLiabilities + totalExtraLiabilities;
  const netWorth = totalAssets - totalLiabilities;

  const handleAddExtra = () => {
    const list = [...(liabilities.extra || [])];
    list.push({ id: Date.now(), name: '', amount: '' });
    updateLiabilities('extra', list);
  };

  const handleUpdateExtra = (id, field, val) => {
    const list = (liabilities.extra || []).map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    updateLiabilities('extra', list);
  };

  const handleRemoveExtra = (id) => {
    const list = (liabilities.extra || []).filter((item) => item.id !== id);
    updateLiabilities('extra', list);
  };

  return (
    <WizardLayout
      activeStep={getStepIndex('/liabilities')}
      title="Liabilities"
      subtitle="Enter outstanding loan and credit balances, and add any custom liabilities."
    >
      <SummaryGrid>
        <SummaryCard label="Total Liabilities" value={totalLiabilities} color="warning.main" />
        <SummaryCard label="Total Assets" value={totalAssets} color="primary.main" />
        <SummaryCard
          label="Net Worth"
          value={netWorth}
          color={netWorth >= 0 ? 'success.main' : 'error.main'}
        />
      </SummaryGrid>

      <Stack spacing={4}>
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

        {/* Custom Liabilities List */}
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="flex-start" sx={{ mt: 1 }}>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddExtra}>
              Add Custom Liability
            </Button>
          </Stack>
          {(liabilities.extra || []).map((item) => (
            <Grid container spacing={2} key={item.id} alignItems="center">
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Liability Name"
                  value={item.name}
                  onChange={(e) => handleUpdateExtra(item.id, 'name', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 5 }}>
                <CurrencyField
                  size="small"
                  label="Amount"
                  value={item.amount}
                  onChange={(e) => handleUpdateExtra(item.id, 'amount', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 1 }}>
                <IconButton color="error" onClick={() => handleRemoveExtra(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Stack>
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
