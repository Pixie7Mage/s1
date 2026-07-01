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

const FINANCIAL_FIELDS = [
  { key: 'cash', label: 'Cash' },
  { key: 'savingsAccount', label: 'Savings Account' },
  { key: 'fd', label: 'Fixed Deposits (FD)' },
  { key: 'stocks', label: 'Stocks' },
  { key: 'mutualFunds', label: 'Mutual Funds' },
  { key: 'esops', label: 'ESOPs' },
  { key: 'nps', label: 'NPS (tier I & II)' },
  { key: 'postalSavings', label: 'Postal Savings' },
  { key: 'epf', label: 'EPF' },
  { key: 'eps', label: 'EPS' },
  { key: 'amountReceivable', label: 'Amount Receivable' },
  { key: 'commodity', label: 'Commodity (Gold/silver in biscuits, etc.)' },
];

const FIXED_FIELDS = [
  { key: 'realEstate', label: 'Real Estate' },
  { key: 'car', label: 'Car' },
  { key: 'bike', label: 'Bike' },
  { key: 'jewellery', label: 'Jewellery (Gold/Silver)' },
  { key: 'otherFixed', label: 'Others' },
];

export default function AssetsPage() {
  const { formState, updateAssets } = useClientForm();
  const { assets } = formState;
  const { snackbar, handleNext, closeSnackbar } = useWizardStep('/assets');

  // Calculates the sum of a list of predefined keys
  const sumFields = (fields) => {
    return fields.reduce((sum, f) => sum + (parseFloat(assets[f.key]) || 0), 0);
  };

  // Calculates the sum of extra fields
  const sumExtra = (extra) => {
    return (extra || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const totalFinancial = sumFields(FINANCIAL_FIELDS) + sumExtra(assets.extraFinancial);
  const totalFixed = sumFields(FIXED_FIELDS) + sumExtra(assets.extraFixed);
  const totalAssets = totalFinancial + totalFixed;

  const handleAddExtraFinancial = () => {
    const list = [...(assets.extraFinancial || [])];
    list.push({ id: Date.now(), name: '', amount: '' });
    updateAssets('extraFinancial', list);
  };

  const handleUpdateExtraFinancial = (id, field, val) => {
    const list = (assets.extraFinancial || []).map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    updateAssets('extraFinancial', list);
  };

  const handleRemoveExtraFinancial = (id) => {
    const list = (assets.extraFinancial || []).filter((item) => item.id !== id);
    updateAssets('extraFinancial', list);
  };

  const handleAddExtraFixed = () => {
    const list = [...(assets.extraFixed || [])];
    list.push({ id: Date.now(), name: '', amount: '' });
    updateAssets('extraFixed', list);
  };

  const handleUpdateExtraFixed = (id, field, val) => {
    const list = (assets.extraFixed || []).map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    updateAssets('extraFixed', list);
  };

  const handleRemoveExtraFixed = (id) => {
    const list = (assets.extraFixed || []).filter((item) => item.id !== id);
    updateAssets('extraFixed', list);
  };

  return (
    <WizardLayout
      activeStep={getStepIndex('/assets')}
      title="Assets"
      subtitle="Enter the current value of all your assets, categorized into Financial and Fixed assets."
    >
      <SummaryGrid>
        <SummaryCard label="Financial Assets" value={totalFinancial} color="primary.main" />
        <SummaryCard label="Fixed Assets" value={totalFixed} color="warning.main" />
        <SummaryCard label="Total Assets" value={totalAssets} color="success.main" />
      </SummaryGrid>

      <Stack spacing={4}>
        {/* FINANCIAL ASSETS SECTION */}
        <Stack spacing={2.5}>
          <Typography variant="h5" fontWeight="bold">Financial Assets</Typography>
          <Grid container spacing={2.5}>
            {FINANCIAL_FIELDS.map(({ key, label }) => (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <CurrencyField
                  label={label}
                  value={assets[key]}
                  onChange={(e) => updateAssets(key, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* Custom Financial Assets */}
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="flex-start" sx={{ mt: 1 }}>
              <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddExtraFinancial}>
                Add Custom Asset
              </Button>
            </Stack>
            {(assets.extraFinancial || []).map((item) => (
              <Grid container spacing={2} key={item.id} alignItems="center">
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Asset Name"
                    value={item.name}
                    onChange={(e) => handleUpdateExtraFinancial(item.id, 'name', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 5 }}>
                  <CurrencyField
                    size="small"
                    label="Amount"
                    value={item.amount}
                    onChange={(e) => handleUpdateExtraFinancial(item.id, 'amount', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 1 }}>
                  <IconButton color="error" onClick={() => handleRemoveExtraFinancial(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Stack>
        </Stack>

        {/* FIXED ASSETS SECTION */}
        <Stack spacing={2.5}>
          <Divider />
          <Typography variant="h5" fontWeight="bold">Fixed Assets</Typography>
          <Grid container spacing={2.5}>
            {FIXED_FIELDS.map(({ key, label }) => (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <CurrencyField
                  label={label}
                  value={assets[key]}
                  onChange={(e) => updateAssets(key, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Custom Fixed Assets */}
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="flex-start" sx={{ mt: 1 }}>
              <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddExtraFixed}>
                Add Custom Asset
              </Button>
            </Stack>
            {(assets.extraFixed || []).map((item) => (
              <Grid container spacing={2} key={item.id} alignItems="center">
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Asset Name"
                    value={item.name}
                    onChange={(e) => handleUpdateExtraFixed(item.id, 'name', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 5 }}>
                  <CurrencyField
                    size="small"
                    label="Amount"
                    value={item.amount}
                    onChange={(e) => handleUpdateExtraFixed(item.id, 'amount', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 1 }}>
                  <IconButton color="error" onClick={() => handleRemoveExtraFixed(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Stack>
        </Stack>
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
