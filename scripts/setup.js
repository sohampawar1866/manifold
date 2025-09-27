#!/usr/bin/env node

/**
 * 🛠️ Kadena Template Setup Wizard
 * 
 * Interactive CLI that helps developers:
 * 1. Clone and customize the template
 * 2. Configure their project settings
 * 3. Set up wallet and environment
 * 4. Deploy their first contracts
 */

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class KadenaSetupWizard {
  constructor() {
    this.config = {};
  }

  async welcome() {
    console.log(`
🌟 Welcome to Kadena Multi-Chain dApp Template Setup!

This wizard will help you:
✅ Configure your project settings
✅ Set up wallet connection
✅ Choose which chains to deploy to
✅ Configure your smart contracts
✅ Deploy everything with one command

Let's get started! 🚀
`);
  }

  async gatherProjectInfo() {
    console.log('📝 Project Information\n');
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        default: 'My Kadena dApp',
        validate: input => input.length > 0 || 'Project name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: 'A multi-chain dApp built on Kadena Chainweb EVM'
      },
      {
        type: 'input',
        name: 'author',
        message: 'Your name/organization:',
        default: 'Your Name'
      }
    ]);

    this.config = { ...this.config, ...answers };
  }

  async selectChains() {
    console.log('\n🔗 Chain Selection\n');
    
    const { deployToChains } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'deployToChains',
        message: 'Which Kadena chains do you want to deploy to?',
        choices: [
          { name: 'Chain 20 (Primary)', value: 20, checked: true },
          { name: 'Chain 21', value: 21, checked: true },
          { name: 'Chain 22', value: 22, checked: true },
          { name: 'Chain 23', value: 23, checked: true },
          { name: 'Chain 24', value: 24, checked: true }
        ],
        validate: input => input.length > 0 || 'Select at least one chain'
      }
    ]);

    this.config.deployment = {
      deployToChains,
      gasSettings: {
        gasLimit: 5000000,
        gasPrice: "20000000000"
      },
      confirmations: 2
    };
  }

  async configureWallet() {
    console.log('\n💼 Wallet Configuration\n');
    
    const { walletSetup } = await inquirer.prompt([
      {
        type: 'list',
        name: 'walletSetup',
        message: 'How do you want to set up your wallet?',
        choices: [
          { name: 'I\'ll provide my private key via environment variable', value: 'private_key' },
          { name: 'I\'ll provide my mnemonic phrase via environment variable', value: 'mnemonic' },
          { name: 'I\'ll set it up later', value: 'later' }
        ]
      }
    ]);

    if (walletSetup !== 'later') {
      console.log(`
⚠️  IMPORTANT: For security, never commit your private key or mnemonic to git!

Create a .env file in your project root with:
${walletSetup === 'private_key' ? 'PRIVATE_KEY=your_private_key_here' : 'MNEMONIC=your_mnemonic_phrase_here'}

The .env file is already in .gitignore for your safety.
`);
    }

    this.config.wallet = {
      requiredNetworks: this.config.deployment.deployToChains.map(chain => 5920 + chain - 20),
      autoAddNetworks: true
    };
  }

  async configureContracts() {
    console.log('\n📄 Smart Contract Configuration\n');
    
    const contractsDir = path.join(__dirname, '../src/contracts');
    let contractFiles = [];
    
    if (fs.existsSync(contractsDir)) {
      contractFiles = fs.readdirSync(contractsDir)
        .filter(file => file.endsWith('.sol') || file.endsWith('.json'));
    }

    if (contractFiles.length === 0) {
      console.log('ℹ️  No contracts found. You can add them later to src/contracts/');
      this.config.contracts = {};
      return;
    }

    console.log(`Found contracts: ${contractFiles.join(', ')}`);
    
    const { enabledFeatures } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'enabledFeatures',
        message: 'Which features do you want to enable in your frontend?',
        choices: [
          { name: 'Cross-chain transfers', value: 'crossChainTransfers', checked: true },
          { name: 'Multi-chain balance display', value: 'multiChainBalances', checked: true },
          { name: 'Contract interaction UI', value: 'contractInteraction', checked: true }
        ]
      }
    ]);

    this.config.frontend = {
      defaultChain: this.config.deployment.deployToChains[0],
      enabledFeatures: {
        crossChainTransfers: enabledFeatures.includes('crossChainTransfers'),
        multiChainBalances: enabledFeatures.includes('multiChainBalances'),
        contractInteraction: enabledFeatures.includes('contractInteraction')
      }
    };

    // For now, set up default contract config
    this.config.contracts = {};
    contractFiles.forEach(file => {
      const contractName = path.basename(file, path.extname(file));
      this.config.contracts[contractName] = {
        constructorArgs: [],
        deployToChains: this.config.deployment.deployToChains,
        verify: true
      };
    });
  }

  async saveConfiguration() {
    const configPath = path.join(__dirname, '../deployment.config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    console.log('✅ Configuration saved to deployment.config.json');
  }

  async createEnvTemplate() {
    const envPath = path.join(__dirname, '../.env.example');
    const envContent = `# Kadena Multi-Chain dApp Environment Variables
# Copy this file to .env and fill in your values

# Wallet Configuration (choose one)
# PRIVATE_KEY=your_private_key_here
# MNEMONIC=your_mnemonic_phrase_here

# Optional: Custom RPC endpoints
# KADENA_CHAIN_20_RPC=https://your-custom-rpc.com
# KADENA_CHAIN_21_RPC=https://your-custom-rpc.com

# Optional: Deployment settings
# GAS_LIMIT=5000000
# GAS_PRICE=20000000000
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.example template');
  }

  async showNextSteps() {
    console.log(`
🎉 Setup Complete! Your Kadena multi-chain dApp is configured.

📋 Next Steps:

1. 💼 Set up your wallet:
   Create a .env file with your PRIVATE_KEY or MNEMONIC

2. 🔨 Add your smart contracts:
   Place your .sol files in src/contracts/

3. 📦 Compile contracts (if needed):
   npm run compile-contracts

4. 🚀 Deploy to all chains:
   npm run deploy

5. 🧪 Test your deployment:
   npm run test-deployment

6. 💻 Start development:
   npm run dev

🆘 Need help? Check README.md for detailed guides and troubleshooting.

Happy building on Kadena! 🌟
`);
  }

  async run() {
    try {
      await this.welcome();
      await this.gatherProjectInfo();
      await this.selectChains();
      await this.configureWallet();
      await this.configureContracts();
      await this.saveConfiguration();
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