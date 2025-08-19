import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Divider,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Blockchain as BlockchainIcon,
  AccountBalanceWallet as WalletIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { ethers } from 'ethers';

const BlockchainInfo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { 
    isConnected, 
    account, 
    networkId, 
    contractAddress, 
    contract,
    getTotalCredentials,
    getTotalCredentials
  } = useBlockchain();
  
  const [blockchainData, setBlockchainData] = useState({
    totalCredentials: '0',
    blockNumber: '0',
    gasPrice: '0',
    networkName: 'Unknown',
    chainId: '0',
    contractBalance: '0',
    lastBlockTime: '0',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && contract) {
      loadBlockchainData();
    }
  }, [isConnected, contract]);

  const loadBlockchainData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const provider = contract.provider;
      
      // Get network information
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const gasPrice = await provider.getGasPrice();
      const lastBlock = await provider.getBlock(blockNumber);
      
      // Get contract information
      const totalCredentials = await getTotalCredentials();
      const contractBalance = await provider.getBalance(contractAddress);
      
      // Get network name
      const networkName = getNetworkName(network.chainId);
      
      setBlockchainData({
        totalCredentials,
        blockNumber: blockNumber.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        networkName,
        chainId: network.chainId.toString(),
        contractBalance: ethers.formatEther(contractBalance),
        lastBlockTime: lastBlock.timestamp,
      });
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setError('Failed to load blockchain data');
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Mumbai Testnet';
      case 56:
        return 'Binance Smart Chain';
      case 97:
        return 'BSC Testnet';
      case 1337:
        return 'Local Hardhat Network';
      case 31337:
        return 'Local Hardhat Network';
      default:
        return 'Unknown Network';
    }
  };

  const getNetworkColor = (chainId) => {
    switch (chainId) {
      case 1:
        return 'success';
      case 5:
      case 11155111:
        return 'warning';
      case 137:
        return 'info';
      case 56:
        return 'primary';
      case 1337:
      case 31337:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getNetworkIcon = (chainId) => {
    switch (chainId) {
      case 1:
        return '🔵';
      case 5:
      case 11155111:
        return '🟡';
      case 137:
        return '🟣';
      case 56:
        return '🟠';
      case 1337:
      case 31337:
        return '🟢';
      default:
        return '⚪';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (chainId, address) => {
    switch (chainId) {
      case 1:
        return `https://etherscan.io/address/${address}`;
      case 5:
        return `https://goerli.etherscan.io/address/${address}`;
      case 11155111:
        return `https://sepolia.etherscan.io/address/${address}`;
      case 137:
        return `https://polygonscan.com/address/${address}`;
      case 80001:
        return `https://mumbai.polygonscan.com/address/${address}`;
      case 56:
        return `https://bscscan.com/address/${address}`;
      case 97:
        return `https://testnet.bscscan.com/address/${address}`;
      default:
        return null;
    }
  };

  const NetworkInfoCard = () => (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: getNetworkColor(parseInt(blockchainData.chainId)),
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            <BlockchainIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {blockchainData.networkName}
            </Typography>
            <Chip
              label={`Chain ID: ${blockchainData.chainId}`}
              color={getNetworkColor(parseInt(blockchainData.chainId))}
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Network Status
            </Typography>
            <Chip
              icon={<CheckIcon />}
              label="Connected"
              color="success"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Network Type
            </Typography>
            <Chip
              label={parseInt(blockchainData.chainId) === 1 ? 'Mainnet' : 'Testnet/Local'}
              color={parseInt(blockchainData.chainId) === 1 ? 'success' : 'warning'}
              size="small"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const ContractInfoCard = () => (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            <CodeIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Smart Contract
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Academic Credential Verification
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contract Address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {formatAddress(contractAddress)}
              </Typography>
              {getExplorerUrl(blockchainData.chainId, contractAddress) && (
                <Tooltip title="View on Explorer">
                  <Link
                    href={getExplorerUrl(blockchainData.chainId, contractAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  </Link>
                </Tooltip>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contract Balance
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {parseFloat(blockchainData.contractBalance).toFixed(4)} ETH
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Credentials
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {blockchainData.totalCredentials}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const BlockchainStatsCard = () => (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: 'info.main',
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            <TrendingIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Blockchain Statistics
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Block
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              #{blockchainData.blockNumber}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Gas Price
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {blockchainData.gasPrice} Gwei
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Last Block Time
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatTimestamp(blockchainData.lastBlockTime)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Network Status
            </Typography>
            <Chip
              icon={<CheckIcon />}
              label="Operational"
              color="success"
              size="small"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const TechnicalDetailsCard = () => (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Technical Details
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Blockchain</TableCell>
                <TableCell>Ethereum</TableCell>
                <TableCell>Base blockchain platform</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Consensus</TableCell>
                <TableCell>Proof of Stake</TableCell>
                <TableCell>Consensus mechanism</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Smart Contract</TableCell>
                <TableCell>Solidity</TableCell>
                <TableCell>Programming language</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Token Standard</TableCell>
                <TableCell>ERC-20 Compatible</TableCell>
                <TableCell>Token standard support</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hashing</TableCell>
                <TableCell>Keccak256</TableCell>
                <TableCell>Credential hashing algorithm</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const SecurityFeaturesCard = () => (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1, color: 'success.main' }} />
          Security Features
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Immutable Records
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Once recorded, credentials cannot be altered or deleted
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Cryptographic Security
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uses Keccak256 hashing for tamper-proof verification
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Access Control
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Only authorized universities can issue credentials
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Transparent Verification
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All verification data is publicly accessible
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
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
              Please connect your MetaMask wallet to view blockchain information.
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
          <BlockchainIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Blockchain Information
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Real-time blockchain network and contract information
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Main Info Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <NetworkInfoCard />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <ContractInfoCard />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <BlockchainStatsCard />
            </Grid>
          </Grid>

          {/* Additional Information */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SecurityFeaturesCard />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TechnicalDetailsCard />
            </Grid>
          </Grid>

          {/* Refresh Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={loadBlockchainData}
              startIcon={<SpeedIcon />}
              size="large"
            >
              Refresh Blockchain Data
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default BlockchainInfo;
