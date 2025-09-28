import { useState, useEffect, useMemo } from 'react'
import { 
  getChainConfig, 
  getAllChains, 
  getSelectedChains, 
  getProviderConfig,
  getMultiChainProviderConfigs,
  isValidChain,
  getBlockExplorerUrl,
  getAddressExplorerUrl
} from '../utils/chainConfig'
import { getRecommendedCombination, validateChainCombination } from '../utils/chainCombinations'

export const useChainConfig = (initialChains = []) => {
  const [selectedChains, setSelectedChains] = useState(initialChains)
  const [connectionStatus, setConnectionStatus] = useState({})
  const [isConnecting, setIsConnecting] = useState(false)

  // Get chain configurations for selected chains
  const chainConfigs = useMemo(() => {
    return getSelectedChains(selectedChains)
  }, [selectedChains])

  // Get all available chains
  const availableChains = useMemo(() => {
    return getAllChains()
  }, [])

  // Get provider configs for selected chains
  const providerConfigs = useMemo(() => {
    return getMultiChainProviderConfigs(selectedChains)
  }, [selectedChains])

  // Validate current chain combination
  const validation = useMemo(() => {
    return validateChainCombination(selectedChains)
  }, [selectedChains])

  // Add chain to selection
  const addChain = (chainNumber) => {
    if (isValidChain(chainNumber) && !selectedChains.includes(chainNumber)) {
      setSelectedChains(prev => [...prev, chainNumber].sort((a, b) => a - b))
    }
  }

  // Remove chain from selection
  const removeChain = (chainNumber) => {
    setSelectedChains(prev => prev.filter(chain => chain !== chainNumber))
  }

  // Toggle chain selection
  const toggleChain = (chainNumber) => {
    if (selectedChains.includes(chainNumber)) {
      removeChain(chainNumber)
    } else {
      addChain(chainNumber)
    }
  }

  // Set multiple chains at once
  const setChains = (chainNumbers) => {
    const validChains = chainNumbers.filter(isValidChain)
    setSelectedChains(validChains.sort((a, b) => a - b))
  }

  // Clear all selected chains
  const clearChains = () => {
    setSelectedChains([])
  }

  // Get recommended chains for use case
  const getRecommended = (useCase, experienceLevel = 'intermediate', chainCount = null) => {
    return getRecommendedCombination(useCase, experienceLevel, chainCount)
  }

  // Apply recommended configuration
  const applyRecommended = (useCase, experienceLevel = 'intermediate', chainCount = null) => {
    const recommended = getRecommended(useCase, experienceLevel, chainCount)
    setChains(recommended)
  }

  // Test connection to a specific chain
  const testChainConnection = async (chainNumber) => {
    const config = getChainConfig(chainNumber)
    if (!config) return false

    try {
      setConnectionStatus(prev => ({
        ...prev,
        [chainNumber]: 'connecting'
      }))

      const response = await fetch(config.rpc, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      })

      if (response.ok) {
        const data = await response.json()
        const isConnected = !!data.result

        setConnectionStatus(prev => ({
          ...prev,
          [chainNumber]: isConnected ? 'connected' : 'failed'
        }))

        return isConnected
      } else {
        setConnectionStatus(prev => ({
          ...prev,
          [chainNumber]: 'failed'
        }))
        return false
      }
    } catch (error) {
      console.error(`Connection test failed for Chain ${chainNumber}:`, error)
      setConnectionStatus(prev => ({
        ...prev,
        [chainNumber]: 'failed'
      }))
      return false
    }
  }

  // Test connections to all selected chains
  const testAllConnections = async () => {
    setIsConnecting(true)
    const results = {}

    try {
      const promises = selectedChains.map(async (chainNum) => {
        const result = await testChainConnection(chainNum)
        results[chainNum] = result
        return result
      })

      await Promise.all(promises)
      return results
    } finally {
      setIsConnecting(false)
    }
  }

  // Get chain statistics
  const getChainStats = () => {
    const totalSelected = selectedChains.length
    const connected = Object.values(connectionStatus).filter(status => status === 'connected').length
    const failed = Object.values(connectionStatus).filter(status => status === 'failed').length
    const connecting = Object.values(connectionStatus).filter(status => status === 'connecting').length

    return {
      totalSelected,
      connected,
      failed,
      connecting,
      connectionRate: totalSelected > 0 ? (connected / totalSelected) * 100 : 0
    }
  }

  // Get chain by number
  const getChain = (chainNumber) => {
    return getChainConfig(chainNumber)
  }

  // Get block explorer URL for transaction
  const getExplorerUrl = (chainNumber, txHash) => {
    return getBlockExplorerUrl(chainNumber, txHash)
  }

  // Get block explorer URL for address
  const getAddressUrl = (chainNumber, address) => {
    return getAddressExplorerUrl(chainNumber, address)
  }

  // Get provider config for specific chain
  const getProvider = (chainNumber) => {
    return getProviderConfig(chainNumber)
  }

  // Auto-test connections when chains change
  useEffect(() => {
    if (selectedChains.length > 0) {
      // Clear previous status
      setConnectionStatus({})
      // Test connections with a small delay
      const timer = setTimeout(() => {
        testAllConnections()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [selectedChains])

  return {
    // Selected chains data
    selectedChains,
    chainConfigs,
    availableChains,
    providerConfigs,
    
    // Validation
    validation,
    isValid: validation.valid,
    
    // Connection status
    connectionStatus,
    isConnecting,
    
    // Chain management
    addChain,
    removeChain,
    toggleChain,
    setChains,
    clearChains,
    
    // Recommendations
    getRecommended,
    applyRecommended,
    
    // Connection testing
    testChainConnection,
    testAllConnections,
    
    // Utilities
    getChain,
    getProvider,
    getExplorerUrl,
    getAddressUrl,
    getChainStats,
    
    // Helpers
    hasChain: (chainNumber) => selectedChains.includes(chainNumber),
    isEmpty: () => selectedChains.length === 0,
    count: () => selectedChains.length,
    isValidSelection: () => selectedChains.length > 0 && validation.valid
  }
}

export default useChainConfig