import React, { useState, useEffect } from 'react';
import { createChainIntelligence } from '../utils/chain-intelligence.js';

/**
 * 🎮 Interactive Playground
 * 
 * SwaggerUI-style interactive playground for Kadena operations:
 * - API explorer interface
 * - Operation testing and execution
 * - Real-time intelligence integration
 * - Live examples and documentation
 */
function InteractivePlayground({ config }) {
  const [selectedCategory, setSelectedCategory] = useState('transfers');
  const [operations, setOperations] = useState({});
  const [expandedOperation, setExpandedOperation] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [showIntelligence, setShowIntelligence] = useState(true);

  const categories = [
    {
      id: 'transfers',
      name: 'Token Transfers',
      icon: '💸',
      description: 'Send tokens between accounts and chains'
    },
    {
      id: 'swaps',
      name: 'Token Swaps',
      icon: '🔄',
      description: 'Swap tokens on DEXs and cross-chain'
    },
    {
      id: 'queries',
      name: 'Chain Queries',
      icon: '🔍',
      description: 'Query blockchain data and state'
    },
    {
      id: 'contracts',
      name: 'Smart Contracts',
      icon: '📋',
      description: 'Interact with smart contracts'
    },
    {
      id: 'cross-chain',
      name: 'Cross-Chain',
      icon: '🌉',
      description: 'Cross-chain operations and bridges'
    },
    {
      id: 'defi',
      name: 'DeFi Operations',
      icon: '🏦',
      description: 'DeFi protocols and yield farming'
    }
  ];

  useEffect(() => {
    if (config) {
      initializeIntelligence();
      generateOperations();
    }
  }, [config]);

  const initializeIntelligence = async () => {
    try {
      const chainIntelligence = createChainIntelligence(config);
      setIntelligence(chainIntelligence);
    } catch (error) {
      console.error('Failed to initialize intelligence:', error);
    }
  };

  const generateOperations = () => {
    const allOperations = {
      transfers: [
        {
          id: 'simple-transfer',
          name: 'Simple Transfer',
          description: 'Transfer KDA tokens between accounts on the same chain',
          method: 'POST',
          endpoint: '/transfer/simple',
          parameters: [
            { name: 'from', type: 'string', required: true, description: 'Sender account key', example: 'k:account123...' },
            { name: 'to', type: 'string', required: true, description: 'Recipient account key', example: 'k:account456...' },
            { name: 'amount', type: 'number', required: true, description: 'Amount to transfer', example: 10.5 },
            { name: 'chainId', type: 'string', required: true, description: 'Target chain ID', example: '20' },
            { name: 'gasPrice', type: 'number', required: false, description: 'Gas price (optional)', example: 0.0000001 }
          ],
          responses: {
            200: { description: 'Transfer successful', example: { txId: 'abc123...', status: 'success' } },
            400: { description: 'Invalid parameters', example: { error: 'Invalid account format' } }
          },
          examples: [
            {
              name: 'Basic Transfer',
              description: 'Transfer 10 KDA on Chain 20',
              parameters: { from: 'k:sender123', to: 'k:recipient456', amount: 10, chainId: '20' }
            }
          ]
        },
        {
          id: 'cross-chain-transfer',
          name: 'Cross-Chain Transfer',
          description: 'Transfer tokens between different chains',
          method: 'POST',
          endpoint: '/transfer/cross-chain',
          parameters: [
            { name: 'from', type: 'string', required: true, description: 'Sender account key' },
            { name: 'to', type: 'string', required: true, description: 'Recipient account key' },
            { name: 'amount', type: 'number', required: true, description: 'Amount to transfer' },
            { name: 'sourceChain', type: 'string', required: true, description: 'Source chain ID' },
            { name: 'targetChain', type: 'string', required: true, description: 'Target chain ID' },
            { name: 'proof', type: 'object', required: false, description: 'SPV proof (auto-generated)' }
          ],
          responses: {
            200: { description: 'Cross-chain transfer initiated', example: { requestKey: 'xyz789...', status: 'pending' } }
          },
          examples: [
            {
              name: 'Chain 20 to 21',
              description: 'Transfer 5 KDA from Chain 20 to Chain 21',
              parameters: { from: 'k:sender123', to: 'k:recipient456', amount: 5, sourceChain: '20', targetChain: '21' }
            }
          ]
        }
      ],
      swaps: [
        {
          id: 'token-swap',
          name: 'Token Swap',
          description: 'Swap tokens on decentralized exchanges',
          method: 'POST',
          endpoint: '/swap/tokens',
          parameters: [
            { name: 'tokenIn', type: 'string', required: true, description: 'Input token symbol', example: 'KDA' },
            { name: 'tokenOut', type: 'string', required: true, description: 'Output token symbol', example: 'USDC' },
            { name: 'amountIn', type: 'number', required: true, description: 'Input amount', example: 100 },
            { name: 'slippage', type: 'number', required: false, description: 'Max slippage %', example: 1.0 },
            { name: 'dex', type: 'string', required: false, description: 'Preferred DEX', example: 'kadenaswap' }
          ],
          responses: {
            200: { description: 'Swap executed', example: { amountOut: 95.5, txId: 'swap123...' } }
          },
          examples: [
            {
              name: 'KDA to USDC',
              description: 'Swap 100 KDA for USDC with 1% slippage',
              parameters: { tokenIn: 'KDA', tokenOut: 'USDC', amountIn: 100, slippage: 1.0 }
            }
          ]
        }
      ],
      queries: [
        {
          id: 'account-balance',
          name: 'Account Balance',
          description: 'Get account balance and details',
          method: 'GET',
          endpoint: '/query/balance/{account}',
          parameters: [
            { name: 'account', type: 'string', required: true, description: 'Account key or name', example: 'k:account123...' },
            { name: 'chainId', type: 'string', required: true, description: 'Chain ID to query', example: '20' },
            { name: 'token', type: 'string', required: false, description: 'Specific token (default: KDA)', example: 'KDA' }
          ],
          responses: {
            200: { description: 'Balance retrieved', example: { balance: 150.75, account: 'k:account123...', guard: {} } }
          },
          examples: [
            {
              name: 'KDA Balance',
              description: 'Get KDA balance for account on Chain 20',
              parameters: { account: 'k:account123', chainId: '20' }
            }
          ]
        },
        {
          id: 'transaction-status',
          name: 'Transaction Status',
          description: 'Check transaction status and details',
          method: 'GET',
          endpoint: '/query/transaction/{txId}',
          parameters: [
            { name: 'txId', type: 'string', required: true, description: 'Transaction ID', example: 'abc123...' },
            { name: 'chainId', type: 'string', required: true, description: 'Chain ID', example: '20' }
          ],
          responses: {
            200: { description: 'Transaction found', example: { status: 'success', result: {}, gas: 1000 } },
            404: { description: 'Transaction not found', example: { error: 'TX not found' } }
          },
          examples: [
            {
              name: 'Check TX Status',
              description: 'Check status of a transaction',
              parameters: { txId: 'abc123def456', chainId: '20' }
            }
          ]
        }
      ],
      contracts: [
        {
          id: 'deploy-contract',
          name: 'Deploy Contract',
          description: 'Deploy a smart contract to the blockchain',
          method: 'POST',
          endpoint: '/contracts/deploy',
          parameters: [
            { name: 'code', type: 'string', required: true, description: 'Contract code (Pact)', example: '(define-keyset...)' },
            { name: 'data', type: 'object', required: false, description: 'Initial data', example: {} },
            { name: 'chainId', type: 'string', required: true, description: 'Target chain', example: '20' },
            { name: 'gasLimit', type: 'number', required: false, description: 'Gas limit', example: 10000 }
          ],
          responses: {
            200: { description: 'Contract deployed', example: { contractAddress: 'contract.name', txId: 'deploy123...' } }
          },
          examples: [
            {
              name: 'Simple Storage',
              description: 'Deploy a simple storage contract',
              parameters: { code: '(define-keyset "admin" (read-keyset "admin-keyset"))', chainId: '20' }
            }
          ]
        }
      ],
      'cross-chain': [
        {
          id: 'bridge-assets',
          name: 'Bridge Assets',
          description: 'Bridge assets between Kadena chains',
          method: 'POST',
          endpoint: '/bridge/assets',
          parameters: [
            { name: 'asset', type: 'string', required: true, description: 'Asset to bridge', example: 'KDA' },
            { name: 'amount', type: 'number', required: true, description: 'Amount to bridge', example: 50 },
            { name: 'sourceChain', type: 'string', required: true, description: 'Source chain', example: '20' },
            { name: 'targetChain', type: 'string', required: true, description: 'Target chain', example: '21' },
            { name: 'recipient', type: 'string', required: true, description: 'Recipient account', example: 'k:recipient...' }
          ],
          responses: {
            200: { description: 'Bridge initiated', example: { bridgeId: 'bridge123...', estimatedTime: '5 minutes' } }
          },
          examples: [
            {
              name: 'KDA Bridge',
              description: 'Bridge 50 KDA from Chain 20 to 21',
              parameters: { asset: 'KDA', amount: 50, sourceChain: '20', targetChain: '21', recipient: 'k:recipient123' }
            }
          ]
        }
      ],
      defi: [
        {
          id: 'stake-tokens',
          name: 'Stake Tokens',
          description: 'Stake tokens in DeFi protocols',
          method: 'POST',
          endpoint: '/defi/stake',
          parameters: [
            { name: 'protocol', type: 'string', required: true, description: 'DeFi protocol', example: 'kaddex' },
            { name: 'token', type: 'string', required: true, description: 'Token to stake', example: 'KDA' },
            { name: 'amount', type: 'number', required: true, description: 'Amount to stake', example: 100 },
            { name: 'duration', type: 'number', required: false, description: 'Staking duration (days)', example: 30 }
          ],
          responses: {
            200: { description: 'Staking successful', example: { stakingId: 'stake123...', apy: 12.5 } }
          },
          examples: [
            {
              name: 'Stake KDA',
              description: 'Stake 100 KDA for 30 days',
              parameters: { protocol: 'kaddex', token: 'KDA', amount: 100, duration: 30 }
            }
          ]
        }
      ]
    };

    setOperations(allOperations);
  };

  const executeOperation = async (operation, parameters) => {
    const executionId = Date.now();
    const execution = {
      id: executionId,
      operation: operation.name,
      parameters,
      timestamp: new Date(),
      status: 'executing',
      response: null
    };

    setExecutionHistory(prev => [execution, ...prev.slice(0, 9)]); // Keep last 10 executions

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Get intelligence recommendations if available
      let recommendations = [];
      if (intelligence && showIntelligence) {
        try {
          const routing = await intelligence.optimizeRouting({
            operation: operation.id,
            parameters,
            chains: config.chains
          });
          recommendations = routing.recommendations || [];
        } catch (error) {
          console.warn('Failed to get intelligence recommendations:', error);
        }
      }

      // Simulate success/failure
      const success = Math.random() > 0.1; // 90% success rate
      
      const response = success ? {
        status: 'success',
        data: operation.responses[200]?.example || { message: 'Operation completed successfully' },
        recommendations,
        executionTime: Math.round(500 + Math.random() * 1500) + 'ms',
        gasUsed: Math.round(1000 + Math.random() * 5000),
        txId: 'tx_' + Math.random().toString(36).substr(2, 12)
      } : {
        status: 'error',
        error: operation.responses[400]?.example || { message: 'Operation failed' },
        code: 400
      };

      // Update execution history
      setExecutionHistory(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { ...exec, status: success ? 'success' : 'error', response }
            : exec
        )
      );

    } catch (error) {
      console.error('Execution failed:', error);
      setExecutionHistory(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { ...exec, status: 'error', response: { error: error.message } }
            : exec
        )
      );
    }
  };

  const currentOperations = operations[selectedCategory] || [];

  return (
    <div className="bg-gray-800 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🎮 Interactive Playground
            </h2>
            <p className="text-gray-400">
              Explore and test Kadena blockchain operations with real-time intelligence
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showIntelligence}
                onChange={(e) => setShowIntelligence(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-300">Show Intelligence</span>
            </label>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Selected Category Description */}
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <p className="text-gray-300 text-sm">
            {categories.find(c => c.id === selectedCategory)?.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
        {/* Operations List */}
        <div className="xl:col-span-2 space-y-4">
          {currentOperations.map(operation => (
            <OperationCard
              key={operation.id}
              operation={operation}
              isExpanded={expandedOperation === operation.id}
              onToggle={() => setExpandedOperation(
                expandedOperation === operation.id ? null : operation.id
              )}
              onExecute={(params) => executeOperation(operation, params)}
              intelligence={intelligence}
              showIntelligence={showIntelligence}
            />
          ))}
          
          {currentOperations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🚧</div>
              <div className="text-lg text-white mb-2">Operations Coming Soon</div>
              <div className="text-gray-400">
                This category is under development
              </div>
            </div>
          )}
        </div>

        {/* Execution History */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-4 flex items-center">
            <span className="mr-2">📜</span>
            Execution History
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {executionHistory.map(execution => (
              <ExecutionHistoryItem key={execution.id} execution={execution} />
            ))}
            
            {executionHistory.length === 0 && (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">⏰</div>
                <div className="text-sm text-gray-400">
                  No executions yet. Try running an operation!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Operation Card Component
function OperationCard({ operation, isExpanded, onToggle, onExecute, intelligence, showIntelligence }) {
  const [parameters, setParameters] = useState({});
  const [selectedExample, setSelectedExample] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-600';
      case 'POST': return 'bg-blue-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const loadExample = (example) => {
    setParameters(example.parameters);
    setSelectedExample(example);
  };

  const handleExecute = () => {
    onExecute(parameters);
  };

  const validateParameters = () => {
    return operation.parameters
      .filter(param => param.required)
      .every(param => parameters[param.name] && parameters[param.name] !== '');
  };

  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden">
      {/* Operation Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-600 transition-colors duration-200"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getMethodColor(operation.method)}`}>
              {operation.method}
            </span>
            <div>
              <h3 className="font-medium text-white">{operation.name}</h3>
              <p className="text-sm text-gray-400">{operation.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <code className="text-sm text-blue-400 bg-gray-800 px-2 py-1 rounded">
              {operation.endpoint}
            </code>
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ⬇️
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-600">
          <div className="p-4 space-y-6">
            {/* Examples */}
            {operation.examples && operation.examples.length > 0 && (
              <div>
                <h4 className="font-medium text-white mb-3">📋 Examples</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {operation.examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => loadExample(example)}
                      className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                        selectedExample === example
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {example.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Parameters Form */}
            <div>
              <h4 className="font-medium text-white mb-3">⚙️ Parameters</h4>
              <div className="space-y-3">
                {operation.parameters.map((param, index) => (
                  <div key={index} className="bg-gray-800 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-medium text-white">
                        {param.name}
                        {param.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        {param.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{param.description}</p>
                    
                    {param.type === 'object' ? (
                      <textarea
                        value={parameters[param.name] ? JSON.stringify(parameters[param.name], null, 2) : ''}
                        onChange={(e) => {
                          try {
                            const value = e.target.value ? JSON.parse(e.target.value) : {};
                            setParameters(prev => ({ ...prev, [param.name]: value }));
                          } catch (error) {
                            // Invalid JSON, keep as string for now
                          }
                        }}
                        placeholder={param.example ? JSON.stringify(param.example, null, 2) : '{}'}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm font-mono"
                        rows="3"
                      />
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={parameters[param.name] || ''}
                        onChange={(e) => setParameters(prev => ({ 
                          ...prev, 
                          [param.name]: param.type === 'number' ? Number(e.target.value) : e.target.value 
                        }))}
                        placeholder={param.example?.toString() || ''}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Intelligence Recommendations */}
            {showIntelligence && intelligence && recommendations.length > 0 && (
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                <h4 className="font-medium text-blue-400 mb-3">🧠 Intelligence Recommendations</h4>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execute Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExecute}
                disabled={!validateParameters()}
                className={`px-6 py-2 rounded font-medium transition-colors duration-200 ${
                  validateParameters()
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                🚀 Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Execution History Item Component
function ExecutionHistoryItem({ execution }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'executing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'executing': return '⏳';
      default: return '⏸️';
    }
  };

  return (
    <div className="bg-gray-800 rounded p-3">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span>{getStatusIcon(execution.status)}</span>
          <div>
            <div className="text-sm font-medium text-white">{execution.operation}</div>
            <div className="text-xs text-gray-400">
              {execution.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <div className={`text-sm font-medium ${getStatusColor(execution.status)}`}>
          {execution.status.toUpperCase()}
        </div>
      </div>
      
      {isExpanded && execution.response && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <pre className="text-xs text-gray-300 bg-gray-900 p-2 rounded overflow-x-auto">
            {JSON.stringify(execution.response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default InteractivePlayground;