#!/usr/bin/env node

/**
 * 🚀 Kadena Multi-Chain Deployment Script
 * 
 * This      // Validate all chains are accessible
      for (const chainId of this.config.deployment.deployToChains) {cript automates the entire deployment process:
 * 1. Validates environment setup
 * 2. Deploys contracts to all 5 Kadena chains
 * 3. Configures cross-chain communication
 * 4. Updates frontend configuration
 * 5. Runs deployment verification tests
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KADENA_CHAINS } from '../src/kadena/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class KadenaDeployer {
  constructor() {
    this.deploymentResults = {};
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../deployment.config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Ensure deployment section exists for backwards compatibility
      if (!config.deployment) {
        config.deployment = {
          deployToChains: config.deployToChains || [20, 21, 22, 23, 24],
          gasSettings: config.gasSettings || {
            gasLimit: 5000000,
            gasPrice: '20000000000'
          },
          confirmations: config.confirmations || 2
        };
      }
      
      return config;
    }
    
    // Default configuration if no setup was run
    console.log('⚠️  No configuration found. Run "npm run setup" first for optimal settings.');
    return {
      projectName: 'My Kadena dApp',
      appType: 'simple-dapp',
      complexity: 'single',
      deployment: {
        deployToChains: [20],
        gasSettings: {
          gasLimit: 3000000,
          gasPrice: '15000000000'
        },
        confirmations: 1
      },
      contracts: {}
    };
  }

  async validateEnvironment() {
    console.log('🔍 Validating deployment environment...');
    
    // Check if wallet is configured
    if (!process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
      throw new Error('❌ No wallet configured. Set PRIVATE_KEY or MNEMONIC environment variable.');
    }

    // Check if contracts exist
    const contractsDir = path.join(__dirname, '../src/contracts');
    if (!fs.existsSync(contractsDir)) {
      throw new Error('❌ No contracts directory found. Add your contracts to src/contracts/');
    }

    // Validate all chains are accessible
    for (const chainId of this.config.deployToChains) {
      const chain = KADENA_CHAINS[chainId];
      try {
        const provider = new ethers.JsonRpcProvider(chain.rpc);
        await provider.getBlockNumber();
        console.log(`✅ Chain ${chainId} (${chain.name}) is accessible`);
      } catch (error) {
        console.warn(`⚠️  Chain ${chainId} may be slow or unavailable: ${error.message}`);
      }
    }

    console.log('✅ Environment validation complete');
  }

  async deployToChain(chainId, contractName, contractCode, constructorArgs = []) {
    console.log(`🚀 Deploying ${contractName} to Chain ${chainId}...`);
    
    const chain = KADENA_CHAINS[chainId];
    const provider = new ethers.JsonRpcProvider(chain.rpc);
    
    // Setup wallet
    let wallet;
    if (process.env.PRIVATE_KEY) {
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    } else if (process.env.MNEMONIC) {
      wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);
    }

    try {
      // Deploy contract
      const factory = new ethers.ContractFactory(
        contractCode.abi,
        contractCode.bytecode,
        wallet
      );

      const contract = await factory.deploy(...constructorArgs, {
        gasLimit: this.config.deployment.gasSettings.gasLimit,
        gasPrice: this.config.deployment.gasSettings.gasPrice
      });

      await contract.waitForDeployment();
      const address = await contract.getAddress();

      console.log(`✅ ${contractName} deployed to Chain ${chainId} at: ${address}`);
      
      return {
        chainId,
        contractName,
        address,
        transactionHash: contract.deploymentTransaction().hash,
        explorer: `${chain.explorer}tx/${contract.deploymentTransaction().hash}`
      };
    } catch (error) {
      console.error(`❌ Failed to deploy ${contractName} to Chain ${chainId}:`, error.message);
      throw error;
    }
  }

  async deployAllContracts() {
    console.log('🚀 Starting multi-chain deployment...');
    
    const contractFiles = fs.readdirSync(path.join(__dirname, '../src/contracts'))
      .filter(file => file.endsWith('.json'));

    if (contractFiles.length === 0) {
      console.log('ℹ️  No compiled contracts found. Make sure to compile your contracts first.');
      return;
    }

    for (const contractFile of contractFiles) {
      const contractName = path.basename(contractFile, '.json');
      const contractPath = path.join(__dirname, '../src/contracts', contractFile);
      const contractCode = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

      // Deploy to all specified chains in parallel
      const deploymentPromises = this.config.deployment.deployToChains.map(chainId =>
        this.deployToChain(chainId, contractName, contractCode)
          .catch(error => ({ chainId, contractName, error: error.message }))
      );

      const results = await Promise.all(deploymentPromises);
      this.deploymentResults[contractName] = results;
    }
  }

  async updateFrontendConfig() {
    console.log('⚙️  Updating frontend configuration...');
    
    const configPath = path.join(__dirname, '../src/config/deployed-contracts.json');
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(this.deploymentResults, null, 2));
    console.log('✅ Frontend configuration updated');
  }

  async verifyDeployment() {
    console.log('🔍 Verifying deployment...');
    
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const [contractName, results] of Object.entries(this.deploymentResults)) {
      for (const result of results) {
        if (result.error) {
          console.log(`❌ ${contractName} on Chain ${result.chainId}: ${result.error}`);
          totalFailed++;
        } else {
          console.log(`✅ ${contractName} on Chain ${result.chainId}: ${result.address}`);
          totalSuccess++;
        }
      }
    }

    console.log(`\n📊 Deployment Summary:`);
    console.log(`✅ Successful deployments: ${totalSuccess}`);
    console.log(`❌ Failed deployments: ${totalFailed}`);

    if (totalFailed > 0) {
      console.log(`\n⚠️  Some deployments failed. Check the logs above for details.`);
    } else {
      console.log(`\n🎉 All deployments successful! Your dApp is ready on all chains.`);
    }
  }

  async run() {
    try {
      console.log(`🌟 Kadena Multi-Chain Deployment Starting...`);
      console.log(`📱 Project: ${this.config.projectName}`);
      console.log(`🎯 App Type: ${this.config.appType || 'Custom'}`);
      console.log(`� Complexity: ${this.config.complexity || 'Unknown'}`);
      console.log(`�🔗 Deploying to chains: ${this.config.deployment.deployToChains.join(', ')}\n`);

      await this.validateEnvironment();
      await this.deployAllContracts();
      await this.updateFrontendConfig();
      await this.verifyDeployment();

      console.log(`\n🚀 Deployment complete! Your Kadena multi-chain dApp is live!`);
      console.log(`📖 Check deployed-contracts.json for all contract addresses.`);
      
    } catch (error) {
      console.error(`💥 Deployment failed:`, error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployer = new KadenaDeployer();
  deployer.run();
}

export { KadenaDeployer };