import {
  Alert,
  Button,
  Grid,
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
import {
  calcAnnualExpenses,
  calcAnnualSavings,
  calcTotalAnnualIncome,
} from '../utils/calculations';
import { getStepIndex } from '../utils/wizardRoutes';

export default function ExpensesPage() {
  const { formState, updateExpenses, addExpenseItem, removeExpenseItem, updateExpenseItem } = useClientForm();
  const { expenses } = formState;
  const { errors, snackbar, handleNext, closeSnackbar } = useWizardStep('/expenses');

  const totalIncome = calcTotalAnnualIncome(formState.income);
  const annualExpenses = calcAnnualExpenses(expenses);
  const annualSavings = calcAnnualSavings(totalIncome, annualExpenses);

  return (
    <WizardLayout
      activeStep={getStepIndex('/expenses')}
      title="Expenses"
      subtitle="Capture your regular outflows to understand savings capacity."
    >
      <SummaryGrid>
        <SummaryCard label="Annual Expenses" value={annualExpenses} />
        <SummaryCard label="Annual Savings" value={annualSavings} color="secondary.main" />
        <SummaryCard
          label="Investment Surplus"
          value={annualSavings}
          subtitle="Income minus expenses"
        />
      </SummaryGrid>

      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Annual income used for savings calculation: based on Step 2 ({totalIncome > 0 ? 'entered' : 'not yet entered'}).
        </Typography>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyField
              required
              label="Monthly Household Expenses"
              value={expenses.monthlyHousehold}
              onChange={(e) => updateExpenses('monthlyHousehold', e.target.value)}
              error={errors.monthlyHousehold}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyField
              label="Annual Lifestyle Expenses"
              value={expenses.annualLifestyle}
              onChange={(e) => updateExpenses('annualLifestyle', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyField
              label="Existing EMIs (Annual)"
              value={expenses.existingEmis}
              onChange={(e) => updateExpenses('existingEmis', e.target.value)}
              helperText="Total annual EMI outflow"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyField
              label="Other Expenses (Annual)"
              value={expenses.otherExpenses}
              onChange={(e) => updateExpenses('otherExpenses', e.target.value)}
            />
          </Grid>
        </Grid>

        {expenses.extra.map((item) => (
          <Grid container spacing={2.5} key={item.id} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Expense Name"
                value={item.name}
                onChange={(e) => updateExpenseItem(item.id, 'name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CurrencyField
                label="Annual Amount"
                value={item.annual}
                onChange={(e) => updateExpenseItem(item.id, 'annual', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => removeExpenseItem(item.id)}
                fullWidth
              >
                Remove
              </Button>
            </Grid>
          </Grid>
        ))}

        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          onClick={addExpenseItem}
          sx={{ width: 'fit-content' }}
        >
          Add Expense Source
        </Button>
      </Stack>

      <WizardNav currentPath="/expenses" onNext={() => handleNext(formState)} />

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
