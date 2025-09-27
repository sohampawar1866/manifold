import React, { useState, useEffect } from 'react';
import { createChainIntelligence } from '../utils/chain-intelligence.js';

/**
 * 🔍 Arbitrage Opportunity Detector
 * 
 * Detects and analyzes arbitrage opportunities across chains:
 * - Price differences between chains
 * - Cross-chain transfer costs
 * - Profit potential calculations
 * - Risk assessment
 */
function ArbitrageOpportunityDetector({ config }) {
  const [opportunities, setOpportunities] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [filters, setFilters] = useState({
    minProfit: 10, // USD
    maxRisk: 'medium',
    token: 'all'
  });
  const [scanResults, setScanResults] = useState(null);

  const tokens = [
    { symbol: 'KDA', name: 'Kadena', icon: '💎' },
    { symbol: 'WETH', name: 'Wrapped ETH', icon: '🔷' },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰' },
    { symbol: 'USDT', name: 'Tether', icon: '💵' },
    { symbol: 'KDX', name: 'KadenaSwap', icon: '🔄' }
  ];

  const riskLevels = [
    { value: 'low', name: 'Low Risk', color: 'text-green-400', description: 'Minimal exposure, stable pairs' },
    { value: 'medium', name: 'Medium Risk', color: 'text-yellow-400', description: 'Moderate exposure, some volatility' },
    { value: 'high', name: 'High Risk', color: 'text-red-400', description: 'High exposure, volatile pairs' }
  ];

  useEffect(() => {
    if (config && config.chains && config.chains.length > 1) {
      scanForOpportunities();
    }
  }, [config, filters]);

  const scanForOpportunities = async () => {
    setIsScanning(true);
    
    try {
      const intelligence = createChainIntelligence(config);
      const detectedOpportunities = await intelligence.detectArbitrageOpportunities();
      
      // Filter opportunities based on user preferences
      const filteredOpportunities = detectedOpportunities.filter(opp => {
        if (opp.potentialProfit < filters.minProfit) return false;
        if (filters.token !== 'all' && opp.token !== filters.token) return false;
        
        const riskIndex = riskLevels.findIndex(r => r.value === filters.maxRisk);
        const oppRiskIndex = riskLevels.findIndex(r => r.value === opp.riskLevel);
        if (oppRiskIndex > riskIndex) return false;
        
        return true;
      });
      
      setOpportunities(filteredOpportunities.sort((a, b) => b.potentialProfit - a.potentialProfit));
      setScanResults({
        totalScanned: detectedOpportunities.length,
        filtered: filteredOpportunities.length,
        lastScan: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Failed to scan for arbitrage opportunities:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getProfitColor = (profit) => {
    if (profit > 100) return 'text-green-400';
    if (profit > 50) return 'text-green-300';
    if (profit > 20) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getRiskColor = (risk) => {
    const riskLevel = riskLevels.find(r => r.value === risk);
    return riskLevel ? riskLevel.color : 'text-gray-400';
  };

  const calculateExecutionTime = (opportunity) => {
    // Estimate based on chain speeds and transfer times
    const baseTime = 30; // seconds
    const chainFactor = (opportunity.sourceChain === '20' || opportunity.targetChain === '20') ? 1.2 : 1.0;
    const riskFactor = opportunity.riskLevel === 'high' ? 1.5 : opportunity.riskLevel === 'medium' ? 1.2 : 1.0;
    
    return Math.round(baseTime * chainFactor * riskFactor);
  };

  const getOpportunityIcon = (type) => {
    switch (type) {
      case 'price_differential': return '📊';
      case 'liquidity_imbalance': return '💧';
      case 'fee_arbitrage': return '💸';
      case 'flash_opportunity': return '⚡';
      default: return '🔍';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            🔍 Arbitrage Detector
          </h2>
          <p className="text-gray-400 text-sm">
            Discover profitable cross-chain arbitrage opportunities
          </p>
        </div>
        
        <button
          onClick={scanForOpportunities}
          disabled={isScanning}
          className={`px-4 py-2 rounded font-medium ${
            isScanning
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {isScanning ? (
            <span className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Scanning...
            </span>
          ) : (
            '🔄 Scan Now'
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-white mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Min Profit (USD)</label>
            <input
              type="number"
              value={filters.minProfit}
              onChange={(e) => setFilters(prev => ({ ...prev, minProfit: Number(e.target.value) }))}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded"
              min="0"
              step="5"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Risk Level</label>
            <select
              value={filters.maxRisk}
              onChange={(e) => setFilters(prev => ({ ...prev, maxRisk: e.target.value }))}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded"
            >
              {riskLevels.map(level => (
                <option key={level.value} value={level.value}>{level.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Token</label>
            <select
              value={filters.token}
              onChange={(e) => setFilters(prev => ({ ...prev, token: e.target.value }))}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded"
            >
              <option value="all">All Tokens</option>
              {tokens.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scan Results Summary */}
      {scanResults && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{scanResults.totalScanned}</div>
            <div className="text-sm text-gray-400">Total Scanned</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{scanResults.filtered}</div>
            <div className="text-sm text-gray-400">Opportunities Found</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-blue-400 mb-1">{scanResults.lastScan}</div>
            <div className="text-sm text-gray-400">Last Scan</div>
          </div>
        </div>
      )}

      {/* Opportunities List */}
      {opportunities.length > 0 ? (
        <div className="space-y-4">
          {opportunities.map((opportunity, index) => (
            <div
              key={index}
              className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedOpportunity === index ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600'
              }`}
              onClick={() => setSelectedOpportunity(selectedOpportunity === index ? null : index)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getOpportunityIcon(opportunity.type)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-white">{opportunity.token}</h3>
                      <span className="text-sm text-gray-400">
                        Chain {opportunity.sourceChain} → Chain {opportunity.targetChain}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 capitalize">
                      {opportunity.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xl font-bold ${getProfitColor(opportunity.potentialProfit)}`}>
                    +${opportunity.potentialProfit.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {opportunity.profitMargin.toFixed(2)}% margin
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Buy Price:</span>
                  <div className="text-white font-medium">${opportunity.buyPrice.toFixed(4)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Sell Price:</span>
                  <div className="text-white font-medium">${opportunity.sellPrice.toFixed(4)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Risk Level:</span>
                  <div className={`font-medium capitalize ${getRiskColor(opportunity.riskLevel)}`}>
                    {opportunity.riskLevel}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Est. Time:</span>
                  <div className="text-white font-medium">{calculateExecutionTime(opportunity)}s</div>
                </div>
              </div>
              
              {selectedOpportunity === index && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Execution Plan */}
                    <div>
                      <h4 className="font-medium text-white mb-3">Execution Plan</h4>
                      <div className="space-y-2">
                        {opportunity.executionSteps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                              {stepIndex + 1}
                            </div>
                            <span className="text-sm text-gray-300">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Risk Analysis */}
                    <div>
                      <h4 className="font-medium text-white mb-3">Risk Analysis</h4>
                      <div className="space-y-3">
                        {opportunity.risks.map((risk, riskIndex) => (
                          <div key={riskIndex} className="bg-gray-800 rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white">{risk.type}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                risk.level === 'high' ? 'bg-red-600' :
                                risk.level === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                              } text-white`}>
                                {risk.level.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{risk.description}</p>
                            <p className="text-xs text-blue-400 mt-1"><strong>Mitigation:</strong> {risk.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500">
                      Save for Later
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500">
                      Execute Trade
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {isScanning ? (
            <div className="animate-pulse">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-lg text-white mb-2">Scanning for opportunities...</div>
              <div className="text-gray-400">Analyzing price differences across chains</div>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-4">📈</div>
              <div className="text-lg text-white mb-2">No arbitrage opportunities found</div>
              <div className="text-gray-400 mb-4">
                Try adjusting your filters or scan again later
              </div>
              <button
                onClick={scanForOpportunities}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Refresh Scan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
        <h3 className="font-medium text-blue-400 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Higher profit margins often come with higher risks</li>
          <li>• Consider gas fees and transfer costs in your calculations</li>
          <li>• Fast execution is crucial - opportunities can disappear quickly</li>
          <li>• Start with smaller amounts to test the execution flow</li>
          <li>• Monitor market volatility during high-risk trades</li>
        </ul>
      </div>
    </div>
  );
}

export default ArbitrageOpportunityDetector;