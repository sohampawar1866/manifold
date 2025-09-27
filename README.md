# Kadena Chainweb EVM Multi-Chain Template

A ready-to-use template for building multi-chain dApps on Kadena Chainweb EVM. This template showcases parallel processing across all 5 Kadena testnet chains (20-24) with zero configuration required.

## 🚀 Quick Start

```bash
# Clone and install
git clone <this-repo>
cd kadena-multichain-template
npm install

# Start development server
npm run dev
```

## ✨ Features

- **Multi-Chain Ready**: Pre-configured for all 5 Kadena Chainweb EVM chains (20-24)
- **Parallel Processing**: Fetch balances and deploy contracts across all chains simultaneously
- **Zero Configuration**: Everything works out of the box
- **Modern Stack**: React + Vite + JavaScript + TailwindCSS
- **Ready-to-Use Hooks**: `useKadenaWallet`, `useMultiChainBalances`, etc.

## 🏗️ Built For

**"$2,500 Best Multichain Build on Chainweb" Prize**

This template demonstrates Kadena's unique parallel processing capabilities across multiple chains.

## 📁 Structure

```
src/
├── kadena/          # Core multi-chain functionality
├── components/      # React components
├── hooks/          # Custom React hooks
└── contracts/      # Example smart contracts
```

## 🎯 For Developers

Drop your smart contracts in `src/contracts/` and start building immediately!+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
