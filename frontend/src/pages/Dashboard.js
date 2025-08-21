import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  School as SchoolIcon,
  VerifiedUser as VerifyIcon,
  AccountBalance as UniversityIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isConnected, account, getTotalCredentials, contractAddress } = useBlockchain();
  
  const [totalCredentials, setTotalCredentials] = useState('0');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      if (isConnected) {
        const total = await getTotalCredentials();
        setTotalCredentials(total);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Avatar
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 2,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const FeatureCard = ({ title, description, icon, color, gradient }) => (
    <Card
      sx={{
        height: '100%',
        background: gradient || 'white',
        color: gradient ? 'white' : 'inherit',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: gradient ? 'rgba(255,255,255,0.2)' : color,
              color: gradient ? 'white' : 'white',
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: gradient ? 0.9 : 0.7 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick, disabled }) => (
    <Card
      sx={{
        height: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
        '&:hover': !disabled ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
      }}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: color,
            width: 48,
            height: 48,
            mx: 'auto',
            mb: 2,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          disabled={disabled}
          sx={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${color}dd 0%, ${color} 100%)`,
            },
          }}
        >
          {title}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: 'white',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to Academic Credential Verification
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Secure, tamper-proof verification of academic credentials using blockchain technology
        </Typography>
        
        {!isConnected && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<WarningIcon />}
              label="Wallet not connected"
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<InfoIcon />}
              label="Connect your wallet to start using the system"
              color="info"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Credentials"
            value={isLoading ? '...' : totalCredentials}
            icon={<SchoolIcon />}
            color="primary.main"
            subtitle="Issued on blockchain"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verifications"
            value="∞"
            icon={<VerifyIcon />}
            color="success.main"
            subtitle="Unlimited verifications"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Universities"
            value="10+"
            icon={<UniversityIcon />}
            color="info.main"
            subtitle="Participating institutions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Security Level"
            value="100%"
            icon={<SecurityIcon />}
            color="warning.main"
            subtitle="Tamper-proof"
          />
        </Grid>
      </Grid>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="Blockchain Security"
            description="All credentials are stored as tamper-proof hashes on the Ethereum blockchain, ensuring authenticity and preventing forgery."
            icon={<SecurityIcon />}
            color="primary.main"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="Instant Verification"
            description="Verify any academic credential instantly by checking its hash against the blockchain, eliminating delays and paperwork."
            icon={<SpeedIcon />}
            color="success.main"
            gradient="linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="University Consortium"
            description="Only authorized universities can issue credentials, maintaining the integrity and trust of the academic system."
            icon={<UniversityIcon />}
            color="info.main"
            gradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="Cost Effective"
            description="One-time issuance fee with unlimited verifications, making it affordable for universities and employers."
            icon={<TrendingIcon />}
            color="warning.main"
            gradient="linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Issue Credential"
            description="Issue a new academic credential for a student"
            icon={<SchoolIcon />}
            color="primary.main"
            onClick={() => navigate('/issue')}
            disabled={!isConnected}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Verify Credential"
            description="Verify the authenticity of an academic credential"
            icon={<VerifyIcon />}
            color="success.main"
            onClick={() => navigate('/verify')}
            disabled={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="View All Credentials"
            description="Browse all issued credentials in the system"
            icon={<CheckIcon />}
            color="info.main"
            onClick={() => navigate('/credentials')}
            disabled={false}
          />
        </Grid>
      </Grid>

      {/* System Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            System Status
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Wallet Connection</Typography>
                  <Chip
                    icon={isConnected ? <CheckIcon /> : <WarningIcon />}
                    label={isConnected ? 'Connected' : 'Not Connected'}
                    color={isConnected ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                {isConnected && (
                  <Typography variant="caption" color="text.secondary">
                    {account}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Smart Contract</Typography>
                  <Chip
                    icon={<CheckIcon />}
                    label="Deployed"
                    color="success"
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {contractAddress || 'Not deployed'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Blockchain Network</Typography>
                  <Chip
                    icon={<CheckIcon />}
                    label="Local Network"
                    color="info"
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Hardhat Network (Chain ID: 1337)
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">System Health</Typography>
                  <Chip
                    icon={<CheckIcon />}
                    label="Operational"
                    color="success"
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  All systems running normally
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Getting Started */}
      {!isConnected && (
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Connect your MetaMask wallet to start issuing and verifying academic credentials
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
              onClick={() => window.location.reload()}
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;
