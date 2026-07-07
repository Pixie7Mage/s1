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
            const goalErrors = errors[goal.id] || {};

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
                  <Typography variant="subtitle2">Goal {index + 1}</Typography>
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CurrencyField
                      required
                      label="Target Corpus"
                      value={goal.targetCorpus}
                      onChange={(e) => updateGoal(goal.id, 'targetCorpus', e.target.value)}
                      error={goalErrors.targetCorpus}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Interest %"
                      value={goal.interest}
                      onChange={(e) => updateGoal(goal.id, 'interest', e.target.value)}
                      error={Boolean(goalErrors.interest)}
                      helperText={goalErrors.interest}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
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
