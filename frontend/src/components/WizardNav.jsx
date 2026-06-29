import { Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getPrevPath, getNextPath } from '../utils/wizardRoutes';

export default function WizardNav({
  currentPath,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  showBack = true,
  loading = false,
}) {
  const prevPath = getPrevPath(currentPath);
  const isReview = currentPath === '/review';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'space-between',
        pt: 2,
        mt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {showBack && prevPath ? (
        <Button component={RouterLink} to={prevPath} variant="outlined">
          Back
        </Button>
      ) : (
        <Box />
      )}
      {!isReview && (
        <Button variant="contained" size="large" onClick={onNext} disabled={nextDisabled || loading}>
          {loading ? 'Saving…' : nextLabel}
        </Button>
      )}
    </Box>
  );
}
