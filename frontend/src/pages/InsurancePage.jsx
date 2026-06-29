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
} from '@mui/material';
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

  const totalIncome = calcTotalAnnualIncome(formState.income);
  const totalLiabilities = calcTotalLiabilities(formState.liabilities);
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

  return (
    <WizardLayout
      activeStep={getStepIndex('/insurance')}
      title="Insurance"
      subtitle="Enter existing insurance coverage. Recommendations are based on income and liabilities."
    >
      <Stack spacing={3}>
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
