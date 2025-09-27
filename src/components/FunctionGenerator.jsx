import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, CheckCircle, Code, Zap, Settings } from 'lucide-react'
import { useFunctionGenerator } from '../hooks/useFunctionGenerator'
import { useChainConfig } from '../hooks/useChainConfig'

const FunctionGenerator = ({ 
  selectedChains = [], 
  selectedFunctions = [], 
  useCase = 'custom',
  onFunctionsGenerated = null 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const chainConfig = useChainConfig(selectedChains)
  const functionGen = useFunctionGenerator(selectedChains, selectedFunctions, useCase)

  // Notify parent when functions are generated
  useEffect(() => {
    if (!functionGen.isEmpty() && onFunctionsGenerated) {
      onFunctionsGenerated(functionGen.generatedFunctions)
    }
  }, [functionGen.generatedFunctions, onFunctionsGenerated])

  const stats = functionGen.getFunctionStats()
  const validation = functionGen.validateConfiguration()
  const chainStats = chainConfig.getChainStats()

  if (selectedChains.length === 0 || selectedFunctions.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl">
        <div className="text-4xl mb-4">⚙️</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Configuration Required
        </h3>
        <p className="text-gray-500">
          Please select chains and functions to generate your multi-chain utilities.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white rounded-2xl shadow-swagger p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Function Generator
            </h2>
            <p className="text-gray-600">
              Generating multi-chain functions for {stats.chains} chains
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              title="Advanced Settings"
            >
              <Settings className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
            
            <button
              onClick={functionGen.refreshFunctions}
              disabled={functionGen.isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${functionGen.isGenerating ? 'animate-spin' : ''}`} />
              {functionGen.isGenerating ? 'Generating...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Code className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Functions</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Chains</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{stats.chains}</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Connected</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">{chainStats.connected}</p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Status</span>
            </div>
            <p className="text-lg font-bold text-orange-800">
              {validation.isValid ? 'Ready' : 'Issues'}
            </p>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {!validation.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 mb-2">Configuration Issues</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Recommendations</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Configuration */}
      {showAdvanced && (
        <div className="bg-white rounded-2xl shadow-swagger p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Advanced Configuration
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chain Details */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Chain Details</h4>
              <div className="space-y-2">
                {chainConfig.chainConfigs.map((chain, index) => (
                  <div key={chain.chainId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{chain.name}</p>
                      <p className="text-sm text-gray-600">Chain ID: {chain.chainId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`
                        w-3 h-3 rounded-full
                        ${chainConfig.connectionStatus[selectedChains[index]] === 'connected' 
                          ? 'bg-green-500' 
                          : chainConfig.connectionStatus[selectedChains[index]] === 'connecting'
                          ? 'bg-yellow-500 animate-pulse'
                          : 'bg-red-500'
                        }
                      `}></div>
                      <span className="text-xs text-gray-500 capitalize">
                        {chainConfig.connectionStatus[selectedChains[index]] || 'unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Function Categories */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Function Categories</h4>
              <div className="space-y-2">
                {Object.entries(stats.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-800 capitalize">{category}</span>
                    <span className="text-sm font-bold text-blue-600">{count} functions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connection Test */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-700">Connection Test</h4>
                <p className="text-sm text-gray-600">
                  Test RPC connections to all selected chains
                </p>
              </div>
              <button
                onClick={chainConfig.testAllConnections}
                disabled={chainConfig.isConnecting}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <Zap className={`w-4 h-4 ${chainConfig.isConnecting ? 'animate-pulse' : ''}`} />
                {chainConfig.isConnecting ? 'Testing...' : 'Test All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Functions Summary */}
      {!functionGen.isEmpty() && (
        <div className="bg-white rounded-2xl shadow-swagger p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Generated Functions Summary
          </h3>
          
          <div className="grid gap-3">
            {functionGen.getFunctionNames().map((functionName) => {
              const metadata = functionGen.getFunctionMetadata(functionName)
              return (
                <div key={functionName} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{metadata.title}</h4>
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${metadata.category === 'core' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                      }
                    `}>
                      {metadata.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{metadata.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Complexity: {metadata.complexity}</span>
                    <span>•</span>
                    <span>Gas: {metadata.gasEstimate}</span>
                    <span>•</span>
                    <span>{metadata.parameters.length} parameters</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error Display */}
      {functionGen.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 mb-1">Generation Error</h4>
              <p className="text-sm text-red-700">{functionGen.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FunctionGenerator