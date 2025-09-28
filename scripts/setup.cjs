#!/usr/bin/env node

const readline = require('readline')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// ANSI color codes for better terminal output
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

console.log(`\n${colors.cyan}${colors.bold}🚀 Welcome to Manifold - Kadena Chainweb EVM Function Generator!${colors.reset}\n`)
console.log(`${colors.blue}This setup wizard will configure your multi-chain development environment.${colors.reset}\n`)

// Helper functions for string manipulation and template generation
function escapeString(str) {
  return str.replace(/\${/g, '\\${').replace(/`/g, '\\`')
}

function wrapInBackticks(str) {
  return '`' + str + '`'
}

// Template functions for App.jsx generation
function generateImports() {
  return [
    "import React, { useState, useEffect } from 'react'",
    "import { toast } from 'react-hot-toast'",
    "import { ethers } from 'ethers'",
    "import { Code, Zap, BookOpen, Wallet, AlertCircle } from 'lucide-react'",
    "import FunctionCard from './components/FunctionCard'",
    "import { useFunctionGenerator } from './hooks/useFunctionGenerator'",
    "import { useChainConfig } from './hooks/useChainConfig'",
    "import { useWallet } from './hooks/useWallet'",
    "import Header from './components/Header'",
    "import LoadingScreen from './components/LoadingScreen'",
    "import manifoldConfig from './manifold.config.js'",
    "import { NetworkManager } from './utils/networkManager'",
    "import { crossChainTransfer, getChainBalances, multiChainDeploy } from './utils/realFunctions'"
  ].join('\\n')
}

function generateUseStates() {
  return `
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [executingFunctions, setExecutingFunctions] = useState({})
  const [filteredFunctions, setFilteredFunctions] = useState([])
  `
}

function generateUseEffects() {
  return escapeString(`
  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (manifoldConfig?.selectedChains?.length > 0) {
          console.log('✅ Configuration loaded:', {
            useCase: manifoldConfig.useCase,
            chains: manifoldConfig.selectedChains,
            functions: manifoldConfig.selectedFunctions
          })
          
          setTimeout(() => {
            setIsLoading(false)
            toast.success('Functions loaded successfully!')
          }, 1000)
        } else {
          console.error('❌ Invalid configuration detected')
          toast.error('Configuration not found. Please check your setup.')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Failed to load configuration:', error)
        toast.error('Failed to load configuration')
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    let functions = Object.values(functionGen.generatedFunctions || {})
    
    if (searchTerm) {
      functions = functions.filter(func => 
        func.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFunctions(functions)
  }, [functionGen.generatedFunctions, searchTerm])`)
}

function generateHandleFunctionExecute() {
  return escapeString(`
  const handleFunctionExecute = async (functionName, parameters) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setExecutingFunctions(prev => ({ ...prev, [functionName]: true }))
    
    try {
      let result
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      const functionMap = {
        crossChainTransfer: async () => {
          const { fromChain = 20, toChain = 21, amount = '0.01', recipient } = parameters
          return crossChainTransfer(fromChain, toChain, amount, recipient || account, signer)
        },
        getChainBalances: async () => {
          const { chains = manifoldConfig.selectedChains } = parameters
          return getChainBalances(account, chains, signer)
        },
        multiChainDeploy: async () => {
          const { chains = manifoldConfig.selectedChains, bytecode, args = [] } = parameters
          return multiChainDeploy(chains, bytecode, args, signer)
        }
      }

      if (functionMap[functionName]) {
        result = await functionMap[functionName]()
      } else {
        const networkManager = new NetworkManager()
        result = await networkManager.executeTransaction(functionName, parameters)
      }
      
      if (result?.success) {
        toast.success(\`\${functionName} executed successfully!\`)
        return result
      } else {
        throw new Error(result?.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Function execution failed:', error)
      toast.error('Execution failed: ' + error.message)
      throw error
    } finally {
      setExecutingFunctions(prev => ({ ...prev, [functionName]: false }))
    }
  }`)

const config = {
  useCase: '',
  chainCount: 0,
  selectedChains: [],
  selectedFunctions: [],
  functionSelectionMode: ''
}

// Available function templates with contract requirements
const coreFunctions = [
  { 
    name: 'crossChainTransfer',
    description: 'Transfer tokens between selected chains',
    contractRequired: true,
    contracts: {
      bridge: 'process.env.BRIDGE_CONTRACT_${chain}',
      token: 'process.env.TOKEN_CONTRACT_${chain}'
    }
  },
  {
    name: 'multiChainDeploy',
    description: 'Deploy contracts across multiple chains',
    contractRequired: false
  },
  {
    name: 'getChainBalances',
    description: 'Get balances across all selected chains',
    contractRequired: true,
    contracts: {
      token: 'process.env.TOKEN_CONTRACT_${chain}'
    }
  }
]

const defiFunctions = [
  {
    name: 'addLiquidityMultiChain',
    description: 'Add liquidity across multiple chains',
    contractRequired: true,
    contracts: {
      defi: 'process.env.DEFI_CONTRACT_${chain}',
      token: 'process.env.TOKEN_CONTRACT_${chain}'
    }
  },
  {
    name: 'executeArbitrage',
    description: 'Execute arbitrage opportunities',
    contractRequired: true,
    contracts: {
      router: 'process.env.ROUTER_CONTRACT_${chain}',
      defi: 'process.env.DEFI_CONTRACT_${chain}'
    }
  },
  {
    name: 'crossChainYieldFarm',
    description: 'Yield farming across chains',
    contractRequired: true,
    contracts: {
      defi: 'process.env.DEFI_CONTRACT_${chain}',
      token: 'process.env.TOKEN_CONTRACT_${chain}'
    }
  },
  {
    name: 'multiChainLending',
    description: 'Multi-chain lending operations',
    contractRequired: true,
    contracts: {
      defi: 'process.env.DEFI_CONTRACT_${chain}',
      token: 'process.env.TOKEN_CONTRACT_${chain}'
    }
  }
]

const gamingFunctions = [
  { name: 'crossChainAssetTransfer', description: 'Transfer gaming assets between chains' },
  { name: 'multiChainTournament', description: 'Run tournaments across chains' },
  { name: 'crossChainLeaderboard', description: 'Maintain leaderboards across chains' }
]

const nftFunctions = [
  { name: 'crossChainNFTBridge', description: 'Bridge NFTs between chains' },
  { name: 'multiChainMarketplace', description: 'Multi-chain NFT marketplace operations' },
  { name: 'crossChainRoyalties', description: 'Handle royalties across chains' }
]

const bridgeFunctions = [
  { name: 'initiateBridge', description: 'Initiate cross-chain bridge operations' },
  { name: 'verifyBridgeTransaction', description: 'Verify bridge transactions' },
  { name: 'handleBridgeCallback', description: 'Handle bridge completion callbacks' }
]

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${prompt}${colors.reset} `, resolve)
  })
}

async function askUseCase() {
  console.log(`${colors.bold}STEP 1: Use Case Selection${colors.reset}`)
  console.log(`${colors.blue}What type of application are you building with Kadena Chainweb EVM?${colors.reset}\n`)
  
  const options = [
    '1) DeFi Protocol',
    '2) Gaming Platform', 
    '3) NFT Marketplace',
    '4) Cross-chain Bridge',
    '5) Custom Application'
  ]
  
  options.forEach(option => console.log(`  ${colors.cyan}${option}${colors.reset}`))
  
  const answer = await question('\nEnter your choice (1-5): ')
  
  const useCaseMap = {
    '1': 'defi',
    '2': 'gaming',
    '3': 'nft', 
    '4': 'bridge',
    '5': 'custom'
  }
  
  config.useCase = useCaseMap[answer] || 'custom'
  console.log(`${colors.green}✓ Selected: ${config.useCase.toUpperCase()}${colors.reset}\n`)
}

async function askChainCount() {
  console.log(`${colors.bold}STEP 2: Chain Selection${colors.reset}`)
  console.log(`${colors.blue}Select the number of Chainweb EVM chains for your application:${colors.reset}\n`)
  
  const recommendations = {
    defi: '3 Chains (Recommended for DeFi Protocol)',
    gaming: '2 Chains (Recommended for Gaming Platform)',
    nft: '2 Chains (Recommended for NFT Marketplace)', 
    bridge: '5 Chains (Recommended for Cross-chain Bridge)',
    custom: '3 Chains (Balanced approach)'
  }
  
  const options = [
    '1) 1 Chain (Simple)',
    '2) 2 Chains (Moderate)',
    '3) 3 Chains (Advanced)',
    '4) 4 Chains (Expert)',
    '5) 5 Chains (Maximum)'
  ]
  
  options.forEach(option => {
    const chainCount = option.split(')')[0].split(' ')[1]
    const isRecommended = recommendations[config.useCase].includes(chainCount)
    const display = isRecommended ? `${option} ${colors.green}← ${recommendations[config.useCase]}${colors.reset}` : option
    console.log(`  ${colors.cyan}${display}${colors.reset}`)
  })
  
  const answer = await question('\nEnter your choice (1-5): ')
  config.chainCount = parseInt(answer) || 3
  
  // Select specific chains based on count
  const availableChains = [20, 21, 22, 23, 24]
  config.selectedChains = availableChains.slice(0, config.chainCount)
  
  console.log(`${colors.green}✓ Selected chains: ${config.selectedChains.join(', ')}${colors.reset}\n`)
}

async function askFunctionSelection() {
  console.log(`${colors.bold}STEP 3: Function Selection${colors.reset}`)
  console.log(`${colors.blue}How would you like to select functions?${colors.reset}\n`)
  
  console.log(`  ${colors.cyan}1) Recommended functions (Auto-select based on your use case)${colors.reset}`)
  console.log(`  ${colors.cyan}2) Manual selection (Choose specific functions)${colors.reset}`)
  
  const answer = await question('\nEnter your choice (1-2): ')
  config.functionSelectionMode = answer === '2' ? 'manual' : 'recommended'
  
  if (config.functionSelectionMode === 'recommended') {
    // Auto-select based on use case
    config.selectedFunctions = [...coreFunctions.map(f => f.name)]
    
    switch (config.useCase) {
      case 'defi':
        config.selectedFunctions.push(...defiFunctions.map(f => f.name))
        break
      case 'gaming':
        config.selectedFunctions.push(...gamingFunctions.map(f => f.name))
        break
      case 'nft':
        config.selectedFunctions.push(...nftFunctions.map(f => f.name))
        break
      case 'bridge':
        config.selectedFunctions.push(...bridgeFunctions.map(f => f.name))
        break
    }
    
    console.log(`${colors.green}✓ Auto-selected ${config.selectedFunctions.length} functions for ${config.useCase.toUpperCase()}${colors.reset}`)
    console.log(`${colors.blue}Functions: ${config.selectedFunctions.join(', ')}${colors.reset}\n`)
    
  } else {
    // Manual selection
    await manualFunctionSelection()
  }
}

async function manualFunctionSelection() {
  console.log(`${colors.blue}Select which functions to generate:${colors.reset}\n`)
  
  const allFunctions = [...coreFunctions]
  
  switch (config.useCase) {
    case 'defi':
      allFunctions.push(...defiFunctions)
      break
    case 'gaming':
      allFunctions.push(...gamingFunctions)
      break
    case 'nft':
      allFunctions.push(...nftFunctions)
      break
    case 'bridge':
      allFunctions.push(...bridgeFunctions)
      break
  }
  
  console.log(`${colors.magenta}Core Functions (Always recommended):${colors.reset}`)
  coreFunctions.forEach((func, i) => {
    console.log(`  ${colors.green}☑️  ${func.name}() ${colors.reset}[Core] - ${func.description}`)
  })
  
  if (allFunctions.length > coreFunctions.length) {
    console.log(`\n${colors.magenta}${config.useCase.toUpperCase()}-Specific Functions:${colors.reset}`)
    allFunctions.slice(coreFunctions.length).forEach((func, i) => {
      console.log(`  ${colors.cyan}☐  ${func.name}() ${colors.reset}[${config.useCase.toUpperCase()}] - ${func.description}`)
    })
  }
  
  const answer = await question(`\nEnter function numbers to include (e.g., "1,2,4") or "all" for everything: `)
  
  if (answer.toLowerCase() === 'all') {
    config.selectedFunctions = allFunctions.map(f => f.name)
  } else {
    config.selectedFunctions = [...coreFunctions.map(f => f.name)] // Always include core
    const selected = answer.split(',').map(n => parseInt(n.trim()) - 1)
    selected.forEach(index => {
      if (index >= coreFunctions.length && index < allFunctions.length) {
        config.selectedFunctions.push(allFunctions[index].name)
      }
    })
  }
  
  console.log(`${colors.green}✓ Selected ${config.selectedFunctions.length} functions${colors.reset}\n`)
}

async function confirmGeneration() {
  console.log(`${colors.bold}STEP 4: Configuration Summary${colors.reset}`)
  console.log(`${colors.blue}Ready to generate your Kadena Chainweb EVM application?${colors.reset}\n`)
  
  console.log(`${colors.cyan}Use Case:${colors.reset} ${config.useCase.toUpperCase()}`)
  console.log(`${colors.cyan}Chains:${colors.reset} ${config.selectedChains.join(', ')} (${config.chainCount} chains)`)
  console.log(`${colors.cyan}Functions:${colors.reset} ${config.selectedFunctions.length} functions`)
  console.log(`${colors.cyan}Selection Mode:${colors.reset} ${config.functionSelectionMode}`)
  
  console.log(`\n${colors.magenta}Generated Functions:${colors.reset}`)
  config.selectedFunctions.forEach(func => {
    console.log(`  ${colors.green}✓${colors.reset} ${func}()`)
  })
  
  const answer = await question(`\n${colors.yellow}Generate project? (Y/n): ${colors.reset}`)
  return answer.toLowerCase() !== 'n'
}

async function generateProject() {
  console.log(`\n${colors.bold}🔧 Generating your Kadena Chainweb EVM application...${colors.reset}\n`)
  
  // Create gen_manifold directory
  const genProjectPath = path.join(__dirname, '..', 'gen_manifold')
  
  // Remove existing gen_manifold if it exists
  if (fs.existsSync(genProjectPath)) {
    console.log(`${colors.yellow}Removing existing gen_manifold folder...${colors.reset}`)
    fs.rmSync(genProjectPath, { recursive: true, force: true })
  }
  
  // Create new gen_manifold directory
  fs.mkdirSync(genProjectPath, { recursive: true })
  console.log(`${colors.green}✅ Created gen_manifold folder${colors.reset}`)
  
  // Generate clean project structure
  await generateProjectStructure(genProjectPath)
  
  // Write configuration file in the generated project
  const configPath = path.join(genProjectPath, 'src/manifold.config.js')
  const useCaseNames = {
    defi: 'DeFi Protocol',
    gaming: 'Gaming Platform', 
    nft: 'NFT Marketplace',
    bridge: 'Cross-chain Bridge',
    custom: 'Custom Application'
  }
  
  const configContent = `// Generated by Manifold Setup Wizard
// Kadena Chainweb EVM Configuration - ${new Date().toLocaleString()}

export const manifoldConfig = {
  useCase: '${config.useCase}',
  useCaseName: '${useCaseNames[config.useCase] || 'Custom Application'}',
  selectedChains: ${JSON.stringify(config.selectedChains)},
  selectedFunctions: ${JSON.stringify(config.selectedFunctions)},
  functionSelectionMode: '${config.functionSelectionMode}',
  chainCount: ${config.chainCount},
  generatedAt: '${new Date().toISOString()}',
  isDefault: false
}

export default manifoldConfig`

  fs.writeFileSync(configPath, configContent)
  console.log(`${colors.green}✅ Configuration saved to gen_manifold/src/manifold.config.js${colors.reset}`)
  
  // Create package.json for the generated project
  await createGeneratedPackageJson(genProjectPath)
  
  console.log(`${colors.green}✅ Functions generated for chains: ${config.selectedChains.join(', ')}${colors.reset}`)
  console.log(`${colors.green}✅ ${config.selectedFunctions.length} functions ready for use${colors.reset}`)
  
  // Auto-install dependencies
  console.log(`\n${colors.yellow}📦 Installing dependencies...${colors.reset}`)
  try {
    execSync('npm install', { 
      cwd: genProjectPath, 
      stdio: 'inherit',
      timeout: 120000 // 2 minute timeout
    })
    console.log(`${colors.green}✅ Dependencies installed successfully${colors.reset}`)
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Auto-install failed, please run 'npm install' manually${colors.reset}`)
  }
  
  console.log(`\n${colors.bold}🚀 Setup Complete!${colors.reset}`)
  console.log(`${colors.green}Your generated project is ready with Tailwind CSS configured!${colors.reset}`)
  console.log(`${colors.blue}To start your application:${colors.reset}\n`)
  console.log(`${colors.cyan}${colors.bold}  cd gen_manifold${colors.reset}`)
  console.log(`${colors.cyan}${colors.bold}  npm run dev${colors.reset}\n`)
  console.log(`${colors.blue}Then open your browser to the provided localhost URL.${colors.reset}`)
}

async function generateProjectStructure(targetPath) {
  // Create directory structure
  const dirs = ['src/components', 'src/hooks', 'src/utils']
  dirs.forEach(dir => {
    fs.mkdirSync(path.join(targetPath, dir), { recursive: true })
  })
  
  // Generate clean files manually
  await generateIndexHtml(targetPath)
  await generateViteConfig(targetPath)
  await generateTailwindConfig(targetPath)
  await generatePostCssConfig(targetPath)
  await generateMainJsx(targetPath)
  await generateCleanApp(targetPath)
  await generateComponents(targetPath)
  await generateHooks(targetPath)
  await generateUtils(targetPath)
  await generateRealFunctionTemplates(targetPath)
  await generateIndexCss(targetPath)
  await generateReadme(targetPath)
  
  console.log(`${colors.green}✅ Generated clean project structure${colors.reset}`)
}



async function createGeneratedPackageJson(targetPath) {
  const packageJsonContent = {
    "name": "generated-manifold",
    "private": true,
    "version": "1.0.0",
    "description": "Generated Kadena Chainweb EVM multi-chain application",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "ethers": "^6.7.1",
      "lucide-react": "^0.263.1",
      "react-hot-toast": "^2.4.1"
    },
    "devDependencies": {
      "@types/react": "^18.3.8",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1",
      "autoprefixer": "^10.4.20",
      "postcss": "^8.4.47",
      "tailwindcss": "^3.4.10",
      "vite": "^5.4.7"
    },
    "engines": {
      "node": ">=18.0.0"
    },
    "useCase": config.useCase,
    "selectedChains": config.selectedChains,
    "selectedFunctions": config.selectedFunctions,
    "generatedAt": new Date().toISOString()
  }
  
  const packageJsonPath = path.join(targetPath, 'package.json')
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2))
  console.log(`${colors.green}✅ Created package.json with dependencies${colors.reset}`)
}

async function runSetup() {
  try {
    await askUseCase()
    await askChainCount()
    await askFunctionSelection()
    
    if (await confirmGeneration()) {
      await generateProject()
    } else {
      console.log(`\n${colors.yellow}Setup cancelled. Run "npm run setup" again when ready.${colors.reset}`)
    }
    
  } catch (error) {
    console.error(`\n${colors.red}Setup failed:${colors.reset}`, error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// File generation functions
async function generateIndexHtml(targetPath) {
  const content = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated Manifold - Kadena Chainweb EVM Functions</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
  
  fs.writeFileSync(path.join(targetPath, 'index.html'), content)
}

async function generateViteConfig(targetPath) {
  const content = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'ethers', 'react-hot-toast', 'lucide-react'],
    exclude: []
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      BRIDGE_CONTRACT_20: JSON.stringify('0x...'), // Default contract addresses
      TOKEN_CONTRACT_20: JSON.stringify('0x...'),
      DEFI_CONTRACT_20: JSON.stringify('0x...'),
      ROUTER_CONTRACT_20: JSON.stringify('0x...')
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ethers-vendor': ['ethers']
        }
      }
    }
  }
})`
  
  fs.writeFileSync(path.join(targetPath, 'vite.config.js'), content)
}

async function generateTailwindConfig(targetPath) {
  const content = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        swagger: {
          blue: '#3b82f6',
          green: '#10b981',
          orange: '#f59e0b',
          red: '#ef4444',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'swagger': '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'function-card': '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}`
  
  fs.writeFileSync(path.join(targetPath, 'tailwind.config.js'), content)
  console.log(`${colors.green}✅ Generated tailwind.config.js${colors.reset}`)
}

async function generatePostCssConfig(targetPath) {
  const content = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
  
  fs.writeFileSync(path.join(targetPath, 'postcss.config.js'), content)
  console.log(`${colors.green}✅ Generated postcss.config.js${colors.reset}`)
}

async function generateMainJsx(targetPath) {
  const content = `import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Error boundary component for catching runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ErrorBoundary>
  </React.StrictMode>
)`
  
  fs.writeFileSync(path.join(targetPath, 'src/main.jsx'), content)
}

function escapeDollarSign(str) {
  return str.replace(/\$/g, '\\$')
}

async function generateCleanApp(targetPath) {
  const useCaseNames = {
    defi: 'DeFi Protocol',
    gaming: 'Gaming Platform', 
    nft: 'NFT Marketplace',
    bridge: 'Cross-chain Bridge',
    custom: 'Custom Application'
  }

  // Helper function to escape template literals
  function escapeTemplateString(str) {
    return str.replace(/\${/g, '\\${')
  }
  
  // This function contains the actual template for the App.jsx file
  const generateAppJsxTemplate = (useCaseName) => {
    const successMessage = "${functionName} executed successfully!"
    const imports = [
      "import React, { useState, useEffect } from 'react'",
      "import { toast } from 'react-hot-toast'",
      "import { ethers } from 'ethers'",
      "import { Code, Zap, BookOpen, Wallet, AlertCircle } from 'lucide-react'",
      "import FunctionCard from './components/FunctionCard'",
      "import { useFunctionGenerator } from './hooks/useFunctionGenerator'",
      "import { useChainConfig } from './hooks/useChainConfig'",
      "import { useWallet } from './hooks/useWallet'",
      "import Header from './components/Header'",
      "import LoadingScreen from './components/LoadingScreen'",
      "import manifoldConfig from './manifold.config.js'",
      "import { NetworkManager } from './utils/networkManager'",
      "import { crossChainTransfer, getChainBalances, multiChainDeploy } from './utils/realFunctions'"
    ].join('\n')
    // Create the template string with proper escaping for template literals
    const template = []
    
    // Add imports
    template.push(`
import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { Code, Zap, BookOpen, Wallet, AlertCircle } from 'lucide-react'
import FunctionCard from './components/FunctionCard'
import { useFunctionGenerator } from './hooks/useFunctionGenerator'
import { useChainConfig } from './hooks/useChainConfig'
import { useWallet } from './hooks/useWallet'
import Header from './components/Header'
import LoadingScreen from './components/LoadingScreen'
import manifoldConfig from './manifold.config.js'
import { NetworkManager } from './utils/networkManager'
import { crossChainTransfer, getChainBalances, multiChainDeploy } from './utils/realFunctions'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [executingFunctions, setExecutingFunctions] = useState({})
  const [filteredFunctions, setFilteredFunctions] = useState([])
  
  const chainConfig = useChainConfig(manifoldConfig.selectedChains)
  const functionGen = useFunctionGenerator(
    manifoldConfig.selectedChains, 
    manifoldConfig.selectedFunctions,
    manifoldConfig.useCase
  )
  
  const { 
    account, 
    isConnected, 
    chainId,
    connectWallet, 
    disconnectWallet, 
    switchToChain,
    balance,
    isConnecting,
    network
  } = useWallet()

  const handleFunctionExecute = async (functionName, parameters) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setExecutingFunctions(prev => ({ ...prev, [functionName]: true }))
    
    try {
      let result
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      const functionMap = {
        crossChainTransfer: async () => {
          const { fromChain = 20, toChain = 21, amount = '0.01', recipient } = parameters
          return crossChainTransfer(fromChain, toChain, amount, recipient || account, signer)
        },
        getChainBalances: async () => {
          const { chains = manifoldConfig.selectedChains } = parameters
          return getChainBalances(account, chains, signer)
        },
        multiChainDeploy: async () => {
          const { chains = manifoldConfig.selectedChains, bytecode, args = [] } = parameters
          return multiChainDeploy(chains, bytecode, args, signer)
        }
      }

      if (functionMap[functionName]) {
        result = await functionMap[functionName]()
      } else {
        const networkManager = new NetworkManager()
        result = await networkManager.executeTransaction(functionName, parameters)
      }
      
      if (result?.success) {
        toast.success(\\\`\\\${functionName} executed successfully!\\\`)
        return result
      } else {
        throw new Error(result?.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Function execution failed:', error)
      toast.error('Execution failed: ' + error.message)
      throw error
    } finally {
      setExecutingFunctions(prev => ({ ...prev, [functionName]: false }))
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (manifoldConfig?.selectedChains?.length > 0) {
          console.log('✅ Configuration loaded:', {
            useCase: manifoldConfig.useCase,
            chains: manifoldConfig.selectedChains,
            functions: manifoldConfig.selectedFunctions
          })
          
          setTimeout(() => {
            setIsLoading(false)
            toast.success('Functions loaded successfully!')
          }, 1000)
        } else {
          console.error('❌ Invalid configuration detected')
          toast.error('Configuration not found. Please check your setup.')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Failed to load configuration:', error)
        toast.error('Failed to load configuration')
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    let functions = Object.values(functionGen.generatedFunctions || {})
    
    if (searchTerm) {
      functions = functions.filter(func => 
        func.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFunctions(functions)
  }, [functionGen.generatedFunctions, searchTerm])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!manifoldConfig?.selectedChains?.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card-container max-w-lg mx-auto p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Configuration Missing</h1>
          <p className="text-slate-600 mb-8">
            No configuration found. Please run the setup command to configure your chains and functions.
          </p>
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 mb-6">
            <code className="text-lg">npm run setup</code>
          </div>
        </div>
      </div>
    )
  }

  const stats = functionGen.getFunctionStats?.() || { total: 0, chains: manifoldConfig.selectedChains.length }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        isConnected={isConnected}
        account={account}
        balance={balance}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-slate-800">Manifold Functions</h1>
          <div className="text-sm text-slate-500">${useCaseName}</div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Functions</div>
          </div>
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {manifoldConfig.selectedChains.length}
            </div>
            <div className="text-sm text-slate-500">Active Chains</div>
          </div>
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {isConnected ? 'Connected' : 'Not Connected'}
            </div>
            <div className="text-sm text-slate-500">Wallet Status</div>
          </div>
        </div>

        <div className="card-container p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Wallet Connection</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {isConnected ? (
                <div className="text-sm text-slate-600">
                  <p>Account: {account?.slice(0, 6)}...{account?.slice(-4)}</p>
                  <p>Network: {network ? ('Chain ' + chainId) : 'Unknown'}</p>
                  <p>Balance: {balance} KDA</p>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Connect your wallet to start interacting with functions
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <>
                  <select
                    value={chainId || ''}
                    onChange={(e) => {
                      const selectedChainId = parseInt(e.target.value)
                      const chainNumber = selectedChainId - 5900
                      switchToChain(chainNumber)
                    }}
                    className="input-primary text-sm"
                  >
                    <option value="">Select Chain</option>
                    {manifoldConfig.selectedChains.map(chain => (
                      <option key={chain} value={5900 + chain}>
                        Chain {chain}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={disconnectWallet}
                    className="btn-secondary text-sm"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card-container p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="Search functions..."
              className="input-primary w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="text-sm text-slate-500">
              {filteredFunctions.length} functions found
            </div>
          </div>

          <div className="space-y-4">
            {filteredFunctions.map((func) => (
              <FunctionCard
                key={func.name}
                functionData={func}
                chainConfigs={chainConfig.chainConfigs}
                onExecute={handleFunctionExecute}
                isExecuting={executingFunctions[func.name]}
                walletConnected={isConnected}
                currentAccount={account}
                currentNetwork={network}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
    `.trim())
    
    return template.join('')
  }
    // Define the imports section
    const imports = [
      "import React, { useState, useEffect } from 'react'",
      "import { toast } from 'react-hot-toast'",
      "import { ethers } from 'ethers'",
      "import { Code, Zap, BookOpen, Wallet, AlertCircle } from 'lucide-react'",
      "import FunctionCard from './components/FunctionCard'",
      "import { useFunctionGenerator } from './hooks/useFunctionGenerator'",
      "import { useChainConfig } from './hooks/useChainConfig'",
      "import { useWallet } from './hooks/useWallet'",
      "import Header from './components/Header'",
      "import LoadingScreen from './components/LoadingScreen'",
      "import manifoldConfig from './manifold.config.js'",
      "import { NetworkManager } from './utils/networkManager'",
      "import { crossChainTransfer, getChainBalances, multiChainDeploy } from './utils/realFunctions'"
    ].join('\n')

    // Define the main component structure
    return `${imports}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [executingFunctions, setExecutingFunctions] = useState({})
  const [filteredFunctions, setFilteredFunctions] = useState([])
  
  const chainConfig = useChainConfig(manifoldConfig.selectedChains)
  const functionGen = useFunctionGenerator(
    manifoldConfig.selectedChains, 
    manifoldConfig.selectedFunctions,
    manifoldConfig.useCase
  )
  
  const { 
    account, 
    isConnected, 
    chainId,
    connectWallet, 
    disconnectWallet, 
    switchToChain,
    balance,
    isConnecting,
    network
  } = useWallet()

  // Handle function execution with proper error handling
  const handleFunctionExecute = async (functionName, parameters) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setExecutingFunctions(prev => ({ ...prev, [functionName]: true }))
    
    try {
      let result
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Route to appropriate function based on name
      const functionMap = {
        crossChainTransfer: async () => {
          const { fromChain = 20, toChain = 21, amount = '0.01', recipient } = parameters
          return crossChainTransfer(fromChain, toChain, amount, recipient || account, signer)
        },
        getChainBalances: async () => {
          const { chains = manifoldConfig.selectedChains } = parameters
          return getChainBalances(account, chains, signer)
        },
        multiChainDeploy: async () => {
          const { chains = manifoldConfig.selectedChains, bytecode, args = [] } = parameters
          return multiChainDeploy(chains, bytecode, args, signer)
        }
      }

      if (functionMap[functionName]) {
        result = await functionMap[functionName]()
      } else {
        const networkManager = new NetworkManager()
        result = await networkManager.executeTransaction(functionName, parameters)
      }
      
      if (result?.success) {
        toast.success(\`\${functionName} executed successfully!\`)
        return result
      } else {
        throw new Error(result?.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Function execution failed:', error)
      toast.error('Execution failed: ' + error.message)
      throw error
    } finally {
      setExecutingFunctions(prev => ({ ...prev, [functionName]: false }))
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (manifoldConfig?.selectedChains?.length > 0) {
          console.log('✅ Configuration loaded:', {
            useCase: manifoldConfig.useCase,
            chains: manifoldConfig.selectedChains,
            functions: manifoldConfig.selectedFunctions
          })
          
          setTimeout(() => {
            setIsLoading(false)
            toast.success('Functions loaded successfully!')
          }, 1000)
        } else {
          console.error('❌ Invalid configuration detected')
          toast.error('Configuration not found. Please check your setup.')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Failed to load configuration:', error)
        toast.error('Failed to load configuration')
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    let functions = Object.values(functionGen.generatedFunctions || {})
    
    if (searchTerm) {
      functions = functions.filter(func => 
        func.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFunctions(functions)
  }, [functionGen.generatedFunctions, searchTerm])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!manifoldConfig?.selectedChains?.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card-container max-w-lg mx-auto p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Configuration Missing</h1>
          <p className="text-slate-600 mb-8">
            No configuration found. Please run the setup command to configure your chains and functions.
          </p>
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 mb-6">
            <code className="text-lg">npm run setup</code>
          </div>
        </div>
      </div>
    )
  }

  const stats = functionGen.getFunctionStats?.() || { total: 0, chains: manifoldConfig.selectedChains.length }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        isConnected={isConnected}
        account={account}
        balance={balance}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-slate-800">Manifold Functions</h1>
          <div className="text-sm text-slate-500">${useCaseName}</div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Functions</div>
          </div>
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {manifoldConfig.selectedChains.length}
            </div>
            <div className="text-sm text-slate-500">Active Chains</div>
          </div>
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {isConnected ? 'Connected' : 'Not Connected'}
            </div>
            <div className="text-sm text-slate-500">Wallet Status</div>
          </div>
        </div>

        <div className="card-container p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Wallet Connection</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {isConnected ? (
                <div className="text-sm text-slate-600">
                  <p>Account: {account?.slice(0, 6)}...{account?.slice(-4)}</p>
                  <p>Network: {network ? ('Chain ' + chainId) : 'Unknown'}</p>
                  <p>Balance: {balance} KDA</p>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Connect your wallet to start interacting with functions
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <>
                  <select
                    value={chainId || ''}
                    onChange={(e) => {
                      const selectedChainId = parseInt(e.target.value)
                      const chainNumber = selectedChainId - 5900
                      switchToChain(chainNumber)
                    }}
                    className="input-primary text-sm"
                  >
                    <option value="">Select Chain</option>
                    {manifoldConfig.selectedChains.map(chain => (
                      <option key={chain} value={5900 + chain}>
                        Chain {chain}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={disconnectWallet}
                    className="btn-secondary text-sm"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card-container p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="Search functions..."
              className="input-primary w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="text-sm text-slate-500">
              {filteredFunctions.length} functions found
            </div>
          </div>

          <div className="space-y-4">
            {filteredFunctions.map((func) => (
              <FunctionCard
                key={func.name}
                functionData={func}
                chainConfigs={chainConfig.chainConfigs}
                onExecute={handleFunctionExecute}
                isExecuting={executingFunctions[func.name]}
                walletConnected={isConnected}
                currentAccount={account}
                currentNetwork={network}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App`
    }
  }
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { Code, Zap, BookOpen, Wallet, AlertCircle } from 'lucide-react'
import FunctionCard from './components/FunctionCard'
import { useFunctionGenerator } from './hooks/useFunctionGenerator'
import { useChainConfig } from './hooks/useChainConfig'
import { useWallet } from './hooks/useWallet'
import Header from './components/Header'
import LoadingScreen from './components/LoadingScreen'
import manifoldConfig from './manifold.config.js'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [executingFunctions, setExecutingFunctions] = useState({})
  const [filteredFunctions, setFilteredFunctions] = useState([])
  
  const chainConfig = useChainConfig(manifoldConfig.selectedChains)
  const functionGen = useFunctionGenerator(
    manifoldConfig.selectedChains, 
    manifoldConfig.selectedFunctions,
    manifoldConfig.useCase
  )

  const handleFunctionExecute = async (functionName, parameters) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setExecutingFunctions(prev => ({ ...prev, [functionName]: true }))
    
    try {
      let result
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Route to appropriate function based on name
      const functionMap = {
        crossChainTransfer: async () => {
          const { fromChain = 20, toChain = 21, amount = '0.01', recipient } = parameters
          return crossChainTransfer(fromChain, toChain, amount, recipient || account, signer)
        },
        getChainBalances: async () => {
          const { chains = manifoldConfig.selectedChains } = parameters
          return getChainBalances(account, chains, signer)
        },
        multiChainDeploy: async () => {
          const { chains = manifoldConfig.selectedChains, bytecode, args = [] } = parameters
          return multiChainDeploy(chains, bytecode, args, signer)
        }
      }

      if (functionMap[functionName]) {
        result = await functionMap[functionName]()
      } else {
        // For other functions, use the NetworkManager
        const networkManager = new NetworkManager()
        result = await networkManager.executeTransaction(functionName, parameters)
      }
      
      if (result?.success) {
        toast.success(\`\${functionName} executed successfully!\`)
        return result
      } else {
        throw new Error(result?.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Function execution failed:', error)
      toast.error(\`Execution failed: \${error.message}\`)
      throw error
    } finally {
      setExecutingFunctions(prev => ({ ...prev, [functionName]: false }))
    }
  }
  
  const { 
    account, 
    isConnected, 
    chainId,
    connectWallet, 
    disconnectWallet, 
    switchToChain,
    balance,
    isConnecting,
    network
  } = useWallet()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (manifoldConfig?.selectedChains?.length > 0) {
          console.log('✅ Configuration loaded:', {
            useCase: manifoldConfig.useCase,
            chains: manifoldConfig.selectedChains,
            functions: manifoldConfig.selectedFunctions
          })
          
          setTimeout(() => {
            setIsLoading(false)
            toast.success('Functions loaded successfully!')
          }, 1000)
        } else {
          console.error('❌ Invalid configuration detected')
          toast.error('Configuration not found. Please check your setup.')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Failed to load configuration:', error)
        toast.error('Failed to load configuration')
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    let functions = Object.values(functionGen.generatedFunctions || {})

    if (searchTerm) {
      functions = functions.filter(func => 
        func.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFunctions(functions)
  }, [functionGen.generatedFunctions, searchTerm])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!manifoldConfig?.selectedChains?.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card-container max-w-lg mx-auto p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Configuration Missing</h1>
          <p className="text-slate-600 mb-8">
            No configuration found. Please run the setup command to configure your chains and functions.
          </p>
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 mb-6">
            <code className="text-lg">npm run setup</code>
          </div>
        </div>
      </div>
    )
  }

  const stats = functionGen.getFunctionStats?.() || { total: 0, chains: manifoldConfig.selectedChains.length }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        isConnected={isConnected}
        account={account}
        balance={balance}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-slate-800">Manifold Functions</h1>
          <div className="text-sm text-slate-500">${useCaseName}</div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Functions</div>
          </div>
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {manifoldConfig.selectedChains.length}
            </div>
            <div className="text-sm text-slate-500">Active Chains</div>
          </div>
          <div className="card-container p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {isConnected ? 'Connected' : 'Not Connected'}
            </div>
            <div className="text-sm text-slate-500">Wallet Status</div>
          </div>
        </div>

        <div className="card-container p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Wallet Connection</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {isConnected ? (
                <div className="text-sm text-slate-600">
                  <p>Account: {account?.slice(0, 6)}...{account?.slice(-4)}</p>
                  <p>Network: {network ? \`Chain \${chainId}\` : 'Unknown'}</p>
                  <p>Balance: {balance} KDA</p>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Connect your wallet to start interacting with functions
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <>
                  <select
                    value={chainId || ''}
                    onChange={(e) => {
                      const selectedChainId = parseInt(e.target.value)
                      const chainNumber = selectedChainId - 5900
                      switchToChain(chainNumber)
                    }}
                    className="input-primary text-sm"
                  >
                    <option value="">Select Chain</option>
                    {manifoldConfig.selectedChains.map(chain => (
                      <option key={chain} value={5900 + chain}>
                        Chain {chain}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={disconnectWallet}
                    className="btn-secondary text-sm"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card-container p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="Search functions..."
              className="input-primary w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="text-sm text-slate-500">
              {filteredFunctions.length} functions found
            </div>
          </div>

          <div className="space-y-4">
            {filteredFunctions.map((func) => (
              <FunctionCard
                key={func.name}
                functionData={func}
                chainConfigs={chainConfig.chainConfigs}
                onExecute={handleFunctionExecute}
                isExecuting={executingFunctions[func.name]}
                walletConnected={isConnected}
                currentAccount={account}
                currentNetwork={network}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App`
  
  const content = `import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { Code, Zap, BookOpen, Wallet, AlertCircle } from 'lucide-react'
import FunctionCard from './components/FunctionCard'
import { useFunctionGenerator } from './hooks/useFunctionGenerator'
import { useChainConfig } from './hooks/useChainConfig'
import { useWallet } from './hooks/useWallet'
import Header from './components/Header'
import LoadingScreen from './components/LoadingScreen'
import manifoldConfig from './manifold.config.js'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [executingFunctions, setExecutingFunctions] = useState({})
  const [filteredFunctions, setFilteredFunctions] = useState([])
  
  const chainConfig = useChainConfig(manifoldConfig.selectedChains)
  const functionGen = useFunctionGenerator(
    manifoldConfig.selectedChains, 
    manifoldConfig.selectedFunctions, 
    manifoldConfig.useCase
  )
  
  const { 
    account, 
    isConnected, 
    chainId,
    connectWallet, 
    disconnectWallet, 
    switchToChain,
    balance,
    isConnecting,
    network
  } = useWallet()

  useEffect(() => {
    // Load configuration and initialize app
    const initializeApp = async () => {
      try {
        if (manifoldConfig && manifoldConfig.selectedChains && manifoldConfig.selectedChains.length > 0) {
          console.log('✅ Configuration loaded:', {
            useCase: manifoldConfig.useCase,
            chains: manifoldConfig.selectedChains,
            functions: manifoldConfig.selectedFunctions
          })
          
          setTimeout(() => {
            setIsLoading(false)
            toast.success('Functions loaded successfully!')
          }, 1000)
        } else {
          console.error('❌ Invalid configuration detected')
          toast.error('Configuration not found. Please check your setup.')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Failed to load configuration:', error)
        toast.error('Failed to load configuration')
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Filter functions based on search
  useEffect(() => {
    let functions = Object.values(functionGen.generatedFunctions || {})

    if (searchTerm) {
      functions = functions.filter(func => 
        func.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFunctions(functions)
  }, [functionGen.generatedFunctions, searchTerm])

  const handleFunctionExecute = async (functionName, parameters) => {
    // Check wallet connection first
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setExecutingFunctions(prev => ({ ...prev, [functionName]: true }))
    
    try {
      let result
      
      // Get wallet signer for transactions
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Route to appropriate real function based on function name
      switch (functionName) {
        case 'crossChainTransfer':
          console.log('🔄 Executing crossChainTransfer with parameters:', parameters)
          result = await crossChainTransfer(
            parameters.fromChain || 20, // Default to chain 20 if not specified
            parameters.toChain || 21,   // Default to chain 21 if not specified
            parameters.amount || '0.01', // Default to 0.01 KDA if not specified
            parameters.recipient || account, // Default to current account if not specified
            signer
          )
          break
        case 'getChainBalances':
          result = await getChainBalances(
            parameters.address || account, 
            parameters.chains || manifoldConfig.selectedChains, 
            signer
          )
          break
        case 'multiChainDeploy':
          result = await multiChainDeploy(
            parameters.chains || manifoldConfig.selectedChains,
            parameters.contractBytecode,
            parameters.constructorArgs || [],
            signer
          )
          break
        default:
          // For other functions, create a generic blockchain interaction
          const networkManager = new NetworkManager()
          result = await networkManager.executeTransaction(functionName, parameters)
          break
      }
      
      if (result && result.success) {
        toast.success(\`\${functionName} executed successfully!\`)
        return result
      } else {
        throw new Error(result?.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Function execution failed:', error)
      const errorMsg = error.message || 'Unknown error occurred'
      toast.error(\`Execution failed: \${errorMsg}\`)
      throw error
    } finally {
      setExecutingFunctions(prev => ({ ...prev, [functionName]: false }))
    }
  }

  const stats = functionGen.getFunctionStats ? functionGen.getFunctionStats() : { total: 0, chains: 0 }
  const useCaseName = "${useCaseNames[config.useCase] || 'Custom Application'}"

  if (isLoading) {
    return <LoadingScreen />
  }

  // Show error state if no config
  if (!manifoldConfig || !manifoldConfig.selectedChains || manifoldConfig.selectedChains.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card-container max-w-lg mx-auto p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Configuration Missing</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            No configuration found. Please run the setup command to configure your chains and functions.
          </p>
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-slate-800">Run this command:</p>
              <button
                onClick={() => navigator.clipboard.writeText('npm run setup')}
                className="text-slate-500 hover:text-slate-700 p-1"
                title="Copy command"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <code className="code-inline text-lg">npm run setup</code>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm text-slate-500">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="font-medium text-blue-700">1. Select Use Case</div>
              <div className="text-blue-600">DeFi, NFT, Bridge</div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="font-medium text-green-700">2. Choose Chains</div>
              <div className="text-green-600">20, 21, 22, 23, 24</div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <div className="font-medium text-purple-700">3. Generate</div>
              <div className="text-purple-600">Ready to use!</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        isConnected={isConnected}
        account={account}
        balance={balance}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gradient tracking-tight mb-2">
                Manifold Functions
              </h1>
              <p className="text-xl text-slate-600">
                Interactive Swagger-style API for {useCaseName}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Kadena Chainweb EVM Functions - Multi-chain Ready
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4">
              <div className="feature-card min-w-[120px] text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Code className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-slate-700">{stats.total}</span>
                </div>
                <p className="text-xs text-slate-500">Functions</p>
              </div>
              <div className="feature-card min-w-[120px] text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-slate-700">{stats.chains || manifoldConfig.selectedChains.length}</span>
                </div>
                <p className="text-xs text-slate-500">Chains</p>
              </div>
              <div className="feature-card min-w-[120px] text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold text-slate-700">API</span>
                </div>
                <p className="text-xs text-slate-500">Ready</p>
              </div>
            </div>
          </div>

          {/* Wallet Connection Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="card-container p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className={\`w-3 h-3 rounded-full \${isConnected ? 'bg-green-500' : 'bg-red-500'}\`}></div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Wallet Status: {isConnected ? 'Connected' : 'Disconnected'}
                </h3>
                {isConnected && (
                  <div className="text-sm text-slate-600">
                    <p>Account: {account?.slice(0, 6)}...{account?.slice(-4)}</p>
                    <p>Network: {network ? \`Chain \${network.chainId}\` : 'Unknown'}</p>
                    <p>Balance: {balance} KDA</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <select
                    value={chainId || ''}
                    onChange={(e) => {
                      const selectedChainId = parseInt(e.target.value)
                      // Convert chainId to chain number (5920 -> 20, 5921 -> 21, etc.)
                      const chainNumber = selectedChainId - 5900
                      switchToChain(chainNumber)
                    }}
                    className="input-primary text-sm"
                  >
                    <option value="">Select Chain</option>
                    <option value="5920">Chain 20</option>
                    <option value="5921">Chain 21</option>
                    <option value="5922">Chain 22</option>
                    <option value="5923">Chain 23</option>
                    <option value="5924">Chain 24</option>
                  </select>
                  <button
                    onClick={disconnectWallet}
                    className="btn-secondary text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {!isConnected && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Wallet Required</p>
                <p>Connect your MetaMask wallet to execute blockchain functions on Kadena Chainweb EVM networks.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Configuration Summary Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-container p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">
              Configuration Overview
            </h2>
            <div className="text-sm text-slate-500">
              Generated for {useCaseName}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Chains Section */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-slate-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active Chains
              </h3>
              <div className="flex flex-wrap gap-2">
                {manifoldConfig.selectedChains.map((chain) => (
                  <span
                    key={chain}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-mono border border-green-200"
                  >
                    Chain {chain}
                  </span>
                ))}
              </div>
            </div>

            {/* Functions Section */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-slate-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Generated Functions
              </h3>
              <p className="text-blue-700 font-semibold text-lg">
                {stats.total} Functions Ready
              </p>
              <p className="text-blue-600 text-sm">
                Multi-chain compatible
              </p>
            </div>

            {/* Use Case Section */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 md:col-span-2 lg:col-span-1">
              <h3 className="font-medium text-slate-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Use Case
              </h3>
              <p className="text-purple-700 font-semibold">
                {useCaseName}
              </p>
              <p className="text-purple-600 text-sm">
                Optimized templates
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="card-container p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search functions..."
                className="input-primary w-full pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">
              {filteredFunctions.length} of {stats.total} functions
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Function Cards */}
        <div className="space-y-6">
          {filteredFunctions.length > 0 ? (
            filteredFunctions.map((functionData) => (
              <FunctionCard
                key={functionData.name}
                functionData={functionData}
                chainConfigs={chainConfig.chainConfigs || []}
                onExecute={handleFunctionExecute}
                isExecuting={executingFunctions[functionData.name] || false}
                walletConnected={isConnected}
                currentAccount={account}
                currentNetwork={network}
              />
            ))
          ) : functionGen.isGenerating ? (
            <div className="card-container text-center py-16 animate-fade-in">
              <div className="animate-pulse-slow">
                <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                  Generating Functions...
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Creating your custom multi-chain functions for {useCaseName}
                </p>
                <div className="mt-6 w-48 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-container text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                No Functions Found
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search term to find the functions you need' : 'No functions have been generated yet. Please check your configuration.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn-primary"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Info Section */}
        <div className="mt-16 card-container p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Kadena Chainweb EVM Integration
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              All functions are optimized for Kadena's Ethereum-compatible chains (20-24) with built-in multi-chain support and KDA currency integration.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Multi-Chain
                </h4>
                <p className="text-green-700 text-sm">Cross-chain transfers & deployment ready</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  EVM Compatible
                </h4>
                <p className="text-blue-700 text-sm">Ethereum tools & libraries supported</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  KDA Native
                </h4>
                <p className="text-purple-700 text-sm">Native KDA currency integration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Function Cards */}
        <div className="space-y-8 mt-8">
          {filteredFunctions.map((functionName) => (
            <FunctionCard
              key={functionName}
              name={functionName}
              description={functionGen.getFunctionDescription?.(functionName) || ''}
              parameters={functionGen.getFunctionParameters?.(functionName) || []}
              isExecuting={executingFunctions[functionName]}
              onExecute={(params) => executeFunction(functionName, params)}
              chains={manifoldConfig.selectedChains}
            />
          ))}
        </div>

      {/* Professional Footer */}
      <footer className="bg-slate-800 text-slate-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Manifold</h3>
            </div>
            <p className="text-slate-400 text-lg mb-6">
              Kadena Chainweb EVM Multi-Chain Function Generator
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-8">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-semibold text-slate-200 mb-1">Active Chains</div>
                <div className="text-slate-400">{manifoldConfig.selectedChains?.join(', ') || 'None'}</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-semibold text-slate-200 mb-1">Functions</div>
                <div className="text-slate-400">{stats.total} Generated</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-semibold text-slate-200 mb-1">Network</div>
                <div className="text-slate-400">Testnet Ready</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-semibold text-slate-200 mb-1">Compatibility</div>
                <div className="text-slate-400">EVM & KDA</div>
              </div>
            </div>
            
            <div className="border-t border-slate-700 pt-6">
              <p className="text-slate-500 text-sm">
                Built with precision for the Kadena ecosystem
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App`
  
  const appJsxContent = generateAppJsxTemplate(useCaseNames[config.useCase] || 'Custom Application')
  fs.writeFileSync(path.join(targetPath, 'src/App.jsx'), appJsxContent)
  console.log(`${colors.green}✅ Generated clean App.jsx${colors.reset}`)
}

function generateComponentContent(componentName) {
  switch (componentName) {
    case 'Header':
      return `import React from 'react'
import { Wallet } from 'lucide-react'

export default function Header({ 
  isConnected, 
  account, 
  balance, 
  connectWallet, 
  disconnectWallet 
}) {
  return (
    <header className="bg-white shadow-xl border-b border-slate-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-800">Manifold</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            EVM Multi-Chain
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <button
              onClick={disconnectWallet}
              className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Wallet className="w-4 h-4 mr-2" />
              <span className="font-medium">
                {account.slice(0, 6)}...{account.slice(-4)} ({balance})
              </span>
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Wallet className="w-4 h-4 mr-2" />
              <span className="font-medium">Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}`
    case 'LoadingScreen':
      return `import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-slate-800">Loading...</h2>
        <p className="mt-2 text-slate-600">Preparing your multi-chain environment</p>
      </div>
    </div>
  )
}`
    default:
      return ''
  }
}

async function generateComponents(targetPath) {
  const components = [
    { name: 'FunctionCard', required: true },
    { name: 'Header', required: true },
    { name: 'LoadingScreen', required: true }
  ]

  for (const component of components) {
    const sourceFile = path.join(__dirname, '..', 'src', 'components', `${component.name}.jsx`)
    const targetFile = path.join(targetPath, 'src', 'components', `${component.name}.jsx`)
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile)
      console.log(`${colors.green}✅ Copied ${component.name} component${colors.reset}`)
    } else if (component.required) {
      // If component is required but source doesn't exist, create it
      const componentContent = generateComponentContent(component.name)
      fs.writeFileSync(targetFile, componentContent)
      console.log(`${colors.green}✅ Generated ${component.name} component${colors.reset}`)
    }
  }
}

async function generateIndexCss(targetPath) {
  const cssContent = `@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@layer base {
  /* CSS Variables: Light Theme */
  :root {
    --color-bg: #f8fafc; /* slate-50 */
    --color-card-bg: #ffffff;
    --color-text-primary: #1e293b; /* slate-800 */
    --color-text-secondary: #475569; /* slate-600 */
    --color-text-muted: #64748b; /* slate-500 */
    --color-border: #e2e8f0; /* slate-200 */
    --color-accent: #22c55e; /* green-500 */
  }

  /* Global styles */
  * {
    @apply box-border m-0 p-0;
  }

  html {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply min-h-screen leading-relaxed;
    background-color: var(--color-bg);
    color: var(--color-text-primary);
  }
}

@layer components {
  /* Feature cards and general cards */
  .feature-card {
    @apply bg-white p-6 rounded-lg border border-slate-200 transition-all duration-200 ease-in-out;
  }
  .feature-card:hover {
    @apply transform -translate-y-1 shadow-md;
  }

  /* Function cards with professional styling */
  .function-card-hover {
    @apply transition-all duration-200 ease-in-out;
  }
  .function-card-hover:hover {
    @apply transform -translate-y-1 shadow-function-card;
  }

  /* Professional button styling */
  .btn-primary {
    @apply px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 border border-slate-300 transition-colors;
  }

  /* Input styling */
  .input-primary {
    @apply px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors;
  }

  /* Code block styling */
  .code-block {
    @apply bg-slate-900 rounded-lg p-4;
  }
  .code-block pre {
    @apply text-slate-100 font-mono text-sm overflow-x-auto m-0;
  }

  /* Reusable inline code snippet style */
  .code-inline {
    @apply bg-slate-100 text-slate-700 font-mono text-sm px-1.5 py-0.5 rounded-md border border-slate-200;
  }

  /* Card container styling */
  .card-container {
    @apply bg-white rounded-2xl shadow-swagger border border-slate-200 overflow-hidden;
  }

  /* Header styling */
  .header-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

@layer utilities {
  /* Text gradient utility */
  .text-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Custom scrollbar for a consistent look */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }
  ::-webkit-scrollbar-track {
    background: var(--color-border);
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1; /* slate-300 */
    @apply rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8; /* slate-400 */
  }
}`
  
  fs.writeFileSync(path.join(targetPath, 'src/index.css'), cssContent)
  console.log(`${colors.green}✅ Generated index.css${colors.reset}`)
}

async function generateHooks(targetPath) {
  // Copy hooks
  const hookFiles = ['useFunctionGenerator.js', 'useChainConfig.js']
  
  hookFiles.forEach(file => {
    const sourceFile = path.join(__dirname, '..', 'src', 'hooks', file)
    const targetFile = path.join(targetPath, 'src', 'hooks', file)
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile)
      console.log(`${colors.green}✅ Copied ${file}${colors.reset}`)
    }
  })
  
  // Generate real wallet connection hook
  await generateWalletHook(targetPath)
  await generateNetworkManager(targetPath)
}

async function generateReadme(targetPath) {
  const useCaseNames = {
    defi: 'DeFi Protocol',
    gaming: 'Gaming Platform', 
    nft: 'NFT Marketplace',
    bridge: 'Cross-chain Bridge',
    custom: 'Custom Application'
  }
  
  const content = `# Generated Manifold Application

# **${useCaseNames[config.useCase] || 'Custom Application'}** built with Kadena Chainweb EVM

## 📋 Configuration

- **Use Case**: ${config.useCase.toUpperCase()}
- **Chains**: ${config.selectedChains.join(', ')} (${config.chainCount} chains)
- **Functions**: ${config.selectedFunctions.length} functions
- **Generated**: ${new Date().toLocaleString()}

## 🎯 Available Functions

${config.selectedFunctions.map(func => `- \`${func}()\``).join('\n')}

## Supported Chains

${config.selectedChains.map(chain => {
  const chainId = 5920 + (chain - 20)
  return `- **Chain ${chain}**: Chain ID ${chainId} | [Explorer](http://chain-${chain}.evm-testnet-blockscout.chainweb.com/)`
}).join('\n')}

## Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open in browser**: [http://localhost:5173](http://localhost:5173)

## Usage

1. Open the Swagger-style interface in your browser
2. Browse available functions in the left sidebar
3. Click on any function to expand parameters
4. Fill in parameters and click "Try it out"
5. Copy the generated code for your project

## 📚 Function Details

Each function includes:
- **Interactive parameters** with validation
- **Live execution** with real blockchain calls
- **Code generation** in JavaScript/TypeScript
- **Gas estimation** and complexity indicators
- **Copy-paste ready** examples

## 🔧 Technical Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: Ethers.js v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Network Information

- **Network**: Kadena Chainweb EVM Testnet
- **Currency**: KDA (for all chains)
- **RPC Pattern**: \`https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/{CHAIN}/evm/rpc\`
- **Explorer Pattern**: \`http://chain-{CHAIN}.evm-testnet-blockscout.chainweb.com/\`

## 📖 Learn More

- [Kadena Chainweb EVM Documentation](https://kadena.io)
- [Architecture Documentation](../architecture.md)
- [Source Repository](https://github.com/sohampawar1866/manifold)

---
*Generated by Manifold v1.0.0 - Kadena Chainweb EVM Function Generator*`
  
  fs.writeFileSync(path.join(targetPath, 'README.md'), content)
  console.log(`${colors.green}✅ Generated README.md${colors.reset}`)
}

async function generateUtils(targetPath) {
  // Copy essential utils
  const utilFiles = ['chainConfig.js', 'functionTemplates.js', 'chainCombinations.js']
  
  utilFiles.forEach(file => {
    const sourceFile = path.join(__dirname, '..', 'src', 'utils', file)
    const targetFile = path.join(targetPath, 'src', 'utils', file)
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile)
      console.log(`${colors.green}✅ Copied ${file}${colors.reset}`)
    }
  })
}

async function generateWalletHook(targetPath) {
  const content = `import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// Kadena Chainweb EVM Networks
const KADENA_NETWORKS = {
  20: {
    chainId: '0x1720', // 5920 in hex
    chainName: 'Kadena Chainweb EVM Chain 20',
    rpcUrls: ['https://erpc.testnet.chainweb.com/chain-20'],
    wsRpcUrls: ['wss://erpc.testnet.chainweb.com/chain-20'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['https://explorer.testnet.chainweb.com/chain-20']
  },
  21: {
    chainId: '0x1721', // 5921 in hex
    chainName: 'Kadena Chainweb EVM Chain 21',
    rpcUrls: ['https://erpc.testnet.chainweb.com/chain-21'],
    wsRpcUrls: ['wss://erpc.testnet.chainweb.com/chain-21'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['https://explorer.testnet.chainweb.com/chain-21']
  },
  22: {
    chainId: '0x1722', // 5922 in hex
    chainName: 'Kadena Chainweb EVM Chain 22',
    rpcUrls: ['https://erpc.testnet.chainweb.com/chain-22'],
    wsRpcUrls: ['wss://erpc.testnet.chainweb.com/chain-22'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['https://explorer.testnet.chainweb.com/chain-22']
  },
  23: {
    chainId: '0x1723', // 5923 in hex
    chainName: 'Kadena Chainweb EVM Chain 23',
    rpcUrls: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['http://chain-23.evm-testnet-blockscout.chainweb.com/']
  },
  24: {
    chainId: '0x1724', // 5924 in hex
    chainName: 'Kadena Chainweb EVM Chain 24',
    rpcUrls: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['http://chain-24.evm-testnet-blockscout.chainweb.com/']
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState('0')

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  // Update balance when account or chain changes
  useEffect(() => {
    if (account && provider) {
      updateBalance()
    }
  }, [account, provider, chainId])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const network = await provider.getNetwork()
          
          setAccount(accounts[0])
          setProvider(provider)
          setSigner(signer)
          setChainId(Number(network.chainId))
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not found! Please install MetaMask.')
      return false
    }

    setIsConnecting(true)
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()
      
      setAccount(accounts[0])
      setProvider(provider)
      setSigner(signer)
      setChainId(Number(network.chainId))
      
      toast.success('Wallet connected successfully!')
      return true
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setBalance('0')
    toast.success('Wallet disconnected')
  }

  const switchToChain = async (chainNumber) => {
    if (!window.ethereum) {
      toast.error('MetaMask not found!')
      return false
    }

    const network = KADENA_NETWORKS[chainNumber]
    if (!network) {
      toast.error(\`Unsupported chain: \${chainNumber}\`)
      return false
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      })
      
      toast.success(\`Switched to \${network.chainName}\`)
      return true
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          })
          
          toast.success(\`Added and switched to \${network.chainName}\`)
          return true
        } catch (addError) {
          console.error('Error adding network:', addError)
          toast.error('Failed to add network')
          return false
        }
      } else {
        console.error('Error switching network:', switchError)
        toast.error('Failed to switch network')
        return false
      }
    }
  }

  const updateBalance = async () => {
    if (!provider || !account) return
    
    try {
      const balance = await provider.getBalance(account)
      setBalance(ethers.formatEther(balance))
    } catch (error) {
      console.error('Error updating balance:', error)
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(Number(chainId))
    // Reload the page to reset state
    window.location.reload()
  }

  const getNetworkName = () => {
    const chain = Object.values(KADENA_NETWORKS).find(
      network => parseInt(network.chainId, 16) === chainId
    )
    return chain ? chain.chainName : 'Unknown Network'
  }

  const isKadenaNetwork = () => {
    return Object.values(KADENA_NETWORKS).some(
      network => parseInt(network.chainId, 16) === chainId
    )
  }

  return {
    // State
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnecting,
    isConnected: !!account,
    isKadenaNetwork: isKadenaNetwork(),
    networkName: getNetworkName(),
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToChain,
    updateBalance,
    
    // Network info
    supportedNetworks: KADENA_NETWORKS
  }
}

export default useWallet`
  
  fs.writeFileSync(path.join(targetPath, 'src/hooks/useWallet.js'), content)
  console.log(`${colors.green}✅ Generated useWallet.js with real wallet connectivity${colors.reset}`)
}

async function generateNetworkManager(targetPath) {
  const content = `import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// Real blockchain interaction utilities for Kadena Chainweb EVM
export class NetworkManager {
  constructor() {
    this.providers = {}
    this.networks = {
      20: {
        chainId: 5920,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc',
        explorer: 'http://chain-20.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 20'
      },
      21: {
        chainId: 5921,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc',
        explorer: 'http://chain-21.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 21'
      },
      22: {
        chainId: 5922,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/22/evm/rpc',
        explorer: 'http://chain-22.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 22'
      },
      23: {
        chainId: 5923,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc',
        explorer: 'http://chain-23.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 23'
      },
      24: {
        chainId: 5924,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc',
        explorer: 'http://chain-24.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 24'
      }
    }
    
    this.initializeProviders()
  }

  initializeProviders() {
    Object.keys(this.networks).forEach(chainNum => {
      const network = this.networks[chainNum]
      this.providers[chainNum] = new ethers.JsonRpcProvider(network.rpc)
    })
  }

  getProvider(chainNumber) {
    if (!this.providers[chainNumber]) {
      throw new Error(\`No provider found for chain \${chainNumber}\`)
    }
    return this.providers[chainNumber]
  }

  getNetwork(chainNumber) {
    if (!this.networks[chainNumber]) {
      throw new Error(\`Network \${chainNumber} not supported\`)
    }
    return this.networks[chainNumber]
  }

  async getBalance(chainNumber, address) {
    try {
      const provider = this.getProvider(chainNumber)
      const balance = await provider.getBalance(address)
      return {
        wei: balance.toString(),
        eth: ethers.formatEther(balance),
        chainNumber,
        chainName: this.networks[chainNumber].name
      }
    } catch (error) {
      console.error(\`Error getting balance on chain \${chainNumber}:\`, error)
      throw error
    }
  }

  async sendTransaction(chainNumber, signer, transaction) {
    try {
      const network = this.getNetwork(chainNumber)
      const tx = await signer.sendTransaction(transaction)
      const receipt = await tx.wait()
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        explorerUrl: \`\${network.explorer}tx/\${tx.hash}\`,
        chainId: network.chainId,
        chainName: network.name
      }
    } catch (error) {
      console.error(\`Transaction failed on chain \${chainNumber}:\`, error)
      throw error
    }
  }

  async getBalanceMultiChain(chainNumbers, address) {
    const balances = {}
    
    for (const chainNum of chainNumbers) {
      try {
        const balance = await this.getBalance(chainNum, address)
        balances[chainNum] = balance
      } catch (error) {
        console.error(\`Failed to get balance for chain \${chainNum}:\`, error)
        balances[chainNum] = {
          wei: '0',
          eth: '0',
          chainNumber: chainNum,
          chainName: this.networks[chainNum]?.name || \`Chain \${chainNum}\`,
          error: error.message
        }
      }
    }
    
    return balances
  }

  getExplorerUrl(chainNumber, txHash) {
    const network = this.getNetwork(chainNumber)
    return \`\${network.explorer}tx/\${txHash}\`
  }

  async executeTransaction(functionName, parameters) {
    try {
      console.log(\`🔄 Executing generic transaction: \${functionName}\`, parameters)
      
      // For generic functions, create a simple transaction
      const chainNumber = parameters.chain || parameters.fromChain || 20
      const provider = this.getProvider(chainNumber)
      
      // This is a placeholder for generic function execution
      // In a real implementation, you would route to specific function logic
      return {
        success: true,
        functionName,
        parameters,
        result: {
          message: \`Generic execution of \${functionName} completed\`,
          chainId: this.networks[chainNumber].chainId,
          chainName: this.networks[chainNumber].name,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error(\`Generic transaction failed:\`, error)
      throw error
    }
  }
}

export const networkManager = new NetworkManager()
export default networkManager`
  
  fs.writeFileSync(path.join(targetPath, 'src/utils/networkManager.js'), content)
  console.log(`${colors.green}✅ Generated networkManager.js with real blockchain utilities${colors.reset}`)
}

async function generateRealFunctionTemplates(targetPath) {
  const content = `// Real Working Function Templates for Kadena Chainweb EVM
import { ethers } from 'ethers'
import { NetworkManager } from './networkManager'
import toast from 'react-hot-toast'

// Contract Configuration
const CONTRACT_ADDRESSES = {
  20: {
    BRIDGE_CONTRACT: '0x0000000000000000000000000000000000000001',
    TOKEN_CONTRACT: '0x0000000000000000000000000000000000000002',
    DEFI_CONTRACT: '0x0000000000000000000000000000000000000003',
    ROUTER_CONTRACT: '0x0000000000000000000000000000000000000004'
  },
  21: {
    BRIDGE_CONTRACT: '0x0000000000000000000000000000000000000001',
    TOKEN_CONTRACT: '0x0000000000000000000000000000000000000002',
    DEFI_CONTRACT: '0x0000000000000000000000000000000000000003',
    ROUTER_CONTRACT: '0x0000000000000000000000000000000000000004'
  }
}

// Kadena Chainweb EVM Network Configuration
const KADENA_NETWORKS = {
  20: {
    chainId: 5920,
    rpcUrl: 'https://erpc.testnet.chainweb.com/chain-20',
    wsRpc: 'wss://erpc.testnet.chainweb.com/chain-20',
    name: 'Chain 20',
    explorer: 'https://explorer.testnet.chainweb.com/chain-20',
    contracts: CONTRACT_ADDRESSES[20]
  },
  21: {
    chainId: 5921,
    rpcUrl: 'https://erpc.testnet.chainweb.com/chain-21',
    wsRpc: 'wss://erpc.testnet.chainweb.com/chain-21',
    name: 'Chain 21',
    explorer: 'https://explorer.testnet.chainweb.com/chain-21',
    contracts: {
      bridge: process.env.BRIDGE_CONTRACT_21,
      router: process.env.ROUTER_CONTRACT_21
    }
  },
  22: {
    chainId: 5922,
    rpcUrl: 'https://erpc.testnet.chainweb.com/chain-22',
    wsRpc: 'wss://erpc.testnet.chainweb.com/chain-22',
    name: 'Chain 22',
    explorer: 'https://explorer.testnet.chainweb.com/chain-22',
    contracts: {
      bridge: process.env.BRIDGE_CONTRACT_22,
      router: process.env.ROUTER_CONTRACT_22
    }
  }
}

export async function crossChainTransfer(fromChain, toChain, amount, recipient, signer) {
  console.log('🔄 crossChainTransfer called with:', { fromChain, toChain, amount, recipient, signer: !!signer })
  
  if (!signer) {
    throw new Error('Wallet not connected. Please connect your wallet first.')
  }
  
  try {
    // Validate inputs with specific error messages
    if (!fromChain) {
      throw new Error('From Chain is required. Please select a source chain.')
    }
    if (!toChain) {
      throw new Error('To Chain is required. Please select a destination chain.')
    }
    if (!amount) {
      throw new Error('Amount is required. Please enter an amount to transfer.')
    }
    if (!recipient) {
      throw new Error('Recipient address is required. Please enter a wallet address.')
    }
    
    if (fromChain === toChain) {
      throw new Error('Cannot transfer to the same chain')
    }
    
    // Check current network matches fromChain
    const currentNetwork = await signer.provider.getNetwork()
    const expectedChainId = networkManager.networks[fromChain].chainId
    
    if (Number(currentNetwork.chainId) !== expectedChainId) {
      throw new Error(\`Please switch to Chain \${fromChain} (Chain ID: \${expectedChainId})\`)
    }
    
    // Check balance
    const balance = await signer.provider.getBalance(await signer.getAddress())
    const transferAmount = ethers.parseEther(amount.toString())
    
    if (balance < transferAmount) {
      throw new Error(\`Insufficient balance. You have \${ethers.formatEther(balance)} KDA\`)
    }
    
    console.log(\`🚀 Initiating transfer from Chain \${fromChain} to Chain \${toChain}\`)
    console.log(\`💰 Amount: \${amount} KDA\`)
    console.log(\`📍 Recipient: \${recipient}\`)
    
    // Execute the transfer
    const transaction = {
      to: recipient,
      value: transferAmount,
      gasLimit: 21000
    }
    
    const result = await networkManager.sendTransaction(fromChain, signer, transaction)
    
    toast.success(\`✅ Transfer completed! TX: \${result.txHash.slice(0,8)}...\`)
    
    return {
      ...result,
      fromChain,
      toChain,
      amount: amount.toString(),
      recipient,
      amountFormatted: \`\${amount} KDA\`,
      message: \`Successfully transferred \${amount} KDA from Chain \${fromChain} to address \${recipient}\`
    }
    
  } catch (error) {
    console.error('❌ Cross-chain transfer failed:', error)
    toast.error(\`Transfer failed: \${error.message}\`)
    throw error
  }
}

export async function getChainBalances(address, chainNumbers, signer = null) {
  console.log('🔍 getChainBalances called with:', { address, chainNumbers, signer: !!signer })
  
  const networkManager = new NetworkManager()
  
  try {
    if (!address) {
      throw new Error('Wallet address is required. Please enter an address to check balances.')
    }
    
    if (!chainNumbers || chainNumbers.length === 0) {
      throw new Error('Chain numbers are required. Please select chains to check balances.')
    }
    
    console.log(\`🔍 Fetching balances for \${address} across chains: \${chainNumbers.join(', ')}\`)
    
    const balances = await networkManager.getBalanceMultiChain(chainNumbers, address)
    
    let totalBalance = 0
    const results = {}
    
    for (const [chainNum, balance] of Object.entries(balances)) {
      const balanceInEth = parseFloat(balance.eth)
      totalBalance += balanceInEth
      
      results[chainNum] = {
        ...balance,
        formatted: \`\${parseFloat(balance.eth).toFixed(4)} KDA\`,
        chainName: networkManager.networks[chainNum].name,
        explorerUrl: \`\${networkManager.networks[chainNum].explorer}address/\${address}\`
      }
    }
    
    console.log(\`✅ Total balance across all chains: \${totalBalance.toFixed(4)} KDA\`)
    
    return {
      success: true,
      address,
      chains: chainNumbers,
      balances: results,
      totalBalance: totalBalance.toFixed(4),
      totalBalanceFormatted: \`\${totalBalance.toFixed(4)} KDA\`,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch balances:', error)
    toast.error(\`Failed to get balances: \${error.message}\`)
    throw error
  }
}

export async function multiChainDeploy(chains, contractBytecode, constructorArgs = [], signer) {
  const networkManager = new NetworkManager()
  
  if (!signer) {
    throw new Error('Wallet not connected. Please connect your wallet first.')
  }
  
  try {
    console.log(\`🚀 Starting multi-chain deployment to chains: \${chains.join(', ')}\`)
    
    const deploymentResults = {}
    let successCount = 0
    
    for (const chainNum of chains) {
      try {
        console.log(\`📦 Deploying to Chain \${chainNum}...\`)
        
        // Check if we're on the correct network
        const currentNetwork = await signer.provider.getNetwork()
        const expectedChainId = networkManager.networks[chainNum].chainId
        
        if (Number(currentNetwork.chainId) !== expectedChainId) {
          throw new Error(\`Please switch to Chain \${chainNum} (Chain ID: \${expectedChainId})\`)
        }
        
        // For demo purposes, we'll deploy a simple contract
        // In real usage, you'd provide actual contract bytecode
        const factory = new ethers.ContractFactory(
          ['constructor()'], // Simple ABI
          contractBytecode || '0x608060405234801561001057600080fd5b50', // Minimal bytecode
          signer
        )
        
        const contract = await factory.deploy(...constructorArgs)
        await contract.waitForDeployment()
        
        const address = await contract.getAddress()
        const deployTx = contract.deploymentTransaction()
        
        deploymentResults[chainNum] = {
          success: true,
          chainId: expectedChainId,
          chainName: networkManager.networks[chainNum].name,
          contractAddress: address,
          deploymentTx: deployTx.hash,
          explorerUrl: networkManager.getExplorerUrl(chainNum, deployTx.hash),
          gasUsed: (await deployTx.wait()).gasUsed.toString()
        }
        
        successCount++
        console.log(\`✅ Deployed on Chain \${chainNum}: \${address}\`)
        
      } catch (error) {
        console.error(\`❌ Deployment failed on Chain \${chainNum}:\`, error)
        deploymentResults[chainNum] = {
          success: false,
          error: error.message,
          chainName: networkManager.networks[chainNum].name
        }
      }
    }
    
    const result = {
      success: successCount > 0,
      totalDeployments: chains.length,
      successfulDeployments: successCount,
      failedDeployments: chains.length - successCount,
      deployments: deploymentResults,
      summary: \`Deployed to \${successCount}/\${chains.length} chains successfully\`
    }
    
    if (successCount > 0) {
      toast.success(\`✅ Deployed to \${successCount}/\${chains.length} chains\`)
    } else {
      toast.error('❌ All deployments failed')
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Multi-chain deployment failed:', error)
    toast.error(\`Deployment failed: \${error.message}\`)
    throw error
  }
}

// Export all real functions
export const REAL_FUNCTIONS = {
  crossChainTransfer,
  getChainBalances,
  multiChainDeploy
}

export default REAL_FUNCTIONS`

  fs.writeFileSync(path.join(targetPath, 'src/utils/realFunctions.js'), content)
  console.log(`${colors.green}✅ Generated realFunctions.js with working blockchain integration${colors.reset}`)
}

runSetup()
