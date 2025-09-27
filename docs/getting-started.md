# 🚀 Getting Started with Kadena Multi-Chain Template

Welcome! This guide will help you build and deploy your first multi-chain dApp on Kadena in just 5 minutes.

## 📋 Prerequisites

- **Node.js** 18+ installed
- **Git** for cloning the repository
- **MetaMask** or any EVM-compatible wallet
- Basic knowledge of React and JavaScript

## ⚡ 5-Minute Quick Start

### Step 1: Clone and Setup (1 minute)

```bash
# Clone the template
git clone https://github.com/sohampawar1866/manifold.git my-kadena-app
cd my-kadena-app

# Install dependencies
npm install
```

### Step 2: Interactive Configuration (2 minutes)

```bash
# Run the setup wizard
npm run setup
```

The wizard will ask you:
- Project name and description
- Which chains to deploy to (default: all 5 chains)
- Wallet configuration method
- Frontend features to enable

**Pro tip:** Just hit Enter to accept defaults for your first deployment!

### Step 3: Configure Your Wallet (1 minute)

Create a `.env` file in your project root:

```bash
# Option 1: Use private key
PRIVATE_KEY=your_private_key_here

# Option 2: Use mnemonic phrase
MNEMONIC=your twelve word mnemonic phrase here
```

**⚠️ Security Note:** The `.env` file is already in `.gitignore` - never commit your private keys!

### Step 4: Deploy to All Chains (1 minute)

```bash
# Deploy your contracts to all 5 Kadena chains
npm run deploy
```

This will:
- ✅ Compile your smart contracts
- ✅ Deploy to all selected chains simultaneously
- ✅ Update frontend configuration
- ✅ Verify all deployments

### Step 5: Start Building! (30 seconds)

```bash
# Start your development server
npm run dev
```

Visit `http://localhost:5173` and see your multi-chain dApp running!

## 🎉 Congratulations!

You now have a working multi-chain dApp deployed on Kadena! 

## 🔍 What Just Happened?

Your template is now configured with:

1. **Smart Contracts**: Deployed to all selected Kadena chains
2. **Frontend**: React app with multi-chain wallet connection
3. **Cross-Chain Utils**: Ready-made functions for cross-chain operations
4. **Configuration**: All chain settings automatically configured

## 🎯 Next Steps

### Add Your Own Smart Contract

1. Create a new `.sol` file in `src/contracts/`:

```solidity
// src/contracts/MyToken.sol
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "My Token";
    // ... your contract code
}
```

2. Compile and deploy:

```bash
npm run compile-contracts
npm run deploy
```

### Customize Your Frontend

Edit `src/App.jsx` to build your custom UI:

```javascript
import { useKadenaWallet, useMultiChainBalances } from './hooks/useKadena.js';

function MyApp() {
  const { connect, isConnected, address } = useKadenaWallet();
  const { balances } = useMultiChainBalances(address);
  
  // Your custom UI here
}
```

### Use Cross-Chain Features

```javascript
import { crossChainTransfer } from './kadena/utils.js';

// Transfer tokens between chains
const result = await crossChainTransfer(20, 21, '5.0', recipientAddress);
```

## 🆘 Need Help?

- **❓ Questions**: Check our [FAQ](./faq.md)
- **🐛 Issues**: See [Troubleshooting Guide](./troubleshooting.md)
- **📖 Deep Dive**: Read [Architecture Guide](./architecture.md)
- **💬 Community**: Join [Kadena Discord](https://discord.gg/kadena)

## 🎊 You're Ready!

Your Kadena multi-chain dApp template is set up and ready. Start building amazing multi-chain experiences!

---

**Next:** [Deployment Guide](./deployment.md) | [Customization Guide](./customization.md)