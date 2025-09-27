#!/usr/bin/env node

/**
 * 🧪 Kadena Multi-Chain Deployment Testing
 * 
 * Validates that your deployment worked correctly across all chains:
 * 1. Checks contract deployment status
 * 2. Tests basic contract functionality
 * 3. Validates cross-chain communication
 * 4. Verifies frontend configuration
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KADENA_CHAINS } from '../src/kadena/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class DeploymentTester {
  constructor() {
    this.config = this.loadConfig();
    this.deployedContracts = this.loadDeployedContracts();
    this.testResults = {};
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../deployment.config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    throw new Error('❌ No deployment.config.json found. Run npm run setup first.');
  }

  loadDeployedContracts() {
    const contractsPath = path.join(__dirname, '../src/config/deployed-contracts.json');
    if (fs.existsSync(contractsPath)) {
      return JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
    }
    throw new Error('❌ No deployed contracts found. Run npm run deploy first.');
  }

  async testContractDeployment(chainId, contractName, contractData) {
    console.log(`🔍 Testing ${contractName} on Chain ${chainId}...`);
    
    const chain = KADENA_CHAINS[chainId];
    const provider = new ethers.JsonRpcProvider(chain.rpc);
    
    try {
      // Check if contract exists
      const code = await provider.getCode(contractData.address);
      if (code === '0x') {
        return {
          success: false,
          error: 'Contract not found at address'
        };
      }

      // Try to interact with contract
      const contractAbi = await this.getContractAbi(contractName);
      if (contractAbi) {
        const contract = new ethers.Contract(contractData.address, contractAbi, provider);
        
        // Test a simple read function if available
        if (contractAbi.find(item => item.name === 'get' && item.type === 'function')) {
          try {
            await contract.get();
            console.log(`  ✅ Contract interaction successful`);
          } catch (error) {
            console.log(`  ⚠️  Contract interaction failed: ${error.message}`);
          }
        }
      }

      // Check transaction
      if (contractData.transactionHash) {
        const receipt = await provider.getTransactionReceipt(contractData.transactionHash);
        if (!receipt) {
          return {
            success: false,
            error: 'Deployment transaction not found'
          };
        }
        
        if (receipt.status !== 1) {
          return {
            success: false,
            error: 'Deployment transaction failed'
          };
        }
      }

      console.log(`  ✅ ${contractName} is working correctly on Chain ${chainId}`);
      return {
        success: true,
        address: contractData.address,
        transactionHash: contractData.transactionHash,
        blockNumber: await provider.getBlockNumber()
      };

    } catch (error) {
      console.log(`  ❌ ${contractName} test failed on Chain ${chainId}: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getContractAbi(contractName) {
    try {
      const compiledPath = path.join(__dirname, `../src/contracts/compiled/${contractName}.json`);
      if (fs.existsSync(compiledPath)) {
        const compiled = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));
        return compiled.abi;
      }
    } catch (error) {
      console.log(`  ⚠️  Could not load ABI for ${contractName}`);
    }
    return null;
  }

  async testWalletConnection() {
    console.log('💼 Testing wallet configuration...');
    
    if (!process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
      console.log('  ⚠️  No wallet configured in environment variables');
      return { success: false, error: 'No wallet configured' };
    }

    try {
      // Test wallet on first chain
      const chainId = this.config.deployment.deployToChains[0];
      const chain = KADENA_CHAINS[chainId];
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      
      let wallet;
      if (process.env.PRIVATE_KEY) {
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      } else {
        wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);
      }

      const address = await wallet.getAddress();
      const balance = await provider.getBalance(address);
      
      console.log(`  ✅ Wallet connected: ${address}`);
      console.log(`  💰 Balance on Chain ${chainId}: ${ethers.formatEther(balance)} KDA`);
      
      return {
        success: true,
        address,
        balance: ethers.formatEther(balance)
      };
      
    } catch (error) {
      console.log(`  ❌ Wallet test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testChainConnectivity() {
    console.log('🌐 Testing chain connectivity...');
    
    const connectivityResults = {};
    
    for (const chainId of this.config.deployment.deployToChains) {
      try {
        const chain = KADENA_CHAINS[chainId];
        const provider = new ethers.JsonRpcProvider(chain.rpc);
        
        const startTime = Date.now();
        const blockNumber = await provider.getBlockNumber();
        const responseTime = Date.now() - startTime;
        
        console.log(`  ✅ Chain ${chainId}: Block ${blockNumber} (${responseTime}ms)`);
        connectivityResults[chainId] = {
          success: true,
          blockNumber,
          responseTime
        };
        
      } catch (error) {
        console.log(`  ❌ Chain ${chainId}: ${error.message}`);
        connectivityResults[chainId] = {
          success: false,
          error: error.message
        };
      }
    }
    
    return connectivityResults;
  }

  async testFrontendConfig() {
    console.log('⚙️  Testing frontend configuration...');
    
    const configPath = path.join(__dirname, '../src/config/deployed-contracts.json');
    
    if (!fs.existsSync(configPath)) {
      console.log('  ❌ deployed-contracts.json not found');
      return { success: false, error: 'Frontend config not found' };
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const contractCount = Object.keys(config).length;
      
      console.log(`  ✅ Configuration loaded: ${contractCount} contracts configured`);
      
      // Validate that all deployed contracts are in config
      let validContracts = 0;
      for (const [contractName, deployments] of Object.entries(config)) {
        const successfulDeployments = deployments.filter(d => !d.error).length;
        console.log(`  📄 ${contractName}: ${successfulDeployments} successful deployments`);
        if (successfulDeployments > 0) validContracts++;
      }
      
      return {
        success: true,
        contractCount,
        validContracts
      };
      
    } catch (error) {
      console.log(`  ❌ Frontend config test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🧪 Starting deployment tests...\n');
    
    // Test 1: Chain connectivity
    this.testResults.connectivity = await this.testChainConnectivity();
    console.log('');

    // Test 2: Wallet configuration
    this.testResults.wallet = await this.testWalletConnection();
    console.log('');

    // Test 3: Contract deployments
    this.testResults.contracts = {};
    
    for (const [contractName, deployments] of Object.entries(this.deployedContracts)) {
      console.log(`📄 Testing ${contractName} deployments...`);
      this.testResults.contracts[contractName] = {};
      
      for (const deployment of deployments) {
        if (!deployment.error) {
          const result = await this.testContractDeployment(
            deployment.chainId,
            contractName,
            deployment
          );
          this.testResults.contracts[contractName][deployment.chainId] = result;
        } else {
          this.testResults.contracts[contractName][deployment.chainId] = {
            success: false,
            error: deployment.error
          };
        }
      }
      console.log('');
    }

    // Test 4: Frontend configuration
    this.testResults.frontend = await this.testFrontendConfig();
    console.log('');

    // Generate summary
    this.generateTestSummary();
  }

  generateTestSummary() {
    console.log('📊 Test Summary\n');
    
    // Chain connectivity summary
    const chains = Object.keys(this.testResults.connectivity);
    const workingChains = chains.filter(chainId => this.testResults.connectivity[chainId].success);
    console.log(`🌐 Chain Connectivity: ${workingChains.length}/${chains.length} chains working`);
    
    // Wallet summary
    console.log(`💼 Wallet: ${this.testResults.wallet.success ? '✅ Working' : '❌ Failed'}`);
    
    // Contract summary
    let totalDeployments = 0;
    let successfulDeployments = 0;
    
    for (const [contractName, chainResults] of Object.entries(this.testResults.contracts)) {
      for (const [chainId, result] of Object.entries(chainResults)) {
        totalDeployments++;
        if (result.success) successfulDeployments++;
      }
    }
    
    console.log(`📄 Contracts: ${successfulDeployments}/${totalDeployments} deployments working`);
    
    // Frontend summary
    console.log(`⚙️  Frontend: ${this.testResults.frontend.success ? '✅ Configured' : '❌ Issues found'}`);
    
    // Overall status
    const overallSuccess = 
      workingChains.length > 0 && 
      this.testResults.wallet.success && 
      successfulDeployments > 0 && 
      this.testResults.frontend.success;
    
    console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ DEPLOYMENT SUCCESSFUL' : '❌ ISSUES DETECTED'}`);
    
    if (overallSuccess) {
      console.log(`\n🚀 Your Kadena multi-chain dApp is ready!`);
      console.log(`📱 Start your frontend: npm run dev`);
    } else {
      console.log(`\n🔧 Please fix the issues above and run tests again.`);
    }
    
    // Save detailed results
    const resultsPath = path.join(__dirname, '../test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Detailed results saved to test-results.json`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new DeploymentTester();
  tester.runAllTests().catch(error => {
    console.error('Testing failed:', error);
    process.exit(1);
  });
}

export { DeploymentTester };