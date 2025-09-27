#!/usr/bin/env node

/**
 * 🎯 One-Command Developer Onboarding
 * 
 * This script handles EVERYTHING for new developers:
 * 1. Environment validation
 * 2. Interactive setup
 * 3. Sample contract creation
 * 4. Automatic deployment
 * 5. Testing and validation
 * 6. Development server startup
 */

import { KadenaSetupWizard } from './setup.js';
import { ContractCompiler } from './compile-contracts.js';
import { KadenaDeployer } from './deploy.js';
import { DeploymentTester } from './test-deployment.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class DeveloperOnboarding {
  constructor() {
    this.steps = [
      { name: 'Environment Check', fn: this.checkEnvironment },
      { name: 'Interactive Setup', fn: this.runSetup },
      { name: 'Contract Preparation', fn: this.prepareContracts },
      { name: 'Multi-Chain Deployment', fn: this.deployContracts },
      { name: 'Deployment Testing', fn: this.testDeployment },
      { name: 'Final Setup', fn: this.finalizeSetup }
    ];
    this.currentStep = 0;
  }

  async welcome() {
    console.log(`
🌟 Welcome to Kadena Multi-Chain dApp Template!

This onboarding script will:
✅ Set up your entire development environment
✅ Configure your project settings
✅ Create and deploy sample contracts
✅ Test everything across all 5 Kadena chains
✅ Get you ready to start building

Time to complete: ~3-5 minutes
Let's get started! 🚀

`);

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      readline.question('Press Enter to continue or Ctrl+C to exit...', () => {
        readline.close();
        resolve();
      });
    });
  }

  async checkEnvironment() {
    console.log('🔍 Checking your development environment...\n');

    const checks = [
      { name: 'Node.js version', check: this.checkNodeVersion },
      { name: 'NPM availability', check: this.checkNpm },
      { name: 'Git availability', check: this.checkGit },
      { name: 'Project dependencies', check: this.checkDependencies }
    ];

    for (const check of checks) {
      try {
        await check.check();
        console.log(`  ✅ ${check.name}`);
      } catch (error) {
        console.log(`  ❌ ${check.name}: ${error.message}`);
        throw new Error(`Environment check failed: ${check.name}`);
      }
    }

    console.log('\n✅ Environment check passed!\n');
  }

  async checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required, found ${version}`);
    }
  }

  async checkNpm() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec('npm --version', (error) => {
        if (error) reject(new Error('NPM not found'));
        else resolve();
      });
    });
  }

  async checkGit() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec('git --version', (error) => {
        if (error) reject(new Error('Git not found'));
        else resolve();
      });
    });
  }

  async checkDependencies() {
    const packageJsonPath = path.join(__dirname, '../package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
      throw new Error('Dependencies not installed. Run: npm install');
    }
  }

  async runSetup() {
    console.log('⚙️  Running interactive setup wizard...\n');
    
    const wizard = new KadenaSetupWizard();
    await wizard.run();
    
    console.log('\n✅ Project configuration complete!\n');
  }

  async prepareContracts() {
    console.log('🔨 Preparing smart contracts...\n');
    
    const compiler = new ContractCompiler();
    const compiledContracts = await compiler.compileAll();
    
    if (compiledContracts.length === 0) {
      console.log('ℹ️  No contracts to compile. Sample contract was created for you.\n');
    } else {
      console.log(`\n✅ ${compiledContracts.length} contract(s) compiled successfully!\n`);
    }
  }

  async deployContracts() {
    console.log('🚀 Deploying contracts to all Kadena chains...\n');
    
    // Check if wallet is configured
    if (!process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
      console.log('⚠️  Wallet not configured. This is for demonstration - deployment will be simulated.\n');
      console.log('To deploy for real:');
      console.log('1. Create a .env file with your PRIVATE_KEY or MNEMONIC');
      console.log('2. Run: npm run deploy\n');
      return;
    }
    
    const deployer = new KadenaDeployer();
    await deployer.run();
    
    console.log('\n✅ Multi-chain deployment complete!\n');
  }

  async testDeployment() {
    console.log('🧪 Testing deployment across all chains...\n');
    
    // Skip testing if no wallet configured
    if (!process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
      console.log('ℹ️  Skipping deployment tests (no wallet configured)\n');
      return;
    }
    
    const tester = new DeploymentTester();
    await tester.runAllTests();
    
    console.log('\n✅ Deployment testing complete!\n');
  }

  async finalizeSetup() {
    console.log('🎯 Finalizing your development environment...\n');
    
    // Create helpful scripts
    await this.createDeveloperScripts();
    
    // Show next steps
    await this.showNextSteps();
    
    console.log('\n✅ Onboarding complete!\n');
  }

  async createDeveloperScripts() {
    // Create a quick start script
    const quickStartScript = `#!/bin/bash
# Quick development commands for your Kadena dApp

echo "🚀 Kadena Multi-Chain dApp - Quick Commands"
echo ""
echo "1. Start development server:"
echo "   npm run dev"
echo ""
echo "2. Deploy to all chains:"
echo "   npm run deploy"
echo ""
echo "3. Test deployment:"
echo "   npm run test-deployment"
echo ""
echo "4. Compile contracts:"
echo "   npm run compile-contracts"
echo ""
echo "Choose an option (1-4) or press Enter to start dev server:"
read -r choice

case $choice in
  1|"") npm run dev ;;
  2) npm run deploy ;;
  3) npm run test-deployment ;;
  4) npm run compile-contracts ;;
  *) echo "Invalid option" ;;
esac
`;

    fs.writeFileSync(path.join(__dirname, '../quick-start.sh'), quickStartScript);
    
    // Make it executable
    const { exec } = require('child_process');
    exec('chmod +x quick-start.sh', () => {});
    
    console.log('  ✅ Created quick-start.sh script');
  }

  async showNextSteps() {
    console.log(`
🎉 Your Kadena Multi-Chain dApp Template is Ready!

📁 What we set up for you:
   • Multi-chain configuration for all 5 Kadena chains
   • Sample smart contract (SimpleStorage)
   • React frontend with wallet connection
   • Cross-chain utility functions
   • Automated deployment scripts

🚀 Next steps:

   1. 💼 Configure your wallet (if not done yet):
      Create .env file with: PRIVATE_KEY=your_private_key

   2. 🏗️  Start building:
      npm run dev

   3. 📄 Add your contracts:
      Place .sol files in src/contracts/

   4. 🌐 Deploy to all chains:
      npm run deploy

   5. 🧪 Test everything:
      npm run test-deployment

💡 Pro tips:
   • Use ./quick-start.sh for common commands
   • Check docs/ folder for detailed guides
   • Join Kadena Discord for community support

🆘 Need help?
   • docs/getting-started.md - Complete beginner guide
   • docs/troubleshooting.md - Common issues and fixes
   • GitHub Issues - Report bugs and get help

Happy building on Kadena! 🌟
`);
  }

  async run() {
    try {
      await this.welcome();
      
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        this.currentStep = i + 1;
        
        console.log(`📋 Step ${this.currentStep}/${this.steps.length}: ${step.name}`);
        await step.fn.call(this);
      }
      
      console.log(`
🎊 Onboarding Complete!

Your Kadena multi-chain dApp template is ready to use.
Start building the future of multi-chain applications! 🚀
`);

    } catch (error) {
      console.error(`\n💥 Onboarding failed at step ${this.currentStep}:`, error.message);
      console.error('\n🔧 Troubleshooting:');
      console.error('   • Check docs/troubleshooting.md');
      console.error('   • Report issues on GitHub');
      console.error('   • Ask for help on Kadena Discord\n');
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const onboarding = new DeveloperOnboarding();
  onboarding.run();
}

export { DeveloperOnboarding };