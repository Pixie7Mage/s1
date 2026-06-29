import {
  Alert,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CurrencyField from '../components/CurrencyField';
import SummaryCard, { SummaryGrid } from '../components/SummaryCard';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import { calcTotalAnnualIncome, toAnnual } from '../utils/calculations';
import { formatINR } from '../utils/currency';
import { getStepIndex } from '../utils/wizardRoutes';

const INCOME_FIELDS = [
  { key: 'salary', label: 'Salary' },
  { key: 'business', label: 'Business Income' },
  { key: 'rental', label: 'Rental Income' },
  { key: 'interest', label: 'Interest Income' },
  { key: 'other', label: 'Other Income' },
];

export default function IncomePage() {
  const { formState, updateIncome, addIncomeItem, removeIncomeItem, updateIncomeItem } = useClientForm();
  const { income } = formState;
  const { snackbar, handleNext, closeSnackbar } = useWizardStep('/income');

  const totalAnnual = calcTotalAnnualIncome(income);

  return (
    <WizardLayout
      activeStep={getStepIndex('/income')}
      title="Income"
      subtitle="Enter all income sources. Choose annual or monthly — monthly amounts are converted automatically."
    >
      <SummaryGrid>
        <SummaryCard label="Total Annual Income" value={totalAnnual} color="secondary.main" />
      </SummaryGrid>

      <Stack spacing={3}>
        {INCOME_FIELDS.map(({ key, label }) => (
          <Grid container spacing={2} key={key} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <CurrencyField
                label={label}
                value={income[key].amount}
                onChange={(e) => {
                  updateIncome(key, 'amount', e.target.value);
                  if (income[key].annual) {
                    updateIncome(key, 'annual', '');
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel id={`${key}-period`}>Period</InputLabel>
                <Select
                  labelId={`${key}-period`}
                  label="Period"
                  value={income[key].period}
                  onChange={(e) => {
                    updateIncome(key, 'period', e.target.value);
                    if (income[key].annual) {
                      updateIncome(key, 'annual', '');
                    }
                  }}
                >
                  <MenuItem value="annual">Annual</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CurrencyField
                label="Annual Amount"
                value={income[key].annual || toAnnual(income[key].amount, income[key].period)}
                onChange={(e) => updateIncome(key, 'annual', e.target.value)}
                helperText={income[key].annual ? 'Manual annual override' : 'Derived from amount and period'}
              />
            </Grid>
          </Grid>
        ))}

        {income.extra.map((item) => (
          <Grid container spacing={2} key={item.id} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Income Source"
                value={item.name}
                onChange={(e) => updateIncomeItem(item.id, 'name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth>
                <InputLabel id={`${item.id}-period`}>Period</InputLabel>
                <Select
                  labelId={`${item.id}-period`}
                  label="Period"
                  value={item.period}
                  onChange={(e) => {
                    updateIncomeItem(item.id, 'period', e.target.value);
                    if (item.annual) {
                      updateIncomeItem(item.id, 'annual', '');
                    }
                  }}
                >
                  <MenuItem value="annual">Annual</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <CurrencyField
                label="Amount"
                value={item.amount}
                onChange={(e) => {
                  updateIncomeItem(item.id, 'amount', e.target.value);
                  if (item.annual) {
                    updateIncomeItem(item.id, 'annual', '');
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <CurrencyField
                label="Annual Amount"
                value={item.annual || toAnnual(item.amount, item.period)}
                onChange={(e) => updateIncomeItem(item.id, 'annual', e.target.value)}
                helperText={item.annual ? 'Manual annual override' : 'Derived from amount and period'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => removeIncomeItem(item.id)}
              >
                Remove
              </Button>
            </Grid>
          </Grid>
        ))}

        <Button startIcon={<AddIcon />} variant="outlined" onClick={addIncomeItem}>
          Add Income Source
        </Button>
      </Stack>

      <WizardNav currentPath="/income" onNext={() => handleNext(formState)} />

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
