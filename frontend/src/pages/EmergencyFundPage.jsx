import {
  Alert,
  Grid,
  Snackbar,
  Stack,
  Button,
  IconButton,
  TextField,
  Divider,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CurrencyField from '../components/CurrencyField';
import SummaryCard, { SummaryGrid } from '../components/SummaryCard';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import {
  calcAnnualExpenses,
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

  // Sum predefined emergency fund fields
  const totalPredefined = FUND_FIELDS.reduce(
    (sum, f) => sum + (parseFloat(emergencyFund[f.key]) || 0),
    0
  );
  // Sum custom emergency fund fields
  const totalExtra = (emergencyFund.extra || []).reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const available = totalPredefined + totalExtra;
  const annualExpenses = calcAnnualExpenses(expenses);
  const required = calcEmergencyFundRequired(annualExpenses, assumptions.emergencyFundMonths);
  const gap = Math.max(0, required - available);

  const handleAddExtra = () => {
    const list = [...(emergencyFund.extra || [])];
    list.push({ id: Date.now(), name: '', amount: '' });
    updateEmergencyFund('extra', list);
  };

  const handleUpdateExtra = (id, field, val) => {
    const list = (emergencyFund.extra || []).map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    updateEmergencyFund('extra', list);
  };

  const handleRemoveExtra = (id) => {
    const list = (emergencyFund.extra || []).filter((item) => item.id !== id);
    updateEmergencyFund('extra', list);
  };

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

      <Stack spacing={4}>
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

        {/* Custom Emergency Funds List */}
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="flex-start" sx={{ mt: 1 }}>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddExtra}>
              Add Custom Category
            </Button>
          </Stack>
          {(emergencyFund.extra || []).map((item) => (
            <Grid container spacing={2} key={item.id} alignItems="center">
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Category Name"
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
