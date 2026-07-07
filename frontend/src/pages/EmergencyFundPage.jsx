import {
  Alert,
  Box,
  Grid,
  Snackbar,
  Stack,
  Button,
  IconButton,
  TextField,
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
  calcEmergencyFundAvailable,
  calcEmergencyFundRequired,
  getDerivedAssets,
} from '../utils/calculations';
import { getStepIndex } from '../utils/wizardRoutes';

export default function EmergencyFundPage() {
  const {
    formState,
    updateEmergencyFundGlobal,
    addEmergencyFundItem,
    removeEmergencyFundItem,
    updateEmergencyFundItem,
  } = useClientForm();
  const { emergencyFund } = formState;
  const { errors, snackbar, handleNext, closeSnackbar } = useWizardStep('/emergency-fund');

  const derivedAssets = getDerivedAssets(formState);
  const available = calcEmergencyFundAvailable(derivedAssets);
  const required = calcEmergencyFundRequired(emergencyFund);
  const gap = Math.max(0, required - available);

  const items = emergencyFund.items || [];

  return (
    <WizardLayout
      activeStep={getStepIndex('/emergency-fund')}
      title="Emergency Fund"
      subtitle="The available emergency fund is automatically calculated from your liquid assets. Manually enter your required fund target and add individual contingencies below."
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

      <Stack spacing={3.5}>
        {/* Required Emergency Fund Input */}
        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 1.5, fontWeight: 'bold' }}>
            Required Fund Configuration
          </Typography>
          <CurrencyField
            fullWidth
            required
            label="Required Emergency Fund"
            value={emergencyFund.requiredFund || ''}
            onChange={(e) => updateEmergencyFundGlobal('requiredFund', e.target.value)}
            error={errors.requiredFund}
          />
        </Box>

        {/* Emergency Fund list */}
        <Stack spacing={2.5}>
          <Typography variant="h6" fontWeight="bold">
            Emergency Fund Allocations
          </Typography>
          {items.length === 0 ? (
            <Alert severity="info" sx={{ mb: 1 }}>
              No emergency fund allocations added yet. Click the button below to add an emergency fund.
            </Alert>
          ) : (
            <Stack spacing={2.5}>
              {items.map((item, index) => {
                const itemErrors = errors[item.id] || {};
                const amt = parseFloat(item.amount) || 0;
                const req = parseFloat(item.required) || 0;
                const itemGap = Math.max(0, req - amt);

                return (
                  <Box
                    key={item.id}
                    sx={{
                      p: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Emergency Fund {index + 1}</Typography>
                      <IconButton size="small" color="error" onClick={() => removeEmergencyFundItem(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="Emergency Fund Name"
                          value={item.name}
                          onChange={(e) => updateEmergencyFundItem(item.id, 'name', e.target.value)}
                          error={Boolean(itemErrors.name)}
                          helperText={itemErrors.name}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="Where to Invest"
                          value={item.whereToInvest}
                          onChange={(e) => updateEmergencyFundItem(item.id, 'whereToInvest', e.target.value)}
                          error={Boolean(itemErrors.whereToInvest)}
                          helperText={itemErrors.whereToInvest}
                          placeholder="e.g. Cash, Savings Account, FD, Liquid Fund"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <CurrencyField
                          required
                          label="Amount (Available)"
                          value={item.amount}
                          onChange={(e) => updateEmergencyFundItem(item.id, 'amount', e.target.value)}
                          error={itemErrors.amount}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <CurrencyField
                          required
                          label="Required Target"
                          value={item.required}
                          onChange={(e) => updateEmergencyFundItem(item.id, 'required', e.target.value)}
                          error={itemErrors.required}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          disabled
                          label="Calculated Gap"
                          value={itemGap ? `₹${itemGap.toLocaleString('en-IN')}` : '₹0'}
                          slotProps={{ input: { readOnly: true } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Stack>
          )}

          <Stack direction="row" justifyContent="flex-start" sx={{ mt: 1 }}>
            <Button startIcon={<AddIcon />} variant="contained" onClick={addEmergencyFundItem}>
              Add Emergency Fund
            </Button>
          </Stack>
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
