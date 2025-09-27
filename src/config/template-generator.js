/**
 * 🏗️ Template Configuration Generator
 * 
 * This creates different configurations based on user setup choices.
 * Generates the final deployment.config.json with intelligent defaults.
 */

import { APP_TYPES, COMPLEXITY_LEVELS, getAppType, getComplexityLevel } from './app-types.js';
import { generateComponents } from '../utils/component-generator.js';
import { promises as fs } from 'fs';
import path from 'path';

export class TemplateConfigGenerator {
  constructor() {
    this.config = {};
  }

  /**
   * Generate configuration for guided setup
   */
  generateGuidedConfig(appTypeId, projectName, author) {
    const appType = getAppType(appTypeId);
    const complexity = getComplexityLevel(appType.complexity);

    this.config = {
      // Project Information
      projectName: projectName || `My ${appType.name}`,
      description: `A ${appType.description.toLowerCase()} built on Kadena Chainweb EVM`,
      author: author || 'Your Name',
      version: '1.0.0',
      appType: appType.id,
      complexity: appType.complexity,

      // Deployment Configuration
      deployment: {
        deployToChains: appType.recommendedChains,
        gasSettings: this.getOptimalGasSettings(appType.complexity),
        confirmations: this.getConfirmations(appType.complexity)
      },

      // Features Configuration
      features: {
        enabled: appType.features,
        complexity: appType.complexity,
        estimatedCost: appType.estimatedCost
      },

      // Frontend Configuration
      frontend: {
        defaultChain: appType.recommendedChains[0],
        theme: this.getThemeFor(appType.id),
        components: this.getComponentsFor(appType.complexity),
        playground: {
          enabled: true,
          features: this.getPlaygroundFeatures(appType.complexity)
        }
      },

      // Smart Contracts Configuration
      contracts: this.getContractsFor(appType.id),

      // Wallet Configuration
      wallet: {
        requiredNetworks: appType.recommendedChains.map(chain => 5920 + chain - 20),
        autoAddNetworks: true
      }
    };

    return this.config;
  }

  /**
   * Generate configuration for manual setup
   */
  generateManualConfig(selectedChains, selectedFeatures, projectInfo) {
    const complexity = this.determineComplexity(selectedChains.length);

    this.config = {
      // Project Information
      projectName: projectInfo.name || 'My Kadena dApp',
      description: projectInfo.description || 'A multi-chain dApp built on Kadena Chainweb EVM',
      author: projectInfo.author || 'Your Name',
      version: '1.0.0',
      appType: 'custom',
      complexity: complexity,

      // Deployment Configuration
      deployment: {
        deployToChains: selectedChains,
        gasSettings: this.getOptimalGasSettings(complexity),
        confirmations: this.getConfirmations(complexity)
      },

      // Features Configuration
      features: {
        enabled: selectedFeatures,
        complexity: complexity,
        estimatedCost: this.calculateCost(selectedChains.length, selectedFeatures)
      },

      // Frontend Configuration
      frontend: {
        defaultChain: selectedChains[0],
        theme: 'professional',
        components: this.getComponentsFor(complexity),
        playground: {
          enabled: true,
          features: this.getPlaygroundFeatures(complexity)
        }
      },

      // Smart Contracts Configuration
      contracts: this.getContractsFor('custom'),

      // Wallet Configuration
      wallet: {
        requiredNetworks: selectedChains.map(chain => 5920 + chain - 20),
        autoAddNetworks: true
      }
    };

    return this.config;
  }

  /**
   * Get optimal gas settings based on complexity
   */
  getOptimalGasSettings(complexity) {
    const gasSettings = {
      single: { gasLimit: 3000000, gasPrice: '15000000000' },
      dual: { gasLimit: 4000000, gasPrice: '18000000000' },
      triple: { gasLimit: 5000000, gasPrice: '20000000000' },
      quad: { gasLimit: 6000000, gasPrice: '22000000000' },
      full: { gasLimit: 8000000, gasPrice: '25000000000' }
    };

    return gasSettings[complexity] || gasSettings.single;
  }

  /**
   * Get confirmation requirements based on complexity
   */
  getConfirmations(complexity) {
    const confirmations = {
      single: 1,
      dual: 2,
      triple: 2,
      quad: 3,
      full: 3
    };

    return confirmations[complexity] || 2;
  }

  /**
   * Get theme based on app type
   */
  getThemeFor(appTypeId) {
    const themes = {
      'simple-dapp': 'clean',
      'defi-protocol': 'financial',
      'nft-marketplace': 'creative',
      'gaming-platform': 'gaming',
      'dao-governance': 'professional',
      'advanced-multichain': 'enterprise'
    };

    return themes[appTypeId] || 'professional';
  }

  /**
   * Get components based on complexity
   */
  getComponentsFor(complexity) {
    const componentSets = {
      single: ['WalletConnection', 'BalanceDisplay', 'BasicContracts'],
      dual: ['WalletConnection', 'MultiChainBalance', 'CrossChainTransfer', 'ChainComparison'],
      triple: ['WalletConnection', 'MultiChainDashboard', 'CrossChainOperations', 'ChainOptimization', 'ArbitrageDetection'],
      quad: ['WalletConnection', 'AdvancedDashboard', 'CrossChainOperations', 'LiquidityAggregation', 'MEVProtection', 'AdvancedArbitrage'],
      full: ['WalletConnection', 'EcosystemDashboard', 'AIOptimization', 'AdvancedAnalytics', 'CrossChainGovernance', 'ProfessionalTools']
    };

    return componentSets[complexity] || componentSets.single;
  }

  /**
   * Get playground features based on complexity
   */
  getPlaygroundFeatures(complexity) {
    const playgroundFeatures = {
      single: ['wallet-demo', 'balance-demo', 'contract-demo'],
      dual: ['wallet-demo', 'balance-demo', 'transfer-demo', 'comparison-demo'],
      triple: ['wallet-demo', 'balance-demo', 'transfer-demo', 'optimization-demo', 'arbitrage-demo'],
      quad: ['wallet-demo', 'balance-demo', 'transfer-demo', 'optimization-demo', 'arbitrage-demo', 'liquidity-demo'],
      full: ['all-demos', 'ai-demo', 'analytics-demo', 'governance-demo', 'professional-tools']
    };

    return playgroundFeatures[complexity] || playgroundFeatures.single;
  }

  /**
   * Get contracts based on app type
   */
  getContractsFor(appTypeId) {
    const contractSets = {
      'simple-dapp': {
        'SimpleStorage': {
          constructorArgs: [],
          deployToChains: 'all',
          verify: true
        }
      },
      'defi-protocol': {
        'MultiChainToken': {
          constructorArgs: ['MyToken', 'MTK', 18],
          deployToChains: 'all',
          verify: true
        },
        'CrossChainDEX': {
          constructorArgs: [],
          deployToChains: 'all',
          verify: true
        }
      },
      'nft-marketplace': {
        'MultiChainNFT': {
          constructorArgs: ['MyNFT', 'MNFT'],
          deployToChains: 'all',
          verify: true
        },
        'NFTMarketplace': {
          constructorArgs: [],
          deployToChains: 'all',
          verify: true
        }
      },
      'gaming-platform': {
        'GameItems': {
          constructorArgs: ['GameItems', 'ITEMS'],
          deployToChains: 'all',
          verify: true
        },
        'PlayerRewards': {
          constructorArgs: [],
          deployToChains: 'all',
          verify: true
        }
      },
      'dao-governance': {
        'GovernanceToken': {
          constructorArgs: ['DAO Token', 'DAO'],
          deployToChains: 'all',
          verify: true
        },
        'CrossChainGovernance': {
          constructorArgs: [],
          deployToChains: 'all',
          verify: true
        }
      },
      'advanced-multichain': {
        'MultiChainProtocol': {
          constructorArgs: [],
          deployToChains: 'all',
          verify: true
        }
      },
      'custom': {
        'SimpleStorage': {
          constructorArgs: [],
          deployToChains: 'all',
          verify: true
        }
      }
    };

    return contractSets[appTypeId] || contractSets.custom;
  }

  /**
   * Determine complexity based on chain count
   */
  determineComplexity(chainCount) {
    if (chainCount === 1) return 'single';
    if (chainCount === 2) return 'dual';
    if (chainCount === 3) return 'triple';
    if (chainCount === 4) return 'quad';
    return 'full';
  }

  /**
   * Calculate estimated cost
   */
  calculateCost(chainCount, features) {
    const baseCost = chainCount * 15;
    const featureCost = features.length * 5;
    const total = baseCost + featureCost;

    return `$${total}-${total * 2}/month`;
  }

  /**
   * Save configuration to file
   */
  saveConfig(filePath) {
    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(this.config, null, 2));
    return this.config;
  }

  /**
   * Generate React components based on configuration
   */
  async generateComponentFiles(outputDir = './src') {
    const components = generateComponents(this.config);
    
    // Ensure components directory exists
    const componentsDir = path.join(outputDir, 'components');
    await fs.mkdir(componentsDir, { recursive: true });
    
    // Generate App.jsx
    await fs.writeFile(
      path.join(outputDir, 'App.jsx'), 
      components.app
    );
    
    // Generate Dashboard component
    const dashboardName = this.getDashboardFileName();
    await fs.writeFile(
      path.join(componentsDir, `${dashboardName}.jsx`), 
      components.dashboard
    );
    
    // Generate additional components based on complexity
    await this.generateComplexityComponents(componentsDir);
    
    console.log(`✅ Generated components for ${this.config.complexity} chain complexity`);
    return { componentsDir, files: [dashboardName] };
  }

  getDashboardFileName() {
    const names = {
      single: 'SingleChainDashboard',
      dual: 'DualChainDashboard', 
      triple: 'TripleChainDashboard',
      quad: 'QuadChainDashboard',
      full: 'FullEcosystemDashboard'
    };
    return names[this.config.complexity] || 'Dashboard';
  }

  async generateComplexityComponents(componentsDir) {
    const templates = this.getComplexityTemplates();
    
    for (const [filename, content] of Object.entries(templates)) {
      await fs.writeFile(
        path.join(componentsDir, `${filename}.jsx`),
        content
      );
    }
  }

  getComplexityTemplates() {
    const baseTemplate = (name, description, features) => `import React from 'react';

function ${name}({ chains }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">${description}</h2>
      <div className="space-y-4">
        ${features.map(feature => `        <div className="p-3 bg-gray-700 rounded">
          <h3 className="font-medium">${feature.title}</h3>
          <p className="text-sm text-gray-400">${feature.description}</p>
        </div>`).join('\n')}
      </div>
    </div>
  );
}

export default ${name};`;

    switch (this.config.complexity) {
      case 'single':
        return {
          'WalletConnection': this.generateWalletConnection(),
          'BasicContractInterface': baseTemplate('BasicContractInterface', 'Contract Interface', [
            { title: 'Read Contract', description: 'View contract state and data' },
            { title: 'Write Contract', description: 'Execute contract functions' }
          ])
        };
        
      case 'dual':
        return {
          'WalletConnection': this.generateWalletConnection(),
          'CrossChainTransfer': baseTemplate('CrossChainTransfer', 'Cross-Chain Transfer', [
            { title: 'Transfer Tokens', description: 'Move assets between chains' },
            { title: 'Transaction History', description: 'View cross-chain transactions' }
          ]),
          'ChainComparison': baseTemplate('ChainComparison', 'Chain Comparison', [
            { title: 'Gas Fees', description: 'Compare transaction costs' },
            { title: 'Performance', description: 'Chain speed and throughput' }
          ])
        };
        
      case 'triple':
        return {
          'WalletConnection': this.generateWalletConnection(),
          'CrossChainOperations': baseTemplate('CrossChainOperations', 'Cross-Chain Operations', [
            { title: 'Multi-Chain Swaps', description: 'Exchange tokens across chains' },
            { title: 'Liquidity Mining', description: 'Earn rewards across chains' }
          ]),
          'ChainOptimization': baseTemplate('ChainOptimization', 'Chain Optimization', [
            { title: 'Route Optimization', description: 'Find best execution paths' },
            { title: 'Cost Analysis', description: 'Minimize transaction fees' }
          ]),
          'ArbitrageDetection': baseTemplate('ArbitrageDetection', 'Arbitrage Detection', [
            { title: 'Price Differences', description: 'Identify profitable opportunities' },
            { title: 'Execution Strategy', description: 'Automated arbitrage execution' }
          ])
        };
        
      case 'quad':
        return {
          'WalletConnection': this.generateWalletConnection(),
          'AdvancedCrossChain': baseTemplate('AdvancedCrossChain', 'Advanced Cross-Chain', [
            { title: 'Flash Loans', description: 'Cross-chain flash loan opportunities' },
            { title: 'Yield Farming', description: 'Multi-chain yield optimization' }
          ]),
          'LiquidityAggregation': baseTemplate('LiquidityAggregation', 'Liquidity Aggregation', [
            { title: 'Pool Aggregation', description: 'Combine liquidity across chains' },
            { title: 'Optimal Routing', description: 'Best execution across DEXs' }
          ]),
          'MEVProtection': baseTemplate('MEVProtection', 'MEV Protection', [
            { title: 'Front-Running Protection', description: 'Protect against MEV attacks' },
            { title: 'Private Mempool', description: 'Submit transactions privately' }
          ])
        };
        
      case 'full':
        return {
          'WalletConnection': this.generateWalletConnection(),
          'AIOptimization': baseTemplate('AIOptimization', 'AI Optimization', [
            { title: 'Machine Learning', description: 'AI-powered trade optimization' },
            { title: 'Predictive Analytics', description: 'Market trend prediction' }
          ]),
          'AdvancedAnalytics': baseTemplate('AdvancedAnalytics', 'Advanced Analytics', [
            { title: 'Portfolio Analytics', description: 'Comprehensive portfolio analysis' },
            { title: 'Risk Management', description: 'Advanced risk assessment tools' }
          ]),
          'CrossChainGovernance': baseTemplate('CrossChainGovernance', 'Cross-Chain Governance', [
            { title: 'DAO Voting', description: 'Participate in cross-chain governance' },
            { title: 'Proposal Creation', description: 'Create and manage proposals' }
          ])
        };
        
      default:
        return {
          'WalletConnection': this.generateWalletConnection()
        };
    }
  }

  generateWalletConnection() {
    return `import React from 'react';
import { useKadenaWallet } from '../hooks/useKadena';

function WalletConnection() {
  const { isConnected, address, connect, disconnect } = useKadenaWallet();

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Wallet Connection</h2>
      
      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-400 mb-4">Connect your Kadena wallet to get started</p>
          <button
            onClick={connect}
            className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-400 font-medium">✅ Wallet Connected</p>
            <p className="text-sm text-gray-400 font-mono">
              {address.slice(0, 8)}...{address.slice(-6)}
            </p>
          </div>
          <button
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export default WalletConnection;`;
  }
}

/**
 * Quick helper functions for setup wizard
 */
export function createGuidedConfig(appTypeId, projectName, author) {
  const generator = new TemplateConfigGenerator();
  return generator.generateGuidedConfig(appTypeId, projectName, author);
}

export function createManualConfig(selectedChains, selectedFeatures, projectInfo) {
  const generator = new TemplateConfigGenerator();
  return generator.generateManualConfig(selectedChains, selectedFeatures, projectInfo);
}