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
        toast.success(functionName + ' executed successfully!')
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
          <div className="text-sm text-slate-500">DeFi Protocol</div>
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