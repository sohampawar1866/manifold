import React from 'react'
import { Settings, RotateCcw, ChevronDown } from 'lucide-react'
import { getChainConfig } from '../utils/chainConfig'

const Header = ({ isConfigured, selectedChains, useCase, onReset, onReconfigure }) => {
  const useCaseNames = {
    defi: 'DeFi Protocol',
    gaming: 'Gaming Platform',
    nft: 'NFT Marketplace',
    bridge: 'Cross-chain Bridge',
    custom: 'Custom Application'
  }

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌐</span>
              <h1 className="text-xl font-bold text-gray-800">
                <span className="text-gradient">Manifold</span>
              </h1>
            </div>
            
            {isConfigured && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>Kadena Chainweb EVM</span>
              </div>
            )}
          </div>

          {/* Configuration Status */}
          {isConfigured && (
            <div className="flex items-center space-x-4">
              {/* Current Configuration */}
              <div className="hidden lg:flex items-center space-x-4 text-sm">
                {/* Use Case */}
                {useCase && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-blue-700 font-medium">
                      {useCaseNames[useCase] || 'Custom'}
                    </span>
                  </div>
                )}
                
                {/* Selected Chains */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium">
                    {selectedChains.length} Chain{selectedChains.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center space-x-1">
                    {selectedChains.slice(0, 3).map((chainNum, index) => {
                      const config = getChainConfig(chainNum)
                      return (
                        <span 
                          key={chainNum}
                          className="text-xs text-green-600 font-mono"
                          title={config?.name}
                        >
                          {chainNum}{index < selectedChains.slice(0, 3).length - 1 ? ',' : ''}
                        </span>
                      )
                    })}
                    {selectedChains.length > 3 && (
                      <span className="text-xs text-green-600">+{selectedChains.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Configuration Dropdown */}
              <div className="lg:hidden">
                <details className="relative">
                  <summary className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </summary>
                  <div className="absolute right-0 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="space-y-3">
                      {useCase && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Use Case</label>
                          <p className="text-sm text-gray-800">{useCaseNames[useCase]}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Chains</label>
                        <p className="text-sm text-gray-800">
                          {selectedChains.join(', ')} ({selectedChains.length} chains)
                        </p>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onReconfigure}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Reconfigure"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Configure</span>
                </button>
                
                <button
                  onClick={onReset}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Reset Configuration"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!isConfigured && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span>Setup Required</span>
            </div>
          )}
        </div>

        {/* Progress Indicator for Configuration */}
        {isConfigured && (
          <div className="pb-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Ready for development</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Configured</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header