# Manifold

Professional multi-chain function generator for Kadena Chainweb EVM. Creates Swagger-style interfaces with automatic setup.

## Usage

```bash
# Clone and setup
git clone https://github.com/sohampawar1866/manifold
cd manifold
npm install

# Generate project
npm run setup

# Launch generated app
cd gen_manifold
npm run dev
```

Open `http://localhost:5173` for your function explorer.

## Supported Chains

| Chain | Chain ID | Explorer |
|-------|----------|----------|
| 20 | 5920 | [View](http://chain-20.evm-testnet-blockscout.chainweb.com/) |
| 21 | 5921 | [View](http://chain-21.evm-testnet-blockscout.chainweb.com/) |
| 22 | 5922 | [View](http://chain-22.evm-testnet-blockscout.chainweb.com/) |
| 23 | 5923 | [View](http://chain-23.evm-testnet-blockscout.chainweb.com/) |
| 24 | 5924 | [View](http://chain-24.evm-testnet-blockscout.chainweb.com/) |

**Network**: Kadena Chainweb EVM Testnet | **Currency**: KDA

## Generated Functions

**Core**: `crossChainTransfer`, `multiChainDeploy`, `getChainBalances`

**DeFi**: `addLiquidityMultiChain`, `executeArbitrage`, `crossChainYieldFarm`, `multiChainLending`

**Gaming**: `crossChainAssetTransfer`, `multiChainTournament`, `crossChainLeaderboard`

**NFT**: `crossChainNFTBridge`, `multiChainMarketplace`, `crossChainRoyalties`

**Bridge**: `initiateBridge`, `verifyBridgeTransaction`, `handleBridgeCallback`

## Tech Stack

- React 18 + Vite
- Tailwind CSS + PostCSS  
- Ethers.js v6
- Lucide React icons
- Auto-installed dependencies

## Features

- Interactive function testing
- Code generation (JS/TS/cURL)
- Multi-chain support (1-5 chains)
- Professional UI with clean styling
- Copy-paste ready examples
- Real-time blockchain integration

## Setup Options

The wizard asks for:
- **Use case**: DeFi, Gaming, NFT, Bridge, Custom
- **Chain count**: 1-5 chains
- **Functions**: Recommended or manual selection

## License

MIT

---

*v1.0.0 - Professional multi-chain function generator*