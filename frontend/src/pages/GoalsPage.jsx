import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CurrencyField from '../components/CurrencyField';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { GOAL_TEMPLATES, useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import { calcGoalMetrics } from '../utils/calculations';
import { formatINR, formatPercent } from '../utils/currency';
import { getStepIndex } from '../utils/wizardRoutes';

export default function GoalsPage() {
  const { formState, addGoal, removeGoal, updateGoal } = useClientForm();
  const { goals, assumptions } = formState;
  const { errors, snackbar, handleNext, closeSnackbar } = useWizardStep('/goals');

  return (
    <WizardLayout
      activeStep={getStepIndex('/goals')}
      title="Financial Goals"
      subtitle="Add goals from templates or create custom goals. Calculations update automatically."
    >
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
        {GOAL_TEMPLATES.map((template) => (
          <Button
            key={template.key}
            size="small"
            variant="outlined"
            onClick={() => addGoal(template)}
          >
            + {template.name}
          </Button>
        ))}
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => addGoal()}>
          Custom Goal
        </Button>
      </Stack>

      {goals.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No goals added yet. Use a template above or add a custom goal.
        </Alert>
      ) : (
        <Stack spacing={2.5}>
          {goals.map((goal, index) => {
            const metrics = calcGoalMetrics(goal, assumptions);
            const goalErrors = errors[goal.id] || {};
            const statusColor =
              metrics.status === 'On Track'
                ? 'success'
                : metrics.status === 'Needs Attention'
                  ? 'warning'
                  : 'error';

            return (
              <Box
                key={goal.id}
                sx={{
                  p: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">Goal {index + 1}</Typography>
                    <Chip label={metrics.status} size="small" color={statusColor} />
                  </Stack>
                  <IconButton size="small" color="error" onClick={() => removeGoal(goal.id)}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Goal Name"
                      value={goal.name}
                      onChange={(e) => updateGoal(goal.id, 'name', e.target.value)}
                      error={Boolean(goalErrors.name)}
                      helperText={goalErrors.name}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CurrencyField
                      required
                      label="Current Cost"
                      value={goal.currentCost}
                      onChange={(e) => updateGoal(goal.id, 'currentCost', e.target.value)}
                      error={goalErrors.currentCost}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Target Year"
                      value={goal.targetYear}
                      onChange={(e) => updateGoal(goal.id, 'targetYear', e.target.value)}
                      error={Boolean(goalErrors.targetYear)}
                      helperText={goalErrors.targetYear}
                      inputProps={{ min: new Date().getFullYear() }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Expected Inflation %"
                      value={goal.inflationRate}
                      onChange={(e) => updateGoal(goal.id, 'inflationRate', e.target.value)}
                      inputProps={{ min: 0, max: 30, step: 0.1 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CurrencyField
                      label="Existing Investment"
                      value={goal.existingInvestment}
                      onChange={(e) => updateGoal(goal.id, 'existingInvestment', e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Future Cost
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatINR(metrics.futureCost)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Target Corpus
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatINR(metrics.targetCorpus)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Funding
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatPercent(metrics.fundingPct)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Corpus Gap
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      {formatINR(metrics.corpusGap)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </Stack>
      )}

      <WizardNav currentPath="/goals" onNext={() => handleNext(formState)} />

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
