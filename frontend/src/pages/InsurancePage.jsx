import {
  Alert,
  Grid,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Divider,
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CurrencyField from '../components/CurrencyField';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import {
  calcRecommendedHealthCover,
  calcRecommendedTermCover,
  calcTotalAnnualIncome,
  calcTotalLiabilities,
} from '../utils/calculations';
import { formatINR } from '../utils/currency';
import { getStepIndex } from '../utils/wizardRoutes';

export default function InsurancePage() {
  const { formState, updateInsurance } = useClientForm();
  const { insurance, familyMembers } = formState;
  const { snackbar, handleNext, closeSnackbar } = useWizardStep('/insurance');

  // Sum predefined liabilities (factor in custom liabilities also if present in formState.liabilities.extra)
  const totalPredefinedLiabilities = Object.keys(formState.liabilities)
    .filter(k => k !== 'extra')
    .reduce((sum, k) => sum + (parseFloat(formState.liabilities[k]) || 0), 0);
  const totalExtraLiabilities = (formState.liabilities.extra || []).reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const totalLiabilities = totalPredefinedLiabilities + totalExtraLiabilities;

  const totalIncome = calcTotalAnnualIncome(formState.income);
  const recommendedTerm = calcRecommendedTermCover(totalIncome, totalLiabilities);
  const recommendedHealth = calcRecommendedHealthCover(1 + familyMembers.length);

  const comparisons = [
    {
      type: 'Term Insurance',
      existing: insurance.termCover,
      recommended: recommendedTerm,
      field: 'termCover',
    },
    {
      type: 'Health Insurance',
      existing: insurance.healthCover,
      recommended: recommendedHealth,
      field: 'healthCover',
    },
  ];

  const handleAddExtra = () => {
    const list = [...(insurance.extra || [])];
    list.push({ id: Date.now(), name: '', amount: '' });
    updateInsurance('extra', list);
  };

  const handleUpdateExtra = (id, field, val) => {
    const list = (insurance.extra || []).map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    updateInsurance('extra', list);
  };

  const handleRemoveExtra = (id) => {
    const list = (insurance.extra || []).filter((item) => item.id !== id);
    updateInsurance('extra', list);
  };

  return (
    <WizardLayout
      activeStep={getStepIndex('/insurance')}
      title="Insurance"
      subtitle="Enter existing insurance coverage. Recommendations are based on income and liabilities."
    >
      <Stack spacing={4}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell align="right">Existing Cover</TableCell>
              <TableCell align="right">Recommended Cover</TableCell>
              <TableCell align="right">Gap</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisons.map(({ type, existing, recommended, field }) => {
              const existingNum = Number(existing) || 0;
              const gap = Math.max(0, recommended - existingNum);
              return (
                <TableRow key={type}>
                  <TableCell>{type}</TableCell>
                  <TableCell align="right">
                    <CurrencyField
                      label=""
                      value={existing}
                      onChange={(e) => updateInsurance(field, e.target.value)}
                      sx={{ maxWidth: 180 }}
                    />
                  </TableCell>
                  <TableCell align="right">{formatINR(recommended)}</TableCell>
                  <TableCell align="right" sx={{ color: gap > 0 ? 'error.main' : 'success.main' }}>
                    {formatINR(gap)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Stack spacing={2.5}>
          <Typography variant="h6">Other Insurance</Typography>
          <Grid container spacing={2.5}>
            {[
              { key: 'lic', label: 'LIC' },
              { key: 'ulip', label: 'ULIP' },
              { key: 'endowment', label: 'Endowment' },
              { key: 'others', label: 'Others' },
            ].map(({ key, label }) => (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <CurrencyField
                  label={label}
                  value={insurance[key]}
                  onChange={(e) => updateInsurance(key, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>

        {/* Custom Insurance Policies */}
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="flex-start" sx={{ mt: 1 }}>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddExtra}>
              Add Custom Policy
            </Button>
          </Stack>
          {(insurance.extra || []).map((item) => (
            <Grid container spacing={2} key={item.id} alignItems="center">
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Policy / Insurer Name"
                  value={item.name}
                  onChange={(e) => handleUpdateExtra(item.id, 'name', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 5 }}>
                <CurrencyField
                  size="small"
                  label="Coverage Amount"
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

        <Alert severity="info">
          Term cover recommendation: max(10× annual income, liabilities + 5× annual income).
          Health cover: ₹5L base + ₹3L per additional family member.
        </Alert>
      </Stack>

      <WizardNav currentPath="/insurance" onNext={() => handleNext(formState)} />

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
