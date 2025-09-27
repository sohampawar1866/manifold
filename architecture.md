# 🏗️ MANIFOLD ARCHITECTURE - KADENA MULTI-CHAIN FUNCTION GENERATOR

## 🎯 **CORE CONCEPT**
A **Swagger-style interactive platform** that generates ready-to-use multi-chain functions for **Kadena Chainweb EVM** (NOT Pact) based on developer's chain selection. This tool specifically targets Ethereum-compatible development on Kadena's EVM layer.

## 🌐 **CHAINWEB EVM TESTNET CONFIGURATION**

**Testnet (Production Testing)**
**Currency Symbol: KDA** (for all networks)

**Chain 20:**
- Chain ID: 5920
- RPC: https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc
- Block Explorer: http://chain-20.evm-testnet-blockscout.chainweb.com/
- Currency Symbol: KDA

**Chain 21:**
- Chain ID: 5921
- RPC: https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc
- Block Explorer: http://chain-21.evm-testnet-blockscout.chainweb.com/
- Currency Symbol: KDA

**Chain 22:**
- Chain ID: 5922
- RPC: https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/22/evm/rpc
- Block Explorer: http://chain-22.evm-testnet-blockscout.chainweb.com/
- Currency Symbol: KDA

**Chain 23:**
- Chain ID: 5923
- RPC: https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc
- Block Explorer: http://chain-23.evm-testnet-blockscout.chainweb.com/
- Currency Symbol: KDA

**Chain 24:**
- Chain ID: 5924
- RPC: https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc
- Block Explorer: http://chain-24.evm-testnet-blockscout.chainweb.com/
- Currency Symbol: KDA

## 📋 **EXACT DEVELOPER FLOW**

### **STEP 1: Developer Clones Repo**
```bash
git clone https://github.com/sohampawar1866/manifold
cd manifold
npm install
```

### **STEP 2: Initial Setup (Like create-react-app)**
**Developer runs setup command to configure the project:**
```bash
npm run setup
# OR
node scripts/setup.js
```

### **STEP 3: Setup Wizard Flow**
**Setup wizard prompts in terminal:**

**Prompt 1:** "What's your primary use case?"
**Actual terminal statement:** `"What type of application are you building with Kadena Chainweb EVM?"`
- DeFi Protocol
- Gaming Platform
- NFT Marketplace
- Cross-chain Bridge
- Custom Application

**Prompt 2:** "How many chains do you want to work with?"
**Actual terminal statement:** `"Select the number of Chainweb EVM chains for your application:"`
- 1 Chain (Simple)
- 2 Chains (Moderate)
- 3 Chains (Recommended for DeFi Protocol) ← Shows recommendation based on Step 1
- 4 Chains (Advanced)
- 5 Chains (Expert)

**Prompt 3:** "Function Selection Mode"
**Actual terminal statement:** `"How would you like to select functions?"`
```
1) Recommended functions (Auto-select all available functions)
2) Manual selection (Choose specific functions)
```

**If Option 1 - Recommended Functions:**
Shows and auto-selects all available functions:
**Core Functions (Always Generated):**
- crossChainTransfer()
- multiChainDeploy()
- getChainBalances()

**DeFi-Specific Functions (Available because you chose recommended 3 chains for DeFi):**
- addLiquidityMultiChain()
- executeArbitrage()
- crossChainYieldFarm()
- multiChainLending()

**If Option 2 - Manual Selection:**
**Actual terminal statement:** `"Select which functions to generate:"`
```
☑️ crossChainTransfer() [Core]
☑️ multiChainDeploy() [Core]
☑️ getChainBalances() [Core]
☑️ addLiquidityMultiChain() [DeFi-Specific]
☐ executeArbitrage() [DeFi-Specific]
☑️ crossChainYieldFarm() [DeFi-Specific]
☐ multiChainLending() [DeFi-Specific]
```

**Prompt 4:** "Generate Project"
**Actual terminal statement:** `"Ready to generate your Kadena Chainweb EVM application? (Y/n)"`

### **STEP 4: Setup Generates Project**
**Setup automatically generates the final app based on selections:**

Example: If user selects Chainweb EVM Chains 20, 21, 22:
```javascript
// Generated Ethereum-compatible functions in src/kadena/utils.js:
crossChainTransfer(fromChain, toChain, amount, recipient)
multiChainDeploy([20,21,22], contractFactory, args)  
executeArbitrage(tokenAddress, amount)
addLiquidityMultiChain([20,21,22], tokenA, tokenB, amountA, amountB)
```

### **STEP 5: Developer Runs Final App**
**After setup, developer runs the generated app:**
```bash
npm run dev
```

**App shows Swagger-style function explorer with the generated functions:**

For each generated function:

```
┌─────────────────────────────────────────────────────┐
│ crossChainTransfer()                                │
│ Transfer tokens between selected chains             │
│                                                     │
│ Parameters:                                         │
│ • fromChain: number (20, 21, or 22)               │
│ • toChain: number (20, 21, or 22)                 │  
│ • amount: string ("1.0")                          │
│ • recipient: address (0x...)                      │
│                                                     │
│ [Try It] [Copy Code] [View Example]                │
│                                                     │
│ Input Fields:                                       │
│ From Chain: [20 ▼]                                │
│ To Chain: [21 ▼]                                  │
│ Amount: [1.0____________]                          │
│ Recipient: [0x742d35Cc..._______________]          │
│                                                     │
│ [▶️ EXECUTE FUNCTION]                              │
│                                                     │
│ Result: ✅ Transfer completed                      │
│ Transaction: 0xabc123...                           │
└─────────────────────────────────────────────────────┘
```

## 🎨 **COMPONENT STRUCTURE**

```
src/
├── App.jsx (Main router)
├── components/
│   ├── ModeSelection.jsx (Guided vs Manual buttons)
│   ├── GuidedWizard.jsx (Step-by-step wizard)
│   ├── ManualConfig.jsx (Expert configuration)
│   ├── FunctionGenerator.jsx (Generates custom functions)
│   ├── SwaggerDemo.jsx (Interactive function explorer)
│   └── FunctionCard.jsx (Individual function demo)
├── hooks/
│   ├── useChainConfig.js (Chain selection logic)
│   └── useFunctionGenerator.js (Function generation logic)
├── utils/
│   ├── functionTemplates.js (Function code templates)
│   └── chainCombinations.js (Recommended configurations)
└── kadena/ (existing multi-chain infrastructure)
```

## 🔥 **KEY FEATURES**

### **1. NO DeFi Contracts**
- This is NOT a DeFi protocol
- This is a DEVELOPMENT TOOL for generating Chainweb EVM multi-chain functions
- Focus on Ethereum-compatible function generation for Kadena's EVM layer
- Uses Solidity patterns, NOT Pact language

### **2. Swagger-Style Interface**
- Each function has "Try It" button
- Live parameter input
- Real execution with results
- Copy code snippets
- Example usage

### **3. Dynamic Function Generation**
Functions change based on selected chains:
- 2 chains selected → generates 2-chain functions
- 5 chains selected → generates 5-chain functions
- Custom parameter validation per selection

### **4. Developer Experience**
- Clone → Run Setup → Select Chains → Get Functions → Copy Code
- Zero configuration needed after setup
- Ready-to-use functions immediately
- Professional documentation
- Pre-configured with Chainweb EVM testnet endpoints

### **5. Chainweb EVM Integration**
- Works with Chains 20-24 (Chain IDs 5920-5924)
- Pre-configured RPC endpoints for all chains
- Block explorer integration for transaction tracking
- Ethereum-compatible tooling (MetaMask, Ethers.js, etc.)

## 🚫 **WHAT NOT TO BUILD**

❌ DeFi smart contracts (ManifoldDEX, etc.)
❌ Traditional landing pages
❌ Complex staking/lending protocols
❌ Generic multi-chain dashboards

## ✅ **WHAT TO BUILD**

✅ Setup wizard with mode selection (Guided vs Manual)
✅ Chain selection with recommendations
✅ Function generator engine
✅ Swagger-style function explorer
✅ Live function execution demos
✅ Copy-paste ready code examples

## 🎯 **SUCCESS CRITERIA**

A developer should be able to:
1. Clone the repo
2. Run `npm run setup`
3. Choose guided/manual mode in terminal
4. Select chains and use case through prompts
5. Get generated functions specific to their selection
6. Run `npm run dev` to see Swagger-style interface
7. Test functions live and copy working code for their project

**This is a CHAINWEB EVM DEVELOPMENT TOOL GENERATOR for Ethereum-compatible multi-chain functions, not an end-user DeFi application.**

## 🎯 **CORRECT FLOW (AS PER ARCHITECTURE)**

### **Developer Experience (Terminal-Based Setup)**

1. **Developer clones repo:** `git clone https://github.com/sohampawar1866/manifold`
2. **Runs terminal setup:** `npm run setup`
3. **Terminal prompts (NOT web interface):**
   - ✅ Use case selection (DeFi, Gaming, NFT, Bridge, Custom)
   - ✅ Chain count selection (1-5 chains)
   - ✅ Function selection mode (Recommended/Manual)
   - ✅ Confirmation and generation
4. **Generates clean project in gen_manifold folder**
5. **Developer runs generated app:** `cd gen_manifold && npm install && npm run dev`
6. **Pure Swagger-style interface loads directly - NO setup UI!**

### **🔧 What Gets Generated (CLEAN)**

The `gen_manifold` folder now contains:

- **Clean App.jsx** - Loads config directly, shows only Swagger UI
- **Generated config** - Based on terminal selections
- **Minimal structure** - Only what's needed for the Swagger interface
- **No web-based setup components** - No ModeSelection, GuidedWizard, etc.

**Key Difference:** The setup happens ONCE in terminal during `npm run setup`, then the generated app is a clean Swagger interface without any setup UI components.