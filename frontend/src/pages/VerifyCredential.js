import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  VerifiedUser as VerifyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  AccountBalance as UniversityIcon,
  CalendarToday as DateIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const VerifyCredential = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { verifyCredential } = useBlockchain();
  
  const [credentialHash, setCredentialHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!credentialHash.trim()) {
      setError('Please enter a credential hash to verify');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      setVerificationResult(null);

      const result = await verifyCredential(credentialHash.trim());
      setVerificationResult(result);
      
      if (result.isValid) {
        toast.success('Credential verified successfully!');
      } else {
        toast.warning('Credential verification failed');
      }
    } catch (error) {
      console.error('Error verifying credential:', error);
      setError('Failed to verify credential. Please check the hash and try again.');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClear = () => {
    setCredentialHash('');
    setVerificationResult(null);
    setError('');
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    try {
      const date = new Date(timestamp * 1000);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (isValid, isRevoked) => {
    if (isRevoked) return 'error';
    if (isValid) return 'success';
    return 'warning';
  };

  const getStatusIcon = (isValid, isRevoked) => {
    if (isRevoked) return <CancelIcon />;
    if (isValid) return <CheckIcon />;
    return <WarningIcon />;
  };

  const getStatusText = (isValid, isRevoked) => {
    if (isRevoked) return 'Revoked';
    if (isValid) return 'Valid';
    return 'Invalid';
  };

  const CredentialDisplay = ({ credential, isValid }) => (
    <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 3 }}>
      <Grid container spacing={3}>
        {/* Status Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: getStatusColor(isValid, credential.isRevoked),
                mr: 2,
              }}
            >
              {getStatusIcon(isValid, credential.isRevoked)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Credential Status: {getStatusText(isValid, credential.isRevoked)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last verified: {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Student Information */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Student Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {credential.studentName || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* University Information */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              University Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <UniversityIcon sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {credential.universityName || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Degree Details */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Degree Details
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              {credential.degreeType || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {credential.fieldOfStudy || 'N/A'}
            </Typography>
          </Box>
        </Grid>

        {/* Dates */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Important Dates
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DateIcon sx={{ mr: 1, color: 'warning.main', fontSize: 20 }} />
              <Typography variant="body2">
                Graduated: {formatDate(credential.graduationDate)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DateIcon sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
              <Typography variant="body2">
                Issued: {formatTimeAgo(credential.issuedAt)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Blockchain Information */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Blockchain Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2">
                  Credential Hash: {credential.credentialHash || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2">
                  Issued By: {credential.issuedBy ? `${credential.issuedBy.slice(0, 6)}...${credential.issuedBy.slice(-4)}` : 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );

  const VerificationForm = () => (
    <Card sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              bgcolor: 'success.main',
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
            }}
          >
            <VerifyIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Verify Academic Credential
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Verify the authenticity of any academic credential using its hash
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Credential Hash"
              value={credentialHash}
              onChange={(e) => setCredentialHash(e.target.value)}
              placeholder="Enter the credential hash to verify"
              multiline
              rows={3}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleVerify}
                disabled={isVerifying || !credentialHash.trim()}
                startIcon={isVerifying ? <CircularProgress size={20} /> : <VerifyIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                  },
                }}
              >
                {isVerifying ? 'Verifying...' : 'Verify Credential'}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={handleClear}
                disabled={isVerifying}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Instructions */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} />
            How to Verify a Credential
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To verify an academic credential:
          </Typography>
          <Box component="ol" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Obtain the credential hash from the student or university
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Paste the hash in the input field above
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Click "Verify Credential" to check against the blockchain
            </Typography>
            <Typography component="li" variant="body2">
              View the verification results and credential details
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <VerificationForm />

      {/* Verification Results */}
      {verificationResult && (
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Verification Results
            </Typography>
            
            {verificationResult.isValid ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ✓ Credential Verified Successfully
                </Typography>
                <Typography variant="body2">
                  This credential has been verified on the blockchain and is authentic.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ⚠ Credential Verification Failed
                </Typography>
                <Typography variant="body2">
                  This credential could not be verified. It may not exist on the blockchain or may have been revoked.
                </Typography>
              </Alert>
            )}

            <CredentialDisplay 
              credential={verificationResult.credential} 
              isValid={verificationResult.isValid}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                startIcon={<VerifyIcon />}
              >
                Verify Another Credential
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Benefits Section */}
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Why Use Blockchain Verification?
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Instant Verification
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verify credentials in seconds without waiting for university responses
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <SecurityIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Tamper-Proof
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Blockchain technology ensures credentials cannot be forged or altered
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <InfoIcon sx={{ color: 'info.main', mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Complete Transparency
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All verification data is publicly accessible and verifiable
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Cost-Effective
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No fees for verification - only one-time issuance costs
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyCredential;
