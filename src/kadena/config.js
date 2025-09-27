/**
 * Kadena Chainweb EVM Configuration
 * All 5 testnet chains with their specific endpoints
 */

export const KADENA_CHAINS = {
  20: {
    chainId: 5920,
    name: 'Kadena Chain 20',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc',
    explorer: 'http://chain-20.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'KDA',
      symbol: 'KDA',
      decimals: 18
    }
  },
  21: {
    chainId: 5921,
    name: 'Kadena Chain 21',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc',
    explorer: 'http://chain-21.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'KDA',
      symbol: 'KDA',
      decimals: 18
    }
  },
  22: {
    chainId: 5922,
    name: 'Kadena Chain 22',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/22/evm/rpc',
    explorer: 'http://chain-22.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'KDA',
      symbol: 'KDA',
      decimals: 18
    }
  },
  23: {
    chainId: 5923,
    name: 'Kadena Chain 23',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc',
    explorer: 'http://chain-23.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'KDA',
      symbol: 'KDA',
      decimals: 18
    }
  },
  24: {
    chainId: 5924,
    name: 'Kadena Chain 24',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc',
    explorer: 'http://chain-24.evm-testnet-blockscout.chainweb.com/',
    currency: {
      name: 'KDA',
      symbol: 'KDA',
      decimals: 18
    }
  }
};

export const DEFAULT_CHAIN = 20;
export const ALL_CHAIN_IDS = Object.keys(KADENA_CHAINS).map(Number);

/**
 * Get chain configuration by chain number (20, 21, 22, 23, 24)
 */
export function getChainConfig(chainNumber) {
  return KADENA_CHAINS[chainNumber];
}

/**
 * Get all chain configurations
 */
export function getAllChains() {
  return Object.values(KADENA_CHAINS);
}

/**
 * Check if a chain number is supported
 */
export function isSupportedChain(chainNumber) {
  return chainNumber in KADENA_CHAINS;
}