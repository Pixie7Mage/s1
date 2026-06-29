import { InputAdornment, TextField } from '@mui/material';

export default function CurrencyField({
  label,
  value,
  onChange,
  required = false,
  error,
  helperText,
  fullWidth = true,
  ...rest
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      required={required}
      label={label}
      type="number"
      value={value}
      onChange={onChange}
      error={Boolean(error)}
      helperText={error || helperText}
      InputProps={{
        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
      }}
      inputProps={{ min: 0, step: 'any' }}
      {...rest}
    />
  );
}
