import { useState } from 'react';
import { 
  crossChainTransfer, 
  executeArbitrage, 
  addLiquidityMultiChain,
  executeFlashLoan,
  rebalancePortfolio 
} from '../kadena/utils.js';

/**
 * Advanced Operations Component - Dark Theme
 * Professional minimal design with reduced padding
 */
export function AdvancedOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Example: Cross-chain transfer with just 4 parameters!
  const handleCrossChainTransfer = async () => {
    setIsLoading(true);
    try {
      const result = await crossChainTransfer(
        20,  // Source chain
        21,  // Destination chain
        '1.0', // Amount in KDA
        '0x742d35Cc6633C0532925a3b8D0e0b5f3d12c0f6B' // Recipient address (example)
      );
      setResults(result);
      console.log('Cross-chain transfer completed:', result);
    } catch (error) {
      console.error('Cross-chain transfer failed:', error);
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Multi-chain arbitrage - finds best prices automatically
  const handleArbitrage = async () => {
    setIsLoading(true);
    try {
      const result = await executeArbitrage(
        '0x1234567890123456789012345678901234567890', // Token contract address
        '100' // Amount to trade
      );
      setResults(result);
      console.log('Arbitrage executed:', result);
    } catch (error) {
      console.error('Arbitrage failed:', error);
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Multi-chain liquidity provision
  const handleMultiChainLiquidity = async () => {
    setIsLoading(true);
    try {
      const result = await addLiquidityMultiChain(
        [20, 21, 22], // Target chains
        '0x1234567890123456789012345678901234567890', // Token A
        '0x0987654321098765432109876543210987654321', // Token B
        '50', // Amount A per chain
        '50'  // Amount B per chain
      );
      setResults(result);
      console.log('Multi-chain liquidity added:', result);
    } catch (error) {
      console.error('Liquidity provision failed:', error);
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Portfolio rebalancing across all chains
  const handleRebalancing = async () => {
    setIsLoading(true);
    try {
      const result = await rebalancePortfolio(
        { 20: 25, 21: 25, 22: 20, 23: 15, 24: 15 }, // Percentage allocation per chain
        '1000' // Total portfolio value in KDA
      );
      setResults(result);
      console.log('Portfolio rebalanced:', result);
    } catch (error) {
      console.error('Portfolio rebalancing failed:', error);
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-900 rounded"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Manifold Advanced Operations
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto mb-6">
            Leverage Kadena's parallel chain architecture for high-throughput operations. Execute complex strategies across the braided network.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded text-sm font-medium border border-purple-500/20">SPV Cross-Chain</span>
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded text-sm font-medium border border-blue-500/20">Parallel Execution</span>
            <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded text-sm font-medium border border-red-500/20">Zero Gas Fees</span>
            <span className="bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded text-sm font-medium border border-emerald-500/20">PoW Security</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cross-Chain Transfer - Purple Theme */}
          <div className="bg-gray-900 border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-6 bg-white rounded"></div>
                  <div className="w-1 h-6 bg-white rounded"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-400">Cross-Chain Transfer</h3>
                <p className="text-purple-300 text-sm">Instant cross-chain transactions</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed text-sm">
              Execute native cross-chain transfers using Kadena's built-in SPV. No external bridges required.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <pre className="text-sm text-purple-300 overflow-x-auto font-mono">
{`crossChainTransfer(
  20,     // Source chain
  21,     // Destination  
  '1.0',  // Amount KDA
  '0x...' // Recipient
)`}
              </pre>
            </div>
            <button
              onClick={handleCrossChainTransfer}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 text-sm"
            >
              Execute Transfer
            </button>
          </div>

          {/* Arbitrage - Blue Theme */}
          <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="transform rotate-45">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-400">Multi-Chain Arbitrage</h3>
                <p className="text-blue-300 text-sm">Automated profit extraction</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed text-sm">
              Exploit market inefficiencies across parallel chains with instant finality and zero fees.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <pre className="text-sm text-blue-300 overflow-x-auto font-mono">
{`executeArbitrage(
  '0x1234...', // Token contract
  '100'        // Amount to trade
)`}
              </pre>
            </div>
            <button
              onClick={handleArbitrage}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 text-sm"
            >
              Execute Arbitrage
            </button>
          </div>

          {/* Multi-Chain Liquidity - Red Theme */}
          <div className="bg-gray-900 border border-red-500/20 rounded-lg p-6 hover:border-red-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <div className="flex flex-col space-y-0.5">
                  <div className="w-6 h-1 bg-white rounded"></div>
                  <div className="w-6 h-1 bg-white rounded"></div>
                  <div className="w-6 h-1 bg-white rounded"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-400">Multi-Chain Liquidity</h3>
                <p className="text-red-300 text-sm">Distributed liquidity provision</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed text-sm">
              Deploy capital across the braided network for optimized yield farming with reduced impermanent loss.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <pre className="text-sm text-red-300 overflow-x-auto font-mono">
{`addLiquidityMultiChain(
  [20,21,22], // Target chains
  tokenA,     // First token
  tokenB,     // Second token
  '50', '50'  // Amounts
)`}
              </pre>
            </div>
            <button
              onClick={handleMultiChainLiquidity}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 text-sm"
            >
              Add Liquidity
            </button>
          </div>

          {/* Portfolio Rebalancing - Emerald Theme */}
          <div className="bg-gray-900 border border-emerald-500/20 rounded-lg p-6 hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-400">Portfolio Rebalancing</h3>
                <p className="text-emerald-300 text-sm">Intelligent asset allocation</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed text-sm">
              Utilize parallel processing to rebalance portfolios across 20 chains with minimal latency.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <pre className="text-sm text-emerald-300 overflow-x-auto font-mono">
{`rebalancePortfolio(
  {20:25, 21:25, 22:20...}, // %
  '1000' // Total value
)`}
              </pre>
            </div>
            <button
              onClick={handleRebalancing}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 text-sm"
            >
              Rebalance Portfolio
            </button>
          </div>
        </div>

        {/* Results Display */}
        {isLoading && (
          <div className="mt-6 p-4 bg-gray-800 border border-amber-500/20 rounded-lg">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-amber-500"></div>
              <div>
                <div className="text-amber-400 font-bold text-lg">Executing Multi-Chain Operation</div>
                <div className="text-gray-400 text-sm">Processing across multiple Kadena chains</div>
              </div>
            </div>
            <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between text-sm text-gray-400 font-medium">
                <span>Analysis</span>
                <span>Routing</span>
                <span>Execution</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-amber-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-6 p-4 bg-gray-800 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-green-400">Operation Completed</h4>
                <p className="text-green-300 text-sm">Multi-chain transaction executed successfully</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-green-300 font-mono overflow-auto max-h-32">
                {JSON.stringify(results, null, 2)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Developer Instructions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <div className="w-7 h-7 bg-gray-900 rounded"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Developer Integration Guide
          </h3>
          <p className="text-gray-400 text-lg">
            Simple APIs for complex multi-chain operations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/20">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg mx-auto flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h4 className="font-bold text-purple-400 text-lg">Import Functions</h4>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <pre className="text-purple-300 text-xs overflow-x-auto font-mono">
{`import { 
  crossChainTransfer,
  executeArbitrage,
  addLiquidityMultiChain
} from '../kadena/utils.js';`}
              </pre>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-blue-500/20">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg mx-auto flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h4 className="font-bold text-blue-400 text-lg">Function Calls</h4>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <pre className="text-blue-300 text-xs overflow-x-auto font-mono">
{`// Cross-chain transfer
const result = await crossChainTransfer(
  20, 21, '5.0', address
);

// Arbitrage
const profit = await executeArbitrage(
  tokenAddress, '100'
);`}
              </pre>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-red-500/20">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg mx-auto flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h4 className="font-bold text-red-400 text-lg">Enterprise Features</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-400 text-sm">Parallel execution</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-400 text-sm">Error handling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-400 text-sm">Gas optimization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-400 text-sm">Cross-chain routing</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 px-6 py-3 rounded-lg inline-block">
            <div className="font-bold text-lg">Manifold Framework</div>
            <div className="text-sm font-medium opacity-80">Production-ready multi-chain platform</div>
          </div>
        </div>
      </div>
    </div>
  )
}