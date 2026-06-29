import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';

/**
 * Date input with external label to avoid MUI/native date placeholder overlap.
 */
export default function DateTextField({
  label,
  required = false,
  value,
  onChange,
  error,
  helperText,
  max,
  id,
}) {
  const fieldId = id || 'date-field';

  return (
    <FormControl fullWidth required={required} error={Boolean(error)}>
      <FormLabel htmlFor={fieldId} sx={{ mb: 1, fontSize: '0.875rem' }}>
        {label}
        {required ? ' *' : ''}
      </FormLabel>
      <TextField
        id={fieldId}
        fullWidth
        type="date"
        hiddenLabel
        value={value}
        onChange={onChange}
        inputProps={{ max }}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
