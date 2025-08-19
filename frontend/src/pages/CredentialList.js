import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Pagination,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  VerifiedUser as VerifyIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AccountBalance as UniversityIcon,
  CalendarToday as DateIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const CredentialList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { 
    isConnected, 
    getTotalCredentials, 
    getCredentialHashByIndex, 
    verifyCredential,
    revokeCredential,
    account,
    isUniversityAuthority
  } = useBlockchain();
  
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUniversity, setFilterUniversity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCredentials, setTotalCredentials] = useState(0);
  const [isAuthority, setIsAuthority] = useState(false);
  const [viewingCredential, setViewingCredential] = useState(null);
  const [isViewing, setIsViewing] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    if (isConnected) {
      loadCredentials();
      checkAuthority();
    }
  }, [isConnected, currentPage]);

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

  const loadCredentials = async () => {
    try {
      setIsLoading(true);
      const total = await getTotalCredentials();
      setTotalCredentials(parseInt(total));
      
      if (total > 0) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, total);
        
        const credentialPromises = [];
        for (let i = startIndex; i < endIndex; i++) {
          try {
            const hash = await getCredentialHashByIndex(i);
            credentialPromises.push(verifyCredential(hash));
          } catch (error) {
            console.error(`Error loading credential at index ${i}:`, error);
          }
        }
        
        const results = await Promise.all(credentialPromises);
        const validCredentials = results
          .filter(result => result && result.isValid !== undefined)
          .map((result, index) => ({
            ...result.credential,
            index: startIndex + index,
            isValid: result.isValid,
          }));
        
        setCredentials(validCredentials);
      } else {
        setCredentials([]);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCredential = async (credential) => {
    setIsViewing(true);
    setViewingCredential(credential);
  };

  const handleCloseView = () => {
    setIsViewing(false);
    setViewingCredential(null);
  };

  const handleRevokeCredential = async (credentialHash) => {
    try {
      await revokeCredential(credentialHash);
      toast.success('Credential revoked successfully');
      loadCredentials(); // Reload the list
    } catch (error) {
      console.error('Error revoking credential:', error);
    }
  };

  const filteredCredentials = credentials.filter(credential => {
    const matchesSearch = 
      credential.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.universityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.degreeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.fieldOfStudy?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'valid' && credential.isValid && !credential.isRevoked) ||
      (filterStatus === 'revoked' && credential.isRevoked) ||
      (filterStatus === 'invalid' && !credential.isValid);
    
    const matchesUniversity = filterStatus === 'all' || 
      credential.universityName === filterUniversity;
    
    return matchesSearch && matchesStatus && matchesUniversity;
  });

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

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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

  const CredentialViewModal = ({ credential, open, onClose }) => {
    if (!credential) return null;

    return (
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Credential Details
            </Typography>
            <Button onClick={onClose} variant="outlined">
              Close
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {/* Status */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: getStatusColor(credential.isValid, credential.isRevoked),
                    mr: 2,
                  }}
                >
                  {getStatusIcon(credential.isValid, credential.isRevoked)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Status: {getStatusText(credential.isValid, credential.isRevoked)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {formatTimeAgo(credential.issuedAt)}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Student Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Student Information
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                {credential.studentName || 'N/A'}
              </Typography>
            </Grid>

            {/* University Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                University
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                {credential.universityName || 'N/A'}
              </Typography>
            </Grid>

            {/* Degree Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Degree
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                {credential.degreeType || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {credential.fieldOfStudy || 'N/A'}
              </Typography>
            </Grid>

            {/* Dates */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Important Dates
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Graduated: {formatDate(credential.graduationDate)}
              </Typography>
              <Typography variant="body2">
                Issued: {formatTimeAgo(credential.issuedAt)}
              </Typography>
            </Grid>

            {/* Blockchain Info */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Blockchain Information
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                Hash: {credential.credentialHash || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Issued By: {credential.issuedBy ? `${credential.issuedBy.slice(0, 6)}...${credential.issuedBy.slice(-4)}` : 'N/A'}
              </Typography>
            </Grid>

            {/* Actions */}
            {isAuthority && !credential.isRevoked && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      handleRevokeCredential(credential.credentialHash);
                      onClose();
                    }}
                  >
                    Revoke Credential
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
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
            <Typography variant="body1" color="text.secondary">
              Please connect your MetaMask wallet to view credentials.
            </Typography>
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
            bgcolor: 'info.main',
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
          }}
        >
          <SchoolIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Academic Credentials
        </Typography>
        <Typography variant="h6" color="text.secondary">
          View and manage all issued academic credentials
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Credentials"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, university, degree..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status Filter"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="valid">Valid</MenuItem>
                  <MenuItem value="revoked">Revoked</MenuItem>
                  <MenuItem value="invalid">Invalid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>University Filter</InputLabel>
                <Select
                  value={filterUniversity}
                  label="University Filter"
                  onChange={(e) => setFilterUniversity(e.target.value)}
                >
                  <MenuItem value="all">All Universities</MenuItem>
                  {Array.from(new Set(credentials.map(c => c.universityName)))
                    .filter(Boolean)
                    .map(university => (
                      <MenuItem key={university} value={university}>
                        {university}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterUniversity('all');
                }}
              >
                Clear Filters
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
                {totalCredentials}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Credentials
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {credentials.filter(c => c.isValid && !c.isRevoked).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valid Credentials
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {credentials.filter(c => c.isRevoked).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revoked Credentials
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {Array.from(new Set(credentials.map(c => c.universityName))).filter(Boolean).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Universities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Credentials Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredCredentials.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No credentials found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || filterStatus !== 'all' || filterUniversity !== 'all' 
                  ? 'Try adjusting your search criteria' 
                  : 'No credentials have been issued yet'}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>University</TableCell>
                      <TableCell>Degree</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Issued</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCredentials.map((credential, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              <SchoolIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {credential.studentName || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {credential.fieldOfStudy || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <UniversityIcon sx={{ mr: 1, color: 'info.main' }} />
                            <Typography variant="body2">
                              {credential.universityName || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {credential.degreeType || 'N/A'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(credential.isValid, credential.isRevoked)}
                            label={getStatusText(credential.isValid, credential.isRevoked)}
                            color={getStatusColor(credential.isValid, credential.isRevoked)}
                            size="small"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {formatTimeAgo(credential.issuedAt)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewCredential(credential)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Verify">
                              <IconButton
                                size="small"
                                onClick={() => navigate('/verify', { 
                                  state: { hash: credential.credentialHash } 
                                })}
                              >
                                <VerifyIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              {totalCredentials > itemsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Pagination
                    count={Math.ceil(totalCredentials / itemsPerPage)}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Credential View Modal */}
      {viewingCredential && (
        <Box sx={{ mt: 4 }}>
          <CredentialViewModal
            credential={viewingCredential}
            open={isViewing}
            onClose={handleCloseView}
          />
        </Box>
      )}
    </Box>
  );
};

export default CredentialList;
