import { useState, useEffect, useCallback } from 'react';
import { kadenaClient } from '../kadena/client.js';

/**
 * Hook for wallet connection
 */
export function useKadenaWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const signer = await kadenaClient.connectWallet();
      const address = await signer.getAddress();
      
      setAddress(address);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setError(null);
  }, []);

  return {
    isConnected,
    address,
    isConnecting,
    error,
    connect,
    disconnect
  };
}

/**
 * Hook for multi-chain balances
 */
export function useMultiChainBalances(address) {
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalances = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await kadenaClient.getAllBalances(address);
      setBalances(results);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch balances:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances
  };
}

/**
 * Hook for chain information
 */
export function useChainInfo() {
  const [chains, setChains] = useState([]);

  useEffect(() => {
    const supportedChains = kadenaClient.getSupportedChains();
    const chainInfo = supportedChains.map(chainNumber => ({
      chainNumber,
      ...kadenaClient.getChainInfo(chainNumber)
    }));
    setChains(chainInfo);
  }, []);

  return { chains };
}

/**
 * Hook for contract deployment
 */
export function useContractDeployment() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResults, setDeploymentResults] = useState([]);
  const [error, setError] = useState(null);

  const deployToAllChains = useCallback(async (contractFactory, ...args) => {
    setIsDeploying(true);
    setError(null);

    try {
      const results = await kadenaClient.deployToAllChains(contractFactory, ...args);
      setDeploymentResults(results);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsDeploying(false);
    }
  }, []);

  const deployToChain = useCallback(async (chainNumber, contractFactory, ...args) => {
    setIsDeploying(true);
    setError(null);

    try {
      const result = await kadenaClient.deployContract(chainNumber, contractFactory, ...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsDeploying(false);
    }
  }, []);

  return {
    isDeploying,
    deploymentResults,
    error,
    deployToAllChains,
    deployToChain
  };
}