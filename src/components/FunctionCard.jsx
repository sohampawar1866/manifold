import React, { useState } from 'react'
import { 
  Play, 
  Copy, 
  Code, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const FunctionCard = ({ 
  functionData, 
  chainConfigs, 
  onExecute, 
  isExecuting = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [parameters, setParameters] = useState({})
  const [showCode, setShowCode] = useState(false)
  const [executionResult, setExecutionResult] = useState(null)
  const [codeFormat, setCodeFormat] = useState('javascript')

  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  const handleExecute = async () => {
    try {
      const result = await onExecute(functionData.name, parameters)
      setExecutionResult(result)
      toast.success('Function executed successfully!')
    } catch (error) {
      setExecutionResult({ error: error.message })
      toast.error('Execution failed: ' + error.message)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(functionData.code)
    toast.success('Code copied to clipboard!')
  }

  const copyExample = () => {
    const exampleCall = generateExampleCall()
    navigator.clipboard.writeText(exampleCall)
    toast.success('Example usage copied!')
  }

  const generateExampleCall = () => {
    const safeChainConfigs = chainConfigs || []
    const exampleParams = functionData.parameters.map(param => {
      switch (param.type) {
        case 'number':
          return safeChainConfigs[0]?.chainId.toString().slice(-2) || '20'
        case 'string':
          return param.name === 'amount' ? '"1.0"' : '"example"'
        case 'address':
          return '"0x742d35Cc71c43E90b7D9b2D9F4E8d0b9b7b7b7b7"'
        case 'array':
          return `[${safeChainConfigs.slice(0, 2).map(c => c.chainId.toString().slice(-2)).join(', ')}]`
        default:
          return 'null'
      }
    }).join(', ')

    return `// Example usage
const result = await ${functionData.name}(${exampleParams})
console.log(result)`
  }

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'beginner':
        return 'bg-green-100 text-green-700'
      case 'intermediate':
        return 'bg-blue-100 text-blue-700'
      case 'advanced':
        return 'bg-orange-100 text-orange-700'
      case 'expert':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getGasEstimateColor = (gasEstimate) => {
    switch (gasEstimate) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-orange-600'
      case 'very-high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="card-container function-card-hover mb-6 animate-fade-in">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                {functionData.title}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                functionData.category === 'core' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {functionData.category}
              </span>
            </div>
            
            <p className="text-slate-600 mb-4 leading-relaxed">{functionData.description}</p>
            
            <div className="flex items-center flex-wrap gap-4 text-sm">
              <span className={`px-2 py-1 rounded ${getComplexityColor(functionData.complexity)}`}>
                {functionData.complexity}
              </span>
              <span className="flex items-center space-x-1">
                <Zap className={`w-4 h-4 ${getGasEstimateColor(functionData.gasEstimate)}`} />
                <span className={getGasEstimateColor(functionData.gasEstimate)}>
                  {functionData.gasEstimate} gas
                </span>
              </span>
              <span className="text-gray-500">
                {functionData.supportedChains?.length || 0} chains
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:scale-105"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-b border-gray-100">
          {/* Parameters */}
          {functionData.parameters && functionData.parameters.length > 0 && (
            <div className="p-8 bg-slate-50/50">
              <h4 className="font-semibold text-slate-800 mb-6 text-lg flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Parameters
              </h4>
              <div className="space-y-6">
                {functionData.parameters.map((param, index) => (
                  <div key={index} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <label className="block">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-700">{param.name}</span>
                          {param.required && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Required</span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-mono">{param.type}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">{param.description}</p>
                      
                      {param.type === 'array' ? (
                        <select
                          multiple
                          className="input-primary w-full min-h-[100px]"
                          value={parameters[param.name] || []}
                          onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                            handleParameterChange(param.name, values)
                          }}
                        >
                          {(chainConfigs || []).map((chain) => (
                            <option key={chain.chainId} value={chain.chainId.toString().slice(-2)}>
                              Chain {chain.chainId.toString().slice(-2)} ({chain.shortName || chain.name})
                            </option>
                          ))}
                        </select>
                      ) : param.type === 'number' && param.name.includes('Chain') ? (
                        <select
                          className="input-primary w-full"
                          value={parameters[param.name] || ''}
                          onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
                        >
                          <option value="">Select chain...</option>
                          {(chainConfigs || []).map((chain) => (
                            <option key={chain.chainId} value={chain.chainId.toString().slice(-2)}>
                              Chain {chain.chainId.toString().slice(-2)} ({chain.shortName || chain.name})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          className="input-primary w-full"
                          placeholder={`Enter ${param.name}...`}
                          value={parameters[param.name] || ''}
                          onChange={(e) => handleParameterChange(param.name, param.type === 'number' ? parseInt(e.target.value) : e.target.value)}
                        />
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Result */}
          {executionResult && (
            <div className="p-8 border-t border-slate-100 bg-slate-50/30">
              <h4 className="font-semibold text-slate-800 mb-4 text-lg flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Execution Result
              </h4>
              <div className={`p-4 rounded-lg ${
                executionResult.error 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                {executionResult.error ? (
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Execution Failed</p>
                      <p className="text-sm text-red-700 mt-1">{executionResult.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800 mb-2">Execution Successful</p>
                      <div className="code-block mt-3">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(executionResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-8 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="btn-primary flex items-center space-x-2"
            >
              {isExecuting ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isExecuting ? 'Executing...' : 'Try it out'}
            </button>
            
            <button
              onClick={() => setShowCode(!showCode)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Code className="w-4 h-4" />
              {showCode ? 'Hide Code' : 'View Code'}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={copyExample}
              className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105"
              title="Copy example usage"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            {chainConfigs[0] && (
              <a
                href={chainConfigs[0].blockExplorer}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105"
                title="View on block explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Code Display */}
        {showCode && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h5 className="font-semibold text-slate-800 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Generated Code
                </h5>
                <select
                  value={codeFormat}
                  onChange={(e) => setCodeFormat(e.target.value)}
                  className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="curl">cURL</option>
                </select>
              </div>
              
              <button
                onClick={copyCode}
                className="flex items-center space-x-1 px-3 py-1 text-sm btn-primary"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            
            <div className="code-block">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {codeFormat === 'javascript' && functionData.code}
                  {codeFormat === 'typescript' && functionData.code} {/* Would be converted */}
                  {codeFormat === 'curl' && generateExampleCall()}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FunctionCard