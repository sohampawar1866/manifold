#!/usr/bin/env node

const readline = require('readline')
const fs = require('fs')
const path = require('path')

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

const config = {
  useCase: '',
  chainCount: 0,
  selectedChains: [],
  selectedFunctions: [],
  functionSelectionMode: ''
}

// Available function templates
const coreFunctions = [
  { name: 'crossChainTransfer', description: 'Transfer tokens between selected chains' },
  { name: 'multiChainDeploy', description: 'Deploy contracts across multiple chains' },
  { name: 'getChainBalances', description: 'Get balances across all selected chains' }
]

const defiFunctions = [
  { name: 'addLiquidityMultiChain', description: 'Add liquidity across multiple chains' },
  { name: 'executeArbitrage', description: 'Execute arbitrage opportunities' },
  { name: 'crossChainYieldFarm', description: 'Yield farming across chains' },
  { name: 'multiChainLending', description: 'Multi-chain lending operations' }
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
  
  console.log(`\n${colors.bold}🚀 Setup Complete!${colors.reset}`)
  console.log(`${colors.blue}Your generated project is in the gen_manifold folder.${colors.reset}`)
  console.log(`${colors.blue}Run the following commands to start your application:${colors.reset}\n`)
  console.log(`${colors.cyan}${colors.bold}  cd gen_manifold${colors.reset}`)
  console.log(`${colors.cyan}${colors.bold}  npm install${colors.reset}`)
  console.log(`${colors.cyan}${colors.bold}  npm run dev${colors.reset}\n`)
  console.log(`${colors.blue}Your Swagger-style function explorer will be available at:${colors.reset}`)
  console.log(`${colors.cyan}${colors.bold}  http://localhost:5173${colors.reset}\n`)
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
  await generateMainJsx(targetPath)
  await generateCleanApp(targetPath)
  await generateComponents(targetPath)
  await generateHooks(targetPath)
  await generateUtils(targetPath)
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
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "ethers": "^6.13.2",
      "lucide-react": "^0.441.0",
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

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom']
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
      boxShadow: {
        'swagger': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'swagger-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      },
      colors: {
        'swagger-green': '#22c55e'
      }
    },
  },
  plugins: [],
}`
  
  fs.writeFileSync(path.join(targetPath, 'tailwind.config.js'), content)
  console.log(`${colors.green}✅ Generated tailwind.config.js${colors.reset}`)
}

async function generateMainJsx(targetPath) {
  const content = `import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
)`
  
  fs.writeFileSync(path.join(targetPath, 'src/main.jsx'), content)
}

async function generateCleanApp(targetPath) {
  const useCaseNames = {
    defi: 'DeFi Protocol',
    gaming: 'Gaming Platform', 
    nft: 'NFT Marketplace',
    bridge: 'Cross-chain Bridge',
    custom: 'Custom Application'
  }
  
  const content = `import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Code, Zap, BookOpen } from 'lucide-react'
import FunctionCard from './components/FunctionCard'
import { useFunctionGenerator } from './hooks/useFunctionGenerator'
import { useChainConfig } from './hooks/useChainConfig'
import manifoldConfig from './manifold.config.js'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [executingFunctions, setExecutingFunctions] = useState({})
  
  const chainConfig = useChainConfig(manifoldConfig.selectedChains)
  const functionGen = useFunctionGenerator(
    manifoldConfig.selectedChains, 
    manifoldConfig.selectedFunctions, 
    manifoldConfig.useCase
  )

  const [filteredFunctions, setFilteredFunctions] = useState([])

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
    setExecutingFunctions(prev => ({ ...prev, [functionName]: true }))
    
    try {
      // Simulate function execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResult = {
        success: true,
        functionName,
        parameters,
        result: {
          txHash: '0xabc123def456789...',
          blockNumber: Math.floor(Math.random() * 1000000) + 12345,
          gasUsed: '21000',
          timestamp: new Date().toISOString(),
          chainId: parameters.fromChain || parameters.chain || manifoldConfig.selectedChains[0] || 20
        }
      }
      
      toast.success(\`\${functionName} executed successfully!\`)
      return mockResult
    } catch (error) {
      console.error('Function execution failed:', error)
      toast.error('Execution failed: ' + error.message)
      throw error
    } finally {
      setExecutingFunctions(prev => ({ ...prev, [functionName]: false }))
    }
  }

  const stats = functionGen.getFunctionStats ? functionGen.getFunctionStats() : { total: 0, chains: 0 }
  const useCaseName = "${useCaseNames[config.useCase] || 'Custom Application'}"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your functions...</h2>
        </div>
      </div>
    )
  }

  // Show error state if no config
  if (!manifoldConfig || !manifoldConfig.selectedChains || manifoldConfig.selectedChains.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Configuration Missing</h1>
          <p className="text-gray-600 mb-6">
            No configuration found. Please run the setup command to configure your chains and functions.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-800 mb-2">Run this command:</p>
            <code className="text-blue-600 bg-white px-2 py-1 rounded">npm run setup</code>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🌐 Manifold Functions
              </h1>
              <p className="text-gray-600 mt-1">
                Kadena Chainweb EVM Functions - {useCaseName}
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>{stats.total} Functions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>{stats.chains || manifoldConfig.selectedChains.length} Chains</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>{useCaseName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search functions..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
              />
            ))
          ) : functionGen.isGenerating ? (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Generating Functions...
                </h3>
                <p className="text-gray-500">
                  Creating your custom multi-chain functions
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Functions Found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search term' : 'No functions have been generated yet'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 px-4 bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🚀</span>
            <h3 className="text-lg font-semibold text-gray-800">Manifold</h3>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            Kadena Chainweb EVM Multi-Chain Function Generator
          </p>
          <p className="text-gray-500 text-xs">
            Generated functions for chains: {manifoldConfig.selectedChains?.join(', ') || 'None'}
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>Chains: {manifoldConfig.selectedChains?.join(', ') || 'None'}</span>
            <span>•</span>
            <span>Testnet: KDA</span>
            <span>•</span>
            <span>EVM Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App`
  
  fs.writeFileSync(path.join(targetPath, 'src/App.jsx'), content)
}

async function generateComponents(targetPath) {
  // Copy FunctionCard component
  const sourceFunctionCard = path.join(__dirname, '..', 'src', 'components', 'FunctionCard.jsx')
  const targetFunctionCard = path.join(targetPath, 'src', 'components', 'FunctionCard.jsx')
  if (fs.existsSync(sourceFunctionCard)) {
    fs.copyFileSync(sourceFunctionCard, targetFunctionCard)
    console.log(`${colors.green}✅ Copied FunctionCard component${colors.reset}`)
  }
}

async function generateIndexCss(targetPath) {
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles for Swagger-like appearance */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
}

.function-card-hover {
  transition: all 0.2s ease-in-out;
}

.function-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.code-block {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
}

.code-block pre {
  color: #e2e8f0;
  margin: 0;
}

.swagger-green {
  background-color: #22c55e;
}

.swagger-green:hover {
  background-color: #16a34a;
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

🚀 **${useCaseNames[config.useCase] || 'Custom Application'}** built with Kadena Chainweb EVM

## 📋 Configuration

- **Use Case**: ${config.useCase.toUpperCase()}
- **Chains**: ${config.selectedChains.join(', ')} (${config.chainCount} chains)
- **Functions**: ${config.selectedFunctions.length} functions
- **Generated**: ${new Date().toLocaleString()}

## 🎯 Available Functions

${config.selectedFunctions.map(func => `- \`${func}()\``).join('\n')}

## 🌐 Supported Chains

${config.selectedChains.map(chain => {
  const chainId = 5920 + (chain - 20)
  return `- **Chain ${chain}**: Chain ID ${chainId} | [Explorer](http://chain-${chain}.evm-testnet-blockscout.chainweb.com/)`
}).join('\n')}

## 🚀 Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open in browser**: [http://localhost:5173](http://localhost:5173)

## 🛠️ Usage

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

## 🌐 Network Information

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

runSetup()
