#!/usr/bin/env node

/**
 * 🧙‍♂️ Enhanced Kadena Multi-Chain Setup Wizard
 * 
 * This wizard helps developers create Kadena multi-chain applications with:
 * 1. Guided setup based on app type (DeFi, NFT, Gaming, etc.)  
 * 2. Manual setup for custom configurations
 * 3. Dynamic component generation based on complexity
 * 4. Interactive playground creation
 */

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { APP_TYPES, COMPLEXITY_LEVELS, getAppType, getComplexityLevel } from '../src/config/app-types.js';
import { TemplateConfigGenerator } from '../src/config/template-generator.js';

class KadenaSetupWizard {
  constructor() {
    this.config = {};
    this.setupType = null;
    this.templateGenerator = new TemplateConfigGenerator();
  }

  async welcome() {
    console.log(`
🌟 Welcome to the Enhanced Kadena Multi-Chain Template Generator!

This wizard will help you create a customized multi-chain application 
that adapts to your specific use case and complexity needs.

Choose between:
• 🎯 Guided Setup: Get recommendations based on your app type
• ⚙️  Manual Setup: Full control over chain selection and features
`);
  }

  async chooseSetupType() {
    const { setupType } = await inquirer.prompt([{
      type: 'list',
      name: 'setupType',
      message: '🚀 How would you like to set up your project?',
      choices: [
        { name: '🎯 Guided Setup (Recommended for most users)', value: 'guided' },
        { name: '⚙️  Manual Setup (Advanced users)', value: 'manual' }
      ]
    }]);
    
    this.setupType = setupType;
  }

  async runGuidedSetup() {
    console.log('\n🎯 Guided Setup - We\'ll recommend the best configuration for your app type\n');
    
    // Get app type
    const appTypeChoices = Object.keys(APP_TYPES).map(key => ({
      name: `${APP_TYPES[key].icon} ${APP_TYPES[key].name} - ${APP_TYPES[key].description}`,
      value: key
    }));

    const { appType } = await inquirer.prompt([{
      type: 'list',
      name: 'appType',
      message: '🏗️  What type of application are you building?',
      choices: appTypeChoices
    }]);

    // Get project details
    const { projectName, author } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '📝 Project name:',
        default: `kadena-${appType}-app`
      },
      {
        type: 'input',
        name: 'author',
        message: '👤 Author name:',
        default: 'Developer'
      }
    ]);

    // Show recommendation
    const selectedAppType = getAppType(appType);
    const complexity = getComplexityLevel(selectedAppType.complexity);
    
    console.log(`\n📊 Based on your app type, we recommend:
   🔗 Complexity: ${complexity.name}
   ⛓️  Chains: ${selectedAppType.recommendedChains.join(', ')}
   💡 Reasoning: ${selectedAppType.reasoning}
`);

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: '✅ Does this look good?',
      default: true
    }]);

    if (!confirm) {
      console.log('👍 No problem! Let\'s try manual setup instead...');
      await this.runManualSetup();
      return;
    }

    // Generate configuration
    this.config = this.templateGenerator.generateGuidedConfig(appType, projectName, author);
  }

  async runManualSetup() {
    console.log('\n⚙️  Manual Setup - Full control over your configuration\n');
    
    // Select chains
    const availableChains = [20, 21, 22, 23, 24];
    const { selectedChains } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedChains',
      message: '⛓️  Select chains to deploy to:',
      choices: availableChains.map(id => ({
        name: `Chain ${id} (Network ID: ${5920 + id - 20})`,
        value: id
      })),
      validate: input => input.length > 0 ? true : 'Please select at least one chain'
    }]);

    // Select features
    const availableFeatures = [
      'wallet-connection',
      'multi-chain-balances', 
      'cross-chain-transfers',
      'contract-interaction',
      'transaction-history',
      'chain-analytics'
    ];

    const { selectedFeatures } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedFeatures',
      message: '🎯 Select features to include:',
      choices: availableFeatures.map(feature => ({
        name: feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: feature
      })),
      default: ['wallet-connection', 'multi-chain-balances']
    }]);

    // Get project details  
    const { projectName, author, description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '📝 Project name:',
        default: 'kadena-multi-chain-app'
      },
      {
        type: 'input',
        name: 'author',
        message: '👤 Author name:',
        default: 'Developer'
      },
      {
        type: 'input',
        name: 'description',
        message: '📄 Project description:',
        default: 'A custom Kadena multi-chain application'
      }
    ]);

    // Generate configuration
    this.config = this.templateGenerator.generateManualConfig(
      selectedChains,
      selectedFeatures,
      { projectName, author, description }
    );
  }

  async configureWallet() {
    console.log('\n💼 Wallet Configuration\n');
    
    const { walletType } = await inquirer.prompt([{
      type: 'list',
      name: 'walletType',
      message: '🔐 How will you provide wallet credentials?',
      choices: [
        { name: '🔑 Private Key (for development)', value: 'private_key' },
        { name: '🌱 Mnemonic Phrase (more secure)', value: 'mnemonic' },
        { name: '🎩 Zellic X1 Wallet (coming soon)', value: 'x1_wallet' }
      ]
    }]);

    this.config.wallet = { type: walletType };
    
    if (walletType === 'x1_wallet') {
      console.log('ℹ️  X1 Wallet integration coming soon! Using private key for now.');
      this.config.wallet.type = 'private_key';
    }
  }

  async generateComponents() {
    console.log('\n🏗️  Generating React components...');
    
    try {
      // Generate components using the template generator
      await this.templateGenerator.generateComponentFiles('./src');
      
      console.log('   ✅ Generated App.jsx');
      console.log('   ✅ Generated dashboard component');
      console.log('   ✅ Generated complexity-specific components');
      console.log('   🎯 Component generation complete!');
    } catch (error) {
      console.error('⚠️  Component generation failed:', error.message);
      console.log('   You can still run the setup manually after fixing any issues.');
    }
  }

  async saveConfiguration() {
    const configPath = './deployment.config.json';
    
    // Set the config in template generator for component generation
    this.templateGenerator.config = this.config;
    
    // Save configuration file
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    console.log(`\n💾 Configuration saved to ${configPath}`);
  }

  async createEnvTemplate() {
    const envExample = `# 🔐 Kadena Wallet Configuration
# Copy this file to .env and fill in your credentials

# Option 1: Private Key (for development)
PRIVATE_KEY=your_private_key_here

# Option 2: Mnemonic Phrase (more secure)
# MNEMONIC=your twelve word mnemonic phrase here

# 🌐 Network Configuration
KADENA_NETWORK=testnet
KADENA_CHAIN_ID=20

# 🚀 Deployment Settings
GAS_LIMIT=10000
GAS_PRICE=0.000001

# 🎯 Your Selected Chains
DEPLOY_CHAINS=${this.config.deployment.deployToChains.join(',')}
`;

    fs.writeFileSync('.env.example', envExample);
    console.log('📝 Created .env.example template');
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

  async showNextSteps() {
    const complexity = this.config.complexity;
    const chainCount = this.config.deployment.deployToChains.length;
    
    console.log('\n\n🎉 Setup Complete!\n\n' +
      '📊 Configuration Summary:\n' +
      '   🎯 App Type: ' + (this.config.appType === 'custom' ? 'Custom' : this.config.appType) + '\n' +
      '   🔗 Complexity: ' + COMPLEXITY_LEVELS[complexity].name + ' (' + chainCount + ' chain' + (chainCount > 1 ? 's' : '') + ')\n' +
      '   ⛓️  Chains: ' + this.config.deployment.deployToChains.join(', ') + '\n' +
      '   💰 Estimated Cost: ' + this.config.features.estimatedCost + '\n\n' +
      '📋 Next Steps:\n\n' +
      '1. 💼 Set up your wallet:\n' +
      '   Create a .env file with your PRIVATE_KEY or MNEMONIC\n\n' +
      '2. 🚀 Deploy to ' + chainCount + ' chain' + (chainCount > 1 ? 's' : '') + ':\n' +
      '   npm run deploy\n\n' +
      '3. 🎮 Try the interactive playground:\n' +
      '   npm run dev\n\n' +
      '4. 🔨 Add your smart contracts:\n' +
      '   Place your .sol files in src/contracts/\n\n' +
      '5. 🧪 Test everything:\n' +
      '   npm run test-deployment\n\n' +
      '🎯 Your template includes:\n' +
      this.config.frontend.components.map(comp => '   ✅ ' + comp).join('\n') + '\n\n' +
      '🎮 Interactive playground features:\n' +
      this.config.frontend.playground.features.map(feat => '   🎯 ' + feat.replace('-', ' ')).join('\n') + '\n\n' +
      '🆘 Need help? Check README.md for detailed guides and troubleshooting.\n\n' +
      'Happy building on Kadena! 🌟'
    );
  }

  async run() {
    try {
      await this.welcome();
      await this.chooseSetupType();
      
      if (this.setupType === 'guided') {
        await this.runGuidedSetup();
      } else {
        await this.runManualSetup();
      }
      
      await this.configureWallet();
      await this.saveConfiguration();
      await this.generateComponents();
      await this.createEnvTemplate();
      await this.showNextSteps();
    } catch (error) {
      console.error('Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const wizard = new KadenaSetupWizard();
  wizard.run();
}

export { KadenaSetupWizard };