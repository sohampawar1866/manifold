// Kadena Chainweb EVM Configuration
// All testnet chains with their exact RPC endpoints, chain IDs, and block explorers

export const CHAINWEB_EVM_TESTNET_CHAINS = {
  20: {
    chainId: 5920,
    name: 'Chainweb EVM Chain 20',
    shortName: 'Chain 20',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc',
    blockExplorer: 'http://chain-20.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'Kadena',
      symbol: 'KDA',
      decimals: 18
    },
    testnet: true,
    icon: '🔗'
  },
  21: {
    chainId: 5921,
    name: 'Chainweb EVM Chain 21',
    shortName: 'Chain 21',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc',
    blockExplorer: 'http://chain-21.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'Kadena',
      symbol: 'KDA',
      decimals: 18
    },
    testnet: true,
    icon: '⛓️'
  },
  22: {
    chainId: 5922,
    name: 'Chainweb EVM Chain 22',
    shortName: 'Chain 22',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/22/evm/rpc',
    blockExplorer: 'http://chain-22.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'Kadena',
      symbol: 'KDA',
      decimals: 18
    },
    testnet: true,
    icon: '🌐'
  },
  23: {
    chainId: 5923,
    name: 'Chainweb EVM Chain 23',
    shortName: 'Chain 23',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc',
    blockExplorer: 'http://chain-23.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'Kadena',
      symbol: 'KDA',
      decimals: 18
    },
    testnet: true,
    icon: '🚀'
  },
  24: {
    chainId: 5924,
    name: 'Chainweb EVM Chain 24',
    shortName: 'Chain 24',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc',
    blockExplorer: 'http://chain-24.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'Kadena',
      symbol: 'KDA',
      decimals: 18
    },
    testnet: true,
    icon: '⚡'
  }
}

// Helper functions for chain configuration
export const getChainConfig = (chainNumber) => {
  return CHAINWEB_EVM_TESTNET_CHAINS[chainNumber] || null
}

export const getAllChains = () => {
  return Object.values(CHAINWEB_EVM_TESTNET_CHAINS)
}

export const getChainNumbers = () => {
  return Object.keys(CHAINWEB_EVM_TESTNET_CHAINS).map(Number)
}

export const getSelectedChains = (chainNumbers) => {
  return chainNumbers.map(num => CHAINWEB_EVM_TESTNET_CHAINS[num]).filter(Boolean)
}

export const isValidChain = (chainNumber) => {
  return chainNumber in CHAINWEB_EVM_TESTNET_CHAINS
}

export const getBlockExplorerUrl = (chainNumber, txHash) => {
  const chain = getChainConfig(chainNumber)
  if (!chain) return null
  return `${chain.blockExplorer}tx/${txHash}`
}

export const getAddressExplorerUrl = (chainNumber, address) => {
  const chain = getChainConfig(chainNumber)
  if (!chain) return null
  return `${chain.blockExplorer}address/${address}`
}

// Chain combination recommendations based on use cases
export const CHAIN_RECOMMENDATIONS = {
  defi: {
    recommended: [20, 21, 22],
    description: 'Optimal for DeFi with good liquidity distribution',
    minChains: 2,
    maxChains: 4
  },
  gaming: {
    recommended: [20, 21],
    description: 'Fast and reliable for gaming transactions',
    minChains: 1,
    maxChains: 3
  },
  nft: {
    recommended: [22, 23],
    description: 'Great for NFT marketplace operations',
    minChains: 1,
    maxChains: 3
  },
  bridge: {
    recommended: [20, 21, 22, 23],
    description: 'Maximum connectivity for bridge operations',
    minChains: 2,
    maxChains: 5
  },
  custom: {
    recommended: [20, 21],
    description: 'Flexible starting point for custom applications',
    minChains: 1,
    maxChains: 5
  }
}

export const getRecommendedChains = (useCase) => {
  return CHAIN_RECOMMENDATIONS[useCase] || CHAIN_RECOMMENDATIONS.custom
}

// Ethereum-compatible provider configuration
export const getProviderConfig = (chainNumber) => {
  const chain = getChainConfig(chainNumber)
  if (!chain) return null
  
  return {
    chainId: `0x${chain.chainId.toString(16)}`, // Hex format for MetaMask
    chainName: chain.name,
    nativeCurrency: chain.currency,
    rpcUrls: [chain.rpc],
    blockExplorerUrls: [chain.blockExplorer]
  }
}

// Get all provider configs for selected chains
export const getMultiChainProviderConfigs = (chainNumbers) => {
  return chainNumbers.reduce((configs, chainNum) => {
    const config = getProviderConfig(chainNum)
    if (config) {
      configs[chainNum] = config
    }
    return configs
  }, {})
}

export default CHAINWEB_EVM_TESTNET_CHAINS