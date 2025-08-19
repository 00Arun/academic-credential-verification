// Academic Credential Verification System Configuration
// Copy this file to config.js and update with your values

module.exports = {
  // Smart Contract Configuration
  contract: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default local address
    networkId: 1337, // Local Hardhat Network
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
      apiKey: 'YOUR_ETHERSCAN_API_KEY'
    },
    infura: {
      projectId: 'YOUR_INFURA_PROJECT_ID'
    },
    alchemy: {
      apiKey: 'YOUR_ALCHEMY_API_KEY'
    }
  }
};
