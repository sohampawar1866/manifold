// Chain combination recommendations and utilities for different use cases

import { CHAINWEB_EVM_TESTNET_CHAINS, getChainConfig } from './chainConfig.js'

// Predefined chain combinations for different scenarios
export const CHAIN_COMBINATIONS = {
  // Single chain setups
  single: {
    simple: [20],
    recommended: [21],
    advanced: [22]
  },
  
  // Two chain setups
  dual: {
    basic: [20, 21],
    defi: [21, 22],
    gaming: [20, 23],
    nft: [22, 23],
    bridge: [20, 24]
  },
  
  // Three chain setups (most popular)
  triple: {
    defi: [20, 21, 22],          // DeFi Protocol recommended
    gaming: [20, 21, 23],        // Gaming Platform
    nft: [21, 22, 23],          // NFT Marketplace
    bridge: [20, 22, 24],        // Cross-chain Bridge
    balanced: [20, 21, 24]       // Balanced setup
  },
  
  // Four chain setups
  quad: {
    advanced_defi: [20, 21, 22, 23],
    full_bridge: [20, 21, 22, 24],
    enterprise: [20, 21, 23, 24],
    complete: [21, 22, 23, 24]
  },
  
  // Five chain setup (expert level)
  full: {
    expert: [20, 21, 22, 23, 24]
  }
}

// Use case specific recommendations
export const USE_CASE_COMBINATIONS = {
  defi: {
    beginner: CHAIN_COMBINATIONS.dual.defi,
    intermediate: CHAIN_COMBINATIONS.triple.defi,
    advanced: CHAIN_COMBINATIONS.quad.advanced_defi,
    expert: CHAIN_COMBINATIONS.full.expert
  },
  gaming: {
    beginner: CHAIN_COMBINATIONS.single.simple,
    intermediate: CHAIN_COMBINATIONS.dual.gaming,
    advanced: CHAIN_COMBINATIONS.triple.gaming,
    expert: [20, 21, 22, 23]
  },
  nft: {
    beginner: CHAIN_COMBINATIONS.single.recommended,
    intermediate: CHAIN_COMBINATIONS.dual.nft,
    advanced: CHAIN_COMBINATIONS.triple.nft,
    expert: [20, 22, 23, 24]
  },
  bridge: {
    beginner: CHAIN_COMBINATIONS.dual.bridge,
    intermediate: CHAIN_COMBINATIONS.triple.bridge,
    advanced: CHAIN_COMBINATIONS.quad.full_bridge,
    expert: CHAIN_COMBINATIONS.full.expert
  },
  custom: {
    beginner: CHAIN_COMBINATIONS.single.simple,
    intermediate: CHAIN_COMBINATIONS.dual.basic,
    advanced: CHAIN_COMBINATIONS.triple.balanced,
    expert: CHAIN_COMBINATIONS.quad.enterprise
  }
}

// Function complexity based on chain count
export const FUNCTION_COMPLEXITY = {
  1: {
    level: 'Simple',
    description: 'Basic single-chain operations',
    functions: ['getChainBalance', 'deployContract', 'transferTokens'],
    complexity: 'beginner'
  },
  2: {
    level: 'Moderate',
    description: 'Cross-chain operations between two chains',
    functions: ['crossChainTransfer', 'dualChainDeploy', 'compareBalances'],
    complexity: 'intermediate'
  },
  3: {
    level: 'Recommended',
    description: 'Multi-chain operations with optimal functionality',
    functions: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances', 'triChainArbitrage'],
    complexity: 'advanced'
  },
  4: {
    level: 'Advanced',
    description: 'Complex multi-chain operations',
    functions: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances', 'advancedArbitrage', 'quadChainSync'],
    complexity: 'expert'
  },
  5: {
    level: 'Expert',
    description: 'Full multi-chain ecosystem management',
    functions: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances', 'fullChainArbitrage', 'ecosystemSync', 'globalRebalance'],
    complexity: 'expert'
  }
}

// Get recommended chain combination for use case and experience level
export const getRecommendedCombination = (useCase, experienceLevel, chainCount) => {
  const useCaseCombs = USE_CASE_COMBINATIONS[useCase] || USE_CASE_COMBINATIONS.custom
  
  // If specific chain count requested, find best match
  if (chainCount) {
    const availableCombinations = Object.values(CHAIN_COMBINATIONS).reduce((acc, group) => {
      return { ...acc, ...group }
    }, {})
    
    const matchingCombinations = Object.entries(availableCombinations)
      .filter(([_, chains]) => chains.length === chainCount)
      .map(([name, chains]) => ({ name, chains }))
    
    // Return use case specific if available, otherwise first match
    const useCaseMatch = matchingCombinations.find(({ name }) => name.includes(useCase))
    return useCaseMatch ? useCaseMatch.chains : matchingCombinations[0]?.chains || []
  }
  
  // Return based on experience level
  return useCaseCombs[experienceLevel] || useCaseCombs.intermediate
}

// Generate chain combination metadata
export const getChainCombinationInfo = (chainNumbers) => {
  const chains = chainNumbers.map(num => getChainConfig(num)).filter(Boolean)
  const complexity = FUNCTION_COMPLEXITY[chainNumbers.length] || FUNCTION_COMPLEXITY[2]
  
  return {
    chains,
    count: chainNumbers.length,
    complexity: complexity.level,
    description: complexity.description,
    recommendedFunctions: complexity.functions,
    totalGasCosts: calculateEstimatedGasCosts(chainNumbers.length),
    setupTime: calculateSetupTime(chainNumbers.length),
    difficulty: complexity.complexity
  }
}

// Estimate gas costs for multi-chain operations
const calculateEstimatedGasCosts = (chainCount) => {
  const baseGas = 21000 // Basic transaction
  const crossChainMultiplier = 1.5
  const complexityMultiplier = chainCount * 0.3
  
  return {
    simple: Math.round(baseGas * (1 + complexityMultiplier)),
    crossChain: Math.round(baseGas * crossChainMultiplier * chainCount),
    complex: Math.round(baseGas * crossChainMultiplier * chainCount * 2)
  }
}

// Estimate setup time based on chain count
const calculateSetupTime = (chainCount) => {
  const baseTime = 5 // minutes
  const perChainTime = 2 // minutes per additional chain
  
  return {
    setup: baseTime + (chainCount - 1) * perChainTime,
    testing: chainCount * 3,
    deployment: chainCount * 5
  }
}

// Validate chain combination
export const validateChainCombination = (chainNumbers) => {
  const errors = []
  const warnings = []
  
  // Check if all chains exist
  const validChains = chainNumbers.filter(num => getChainConfig(num))
  if (validChains.length !== chainNumbers.length) {
    errors.push('Some selected chains are not available')
  }
  
  // Check for optimal combinations
  if (chainNumbers.length === 1) {
    warnings.push('Single chain setup limits cross-chain functionality')
  }
  
  if (chainNumbers.length > 4) {
    warnings.push('More than 4 chains may increase complexity and gas costs')
  }
  
  // Check for recommended patterns
  const hasSequentialChains = chainNumbers.some((chain, index) => 
    index > 0 && chain === chainNumbers[index - 1] + 1
  )
  
  if (chainNumbers.length > 2 && !hasSequentialChains) {
    warnings.push('Non-sequential chains may have higher latency')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: calculateCombinationScore(chainNumbers)
  }
}

// Calculate combination score (higher is better)
const calculateCombinationScore = (chainNumbers) => {
  let score = 0
  
  // Base score for having chains
  score += chainNumbers.length * 10
  
  // Bonus for optimal count (2-3 chains)
  if (chainNumbers.length >= 2 && chainNumbers.length <= 3) {
    score += 20
  }
  
  // Bonus for sequential chains
  const hasSequential = chainNumbers.some((chain, index) => 
    index > 0 && chain === chainNumbers[index - 1] + 1
  )
  if (hasSequential) score += 15
  
  // Bonus for recommended combinations
  const isRecommended = Object.values(CHAIN_COMBINATIONS).some(group =>
    Object.values(group).some(combo => 
      combo.length === chainNumbers.length && 
      combo.every(chain => chainNumbers.includes(chain))
    )
  )
  if (isRecommended) score += 25
  
  return Math.min(score, 100) // Cap at 100
}

export default {
  CHAIN_COMBINATIONS,
  USE_CASE_COMBINATIONS,
  FUNCTION_COMPLEXITY,
  getRecommendedCombination,
  getChainCombinationInfo,
  validateChainCombination
}