import { ethers } from 'ethers';
import { KADENA_CHAINS, ALL_CHAIN_IDS, getChainConfig } from './config.js';

/**
 * KadenaMultiChain - The core class for multi-chain operations
 * 
 * This is the main template functionality that developers will use.
 * All Kadena Chainweb EVM operations go through this class.
 */
export class KadenaMultiChain {
  constructor() {
    this.providers = {};
    this.signers = {};
    this.isInitialized = false;
    
    this.initializeProviders();
  }

  /**
   * Initialize providers for all Kadena chains
   */
  initializeProviders() {
    try {
      ALL_CHAIN_IDS.forEach(chainNumber => {
        const config = getChainConfig(chainNumber);
        this.providers[chainNumber] = new ethers.JsonRpcProvider(config.rpc);
      });
      this.isInitialized = true;
      console.log('✅ Kadena Multi-Chain initialized for chains:', ALL_CHAIN_IDS);
    } catch (error) {
      console.error('❌ Failed to initialize Kadena providers:', error);
    }
  }

  /**
   * Connect wallet to all chains
   */
  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create signers for each chain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Store signer for each chain
      ALL_CHAIN_IDS.forEach(chainNumber => {
        this.signers[chainNumber] = signer;
      });

      console.log('✅ Wallet connected to all Kadena chains');
      return signer;
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Get balance on a specific chain
   */
  async getBalance(chainNumber, address) {
    if (!this.providers[chainNumber]) {
      throw new Error(`Chain ${chainNumber} not initialized`);
    }

    try {
      const balance = await this.providers[chainNumber].getBalance(address);
      return {
        chainNumber,
        balance: ethers.formatEther(balance),
        raw: balance.toString()
      };
    } catch (error) {
      console.error(`❌ Failed to get balance on chain ${chainNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get balances across ALL chains simultaneously (parallel processing!)
   */
  async getAllBalances(address) {
    console.log('🚀 Fetching balances across all chains in parallel...');
    
    try {
      const balancePromises = ALL_CHAIN_IDS.map(chainNumber => 
        this.getBalance(chainNumber, address)
      );

      const results = await Promise.all(balancePromises);
      
      console.log('✅ All balances fetched successfully:', results);
      return results;
    } catch (error) {
      console.error('❌ Failed to fetch multi-chain balances:', error);
      throw error;
    }
  }

  /**
   * Send transaction on a specific chain
   */
  async sendTransaction(chainNumber, to, value, data = '0x') {
    if (!this.signers[chainNumber]) {
      throw new Error(`Wallet not connected to chain ${chainNumber}`);
    }

    try {
      const tx = await this.signers[chainNumber].sendTransaction({
        to,
        value: ethers.parseEther(value.toString()),
        data
      });

      console.log(`✅ Transaction sent on chain ${chainNumber}:`, tx.hash);
      return tx;
    } catch (error) {
      console.error(`❌ Failed to send transaction on chain ${chainNumber}:`, error);
      throw error;
    }
  }

  /**
   * Deploy contract on a specific chain
   */
  async deployContract(chainNumber, contractFactory, ...args) {
    if (!this.signers[chainNumber]) {
      throw new Error(`Wallet not connected to chain ${chainNumber}`);
    }

    try {
      const factory = new ethers.ContractFactory(
        contractFactory.abi,
        contractFactory.bytecode,
        this.signers[chainNumber]
      );

      const contract = await factory.deploy(...args);
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      console.log(`✅ Contract deployed on chain ${chainNumber} at:`, address);

      return {
        chainNumber,
        address,
        contract
      };
    } catch (error) {
      console.error(`❌ Failed to deploy contract on chain ${chainNumber}:`, error);
      throw error;
    }
  }

  /**
   * Deploy the same contract on ALL chains simultaneously
   */
  async deployToAllChains(contractFactory, ...args) {
    console.log('🚀 Deploying contract to all chains in parallel...');

    try {
      const deployPromises = ALL_CHAIN_IDS.map(chainNumber =>
        this.deployContract(chainNumber, contractFactory, ...args)
      );

      const results = await Promise.all(deployPromises);
      
      console.log('✅ Contract deployed to all chains:', results);
      return results;
    } catch (error) {
      console.error('❌ Failed to deploy to all chains:', error);
      throw error;
    }
  }

  /**
   * Get chain info
   */
  getChainInfo(chainNumber) {
    return getChainConfig(chainNumber);
  }

  /**
   * Get all supported chains
   */
  getSupportedChains() {
    return ALL_CHAIN_IDS;
  }
}

// Export singleton instance for easy use
export const kadenaClient = new KadenaMultiChain();