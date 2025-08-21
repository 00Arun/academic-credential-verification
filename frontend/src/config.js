// Frontend Configuration
export const CONFIG = {
  // Contract Configuration
  contract: {
    address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    networkId: 1337,
    networkName: 'Local Hardhat Network'
  },
  
  // Application Configuration
  app: {
    title: 'Academic Credential Verification',
    description: 'Blockchain-based academic credential verification system',
    version: '1.0.0'
  },
  
  // Network Configuration
  networks: {
    localhost: {
      chainId: 1337,
      name: 'Local Hardhat Network',
      rpcUrl: 'http://localhost:8545'
    }
  }
};
