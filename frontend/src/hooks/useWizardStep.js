import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextPath } from '../utils/wizardRoutes';
import { STEP_VALIDATORS } from '../utils/validation';

export function useWizardStep(currentPath) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const handleNext = (formState) => {
    const validator = STEP_VALIDATORS[currentPath];
    if (!validator) {
      navigate(getNextPath(currentPath));
      return;
    }

    const result = validator(formState);
    setErrors(result.errors);

    if (!result.isValid) {
      setSnackbar({
        open: true,
        message: result.errors._form || 'Please fix the highlighted fields before continuing.',
        severity: 'error',
      });
      return;
    }

    navigate(getNextPath(currentPath));
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return { errors, setErrors, snackbar, setSnackbar, handleNext, closeSnackbar };
}
