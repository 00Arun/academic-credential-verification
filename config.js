// Academic Credential Verification System Configuration
// Updated with user's wallet address

module.exports = {
  // Smart Contract Configuration
  contract: {
    address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    networkId: 1337, 
    networkName: 'Local Hardhat Network'
  },

  // Frontend Configuration
  frontend: {
    title: 'Academic Credential Verification',
    description: 'Blockchain-based academic credential verification system',
    version: '1.0.0'
  },

  // Blockchain Networks
  networks: {
    localhost: {
      chainId: 1337,
      name: 'Local Hardhat Network',
      rpcUrl: 'http://localhost:8545',
      explorer: null
    },
    goerli: {
      chainId: 5,
      name: 'Goerli Testnet',
      rpcUrl: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
      explorer: 'https://goerli.etherscan.io'
    },
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
      explorer: 'https://sepolia.etherscan.io'
    },
    mainnet: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      explorer: 'https://etherscan.io'
    }
  },

  // Feature Flags
  features: {
    enableAnalytics: false,
    enableDebugMode: true,
    enableTestMode: true
  },

  // API Configuration
  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 30000,
    retries: 3
  },

  // External Services
  services: {
    etherscan: {
      apiKey: '1234567890'
    },
    infura: {
      projectId: '1234567890'
    },
    alchemy: {
      apiKey: '1234567890'
    }
  }
};
