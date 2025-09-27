import React, { useState, useEffect } from 'react';
import { createChainIntelligence } from '../utils/chain-intelligence.js';

/**
 * 🎯 Smart Routing Optimizer
 * 
 * Provides intelligent routing recommendations for multi-chain operations:
 * - Real-time route optimization
 * - Cost-benefit analysis 
 * - Risk assessment
 * - Performance predictions
 */
function SmartRoutingOptimizer({ config, onRouteSelect }) {
  const [routingData, setRoutingData] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState('transfer');
  const [operationDetails, setOperationDetails] = useState({
    amount: 100,
    token: 'KDA',
    fromChain: config.deployment.deployToChains[0],
    toChain: config.deployment.deployToChains[1] || config.deployment.deployToChains[0]
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const operationTypes = [
    { id: 'transfer', name: '💸 Token Transfer', complexity: 'low' },
    { id: 'swap', name: '🔄 Token Swap', complexity: 'medium' },
    { id: 'liquidity', name: '💧 Add Liquidity', complexity: 'medium' },
    { id: 'arbitrage', name: '💎 Arbitrage Trade', complexity: 'high' },
    { id: 'governance', name: '🗳️ Governance Vote', complexity: 'low' },
    { id: 'bridge', name: '🌉 Cross-Chain Bridge', complexity: 'high' }
  ];

  useEffect(() => {
    analyzeRoutes();
  }, [selectedOperation, operationDetails]);

  const analyzeRoutes = async () => {
    setIsAnalyzing(true);
    try {
      const intelligence = createChainIntelligence(config);
      const operation = {
        type: selectedOperation === 'transfer' ? 'cross-chain' : selectedOperation,
        ...operationDetails
      };
      
      const routing = await intelligence.optimizeRouting(operation);
      setRoutingData(routing);
    } catch (error) {
      console.error('Route analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOperationChange = (field, value) => {
    setOperationDetails(prev => ({ ...prev, [field]: value }));
  };

  const selectRoute = (route) => {
    if (onRouteSelect) {
      onRouteSelect(route);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            🎯 Smart Routing Optimizer
          </h2>
          <p className="text-gray-400 text-sm">
            Find the optimal route for your multi-chain operations
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-sm text-gray-300">
            {isAnalyzing ? 'Analyzing...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Operation Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Operation Type */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-3">Operation Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {operationTypes.map((op) => (
              <button
                key={op.id}
                onClick={() => setSelectedOperation(op.id)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedOperation === op.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {op.name}
              </button>
            ))}
          </div>
        </div>

        {/* Operation Details */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-3">Operation Details</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                <input
                  type="number"
                  value={operationDetails.amount}
                  onChange={(e) => handleOperationChange('amount', parseFloat(e.target.value))}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Token</label>
                <select
                  value={operationDetails.token}
                  onChange={(e) => handleOperationChange('token', e.target.value)}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  <option value="KDA">KDA</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
            </div>
            
            {selectedOperation !== 'governance' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">From Chain</label>
                  <select
                    value={operationDetails.fromChain}
                    onChange={(e) => handleOperationChange('fromChain', parseInt(e.target.value))}
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                  >
                    {config.deployment.deployToChains.map(chainId => (
                      <option key={chainId} value={chainId}>Chain {chainId}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">To Chain</label>
                  <select
                    value={operationDetails.toChain}
                    onChange={(e) => handleOperationChange('toChain', parseInt(e.target.value))}
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                  >
                    {config.deployment.deployToChains.map(chainId => (
                      <option key={chainId} value={chainId}>Chain {chainId}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Routing Analysis */}
      {routingData && (
        <div className="space-y-6">
          {/* Recommended Route */}
          <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-green-400 flex items-center">
                <span className="mr-2">🏆</span>
                Recommended Route
              </h3>
              <span className="text-sm text-green-300 bg-green-600/20 px-2 py-1 rounded">
                OPTIMAL
              </span>
            </div>
            
            <RouteCard 
              route={routingData.recommendation} 
              isRecommended={true}
              onSelect={() => selectRoute(routingData.recommendation)}
            />
          </div>

          {/* Alternative Routes */}
          {routingData.alternatives.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-white mb-4">🛣️ Alternative Routes</h3>
              <div className="space-y-3">
                {routingData.alternatives.map((route, index) => (
                  <RouteCard 
                    key={index}
                    route={route} 
                    isRecommended={false}
                    onSelect={() => selectRoute(route)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Route Comparison */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-white mb-4">📊 Route Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left text-gray-400 py-2">Route</th>
                    <th className="text-left text-gray-400 py-2">Efficiency</th>
                    <th className="text-left text-gray-400 py-2">Time</th>
                    <th className="text-left text-gray-400 py-2">Cost</th>
                    <th className="text-left text-gray-400 py-2">Risk</th>
                    <th className="text-left text-gray-400 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <RouteTableRow route={routingData.recommendation} isRecommended={true} onSelect={selectRoute} />
                  {routingData.alternatives.map((route, index) => (
                    <RouteTableRow key={index} route={route} isRecommended={false} onSelect={selectRoute} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-gray-700 rounded-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Analyzing optimal routes...</p>
          <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
        </div>
      )}
    </div>
  );
}

function RouteCard({ route, isRecommended, onSelect }) {
  return (
    <div className={`rounded-lg p-4 ${isRecommended ? 'bg-green-600/5' : 'bg-gray-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-white font-medium">
            {route.chains.join(' → ')}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${
            route.riskLevel === 'low' ? 'bg-green-600 text-white' :
            route.riskLevel === 'medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {route.riskLevel.toUpperCase()} RISK
          </span>
          <span className={`px-2 py-1 text-xs rounded ${
            route.complexity === 'low' ? 'bg-blue-600 text-white' :
            route.complexity === 'medium' ? 'bg-purple-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {route.complexity.toUpperCase()}
          </span>
        </div>
        
        <button
          onClick={onSelect}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isRecommended 
              ? 'bg-green-600 text-white hover:bg-green-500'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          Select Route
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Efficiency: </span>
          <span className={`font-medium ${
            route.efficiency > 80 ? 'text-green-400' : 
            route.efficiency > 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {route.efficiency}%
          </span>
        </div>
        <div>
          <span className="text-gray-400">Time: </span>
          <span className="text-white font-medium">{route.estimatedTime}s</span>
        </div>
        <div>
          <span className="text-gray-400">Cost: </span>
          <span className="text-white font-medium">{route.estimatedCost} KDA</span>
        </div>
        <div>
          <span className="text-gray-400">Hops: </span>
          <span className="text-white font-medium">{route.hops}</span>
        </div>
      </div>
    </div>
  );
}

function RouteTableRow({ route, isRecommended, onSelect }) {
  return (
    <tr className={`border-b border-gray-600 ${isRecommended ? 'bg-green-600/5' : ''}`}>
      <td className="py-3">
        <div className="flex items-center space-x-2">
          {isRecommended && <span className="text-green-400">🏆</span>}
          <span className="text-white font-medium">
            {route.chains.join(' → ')}
          </span>
        </div>
      </td>
      <td className="py-3">
        <span className={`font-medium ${
          route.efficiency > 80 ? 'text-green-400' : 
          route.efficiency > 60 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {route.efficiency}%
        </span>
      </td>
      <td className="py-3 text-white">{route.estimatedTime}s</td>
      <td className="py-3 text-white">{route.estimatedCost} KDA</td>
      <td className="py-3">
        <span className={`px-2 py-1 text-xs rounded ${
          route.riskLevel === 'low' ? 'bg-green-600 text-white' :
          route.riskLevel === 'medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {route.riskLevel.toUpperCase()}
        </span>
      </td>
      <td className="py-3">
        <button
          onClick={() => onSelect(route)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-500 transition-colors"
        >
          Select
        </button>
      </td>
    </tr>
  );
}

export default SmartRoutingOptimizer;