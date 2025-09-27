# 🌟 Kadena Multi-Chain dApp Template

**The easiest way to build and deploy multi-chain dApps on Kadena Chainweb EVM**

Deploy your dApp to all 5 Kadena chains with **one command**. No complex setup, no manual configuration.

## ⚡ Quick Start (30 seconds)

```bash
# 1. Clone the template
git clone https://github.com/sohampawar1866/manifold.git my-kadena-app
cd my-kadena-app
npm install

# 2. Interactive setup wizard
npm run setup

# 3. Add your wallet to .env file
echo "PRIVATE_KEY=your_private_key_here" > .env

# 4. Deploy to all 5 chains automatically
npm run deploy

# 5. Start building!
npm run dev
```

**That's it! Your dApp is live on all Kadena chains.** 🚀

## 🎯 What Makes This Special

- **🚀 One-Command Deployment**: Deploy to all 5 chains simultaneously
- **🛠️ Interactive Setup**: Wizard guides you through configuration
- **🔄 Cross-Chain Ready**: Built-in cross-chain transfer functions
- **⚡ Parallel Processing**: Leverage Kadena's unique multi-chain architecture
- **📱 Modern Stack**: React + Vite + TailwindCSS + Ethers.js
- **🧪 Testing Included**: Automated deployment verification

## 📖 Documentation

### For Beginners
- [🚀 Getting Started Guide](./docs/getting-started.md) - Your first Kadena dApp in 5 minutes
- [💼 Wallet Setup](./docs/wallet-setup.md) - Configure MetaMask for Kadena chains
- [🔧 Environment Setup](./docs/environment.md) - Development environment guide

### For Developers  
- [📋 Deployment Guide](./docs/deployment.md) - Deploy and manage your contracts
- [🔗 Cross-Chain Features](./docs/cross-chain.md) - Use cross-chain functions
- [🎨 Customization](./docs/customization.md) - Customize for your needs
- [🧪 Testing](./docs/testing.md) - Test your multi-chain dApp

### Advanced
- [⚙️ Configuration Reference](./docs/configuration.md) - All config options
- [🔍 Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
- [🏗️ Architecture](./docs/architecture.md) - How it all works

## 🛠️ Available Commands

```bash
npm run setup              # Interactive setup wizard
npm run deploy             # Deploy to all configured chains
npm run test-deployment    # Verify your deployment works
npm run compile-contracts  # Compile Solidity contracts
npm run dev               # Start development server
npm run build             # Build for production
```

## 🌐 Supported Chains

Pre-configured for all Kadena Chainweb EVM testnet chains:

| Chain | Chain ID | RPC Endpoint | Block Explorer |
|-------|----------|--------------|----------------|
| Chain 20 | 5920 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc` | [Explorer](http://chain-20.evm-testnet-blockscout.chainweb.com/) |
| Chain 21 | 5921 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc` | [Explorer](http://chain-21.evm-testnet-blockscout.chainweb.com/) |
| Chain 22 | 5922 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/22/evm/rpc` | [Explorer](http://chain-22.evm-testnet-blockscout.chainweb.com/) |
| Chain 23 | 5923 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc` | [Explorer](http://chain-23.evm-testnet-blockscout.chainweb.com/) |
| Chain 24 | 5924 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc` | [Explorer](http://chain-24.evm-testnet-blockscout.chainweb.com/) |

## 🏗️ Project Structure

```
my-kadena-app/
├── src/
│   ├── components/          # React components
│   │   ├── AdvancedOperations.jsx
│   │   └── MultiChainDashboard.jsx
│   ├── contracts/           # Your smart contracts (add here)
│   ├── hooks/              # Custom React hooks
│   │   └── useKadena.js    # Wallet & multi-chain hooks
│   ├── kadena/             # Core Kadena functionality
│   │   ├── client.js       # Wallet connection
│   │   ├── config.js       # Chain configurations
│   │   └── utils.js        # Cross-chain utilities
│   └── config/             # Generated config files
├── scripts/                # Automation scripts
│   ├── deploy.js           # Multi-chain deployment
│   ├── setup.js            # Interactive setup wizard
│   └── test-deployment.js  # Deployment testing
├── docs/                   # Documentation
└── deployment.config.json  # Your project configuration
```

## � Ready-Made Features

### Cross-Chain Transfers
```javascript
import { crossChainTransfer } from './src/kadena/utils.js';

// Transfer 5 KDA from Chain 20 to Chain 21
const result = await crossChainTransfer(20, 21, '5.0', recipientAddress);
```

### Multi-Chain Balances
```javascript
import { useMultiChainBalances } from './src/hooks/useKadena.js';

function MyComponent() {
  const { balances, loading } = useMultiChainBalances(userAddress);
  // balances = { 20: '10.5', 21: '7.2', 22: '15.0', ... }
}
```

### Wallet Connection
```javascript
import { useKadenaWallet } from './src/hooks/useKadena.js';

function MyComponent() {
  const { connect, isConnected, address } = useKadenaWallet();
  
  return (
    <button onClick={connect}>
      {isConnected ? `Connected: ${address}` : 'Connect Wallet'}
    </button>
  );
}
```

## 🏆 Built for "$2,500 Best Multichain Build on Chainweb" Prize

This template showcases Kadena's unique parallel processing capabilities across multiple chains, making it perfect for:

- **DeFi Protocols**: Multi-chain liquidity pools and farming
- **NFT Marketplaces**: Cross-chain NFT trading
- **Gaming**: Multi-chain game economies
- **DAO Governance**: Distributed voting across chains

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Need Help?

- 📖 [Full Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/sohampawar1866/manifold/issues)
- 💬 [Discord Community](https://discord.gg/kadena)
- 🐦 [Follow on Twitter](https://twitter.com/kadena_io)

---

**Happy building on Kadena! 🌟**

*Made with ❤️ for the Kadena developer community*

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
