import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CurrencyField from '../components/CurrencyField';
import SummaryCard, { SummaryGrid } from '../components/SummaryCard';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import {
  calcMfProfitLoss,
  calcStockCurrentValue,
  calcStockProfitLoss,
  calcInvestmentTotals,
} from '../utils/calculations';
import { formatINR, formatPercent, parseAmount } from '../utils/currency';
import { getStepIndex } from '../utils/wizardRoutes';

export default function InvestmentsPage() {
  const {
    formState,
    addMutualFund,
    removeMutualFund,
    updateMutualFund,
    addStock,
    removeStock,
    updateStock,
  } = useClientForm();
  const { investments } = formState;
  const { errors, snackbar, handleNext, closeSnackbar } = useWizardStep('/investments');

  const totals = calcInvestmentTotals(investments);

  const calcAverageXirr = (items) => {
    const validItems = (items || []).filter(
      (item) => item.xirr !== '' && item.xirr !== null && item.xirr !== undefined
    );
    if (validItems.length === 0) return 0;
    const sum = validItems.reduce((s, item) => s + (parseFloat(item.xirr) || 0), 0);
    return sum / validItems.length;
  };

  const avgMfXirr = calcAverageXirr(investments.mutualFunds);

  return (
    <WizardLayout
      activeStep={getStepIndex('/investments')}
      title="Investment Details"
      subtitle="Add mutual fund and stock holdings for portfolio analysis."
    >
      <SummaryGrid>
        <SummaryCard label="Total Invested" value={totals.totalInvested} />
        <SummaryCard label="Current Value" value={totals.totalCurrent} color="secondary.main" />
        <SummaryCard
          label="Profit / Loss"
          value={totals.totalProfitLoss}
          color={totals.totalProfitLoss >= 0 ? 'success.main' : 'error.main'}
        />
        <SummaryCard label="MF Avg XIRR" value={`${avgMfXirr.toFixed(2)}%`} color="info.main" />
      </SummaryGrid>

      <Stack spacing={3}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Mutual Funds</Typography>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addMutualFund}>
              Add MF
            </Button>
          </Stack>

          {investments.mutualFunds.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No mutual funds added.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {investments.mutualFunds.map((mf, index) => {
                const mfErrors = errors.mutualFunds?.[mf.id] || {};
                const pl = calcMfProfitLoss(mf);
                const investedNum = parseAmount(mf.investedAmount);
                const plPct = investedNum > 0 ? (pl / investedNum) * 100 : 0;
                const formattedPl = pl > 0 ? `+${formatPercent(plPct)}` : formatPercent(plPct);
                return (
                  <InvestmentCard
                    key={mf.id}
                    title={`MF ${index + 1}`}
                    onRemove={() => removeMutualFund(mf.id)}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="Scheme Name"
                          value={mf.schemeName}
                          onChange={(e) => updateMutualFund(mf.id, 'schemeName', e.target.value)}
                          error={Boolean(mfErrors.schemeName)}
                          helperText={mfErrors.schemeName}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="XIRR (%)"
                          value={mf.xirr}
                          onChange={(e) => updateMutualFund(mf.id, 'xirr', e.target.value)}
                          inputProps={{ step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <CurrencyField
                          required
                          label="Invested Amount"
                          value={mf.investedAmount}
                          onChange={(e) => updateMutualFund(mf.id, 'investedAmount', e.target.value)}
                          error={mfErrors.investedAmount}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <CurrencyField
                          label="Current Value"
                          value={mf.currentValue}
                          onChange={(e) => updateMutualFund(mf.id, 'currentValue', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="Profit / Loss"
                          value={formattedPl}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </Grid>
                  </InvestmentCard>
                );
              })}
            </Stack>
          )}
        </Box>

        <Divider />

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Stocks</Typography>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addStock}>
              Add Stock
            </Button>
          </Stack>

          {investments.stocks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No stocks added.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {investments.stocks.map((stock, index) => {
                const stErrors = errors.stocks?.[stock.id] || {};
                const currentValue = calcStockCurrentValue(stock);
                const pl = calcStockProfitLoss(stock);
                const costBasis = parseAmount(stock.quantity) * parseAmount(stock.avgBuyPrice);
                const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
                const formattedPlPct = pl > 0 ? `+${formatPercent(plPct)}` : formatPercent(plPct);
                return (
                  <InvestmentCard
                    key={stock.id}
                    title={`Stock ${index + 1}`}
                    onRemove={() => removeStock(stock.id)}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="Stock Name"
                          value={stock.name}
                          onChange={(e) => updateStock(stock.id, 'name', e.target.value)}
                          error={Boolean(stErrors.name)}
                          helperText={stErrors.name}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          required
                          type="number"
                          label="Quantity"
                          value={stock.quantity}
                          onChange={(e) => updateStock(stock.id, 'quantity', e.target.value)}
                          error={Boolean(stErrors.quantity)}
                          helperText={stErrors.quantity}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <CurrencyField
                          label="Avg Buy Price"
                          value={stock.avgBuyPrice}
                          onChange={(e) => updateStock(stock.id, 'avgBuyPrice', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <CurrencyField
                          label="Current Market Price"
                          value={stock.currentMarketPrice}
                          onChange={(e) => updateStock(stock.id, 'currentMarketPrice', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="Current Value / P&L"
                          value={`${formatINR(currentValue)} (${formattedPlPct})`}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </Grid>
                  </InvestmentCard>
                );
              })}
            </Stack>
          )}
        </Box>
      </Stack>

      <WizardNav currentPath="/investments" onNext={() => handleNext(formState)} />

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

function InvestmentCard({ title, onRemove, children }) {
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <IconButton size="small" color="error" onClick={onRemove}>
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
      {children}
    </Box>
  );
}
