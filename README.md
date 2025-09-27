# 🚀 Manifold - Kadena Chainweb EVM Function Generator

A **Swagger-style interactive platform** that generates ready-to-use multi-chain functions for **Kadena Chainweb EVM** based on developer's chain selection and use case.

## 🎯 What is Manifold?

Manifold is a **development tool generator** that creates custom multi-chain applications for Kadena's Chainweb EVM layer. It's NOT a DeFi protocol - it's a tool that helps developers build on Kadena's Ethereum-compatible chains.

## 🌟 Key Features

- **Terminal-based Setup**: No web UI configuration - everything happens in the terminal
- **Use Case Driven**: Optimized function generation based on DeFi, Gaming, NFT, Bridge, or Custom needs
- **Chain Selection**: Choose 1-5 chains from Kadena Chainweb EVM (Chains 20-24)
- **Function Generation**: Creates ready-to-use Ethereum-compatible functions
- **Swagger-style UI**: Interactive function explorer with live testing capabilities
- **Copy-Paste Ready**: Generated code you can immediately use in your projects

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/sohampawar1866/manifold
cd manifold
npm install
```

### 2. Run Setup Wizard
```bash
npm run setup
```

The setup wizard will ask you:
- **Use Case**: DeFi Protocol, Gaming Platform, NFT Marketplace, Cross-chain Bridge, or Custom
- **Chain Count**: How many chains (1-5) you want to work with
- **Function Selection**: Recommended (auto-select) or Manual selection
- **Confirmation**: Generate your custom application

### 3. Launch Your Generated App
```bash
cd gen_manifold
npm install
npm run dev
```

Your Swagger-style function explorer will be available at `http://localhost:5173`

## 🌐 Supported Chains (Chainweb EVM Testnet)

| Chain | Chain ID | RPC Endpoint | Block Explorer |
|-------|----------|--------------|----------------|
| Chain 20 | 5920 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc` | [Explorer](http://chain-20.evm-testnet-blockscout.chainweb.com/) |
| Chain 21 | 5921 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc` | [Explorer](http://chain-21.evm-testnet-blockscout.chainweb.com/) |
| Chain 22 | 5922 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/22/evm/rpc` | [Explorer](http://chain-22.evm-testnet-blockscout.chainweb.com/) |
| Chain 23 | 5923 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc` | [Explorer](http://chain-23.evm-testnet-blockscout.chainweb.com/) |
| Chain 24 | 5924 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc` | [Explorer](http://chain-24.evm-testnet-blockscout.chainweb.com/) |

**Currency**: KDA (for all chains)

## 🎯 Generated Functions by Use Case

### Core Functions (Always Available)
- `crossChainTransfer()` - Transfer tokens between chains
- `multiChainDeploy()` - Deploy contracts across multiple chains  
- `getChainBalances()` - Get KDA balances across all chains

### DeFi-Specific Functions
- `addLiquidityMultiChain()` - Add liquidity across chains
- `executeArbitrage()` - Execute arbitrage opportunities
- `crossChainYieldFarm()` - Yield farming operations
- `multiChainLending()` - Multi-chain lending operations

### Gaming Functions
- `crossChainAssetTransfer()` - Transfer gaming assets
- `multiChainTournament()` - Tournament management
- `crossChainLeaderboard()` - Leaderboard synchronization

### NFT Functions  
- `crossChainNFTBridge()` - Bridge NFTs between chains
- `multiChainMarketplace()` - NFT marketplace operations
- `crossChainRoyalties()` - Royalty distribution

### Bridge Functions
- `initiateBridge()` - Start bridge operations
- `verifyBridgeTransaction()` - Verify transactions
- `handleBridgeCallback()` - Handle completion

## 🏗️ Architecture

```
Manifold Repository (Development Tool)
├── 📁 src/                    # Development interface (shows setup instructions)
├── 📁 scripts/
│   └── setup.cjs             # Terminal-based setup wizard
└── 📁 gen_manifold/          # Generated application (created by setup)
    ├── 📁 src/
    │   ├── App.jsx           # Clean Swagger-style interface
    │   ├── manifold.config.js # Generated configuration
    │   └── components/       # Function cards and UI
    └── package.json          # Dependencies for generated app
```

## 🛠️ Development Flow

1. **Developer clones repo** → `git clone ...`
2. **Runs setup in terminal** → `npm run setup`
3. **Setup generates clean project** → `gen_manifold/` folder created
4. **Developer runs generated app** → `cd gen_manifold && npm run dev`
5. **Swagger-style interface loads** → No setup UI, just functions!

## 📚 Technical Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS  
- **Blockchain**: Ethers.js v6 (Ethereum-compatible)
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast
- **Build Tool**: Vite for fast development

## 🎨 Features in Generated App

### Interactive Function Explorer
- **Parameter Input**: Dynamic forms based on function requirements
- **Live Execution**: Test functions with real blockchain calls
- **Code Generation**: JavaScript/TypeScript/cURL examples
- **Gas Estimation**: Cost estimates for each function
- **Copy-Paste Ready**: Export code directly to your projects

### Chain Management
- **Multi-chain Support**: Work with multiple chains simultaneously
- **Connection Testing**: Validate RPC connections  
- **Block Explorer Integration**: Direct links to transactions
- **Balance Checking**: Real-time KDA balance queries

## 🔧 Configuration Options

The setup wizard creates a configuration like:

```javascript
{
  useCase: 'defi',
  useCaseName: 'DeFi Protocol', 
  selectedChains: [20, 21, 22],
  selectedFunctions: ['crossChainTransfer', 'multiChainDeploy', ...],
  functionSelectionMode: 'recommended',
  chainCount: 3,
  generatedAt: '2025-09-27T14:07:56.299Z'
}
```

## 🚫 What Manifold is NOT

❌ A DeFi protocol or smart contract platform
❌ A generic multi-chain dashboard
❌ An end-user application
❌ A wallet or trading interface

## ✅ What Manifold IS

✅ A **development tool generator** for Kadena Chainweb EVM
✅ A **function code generator** with Swagger-style interface
✅ A **multi-chain utility creator** for developers
✅ A **terminal-based setup wizard** for custom applications
✅ An **Ethereum-compatible** tooling solution

## 📖 Documentation

- [Architecture Documentation](architecture.md)
- [Kadena Chainweb EVM Docs](https://kadena.io)
- [Ethers.js Documentation](https://docs.ethers.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run setup`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/sohampawar1866/manifold
- **Issues**: https://github.com/sohampawar1866/manifold/issues
- **Kadena**: https://kadena.io

---

**Made for Kadena Chainweb EVM** • **Terminal-based Setup** • **Ethereum-compatible Functions**

*Manifold v1.0.0 - Your multi-chain function generator for Kadena development*