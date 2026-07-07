import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CurrencyField from '../components/CurrencyField';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import { getStepIndex } from '../utils/wizardRoutes';

export default function InsurancePage() {
  const {
    formState,
    updateInsurancePolicy,
    addInsurancePolicy,
    removeInsurancePolicy,
  } = useClientForm();
  const { insurance } = formState;
  const { errors, snackbar, handleNext, closeSnackbar } = useWizardStep('/insurance');

  return (
    <WizardLayout
      activeStep={getStepIndex('/insurance')}
      title="Insurance Details"
      subtitle="Enter details for existing and recommended insurance policies."
    >
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Insurance Policies</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => addInsurancePolicy()}
          >
            Add Insurance
          </Button>
        </Stack>

        {insurance.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No insurance policies added. Click "Add Insurance" to get started.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {insurance.map((pol, index) => {
              const polErrors = errors[pol.id] || {};
              return (
                <InsuranceCard
                  key={pol.id}
                  title={pol.policyType || `Policy ${index + 1}`}
                  onRemove={() => removeInsurancePolicy(pol.id)}
                >
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Insurance Type / Name"
                        value={pol.policyType}
                        onChange={(e) => updateInsurancePolicy(pol.id, 'policyType', e.target.value)}
                        error={Boolean(polErrors.policyType)}
                        helperText={polErrors.policyType}
                        placeholder="e.g. Term Insurance, Health Insurance"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyField
                        label="Existing Cover"
                        value={pol.existingCover}
                        onChange={(e) => updateInsurancePolicy(pol.id, 'existingCover', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CurrencyField
                        label="Recommended Cover"
                        value={pol.recommendedCover}
                        onChange={(e) => updateInsurancePolicy(pol.id, 'recommendedCover', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CurrencyField
                        label="Premium Amount"
                        value={pol.premium}
                        onChange={(e) => updateInsurancePolicy(pol.id, 'premium', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Premium Tenure"
                        value={pol.premiumTenure}
                        onChange={(e) => updateInsurancePolicy(pol.id, 'premiumTenure', e.target.value)}
                        placeholder="e.g. 20 Years, Till Age 60"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Comment / Recommendation"
                        value={pol.comment}
                        onChange={(e) => updateInsurancePolicy(pol.id, 'comment', e.target.value)}
                        placeholder="Add comments or recommendations here..."
                      />
                    </Grid>
                  </Grid>
                </InsuranceCard>
              );
            })}
          </Stack>
        )}

        <WizardNav currentPath="/insurance" onNext={() => handleNext(formState)} />
      </Stack>

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

function InsuranceCard({ title, onRemove, children }) {
  return (
    <Box
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'grey.50',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <IconButton size="small" color="error" onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      </Stack>
      {children}
    </Box>
  );
}
