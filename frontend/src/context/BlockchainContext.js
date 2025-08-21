import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { CONFIG } from '../config';

// Contract ABI - This will be imported from the compiled contract
const CONTRACT_ABI = [
  "function issueCredential(string studentName, string universityName, string degreeType, string fieldOfStudy, uint256 graduationDate, string credentialHash) external",
  "function verifyCredential(string credentialHash) external view returns (bool isValid, tuple(string studentName, string universityName, string degreeType, string fieldOfStudy, uint256 graduationDate, string credentialHash, bool isRevoked, uint256 issuedAt, address issuedBy) credential)",
  "function revokeCredential(string credentialHash) external",
  "function addUniversityAuthority(address university) external",
  "function removeUniversityAuthority(address university) external",
  "function isUniversityAuthority(address university) external view returns (bool)",
  "function getTotalCredentials() external view returns (uint256)",
  "function getCredentialHashByIndex(uint256 index) external view returns (bytes32)",
  "function owner() external view returns (address)"
];

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [networkId, setNetworkId] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);

  // Contract configuration
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || CONFIG.contract.address; // Use config or environment variable

  // Initialize blockchain connection
  useEffect(() => {
    initializeBlockchain();
  }, []);

  const initializeBlockchain = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        // Get network info
        const network = await provider.getNetwork();
        setNetworkId(network.chainId);

        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await connectWallet();
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        // Initialize contract if address is available
        if (CONTRACT_ADDRESS) {
          await initializeContract(provider);
        }
      } else {
        toast.error('MetaMask is not installed. Please install MetaMask to use this application.');
      }
    } catch (error) {
      console.error('Error initializing blockchain:', error);
      toast.error('Failed to initialize blockchain connection');
    }
  };

  const initializeContract = async (provider) => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      setContract(contract);
      setContractAddress(CONTRACT_ADDRESS);
      
      // Verify contract deployment
      try {
        await contract.owner();
        toast.success('Smart contract connected successfully');
      } catch (error) {
        toast.warning('Contract not found at specified address. Please deploy the contract first.');
      }
    } catch (error) {
      console.error('Error initializing contract:', error);
      toast.error('Failed to initialize smart contract');
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];
      
      if (account) {
        const signer = await provider.getSigner();
        setSigner(signer);
        setAccount(account);
        setIsConnected(true);
        
        // Reinitialize contract with signer
        if (CONTRACT_ADDRESS) {
          const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          setContract(contractWithSigner);
        }
        
        toast.success(`Connected to wallet: ${account.slice(0, 6)}...${account.slice(-4)}`);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('User rejected wallet connection');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setSigner(null);
    setAccount(null);
    setIsConnected(false);
    setContract(null);
    toast.info('Wallet disconnected');
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  // Contract interaction functions
  const issueCredential = async (credentialData) => {
    try {
      if (!contract || !isConnected) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      
      const tx = await contract.issueCredential(
        credentialData.studentName,
        credentialData.universityName,
        credentialData.degreeType,
        credentialData.fieldOfStudy,
        credentialData.graduationDate,
        credentialData.credentialHash
      );

      toast.info('Transaction submitted. Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      toast.success('Credential issued successfully!');
      return receipt;
    } catch (error) {
      console.error('Error issuing credential:', error);
      
      if (error.message.includes('Only university authorities')) {
        toast.error('Only university authorities can issue credentials');
      } else if (error.message.includes('Credential already exists')) {
        toast.error('Credential with this hash already exists');
      } else {
        toast.error('Failed to issue credential: ' + error.message);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCredential = async (credentialHash) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const [isValid, credential] = await contract.verifyCredential(credentialHash);
      return { isValid, credential };
    } catch (error) {
      console.error('Error verifying credential:', error);
      toast.error('Failed to verify credential');
      throw error;
    }
  };

  const revokeCredential = async (credentialHash) => {
    try {
      if (!contract || !isConnected) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      
      const tx = await contract.revokeCredential(credentialHash);
      
      toast.info('Revocation transaction submitted. Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      toast.success('Credential revoked successfully!');
      return receipt;
    } catch (error) {
      console.error('Error revoking credential:', error);
      
      if (error.message.includes('Only the issuing university')) {
        toast.error('Only the issuing university or contract owner can revoke credentials');
      } else if (error.message.includes('Credential has been revoked')) {
        toast.error('Credential has already been revoked');
      } else {
        toast.error('Failed to revoke credential: ' + error.message);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addUniversityAuthority = async (universityAddress) => {
    try {
      if (!contract || !isConnected) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      
      const tx = await contract.addUniversityAuthority(universityAddress);
      
      toast.info('Adding university authority. Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      toast.success('University authority added successfully!');
      return receipt;
    } catch (error) {
      console.error('Error adding university authority:', error);
      toast.error('Failed to add university authority: ' + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeUniversityAuthority = async (universityAddress) => {
    try {
      if (!contract || !isConnected) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      
      const tx = await contract.removeUniversityAuthority(universityAddress);
      
      toast.info('Removing university authority. Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      toast.success('University authority removed successfully!');
      return receipt;
    } catch (error) {
      console.error('Error removing university authority:', error);
      toast.error('Failed to remove university authority: ' + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalCredentials = async () => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const total = await contract.getTotalCredentials();
      return total.toString();
    } catch (error) {
      console.error('Error getting total credentials:', error);
      return '0';
    }
  };

  const isUniversityAuthority = async (address) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const isAuthority = await contract.isUniversityAuthority(address);
      return isAuthority;
    } catch (error) {
      console.error('Error checking university authority:', error);
      return false;
    }
  };

  const value = {
    // State
    provider,
    signer,
    contract,
    account,
    isConnected,
    isLoading,
    networkId,
    contractAddress,
    
    // Functions
    connectWallet,
    disconnectWallet,
    issueCredential,
    verifyCredential,
    revokeCredential,
    addUniversityAuthority,
    removeUniversityAuthority,
    getTotalCredentials,
    isUniversityAuthority,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
