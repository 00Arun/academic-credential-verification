import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  AccountBalance as UniversityIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { toast } from 'react-toastify';

const UniversityManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { 
    isConnected, 
    account, 
    addUniversityAuthority, 
    removeUniversityAuthority,
    isUniversityAuthority,
    contract
  } = useBlockchain();
  
  const [universities, setUniversities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUniversityAddress, setNewUniversityAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removingAddress, setRemovingAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  useEffect(() => {
    if (isConnected && contract) {
      loadUniversities();
      checkOwnerStatus();
    }
  }, [isConnected, contract]);

  const checkOwnerStatus = async () => {
    try {
      if (contract && account) {
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
      }
    } catch (error) {
      console.error('Error checking owner status:', error);
    }
  };

  const loadUniversities = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use some sample university addresses
      // In a real implementation, you'd query the contract for all authorities
      const sampleUniversities = [
        {
          address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          name: 'MIT (Massachusetts Institute of Technology)',
          status: 'active',
          addedAt: Date.now() - 86400000 * 30, // 30 days ago
        },
        {
          address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          name: 'Stanford University',
          status: 'active',
          addedAt: Date.now() - 86400000 * 25, // 25 days ago
        },
        {
          address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
          name: 'Harvard University',
          status: 'active',
          addedAt: Date.now() - 86400000 * 20, // 20 days ago
        },
        {
          address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
          name: 'University of California, Berkeley',
          status: 'active',
          addedAt: Date.now() - 86400000 * 15, // 15 days ago
        },
        {
          address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
          name: 'Carnegie Mellon University',
          status: 'active',
          addedAt: Date.now() - 86400000 * 10, // 10 days ago
        }
      ];

      // Check which ones are actually authorities on the contract
      const authorityChecks = await Promise.all(
        sampleUniversities.map(async (uni) => {
          try {
            const isAuthority = await isUniversityAuthority(uni.address);
            return {
              ...uni,
              isAuthority,
              status: isAuthority ? 'active' : 'inactive'
            };
          } catch (error) {
            return { ...uni, isAuthority: false, status: 'error' };
          }
        })
      );

      setUniversities(authorityChecks);
    } catch (error) {
      console.error('Error loading universities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUniversity = async () => {
    if (!newUniversityAddress.trim()) {
      toast.error('Please enter a valid university address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newUniversityAddress.trim())) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      setIsAdding(true);
      await addUniversityAuthority(newUniversityAddress.trim());
      
      // Add to local state
      const newUniversity = {
        address: newUniversityAddress.trim(),
        name: `University at ${newUniversityAddress.trim().slice(0, 6)}...${newUniversityAddress.trim().slice(-4)}`,
        status: 'active',
        isAuthority: true,
        addedAt: Date.now(),
      };
      
      setUniversities(prev => [newUniversity, ...prev]);
      setNewUniversityAddress('');
      setShowAddDialog(false);
      
      toast.success('University authority added successfully!');
    } catch (error) {
      console.error('Error adding university:', error);
      // Error is already handled in the context
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUniversity = async () => {
    try {
      setIsRemoving(true);
      await removeUniversityAuthority(removingAddress);
      
      // Update local state
      setUniversities(prev => 
        prev.map(uni => 
          uni.address === removingAddress 
            ? { ...uni, status: 'inactive', isAuthority: false }
            : uni
        )
      );
      
      setShowRemoveDialog(false);
      setRemovingAddress('');
      
      toast.success('University authority removed successfully!');
    } catch (error) {
      console.error('Error removing university:', error);
      // Error is already handled in the context
    } finally {
      setIsRemoving(false);
    }
  };

  const openRemoveDialog = (address) => {
    setRemovingAddress(address);
    setShowRemoveDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'error': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckIcon />;
      case 'inactive': return <CancelIcon />;
      case 'error': return <WarningIcon />;
      default: return <InfoIcon />;
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const AddUniversityDialog = () => (
    <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
          Add University Authority
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add a new university to the consortium. Only the contract owner can perform this action.
        </Typography>
        
        <TextField
          fullWidth
          label="University Wallet Address"
          value={newUniversityAddress}
          onChange={(e) => setNewUniversityAddress(e.target.value)}
          placeholder="0x..."
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> The address must be a valid Ethereum address. 
            The university will be able to issue academic credentials once added.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAddDialog(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleAddUniversity}
          variant="contained"
          disabled={isAdding || !newUniversityAddress.trim()}
          startIcon={isAdding ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {isAdding ? 'Adding...' : 'Add University'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const RemoveUniversityDialog = () => (
    <Dialog open={showRemoveDialog} onClose={() => setShowRemoveDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RemoveIcon sx={{ mr: 1, color: 'error.main' }} />
          Remove University Authority
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Are you sure you want to remove this university from the consortium? 
          They will no longer be able to issue new credentials.
        </Typography>
        
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Warning:</strong> This action cannot be undone. 
            The university will lose all authority to issue credentials.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowRemoveDialog(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleRemoveUniversity}
          variant="contained"
          color="error"
          disabled={isRemoving}
          startIcon={isRemoving ? <CircularProgress size={20} /> : <RemoveIcon />}
        >
          {isRemoving ? 'Removing...' : 'Remove University'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (!isConnected) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              Wallet Not Connected
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please connect your MetaMask wallet to manage university authorities.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!isOwner) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <SecurityIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Only the contract owner can manage university authorities.
            </Typography>
            <Chip
              label={`Your Wallet: ${account?.slice(0, 6)}...${account?.slice(-4)}`}
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
      {/* Header */}
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
          <UniversityIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          University Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage the consortium of authorized universities
        </Typography>
      </Box>

      {/* Overview Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Consortium Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage which universities are authorized to issue academic credentials on the blockchain. 
                Only the contract owner can add or remove university authorities.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setShowAddDialog(true)}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                  },
                }}
              >
                Add University
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {universities.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Universities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {universities.filter(u => u.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Authorities
              </Typography>
            </CardContent>
          </Card>
        
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {universities.filter(u => u.isAuthority).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On-Chain Authorities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {universities.filter(u => u.status === 'inactive').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Universities Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : universities.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No universities found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by adding the first university to the consortium.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>University</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Added</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {universities.map((university, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <SchoolIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {university.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {university.isAuthority ? 'Authorized' : 'Not Authorized'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {university.address}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(university.status)}
                          label={university.status}
                          color={getStatusColor(university.status)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(university.addedAt)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {university.status === 'active' && (
                            <Tooltip title="Remove Authority">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openRemoveDialog(university.address)}
                              >
                                <RemoveIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Information Cards */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                How It Works
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The university consortium system works as follows:
              </Typography>
              <Box component="ol" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Only the contract owner can add or remove university authorities
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Authorized universities can issue academic credentials
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Removed universities lose the ability to issue new credentials
                </Typography>
                <Typography component="li" variant="body2">
                  All changes are recorded on the blockchain for transparency
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1, color: 'warning.main' }} />
                Security Considerations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Important security aspects to consider:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Only add trusted university wallet addresses
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Verify addresses before adding them to the consortium
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Monitor for any suspicious activity
                </Typography>
                <Typography component="li" variant="body2">
                  Keep the owner wallet secure and backed up
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <AddUniversityDialog />
      <RemoveUniversityDialog />
    </Box>
  );
};

export default UniversityManagement;
