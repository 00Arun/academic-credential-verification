// Frontend Configuration
export const CONFIG = {
  // Contract Configuration
  contract: {
    address: '0x4Ad02bDf82EC78D7D8c67F909Ce1e9667487bC30',
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
