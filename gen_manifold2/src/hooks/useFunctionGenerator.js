import { useState, useEffect, useMemo } from 'react'
import { generateFunction, generateMultipleFunctions, getAvailableFunctions } from '../utils/functionTemplates'
import { getChainConfig, getSelectedChains } from '../utils/chainConfig'

export const useFunctionGenerator = (selectedChains = [], selectedFunctions = [], useCase = 'custom') => {
  const [generatedFunctions, setGeneratedFunctions] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Get available functions based on use case
  const availableFunctions = useMemo(() => {
    return getAvailableFunctions(selectedChains, useCase)
  }, [selectedChains, useCase])

  // Get chain configurations
  const chainConfigs = useMemo(() => {
    return getSelectedChains(selectedChains)
  }, [selectedChains])

  // Generate functions when chains or function selection changes
  useEffect(() => {
    if (selectedChains.length > 0 && selectedFunctions.length > 0) {
      generateFunctions()
    }
  }, [selectedChains, selectedFunctions])

  const generateFunctions = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const functions = generateMultipleFunctions(selectedFunctions, selectedChains)
      setGeneratedFunctions(functions)
    } catch (err) {
      setError(err.message)
      console.error('Function generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSingleFunction = async (functionName) => {
    try {
      const func = generateFunction(functionName, selectedChains)
      setGeneratedFunctions(prev => ({
        ...prev,
        [functionName]: func
      }))
      return func
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const getFunctionCode = (functionName) => {
    return generatedFunctions[functionName]?.code || null
  }

  const getFunctionMetadata = (functionName) => {
    const func = generatedFunctions[functionName]
    if (!func) return null

    return {
      name: func.name,
      title: func.title,
      description: func.description,
      category: func.category,
      complexity: func.complexity,
      parameters: func.parameters,
      returns: func.returns,
      gasEstimate: func.gasEstimate,
      supportedChains: func.supportedChains,
      generatedAt: func.generatedAt
    }
  }

  const getCodeSnippet = (functionName, format = 'javascript') => {
    const func = generatedFunctions[functionName]
    if (!func) return null

    switch (format) {
      case 'javascript':
        return func.code
      case 'typescript':
        // Convert to TypeScript (basic conversion)
        return func.code.replace(/export async function/g, 'export async function')
      case 'curl':
        // Generate curl example (for demonstration)
        return `# Example usage for ${func.title}
curl -X POST http://localhost:3000/api/${functionName} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(getExampleParams(func.parameters), null, 2)}'`
      default:
        return func.code
    }
  }

  const getExampleParams = (parameters) => {
    return parameters.reduce((acc, param) => {
      switch (param.type) {
        case 'number':
          acc[param.name] = selectedChains[0] || 20
          break
        case 'string':
          acc[param.name] = param.name === 'amount' ? '1.0' : 'example'
          break
        case 'address':
          acc[param.name] = '0x742d35Cc71c43E90b7D9b2D9F4E8d0b9b7b7b7b7'
          break
        case 'array':
          acc[param.name] = selectedChains.slice(0, 2)
          break
        default:
          acc[param.name] = null
      }
      return acc
    }, {})
  }

  const getFunctionStats = () => {
    const totalFunctions = Object.keys(generatedFunctions).length
    const categories = {}
    const complexityLevels = {}

    Object.values(generatedFunctions).forEach(func => {
      categories[func.category] = (categories[func.category] || 0) + 1
      complexityLevels[func.complexity] = (complexityLevels[func.complexity] || 0) + 1
    })

    return {
      total: totalFunctions,
      categories,
      complexityLevels,
      chains: selectedChains.length,
      chainNames: chainConfigs.map(c => c.name)
    }
  }

  const validateConfiguration = () => {
    const errors = []
    const warnings = []

    if (selectedChains.length === 0) {
      errors.push('No chains selected')
    }

    if (selectedFunctions.length === 0) {
      errors.push('No functions selected')
    }

    if (selectedChains.length === 1) {
      warnings.push('Single chain setup limits cross-chain functionality')
    }

    if (selectedChains.length > 4) {
      warnings.push('Large number of chains may increase complexity')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const refreshFunctions = () => {
    generateFunctions()
  }

  const clearFunctions = () => {
    setGeneratedFunctions({})
    setError(null)
  }

  return {
    // Generated functions
    generatedFunctions,
    availableFunctions,
    chainConfigs,
    
    // State
    isGenerating,
    error,
    
    // Actions
    generateFunctions,
    generateSingleFunction,
    refreshFunctions,
    clearFunctions,
    
    // Getters
    getFunctionCode,
    getFunctionMetadata,
    getCodeSnippet,
    getExampleParams,
    getFunctionStats,
    
    // Validation
    validateConfiguration,
    
    // Utils
    hasFunction: (functionName) => functionName in generatedFunctions,
    getFunctionNames: () => Object.keys(generatedFunctions),
    isEmpty: () => Object.keys(generatedFunctions).length === 0
  }
}

export default useFunctionGenerator