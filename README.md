# 🌟 Kadena Multi-Chain Interactive Playground# 🌟 Kadena Multi-Chain dApp Template



> **Next-generation SwaggerUI-style interactive playground for Kadena blockchain operations with real-time chain intelligence****The easiest way to build and deploy multi-chain dApps on Kadena Chainweb EVM**



A comprehensive React-based application that provides an intuitive interface for exploring, testing, and optimizing multi-chain operations on the Kadena blockchain ecosystem.Deploy your dApp to all 5 Kadena chains with **one command**. No complex setup, no manual configuration.



## ✨ Features## ⚡ Quick Start (30 seconds)



### 🎮 Interactive Playground```bash

- **SwaggerUI-style interface** with 6 operation categories# 1. Clone the template

- **Real-time operation testing** with parameter validationgit clone https://github.com/sohampawar1866/manifold.git my-kadena-app

- **Execution history** and response visualizationcd my-kadena-app

- **Live examples system** with pre-configured scenariosnpm install

- **Multi-language code generation** (JavaScript, Python, cURL, Node.js)

# 2. Interactive setup wizard

### 🧠 Chain Intelligence Systemnpm run setup

- **Real-time performance monitoring** across multiple chains

- **Smart routing optimization** with cost analysis# 3. Add your wallet to .env file

- **Arbitrage opportunity detection** with risk assessmentecho "PRIVATE_KEY=your_private_key_here" > .env

- **Predictive analytics** for chain performance trends

- **Load balancing recommendations** for optimal distribution# 4. Deploy to all 5 chains automatically

npm run deploy

### 📊 Advanced Analytics

- **Multi-chain dashboard** with live metrics# 5. Start building!

- **Cross-chain operation tracking** and optimizationnpm run dev

- **Gas usage analysis** and cost predictions```

- **Performance grading system** (A+ to F ratings)

- **Visual trend analysis** with historical data**That's it! Your dApp is live on all Kadena chains.** 🚀



### 🔧 Developer Tools## 🎯 What Makes This Special

- **Dynamic component generation** based on configuration

- **Modular architecture** for easy customization- **🚀 One-Command Deployment**: Deploy to all 5 chains simultaneously

- **TypeScript-ready** component structure- **🛠️ Interactive Setup**: Wizard guides you through configuration

- **Comprehensive error handling** and validation- **🔄 Cross-Chain Ready**: Built-in cross-chain transfer functions

- **Professional UI/UX** with responsive design- **⚡ Parallel Processing**: Leverage Kadena's unique multi-chain architecture

- **📱 Modern Stack**: React + Vite + TailwindCSS + Ethers.js

## 🚀 Quick Start- **🧪 Testing Included**: Automated deployment verification



### Prerequisites## 📖 Documentation

- Node.js 16+ and npm/yarn

- Modern web browser with JavaScript enabled### For Beginners

- [🚀 Getting Started Guide](./docs/getting-started.md) - Your first Kadena dApp in 5 minutes

### Installation- [💼 Wallet Setup](./docs/wallet-setup.md) - Configure MetaMask for Kadena chains

- [🔧 Environment Setup](./docs/environment.md) - Development environment guide

```bash

# Clone the repository### For Developers  

git clone https://github.com/sohampawar1866/manifold.git- [📋 Deployment Guide](./docs/deployment.md) - Deploy and manage your contracts

cd manifold- [🔗 Cross-Chain Features](./docs/cross-chain.md) - Use cross-chain functions

- [🎨 Customization](./docs/customization.md) - Customize for your needs

# Install dependencies- [🧪 Testing](./docs/testing.md) - Test your multi-chain dApp

npm install

### Advanced

# Start development server- [⚙️ Configuration Reference](./docs/configuration.md) - All config options

npm run dev- [🔍 Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions

```- [🏗️ Architecture](./docs/architecture.md) - How it all works



### Configuration## 🛠️ Available Commands



The application supports multiple complexity levels:```bash

npm run setup              # Interactive setup wizard

- **Single Chain**: Basic operations on one chainnpm run deploy             # Deploy to all configured chains

- **Dual Chain**: Cross-chain operations between two chainsnpm run test-deployment    # Verify your deployment works

- **Comprehensive**: Full multi-chain with intelligence featuresnpm run compile-contracts  # Compile Solidity contracts

npm run dev               # Start development server

Configure your setup in `src/utils/config.js`:npm run build             # Build for production

```

```javascript

export const config = {## 🌐 Supported Chains

  complexity: 'comprehensive', // single | dual | comprehensive

  chains: ['20', '21', '22', '23'], // Kadena chain IDsPre-configured for all Kadena Chainweb EVM testnet chains:

  features: {

    enabled: ['defi', 'nft', 'gaming'],| Chain | Chain ID | RPC Endpoint | Block Explorer |

    intelligence: true,|-------|----------|--------------|----------------|

    playground: true| Chain 20 | 5920 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc` | [Explorer](http://chain-20.evm-testnet-blockscout.chainweb.com/) |

  }| Chain 21 | 5921 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc` | [Explorer](http://chain-21.evm-testnet-blockscout.chainweb.com/) |

};| Chain 22 | 5922 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/22/evm/rpc` | [Explorer](http://chain-22.evm-testnet-blockscout.chainweb.com/) |

```| Chain 23 | 5923 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc` | [Explorer](http://chain-23.evm-testnet-blockscout.chainweb.com/) |

| Chain 24 | 5924 | `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc` | [Explorer](http://chain-24.evm-testnet-blockscout.chainweb.com/) |

## 📁 Project Structure

## 🏗️ Project Structure

```

src/```

├── components/           # React componentsmy-kadena-app/

│   ├── InteractivePlayground.jsx     # Main playground interface├── src/

│   ├── ChainIntelligenceDashboard.jsx # Intelligence dashboard│   ├── components/          # React components

│   ├── LiveExamplesSystem.jsx        # Pre-configured examples│   │   ├── AdvancedOperations.jsx

│   ├── ResponseVisualizer.jsx        # Response visualization│   │   └── MultiChainDashboard.jsx

│   ├── RealTimePerformanceMonitor.jsx # Performance monitoring│   ├── contracts/           # Your smart contracts (add here)

│   ├── ArbitrageOpportunityDetector.jsx # Arbitrage detection│   ├── hooks/              # Custom React hooks

│   ├── SmartRoutingOptimizer.jsx     # Routing optimization│   │   └── useKadena.js    # Wallet & multi-chain hooks

│   ├── OperationSchemaExplorer.jsx   # API documentation│   ├── kadena/             # Core Kadena functionality

│   ├── MultiChainDashboard.jsx       # Multi-chain overview│   │   ├── client.js       # Wallet connection

│   └── AdvancedOperations.jsx        # Advanced operations│   │   ├── config.js       # Chain configurations

├── utils/               # Utility functions│   │   └── utils.js        # Cross-chain utilities

│   ├── component-generator.js        # Dynamic component generation│   └── config/             # Generated config files

│   ├── chain-intelligence.js         # Intelligence engine├── scripts/                # Automation scripts

│   ├── config.js                     # Configuration management│   ├── deploy.js           # Multi-chain deployment

│   └── utils.js                      # Helper functions│   ├── setup.js            # Interactive setup wizard

├── hooks/               # Custom React hooks│   └── test-deployment.js  # Deployment testing

│   └── useKadena.js                  # Kadena blockchain integration├── docs/                   # Documentation

├── contracts/           # Smart contract utilities└── deployment.config.json  # Your project configuration

│   └── SimpleStorage.js              # Example contract interface```

└── kadena/             # Kadena-specific utilities

    ├── client.js                     # Kadena client setup## � Ready-Made Features

    ├── config.js                     # Kadena configuration

    └── utils.js                      # Kadena helper functions### Cross-Chain Transfers

``````javascript

import { crossChainTransfer } from './src/kadena/utils.js';

## 🎯 Usage Examples

// Transfer 5 KDA from Chain 20 to Chain 21

### Basic Transfer Operationconst result = await crossChainTransfer(20, 21, '5.0', recipientAddress);

```javascript```

// Configure a simple KDA transfer

const transferParams = {### Multi-Chain Balances

  from: 'k:sender-account-key',```javascript

  to: 'k:recipient-account-key',import { useMultiChainBalances } from './src/hooks/useKadena.js';

  amount: 10.5,

  chainId: '20'function MyComponent() {

};  const { balances, loading } = useMultiChainBalances(userAddress);

  // balances = { 20: '10.5', 21: '7.2', 22: '15.0', ... }

// Execute through the playground interface}

await executeOperation('simple-transfer', transferParams);```

```

### Wallet Connection

### Cross-Chain Bridge```javascript

```javascriptimport { useKadenaWallet } from './src/hooks/useKadena.js';

// Bridge assets between chains

const bridgeParams = {function MyComponent() {

  asset: 'KDA',  const { connect, isConnected, address } = useKadenaWallet();

  amount: 50,  

  sourceChain: '20',  return (

  targetChain: '21',    <button onClick={connect}>

  recipient: 'k:recipient-account-key'      {isConnected ? `Connected: ${address}` : 'Connect Wallet'}

};    </button>

  );

await executeOperation('bridge-assets', bridgeParams);}

``````



### Intelligence-Powered Routing## 🏆 Built for "$2,500 Best Multichain Build on Chainweb" Prize

```javascript

// Get optimized routing recommendationsThis template showcases Kadena's unique parallel processing capabilities across multiple chains, making it perfect for:

const routing = await intelligence.optimizeRouting({

  operation: 'token-swap',- **DeFi Protocols**: Multi-chain liquidity pools and farming

  parameters: { tokenIn: 'KDA', tokenOut: 'USDC', amount: 100 },- **NFT Marketplaces**: Cross-chain NFT trading

  chains: ['20', '21', '22']- **Gaming**: Multi-chain game economies

});- **DAO Governance**: Distributed voting across chains



console.log('Recommended route:', routing.optimalRoute);## 🤝 Contributing

console.log('Estimated savings:', routing.estimatedSavings);

```1. Fork the repository

2. Create your feature branch (`git checkout -b feature/amazing-feature`)

## 🧪 Testing3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)

```bash5. Open a Pull Request

# Run unit tests

npm test## 📄 License



# Run integration testsMIT License - see [LICENSE](LICENSE) file for details.

npm run test:integration

## 🆘 Need Help?

# Run end-to-end tests

npm run test:e2e- 📖 [Full Documentation](./docs/)

- 🐛 [Report Issues](https://github.com/sohampawar1866/manifold/issues)

# Generate coverage report- 💬 [Discord Community](https://discord.gg/kadena)

npm run test:coverage- 🐦 [Follow on Twitter](https://twitter.com/kadena_io)

```

---

## 🔧 Development

**Happy building on Kadena! 🌟**

### Adding New Operations

1. Define operation schema in `InteractivePlayground.jsx`*Made with ❤️ for the Kadena developer community*

2. Add parameter validation and examples

3. Implement execution logic with error handling## React Compiler

4. Update documentation and tests

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Extending Intelligence Features

1. Add new analysis methods to `chain-intelligence.js`## Expanding the ESLint configuration

2. Create visualization components

3. Integrate with existing dashboardIf you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

4. Add performance metrics

### Customizing Components
1. Modify component generator configuration
2. Update styling and layout
3. Add new feature flags
4. Test across complexity levels

## 📊 Performance Metrics

- **Load Time**: < 2 seconds for initial app load
- **Operation Execution**: < 5 seconds average response time
- **Intelligence Analysis**: < 1 second for routing optimization
- **Real-time Updates**: 5-second refresh interval
- **Memory Usage**: < 100MB for comprehensive configuration

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Blockchain**: Kadena Chainweb, Pact smart contracts
- **Visualization**: Custom charts and data visualization
- **State Management**: React hooks and context
- **Build Tools**: Vite, PostCSS, ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] **Phase 5**: Smart Contract Suite with DeFi, NFT, and Gaming contracts
- [ ] **Phase 6**: Contract Playground with live interaction capabilities
- [ ] Advanced AI-powered optimization algorithms
- [ ] Multi-wallet support and enhanced security features
- [ ] Mobile-responsive design and progressive web app
- [ ] Community marketplace for custom operations

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/sohampawar1866/manifold/wiki)
- **Issues**: [GitHub Issues](https://github.com/sohampawar1866/manifold/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sohampawar1866/manifold/discussions)

---

**Built with ❤️ for the Kadena ecosystem**