import { Box, Paper, Typography } from '@mui/material';
import { formatINR } from '../utils/currency';

export default function SummaryCard({ label, value, subtitle, color = 'primary.main' }) {
  const display =
    typeof value === 'number' ? formatINR(value) : value;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: 'grey.50',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ color, fontWeight: 700 }}>
        {display}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}

export function SummaryGrid({ children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2,
        mb: 3,
      }}
    >
      {children}
    </Box>
  );
}
