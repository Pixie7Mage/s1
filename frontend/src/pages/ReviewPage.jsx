import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import SummaryCard, { SummaryGrid } from '../components/SummaryCard';
import WizardLayout from '../components/WizardLayout';
import { useClientForm } from '../context/ClientFormContext';
import {
  calcAnnualExpenses,
  calcAnnualSavings,
  calcNetWorth,
  calcTotalAnnualIncome,
  calcTotalAssets,
  calcTotalLiabilities,
  getDerivedAssets,
} from '../utils/calculations';
import { formatINR, formatPercent, parseAmount } from '../utils/currency';
import { getStepIndex } from '../utils/wizardRoutes';
import { buildClientPayload, validateFullForm } from '../utils/validation';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function ReviewPage() {
  const { formState } = useClientForm();
  const {
    personal,
    familyMembers,
    income,
    expenses,
    liabilities,
    goals,
    assumptions,
  } = formState;

  const assets = getDerivedAssets(formState);

  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const totalIncome = calcTotalAnnualIncome(income);
  const annualExpenses = calcAnnualExpenses(expenses);
  const annualSavings = calcAnnualSavings(totalIncome, annualExpenses);
  const totalAssets = calcTotalAssets(assets);
  const totalLiabilities = calcTotalLiabilities(liabilities);
  const netWorth = calcNetWorth(assets, liabilities);

  const assetChartData = {
    labels: [
      'Mutual Funds',
      'Stocks',
      'EPF',
      'NPS',
      'Gold',
      'Real Estate',
      'ESOPs',
      'FD',
      'Cash',
      'Savings',
    ],
    datasets: [
      {
        data: [
          parseAmount(assets.mutualFunds),
          parseAmount(assets.stocks),
          parseAmount(assets.epf),
          parseAmount(assets.nps),
          parseAmount(assets.gold),
          parseAmount(assets.realEstate),
          parseAmount(assets.esops),
          parseAmount(assets.fd),
          parseAmount(assets.cash),
          parseAmount(assets.savingsAccount),
        ],
        backgroundColor: [
          '#1e3a5f',
          '#2d5a8a',
          '#0d9488',
          '#14b8a6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#6366f1',
          '#64748b',
          '#94a3b8',
        ],
      },
    ],
  };

  const netWorthChartData = {
    labels: ['Assets', 'Liabilities', 'Net Worth'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [totalAssets, totalLiabilities, netWorth],
        backgroundColor: ['#0d9488', '#ef4444', '#1e3a5f'],
      },
    ],
  };

  const goalChartData = {
    labels: goals.map((g) => g.name || 'Goal'),
    datasets: [
      {
        label: 'Current Cost',
        data: goals.map((g) => parseAmount(g.currentCost)),
        backgroundColor: '#1e3a5f',
      },
      {
        label: 'Target Corpus',
        data: goals.map((g) => parseAmount(g.targetCorpus)),
        backgroundColor: '#0d9488',
      },
    ],
  };

  const handleGenerateReport = async () => {
    const validation = validateFullForm(formState);
    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: 'Please complete all required fields across wizard steps before generating.',
        severity: 'error',
      });
      return;
    }

    setGenerating(true);
    const payload = buildClientPayload(formState);

    try {
      const response = await fetch('/api/generate-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Report generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${personal.fullName.replace(/\s+/g, '_') || 'Financial'}_Report.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Report downloaded successfully.',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to generate report. Ensure the backend is running.',
        severity: 'error',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <WizardLayout
      activeStep={getStepIndex('/review')}
      title="Review & Generate"
      subtitle="Review your financial profile and generate the Word report."
    >
      <SummaryGrid>
        <SummaryCard label="Annual Income" value={totalIncome} />
        <SummaryCard label="Annual Expenses" value={annualExpenses} />
        <SummaryCard label="Annual Savings" value={annualSavings} color="secondary.main" />
        <SummaryCard label="Net Worth" value={netWorth} />
      </SummaryGrid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Asset Allocation
          </Typography>
          <Box sx={{ maxHeight: 260 }}>
            <Doughnut
              data={assetChartData}
              options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: true }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Net Worth Breakdown
          </Typography>
          <Bar
            data={netWorthChartData}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { ticks: { callback: (v) => formatINR(v, { compact: true }) } } },
            }}
          />
        </Grid>
        {goals.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Goals Overview
            </Typography>
            <Bar
              data={goalChartData}
              options={{ plugins: { legend: { position: 'bottom' } } }}
            />
          </Grid>
        )}
      </Grid>

      <Stack spacing={3}>
        <Section title="Personal Summary">
          <SummaryList
            rows={[
              ['Full Name', personal.fullName || '—'],
              ['Age', personal.age ? `${personal.age} years` : '—'],
              ['Marital Status', personal.maritalStatus || '—'],
              ['Retirement Age', personal.retirementAge || '—'],
              ['Occupation', personal.occupation || '—'],
            ]}
          />
        </Section>

        <Divider />

        <Section title={`Family Members (${familyMembers.length})`}>
          {familyMembers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              None recorded.
            </Typography>
          ) : (
            <List dense disablePadding>
              {familyMembers.map((m) => (
                <ListItem key={m.id} disableGutters>
                  <ListItemText
                    primary={`${m.relationship} — Age ${m.age}`}
                    secondary={`Dependent: ${m.financiallyDependent === 'yes' ? 'Yes' : 'No'}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Section>

        <Divider />

        <Section title={`Financial Goals (${goals.length})`}>
          {goals.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No goals added.
            </Typography>
          ) : (
            <List dense disablePadding>
              {goals.map((g) => {
                return (
                  <ListItem key={g.id} disableGutters>
                    <ListItemText
                      primary={g.name}
                      secondary={`Current Cost: ${formatINR(g.currentCost)} · Target Corpus: ${formatINR(g.targetCorpus)} · Interest: ${g.interest}%`}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Section>
      </Stack>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', pt: 3 }}>
        <Button component={RouterLink} to="/assumptions" variant="outlined">
          Back
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleGenerateReport}
          disabled={generating}
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {generating ? 'Generating…' : 'Generate Report'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </WizardLayout>
  );
}

function Section({ title, children }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function SummaryList({ rows }) {
  return (
    <List dense disablePadding>
      {rows.map(([label, value]) => (
        <ListItem key={label} disableGutters sx={{ py: 0.5 }}>
          <ListItemText
            primary={label}
            secondary={value}
            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
          />
        </ListItem>
      ))}
    </List>
  );
}
