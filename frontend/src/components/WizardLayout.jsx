import {
  Box,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { WIZARD_STEPS } from '../utils/wizardRoutes';

export default function WizardLayout({ activeStep = 0, title, subtitle, children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            color="secondary"
            sx={{ fontWeight: 700, letterSpacing: 1.2 }}
          >
            Financial Planning Report
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
        </Box>

        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, overflowX: 'auto' }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ minWidth: { xs: 900, sm: 'auto' } }}
          >
            {WIZARD_STEPS.map((step) => (
              <Step key={step.path}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { fontSize: { xs: '0.65rem', sm: '0.75rem' } },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            Step {activeStep + 1} of {WIZARD_STEPS.length}
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 4 } }}>{children}</Paper>
      </Container>
    </Box>
  );
}
