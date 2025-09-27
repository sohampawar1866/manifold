/**
 * 🎯 App Type Definitions for Kadena Multi-Chain Template
 * 
 * This file defines different application types and their optimal configurations.
 * Used by the setup wizard to provide intelligent recommendations.
 */

export const APP_TYPES = {
  SIMPLE_DAPP: {
    id: 'simple-dapp',
    name: 'Simple dApp',
    description: 'Basic decentralized application with simple functionality',
    recommendedChains: [20],
    complexity: 'single',
    features: ['wallet-connection', 'basic-contracts'],
    estimatedCost: '$10-30/month',
    examples: ['Token contract', 'Simple voting', 'Basic storage']
  },

  DEFI_PROTOCOL: {
    id: 'defi-protocol',
    name: 'DeFi Protocol',
    description: 'Decentralized finance application with trading and liquidity features',
    recommendedChains: [20, 21, 22],
    complexity: 'triple',
    features: ['cross-chain-transfers', 'liquidity-pools', 'arbitrage-detection'],
    estimatedCost: '$50-150/month',
    examples: ['DEX', 'Lending platform', 'Yield farming']
  },

  NFT_MARKETPLACE: {
    id: 'nft-marketplace',
    name: 'NFT Marketplace',
    description: 'Non-fungible token marketplace with cross-chain capabilities',
    recommendedChains: [20, 22],
    complexity: 'dual',
    features: ['cross-chain-transfers', 'nft-management', 'marketplace-functions'],
    estimatedCost: '$30-80/month',
    examples: ['Art marketplace', 'Gaming items', 'Collectibles']
  },

  GAMING_PLATFORM: {
    id: 'gaming-platform',
    name: 'Gaming Platform',
    description: 'Blockchain gaming platform with multi-chain item management',
    recommendedChains: [20, 22, 23],
    complexity: 'triple',
    features: ['cross-chain-transfers', 'gaming-assets', 'player-rewards'],
    estimatedCost: '$40-120/month',
    examples: ['RPG game', 'Trading card game', 'Virtual worlds']
  },

  DAO_GOVERNANCE: {
    id: 'dao-governance',
    name: 'DAO & Governance',
    description: 'Decentralized autonomous organization with governance features',
    recommendedChains: [20, 21, 24],
    complexity: 'triple',
    features: ['cross-chain-voting', 'governance-tokens', 'proposal-system'],
    estimatedCost: '$35-100/month',
    examples: ['Community DAO', 'Investment DAO', 'Protocol governance']
  },

  ADVANCED_MULTICHAIN: {
    id: 'advanced-multichain',
    name: 'Advanced Multi-Chain',
    description: 'Complex application utilizing all Kadena chains for maximum scalability',
    recommendedChains: [20, 21, 22, 23, 24],
    complexity: 'full',
    features: ['all-features', 'ai-optimization', 'advanced-analytics'],
    estimatedCost: '$100-300/month',
    examples: ['Cross-chain protocol', 'DeFi ecosystem', 'Enterprise dApp']
  }
};

export const COMPLEXITY_LEVELS = {
  single: {
    name: 'Single Chain',
    chainCount: 1,
    description: 'Simple setup with one chain',
    features: ['basic-wallet', 'simple-contracts', 'chain-info']
  },
  dual: {
    name: 'Dual Chain',
    chainCount: 2,
    description: 'Two chains with cross-chain capabilities',
    features: ['multi-wallet', 'cross-chain-transfers', 'chain-comparison']
  },
  triple: {
    name: 'Triple Chain',
    chainCount: 3,
    description: 'Three chains with optimization features',
    features: ['chain-optimization', 'arbitrage-detection', 'load-balancing']
  },
  quad: {
    name: 'Quad Chain',
    chainCount: 4,
    description: 'Four chains with advanced features',
    features: ['advanced-arbitrage', 'liquidity-aggregation', 'mev-protection']
  },
  full: {
    name: 'Full Multi-Chain',
    chainCount: 5,
    description: 'All five chains with complete ecosystem',
    features: ['ai-optimization', 'ecosystem-dashboard', 'advanced-governance', 'professional-analytics']
  }
};

export const FEATURE_DEFINITIONS = {
  'wallet-connection': {
    name: 'Wallet Connection',
    description: 'Connect to MetaMask and other EVM wallets'
  },
  'basic-contracts': {
    name: 'Basic Contract Interaction',
    description: 'Deploy and interact with simple smart contracts'
  },
  'cross-chain-transfers': {
    name: 'Cross-Chain Transfers',
    description: 'Transfer tokens between different Kadena chains'
  },
  'liquidity-pools': {
    name: 'Liquidity Pools',
    description: 'Manage liquidity across multiple chains'
  },
  'arbitrage-detection': {
    name: 'Arbitrage Detection',
    description: 'Detect price differences between chains'
  },
  'nft-management': {
    name: 'NFT Management',
    description: 'Create, trade, and manage NFTs across chains'
  },
  'gaming-assets': {
    name: 'Gaming Assets',
    description: 'Manage in-game items and currencies'
  },
  'governance-tokens': {
    name: 'Governance Tokens',
    description: 'Create and manage voting tokens'
  },
  'ai-optimization': {
    name: 'AI Chain Optimization',
    description: 'Intelligent chain selection and optimization'
  }
};

/**
 * Get app type by ID
 */
export function getAppType(id) {
  return APP_TYPES[id.toUpperCase().replace('-', '_')];
}

/**
 * Get complexity level by name
 */
export function getComplexityLevel(name) {
  return COMPLEXITY_LEVELS[name];
}

/**
 * Get recommended chains for app type
 */
export function getRecommendedChains(appTypeId) {
  const appType = getAppType(appTypeId);
  return appType ? appType.recommendedChains : [20];
}

/**
 * Get all available app types for selection
 */
export function getAvailableAppTypes() {
  return Object.values(APP_TYPES);
}