import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { toast } from 'react-toastify';

const steps = ['Credential Details', 'Generate Hash', 'Review & Issue'];

const degreeTypes = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate (PhD)',
  'Professional Certificate',
  'Postgraduate Diploma',
  'Other'
];

const fieldsOfStudy = [
  'Computer Science',
  'Engineering',
  'Business Administration',
  'Medicine',
  'Law',
  'Arts & Humanities',
  'Social Sciences',
  'Natural Sciences',
  'Mathematics',
  'Education',
  'Other'
];

const IssueCredential = () => {
  const theme = useTheme();
  const { isConnected, account, issueCredential, isUniversityAuthority } = useBlockchain();
  
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    universityName: '',
    degreeType: '',
    fieldOfStudy: '',
    graduationDate: '',
    credentialHash: '',
  });
  const [errors, setErrors] = useState({});
  const [generatedHash, setGeneratedHash] = useState('');

  useEffect(() => {
    checkAuthority();
  }, [account]);

  const checkAuthority = async () => {
    if (isConnected && account) {
      try {
        const authority = await isUniversityAuthority(account);
        setIsAuthority(authority);
      } catch (error) {
        console.error('Error checking authority:', error);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }
    
    if (!formData.universityName.trim()) {
      newErrors.universityName = 'University name is required';
    }
    
    if (!formData.degreeType) {
      newErrors.degreeType = 'Degree type is required';
    }
    
    if (!formData.fieldOfStudy) {
      newErrors.fieldOfStudy = 'Field of study is required';
    }
    
    if (!formData.graduationDate) {
      newErrors.graduationDate = 'Graduation date is required';
    }

    // Validate graduation date is not in the future
    if (formData.graduationDate) {
      const selectedDate = new Date(formData.graduationDate);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.graduationDate = 'Graduation date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCredentialHash = () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before proceeding');
      return;
    }

    // Create a unique hash based on credential data
    const credentialString = JSON.stringify({
      studentName: formData.studentName.trim(),
      universityName: formData.universityName.trim(),
      degreeType: formData.degreeType,
      fieldOfStudy: formData.fieldOfStudy,
      graduationDate: formData.graduationDate,
      timestamp: Date.now(),
    });

    // Simple hash generation (in production, use crypto-js or similar)
    let hash = 0;
    for (let i = 0; i < credentialString.length; i++) {
      const char = credentialString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const hashString = `ACV_${Math.abs(hash).toString(16).toUpperCase()}_${Date.now().toString(36)}`;
    setGeneratedHash(hashString);
    setFormData(prev => ({ ...prev, credentialHash: hashString }));
    
    toast.success('Credential hash generated successfully!');
    setActiveStep(2); // Skip to review step
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    if (!generatedHash) {
      toast.error('Please generate a credential hash first');
      return;
    }

    try {
      setIsLoading(true);
      
      const credentialData = {
        ...formData,
        graduationDate: Math.floor(new Date(formData.graduationDate).getTime() / 1000),
      };

      await issueCredential(credentialData);
      
      // Reset form and go to success
      setFormData({
        studentName: '',
        universityName: '',
        degreeType: '',
        fieldOfStudy: '',
        graduationDate: '',
        credentialHash: '',
      });
      setGeneratedHash('');
      setActiveStep(0);
      
      toast.success('Credential issued successfully on the blockchain!');
    } catch (error) {
      console.error('Error issuing credential:', error);
      // Error is already handled in the context
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateForm()) {
      return;
    }
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student Name"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                error={!!errors.studentName}
                helperText={errors.studentName}
                placeholder="Enter full student name"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="University Name"
                value={formData.universityName}
                onChange={(e) => handleInputChange('universityName', e.target.value)}
                error={!!errors.universityName}
                helperText={errors.universityName}
                placeholder="Enter university name"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.degreeType} required>
                <InputLabel>Degree Type</InputLabel>
                <Select
                  value={formData.degreeType}
                  label="Degree Type"
                  onChange={(e) => handleInputChange('degreeType', e.target.value)}
                >
                  {degreeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.fieldOfStudy} required>
                <InputLabel>Field of Study</InputLabel>
                <Select
                  value={formData.fieldOfStudy}
                  label="Field of Study"
                  onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                >
                  {fieldsOfStudy.map((field) => (
                    <MenuItem key={field} value={field}>
                      {field}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Graduation Date"
                type="date"
                value={formData.graduationDate}
                onChange={(e) => handleInputChange('graduationDate', e.target.value)}
                error={!!errors.graduationDate}
                helperText={errors.graduationDate}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Generate Credential Hash
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Click the button below to generate a unique hash for this credential. 
              This hash will be stored on the blockchain and used for verification.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={generateCredentialHash}
              startIcon={<SendIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Generate Hash
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Review Credential Details
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Student Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.studentName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    University
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.universityName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Degree Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.degreeType}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Field of Study
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.fieldOfStudy}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Graduation Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(formData.graduationDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Credential Hash
                  </Typography>
                  <Chip
                    label={generatedHash}
                    color="primary"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Once issued, this credential will be permanently stored on the blockchain. 
                The hash can be used by anyone to verify the authenticity of this credential.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              Wallet Not Connected
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please connect your MetaMask wallet to issue academic credentials.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!isAuthority) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              Unauthorized Access
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Only university authorities can issue academic credentials. 
              Your wallet address is not authorized to perform this action.
            </Typography>
            <Chip
              label={`Wallet: ${account?.slice(0, 6)}...${account?.slice(-4)}`}
              color="primary"
              variant="outlined"
            />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
          }}
        >
          <SchoolIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Issue Academic Credential
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Create and issue a new academic credential on the blockchain
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isLoading || !generatedHash}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <CheckIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                    },
                  }}
                >
                  {isLoading ? 'Issuing...' : 'Issue Credential'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 0 && !validateForm()}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IssueCredential;
