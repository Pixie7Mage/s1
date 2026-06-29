import {
  Alert,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import { getStepIndex } from '../utils/wizardRoutes';

export default function AssumptionsPage() {
  const { formState, updateAssumptions } = useClientForm();
  const { assumptions } = formState;
  const { errors, snackbar, handleNext, closeSnackbar } = useWizardStep('/assumptions');

  return (
    <WizardLayout
      activeStep={getStepIndex('/assumptions')}
      title="Assumptions"
      subtitle="Set planning assumptions used for goal and emergency fund calculations."
    >
      <Stack spacing={2.5}>
        <Grid container spacing={2.5}>
          {[
            { key: 'inflation', label: 'Inflation Rate (%)', defaultHelper: 'Default: 6%' },
            { key: 'equity', label: 'Expected Equity Return (%)', defaultHelper: 'Default: 12%' },
            { key: 'debt', label: 'Expected Debt Return (%)', defaultHelper: 'Default: 7%' },
            { key: 'gold', label: 'Expected Gold Return (%)', defaultHelper: 'Default: 8%' },
            { key: 'lifeExpectancy', label: 'Life Expectancy (years)', defaultHelper: 'Default: 85' },
          ].map(({ key, label, defaultHelper }) => (
            <Grid size={{ xs: 12, sm: 6 }} key={key}>
              <TextField
                fullWidth
                required
                type="number"
                label={label}
                value={assumptions[key]}
                onChange={(e) => updateAssumptions(key, e.target.value)}
                error={Boolean(errors[key])}
                helperText={errors[key] || defaultHelper}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
          ))}
        </Grid>

        <FormControl component="fieldset" required error={Boolean(errors.emergencyFundMonths)}>
          <FormLabel component="legend">Emergency Fund Coverage</FormLabel>
          <RadioGroup
            row
            value={assumptions.emergencyFundMonths}
            onChange={(e) => updateAssumptions('emergencyFundMonths', e.target.value)}
          >
            <FormControlLabel value="6" control={<Radio />} label="6 months" />
            <FormControlLabel value="12" control={<Radio />} label="12 months" />
          </RadioGroup>
        </FormControl>
      </Stack>

      <WizardNav currentPath="/assumptions" onNext={() => handleNext(formState)} />

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
