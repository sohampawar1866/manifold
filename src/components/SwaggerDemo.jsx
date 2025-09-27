import React, { useState, useEffect } from 'react'
import { Settings, Search, Filter, BookOpen, Code, Zap } from 'lucide-react'
import FunctionCard from './FunctionCard'
import FunctionGenerator from './FunctionGenerator'
import { useFunctionGenerator } from '../hooks/useFunctionGenerator'
import { useChainConfig } from '../hooks/useChainConfig'

const SwaggerDemo = ({ configuration, onReconfigure }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [complexityFilter, setComplexityFilter] = useState('all')
  const [executingFunctions, setExecutingFunctions] = useState({})

  const chainConfig = useChainConfig(configuration.selectedChains)
  const functionGen = useFunctionGenerator(
    configuration.selectedChains, 
    configuration.selectedFunctions, 
    configuration.useCase
  )

  const [filteredFunctions, setFilteredFunctions] = useState([])

  // Filter functions based on search and filters
  useEffect(() => {
    let functions = Object.values(functionGen.generatedFunctions)

    // Search filter
    if (searchTerm) {
      functions = functions.filter(func => 
        func.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      functions = functions.filter(func => func.category === categoryFilter)
    }

    // Complexity filter
    if (complexityFilter !== 'all') {
      functions = functions.filter(func => func.complexity === complexityFilter)
    }

    setFilteredFunctions(functions)
  }, [functionGen.generatedFunctions, searchTerm, categoryFilter, complexityFilter])

  const handleFunctionExecute = async (functionName, parameters) => {
    setExecutingFunctions(prev => ({ ...prev, [functionName]: true }))
    
    try {
      // Simulate function execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful result
      const mockResult = {
        success: true,
        functionName,
        parameters,
        result: {
          txHash: '0xabc123...',
          blockNumber: 12345,
          gasUsed: '21000',
          timestamp: new Date().toISOString()
        }
      }
      
      return mockResult
    } catch (error) {
      throw new Error('Execution failed: ' + error.message)
    } finally {
      setExecutingFunctions(prev => ({ ...prev, [functionName]: false }))
    }
  }

  const stats = functionGen.getFunctionStats()
  const categories = Object.keys(stats.categories)
  const complexityLevels = ['beginner', 'intermediate', 'advanced', 'expert']

  const useCaseNames = {
    defi: 'DeFi Protocol',
    gaming: 'Gaming Platform', 
    nft: 'NFT Marketplace',
    bridge: 'Cross-chain Bridge',
    custom: 'Custom Application'
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-4xl">🎉</span>
          <h1 className="text-3xl font-bold text-gray-800">
            Your Functions Are Ready!
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-6">
          Interactive Swagger-style API documentation for your Kadena Chainweb EVM functions
        </p>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>{stats.total} Functions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>{stats.chains} Chains</span>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>{useCaseNames[configuration.useCase] || 'Custom'}</span>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-white rounded-2xl shadow-swagger p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Configuration Overview
          </h2>
          <button
            onClick={onReconfigure}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Reconfigure</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Use Case */}
          {configuration.useCase && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Use Case</h3>
              <p className="text-blue-700 font-semibold">
                {useCaseNames[configuration.useCase] || configuration.useCase}
              </p>
            </div>
          )}

          {/* Chains */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Active Chains</h3>
            <div className="flex flex-wrap gap-1">
              {configuration.selectedChains.map((chain) => (
                <span
                  key={chain}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-mono"
                  title={chainConfig.getChain(chain)?.name}
                >
                  {chain}
                </span>
              ))}
            </div>
          </div>

          {/* Functions */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Generated Functions</h3>
            <p className="text-purple-700 font-semibold">
              {configuration.selectedFunctions.length} Functions Ready
            </p>
          </div>
        </div>
      </div>

      {/* Function Generator */}
      <div className="mb-8">
        <FunctionGenerator
          selectedChains={configuration.selectedChains}
          selectedFunctions={configuration.selectedFunctions}
          useCase={configuration.useCase}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-swagger p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search functions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              {complexityLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Function Cards */}
      <div className="space-y-6">
        {filteredFunctions.length > 0 ? (
          filteredFunctions.map((functionData) => (
            <FunctionCard
              key={functionData.name}
              functionData={functionData}
              chainConfigs={chainConfig.chainConfigs}
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
        ) : searchTerm || categoryFilter !== 'all' || complexityFilter !== 'all' ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-swagger">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Functions Found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setComplexityFilter('all')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-swagger">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Ready to Generate Functions
            </h3>
            <p className="text-gray-500">
              Your functions will appear here once generation is complete
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 mb-2">
            🌐 Kadena Chainweb EVM Integration
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            All functions are optimized for Kadena's Ethereum-compatible chains (20-24) with built-in multi-chain support
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>Testnet: Ready</span>
            <span>•</span>
            <span>Gas: Optimized</span>
            <span>•</span>
            <span>Security: Audited</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwaggerDemo