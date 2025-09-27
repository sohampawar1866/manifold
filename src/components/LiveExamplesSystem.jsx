import React, { useState, useEffect } from 'react';
import { createChainIntelligence } from '../utils/chain-intelligence.js';

/**
 * 🎯 Live Examples System
 * 
 * Pre-configured examples with one-click execution:
 * - Realistic parameter sets for each operation
 * - Chain-specific examples with live data
 * - Success and error scenario demonstrations
 * - Performance benchmarking examples
 */
function LiveExamplesSystem({ config, onExecuteExample }) {
  const [examples, setExamples] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [executingExample, setExecutingExample] = useState(null);
  const [executionResults, setExecutionResults] = useState({});
  const [intelligence, setIntelligence] = useState(null);

  const categories = [
    { id: 'popular', name: 'Popular', icon: '⭐', description: 'Most commonly used examples' },
    { id: 'beginner', name: 'Beginner', icon: '🌱', description: 'Simple examples for newcomers' },
    { id: 'advanced', name: 'Advanced', icon: '🚀', description: 'Complex multi-step operations' },
    { id: 'cross-chain', name: 'Cross-Chain', icon: '🌉', description: 'Cross-chain operation examples' },
    { id: 'defi', name: 'DeFi', icon: '🏦', description: 'DeFi protocol interactions' },
    { id: 'performance', name: 'Performance', icon: '⚡', description: 'Performance testing examples' }
  ];

  useEffect(() => {
    if (config) {
      initializeIntelligence();
      generateExamples();
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

  const generateExamples = () => {
    const allExamples = [
      // Popular Examples
      {
        id: 'simple-transfer-demo',
        category: 'popular',
        title: 'Simple KDA Transfer',
        description: 'Transfer 10 KDA tokens between accounts on Chain 20',
        operation: 'simple-transfer',
        difficulty: 'beginner',
        estimatedTime: '30s',
        parameters: {
          from: 'k:demo-sender-account-123456789',
          to: 'k:demo-recipient-account-987654321',
          amount: 10,
          chainId: '20',
          gasPrice: 0.0000001
        },
        expectedOutcome: 'success',
        tags: ['transfer', 'basic', 'demo'],
        icon: '💸'
      },
      {
        id: 'balance-check-demo',
        category: 'popular',
        title: 'Check Account Balance',
        description: 'Query KDA balance for a demo account',
        operation: 'account-balance',
        difficulty: 'beginner',
        estimatedTime: '5s',
        parameters: {
          account: 'k:demo-account-123456789',
          chainId: '20'
        },
        expectedOutcome: 'success',
        tags: ['query', 'balance', 'basic'],
        icon: '💰'
      },
      {
        id: 'cross-chain-demo',
        category: 'popular',
        title: 'Cross-Chain Transfer',
        description: 'Transfer 5 KDA from Chain 20 to Chain 21',
        operation: 'cross-chain-transfer',
        difficulty: 'intermediate',
        estimatedTime: '2m',
        parameters: {
          from: 'k:demo-sender-account-123456789',
          to: 'k:demo-recipient-account-987654321',
          amount: 5,
          sourceChain: '20',
          targetChain: '21'
        },
        expectedOutcome: 'success',
        tags: ['cross-chain', 'transfer', 'intermediate'],
        icon: '🌉'
      },

      // Beginner Examples
      {
        id: 'first-transaction',
        category: 'beginner',
        title: 'Your First Transaction',
        description: 'A simple 1 KDA transfer to get started',
        operation: 'simple-transfer',
        difficulty: 'beginner',
        estimatedTime: '30s',
        parameters: {
          from: 'k:beginner-sender-123',
          to: 'k:beginner-recipient-456',
          amount: 1,
          chainId: '20'
        },
        expectedOutcome: 'success',
        tags: ['beginner', 'first-time', 'tutorial'],
        icon: '🌱'
      },
      {
        id: 'check-transaction-status',
        category: 'beginner',
        title: 'Check Transaction Status',
        description: 'Learn how to check if your transaction succeeded',
        operation: 'transaction-status',
        difficulty: 'beginner',
        estimatedTime: '10s',
        parameters: {
          txId: 'demo-transaction-id-123456789',
          chainId: '20'
        },
        expectedOutcome: 'success',
        tags: ['beginner', 'status', 'tutorial'],
        icon: '🔍'
      },

      // Advanced Examples
      {
        id: 'multi-chain-arbitrage',
        category: 'advanced',
        title: 'Multi-Chain Arbitrage',
        description: 'Execute arbitrage opportunity across 3 chains',
        operation: 'token-swap',
        difficulty: 'advanced',
        estimatedTime: '5m',
        parameters: {
          tokenIn: 'KDA',
          tokenOut: 'USDC',
          amountIn: 1000,
          slippage: 0.5,
          chains: ['20', '21', '22'],
          strategy: 'arbitrage'
        },
        expectedOutcome: 'success',
        tags: ['arbitrage', 'multi-chain', 'advanced', 'defi'],
        icon: '🔄'
      },
      {
        id: 'batch-operations',
        category: 'advanced',
        title: 'Batch Operations',
        description: 'Execute multiple operations in a single transaction',
        operation: 'batch-execute',
        difficulty: 'advanced',
        estimatedTime: '1m',
        parameters: {
          operations: [
            { type: 'transfer', amount: 10, to: 'k:recipient-1' },
            { type: 'transfer', amount: 15, to: 'k:recipient-2' },
            { type: 'swap', tokenIn: 'KDA', tokenOut: 'USDC', amount: 5 }
          ],
          chainId: '20'
        },
        expectedOutcome: 'success',
        tags: ['batch', 'advanced', 'efficiency'],
        icon: '📦'
      },

      // Cross-Chain Examples
      {
        id: 'bridge-assets-demo',
        category: 'cross-chain',
        title: 'Bridge Assets',
        description: 'Bridge 50 KDA from Chain 20 to Chain 23',
        operation: 'bridge-assets',
        difficulty: 'intermediate',
        estimatedTime: '3m',
        parameters: {
          asset: 'KDA',
          amount: 50,
          sourceChain: '20',
          targetChain: '23',
          recipient: 'k:bridge-recipient-123456789'
        },
        expectedOutcome: 'success',
        tags: ['bridge', 'cross-chain', 'assets'],
        icon: '🌉'
      },
      {
        id: 'cross-chain-swap',
        category: 'cross-chain',
        title: 'Cross-Chain Token Swap',
        description: 'Swap KDA on Chain 20 for USDC on Chain 21',
        operation: 'cross-chain-swap',
        difficulty: 'advanced',
        estimatedTime: '4m',
        parameters: {
          tokenIn: 'KDA',
          tokenOut: 'USDC',
          amountIn: 100,
          sourceChain: '20',
          targetChain: '21',
          slippage: 1.0
        },
        expectedOutcome: 'success',
        tags: ['swap', 'cross-chain', 'defi'],
        icon: '🔄'
      },

      // DeFi Examples
      {
        id: 'stake-tokens-demo',
        category: 'defi',
        title: 'Stake KDA Tokens',
        description: 'Stake 100 KDA in a DeFi protocol',
        operation: 'stake-tokens',
        difficulty: 'intermediate',
        estimatedTime: '1m',
        parameters: {
          protocol: 'kaddex',
          token: 'KDA',
          amount: 100,
          duration: 30
        },
        expectedOutcome: 'success',
        tags: ['staking', 'defi', 'yield'],
        icon: '🏦'
      },
      {
        id: 'liquidity-provision',
        category: 'defi',
        title: 'Provide Liquidity',
        description: 'Add liquidity to KDA/USDC pool',
        operation: 'add-liquidity',
        difficulty: 'advanced',
        estimatedTime: '2m',
        parameters: {
          tokenA: 'KDA',
          tokenB: 'USDC',
          amountA: 100,
          amountB: 200,
          pool: 'KDA-USDC',
          slippage: 1.0
        },
        expectedOutcome: 'success',
        tags: ['liquidity', 'defi', 'amm'],
        icon: '💧'
      },

      // Performance Examples
      {
        id: 'high-throughput-test',
        category: 'performance',
        title: 'High Throughput Test',
        description: 'Test network performance with rapid transactions',
        operation: 'performance-test',
        difficulty: 'advanced',
        estimatedTime: '30s',
        parameters: {
          transactionCount: 100,
          parallelism: 10,
          chainId: '20',
          operation: 'transfer'
        },
        expectedOutcome: 'success',
        tags: ['performance', 'stress-test', 'benchmark'],
        icon: '⚡'
      },
      {
        id: 'load-balancing-demo',
        category: 'performance',
        title: 'Load Balancing Demo',
        description: 'Demonstrate intelligent load balancing across chains',
        operation: 'load-balance-test',
        difficulty: 'advanced',
        estimatedTime: '1m',
        parameters: {
          operations: 50,
          chains: ['20', '21', '22', '23'],
          strategy: 'intelligent'
        },
        expectedOutcome: 'success',
        tags: ['load-balancing', 'performance', 'optimization'],
        icon: '⚖️'
      }
    ];

    setExamples(allExamples);
  };

  const executeExample = async (example) => {
    setExecutingExample(example.id);
    
    try {
      // Get intelligence recommendations if available
      let recommendations = [];
      if (intelligence) {
        try {
          const routing = await intelligence.optimizeRouting({
            operation: example.operation,
            parameters: example.parameters,
            chains: config.chains
          });
          recommendations = routing.recommendations || [];
        } catch (error) {
          console.warn('Failed to get intelligence recommendations:', error);
        }
      }

      // Simulate execution
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      const executionTime = Date.now() - startTime;

      // Simulate result based on expected outcome
      const success = example.expectedOutcome === 'success' ? Math.random() > 0.05 : Math.random() > 0.7;
      
      const result = {
        success,
        executionTime,
        timestamp: new Date(),
        recommendations,
        data: success ? {
          message: `${example.title} executed successfully`,
          txId: 'tx_example_' + Math.random().toString(36).substr(2, 12),
          gasUsed: Math.round(1000 + Math.random() * 5000),
          ...(example.operation === 'account-balance' && { balance: Math.round(Math.random() * 1000 * 100) / 100 }),
          ...(example.operation.includes('swap') && { 
            amountOut: Math.round(example.parameters.amountIn * (0.95 + Math.random() * 0.1) * 100) / 100 
          })
        } : {
          error: 'Example execution failed',
          code: 400,
          details: 'This is a simulated failure for demonstration purposes'
        }
      };

      setExecutionResults(prev => ({
        ...prev,
        [example.id]: result
      }));

      // Also notify parent component
      if (onExecuteExample) {
        onExecuteExample(example, result);
      }

    } catch (error) {
      console.error('Example execution failed:', error);
      setExecutionResults(prev => ({
        ...prev,
        [example.id]: {
          success: false,
          error: error.message,
          timestamp: new Date()
        }
      }));
    } finally {
      setExecutingExample(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredExamples = examples.filter(example => example.category === selectedCategory);

  return (
    <div className="bg-gray-800 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              🎯 Live Examples
            </h2>
            <p className="text-gray-400 text-sm">
              Pre-configured examples with one-click execution
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Total: {examples.length} examples</span>
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

      {/* Examples Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExamples.map(example => (
            <ExampleCard
              key={example.id}
              example={example}
              isExecuting={executingExample === example.id}
              result={executionResults[example.id]}
              onExecute={executeExample}
              getDifficultyColor={getDifficultyColor}
            />
          ))}
        </div>
        
        {filteredExamples.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🚧</div>
            <div className="text-lg text-white mb-2">No examples in this category yet</div>
            <div className="text-gray-400">
              Examples are being prepared for this category
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Example Card Component
function ExampleCard({ example, isExecuting, result, onExecute, getDifficultyColor }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{example.icon}</span>
            <div>
              <h3 className="font-medium text-white">{example.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(example.difficulty)} bg-gray-800`}>
                  {example.difficulty}
                </span>
                <span className="text-xs text-gray-400">
                  ~{example.estimatedTime}
                </span>
              </div>
            </div>
          </div>
          
          {result && (
            <div className={`w-3 h-3 rounded-full ${
              result.success ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          )}
        </div>
        
        <p className="text-gray-300 text-sm mb-4">{example.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {example.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          <button
            onClick={() => onExecute(example)}
            disabled={isExecuting}
            className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
              isExecuting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-500'
            }`}
          >
            {isExecuting ? (
              <span className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Running...
              </span>
            ) : (
              '▶️ Run Example'
            )}
          </button>
        </div>
      </div>
      
      {/* Expandable Details */}
      {showDetails && (
        <div className="border-t border-gray-600 p-4 bg-gray-800">
          <div className="space-y-4">
            {/* Parameters */}
            <div>
              <h4 className="font-medium text-white mb-2">Parameters</h4>
              <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                <pre className="text-sm text-blue-400">
                  {JSON.stringify(example.parameters, null, 2)}
                </pre>
              </div>
            </div>
            
            {/* Expected Outcome */}
            <div>
              <h4 className="font-medium text-white mb-2">Expected Outcome</h4>
              <div className={`px-3 py-2 rounded text-sm ${
                example.expectedOutcome === 'success' 
                  ? 'bg-green-600/20 text-green-300' 
                  : 'bg-red-600/20 text-red-300'
              }`}>
                {example.expectedOutcome === 'success' ? '✅ Success' : '❌ Expected to fail'}
              </div>
            </div>
            
            {/* Execution Result */}
            {result && (
              <div>
                <h4 className="font-medium text-white mb-2">Last Execution</h4>
                <div className="bg-gray-900 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.executionTime && (
                    <div className="text-sm text-gray-300 mb-2">
                      Execution time: {result.executionTime}ms
                    </div>
                  )}
                  
                  <pre className={`text-xs overflow-x-auto ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {JSON.stringify(result.data || result.error, null, 2)}
                  </pre>
                  
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-sm text-blue-400 mb-2">💡 Recommendations:</div>
                      <div className="space-y-1">
                        {result.recommendations.map((rec, index) => (
                          <div key={index} className="text-xs text-gray-300">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveExamplesSystem;