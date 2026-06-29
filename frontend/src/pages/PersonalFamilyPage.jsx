import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import WizardLayout from '../components/WizardLayout';
import WizardNav from '../components/WizardNav';
import DateTextField from '../components/DateTextField';
import { useClientForm } from '../context/ClientFormContext';
import { useWizardStep } from '../hooks/useWizardStep';
import { getStepIndex } from '../utils/wizardRoutes';
import { validatePersonalFamilyForm } from '../utils/validation';

const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const RELATIONSHIP_OPTIONS = ['Spouse', 'Son', 'Daughter', 'Mother', 'Father', 'Other'];

export default function PersonalFamilyPage() {
  const {
    formState,
    updatePersonal,
    setDobOrAgeMode,
    setDateOfBirth,
    addFamilyMember,
    removeFamilyMember,
    updateFamilyMember,
  } = useClientForm();

  const { personal, familyMembers } = formState;
  const { errors, snackbar, handleNext, closeSnackbar } = useWizardStep('/client');
  const [localErrors, setLocalErrors] = useState({ personal: {}, familyMembers: {} });

  const mergedErrors = {
    personal: { ...localErrors.personal, ...errors.personal },
    familyMembers: { ...localErrors.familyMembers, ...errors.familyMembers },
  };

  const onNext = () => {
    const result = validatePersonalFamilyForm(formState);
    setLocalErrors(result.errors);
    handleNext(formState);
  };

  const getPersonalError = (field) => mergedErrors.personal[field] || '';
  const getFamilyError = (id, field) => mergedErrors.familyMembers[id]?.[field] || '';

  return (
    <WizardLayout
      activeStep={getStepIndex('/client')}
      title="Client Profile"
      subtitle="Tell us about yourself and your family to personalize the financial plan."
    >
      <Stack spacing={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Personal Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fields marked with * are required.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Full Name"
                value={personal.fullName}
                onChange={(e) => updatePersonal('fullName', e.target.value)}
                error={Boolean(getPersonalError('fullName'))}
                helperText={getPersonalError('fullName')}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem' }}>
                  Date of Birth / Age *
                </FormLabel>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={personal.dobOrAgeMode}
                  onChange={(_, value) => value && setDobOrAgeMode(value)}
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="dob">Date of Birth</ToggleButton>
                  <ToggleButton value="age">Enter Age</ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
            </Grid>

            {personal.dobOrAgeMode === 'dob' ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DateTextField
                    label="Date of Birth"
                    required
                    value={personal.dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    error={getPersonalError('dateOfBirth')}
                    helperText="Select your date of birth"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Calculated Age"
                    value={personal.age ? `${personal.age} years` : '—'}
                    InputProps={{ readOnly: true }}
                    helperText="Age is calculated automatically from date of birth"
                  />
                </Grid>
              </>
            ) : (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Age"
                  value={personal.age}
                  onChange={(e) => updatePersonal('age', e.target.value)}
                  error={Boolean(getPersonalError('age'))}
                  helperText={getPersonalError('age')}
                  inputProps={{ min: 0, max: 120 }}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  label="Gender"
                  value={personal.gender}
                  onChange={(e) => updatePersonal('gender', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Not specified</em>
                  </MenuItem>
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required error={Boolean(getPersonalError('maritalStatus'))}>
                <InputLabel id="marital-status-label">Marital Status</InputLabel>
                <Select
                  labelId="marital-status-label"
                  label="Marital Status"
                  value={personal.maritalStatus}
                  onChange={(e) => updatePersonal('maritalStatus', e.target.value)}
                >
                  {MARITAL_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {getPersonalError('maritalStatus') && (
                  <FormHelperText>{getPersonalError('maritalStatus')}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Retirement Age"
                value={personal.retirementAge}
                onChange={(e) => updatePersonal('retirementAge', e.target.value)}
                error={Boolean(getPersonalError('retirementAge'))}
                helperText={getPersonalError('retirementAge') || 'Typical range: 55–65'}
                inputProps={{ min: 40, max: 80 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Occupation"
                value={personal.occupation}
                onChange={(e) => updatePersonal('occupation', e.target.value)}
                error={Boolean(getPersonalError('occupation'))}
                helperText={getPersonalError('occupation')}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Family Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add dependents and family members relevant to your financial plan.
              </Typography>
            </Box>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={addFamilyMember}>
              Add Member
            </Button>
          </Stack>

          {familyMembers.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No family members added yet. Click &quot;Add Member&quot; to include spouse, children,
              or parents.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {familyMembers.map((member, index) => (
                <PaperMemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  getFamilyError={getFamilyError}
                  updateFamilyMember={updateFamilyMember}
                  removeFamilyMember={removeFamilyMember}
                />
              ))}
            </Stack>
          )}
        </Box>

        <WizardNav currentPath="/client" onNext={onNext} showBack={false} />
      </Stack>

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

function PaperMemberCard({ member, index, getFamilyError, updateFamilyMember, removeFamilyMember }) {
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
          Family Member {index + 1}
        </Typography>
        <IconButton
          size="small"
          color="error"
          aria-label="Remove family member"
          onClick={() => removeFamilyMember(member.id)}
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            required
            label="Name"
            value={member.name}
            onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
            error={Boolean(getFamilyError(member.id, 'name'))}
            helperText={getFamilyError(member.id, 'name')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth required error={Boolean(getFamilyError(member.id, 'relationship'))}>
            <InputLabel id={`relationship-${member.id}`}>Relationship</InputLabel>
            <Select
              labelId={`relationship-${member.id}`}
              label="Relationship"
              value={member.relationship}
              onChange={(e) => updateFamilyMember(member.id, 'relationship', e.target.value)}
            >
              {RELATIONSHIP_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {getFamilyError(member.id, 'relationship') && (
              <FormHelperText>{getFamilyError(member.id, 'relationship')}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            required
            type="number"
            label="Age"
            value={member.age}
            onChange={(e) => updateFamilyMember(member.id, 'age', e.target.value)}
            error={Boolean(getFamilyError(member.id, 'age'))}
            helperText={getFamilyError(member.id, 'age')}
            inputProps={{ min: 0, max: 120 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl
            component="fieldset"
            required
            error={Boolean(getFamilyError(member.id, 'financiallyDependent'))}
          >
            <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
              Financially Dependent?
            </FormLabel>
            <RadioGroup
              row
              value={member.financiallyDependent}
              onChange={(e) =>
                updateFamilyMember(member.id, 'financiallyDependent', e.target.value)
              }
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
            {getFamilyError(member.id, 'financiallyDependent') && (
              <FormHelperText>{getFamilyError(member.id, 'financiallyDependent')}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}
