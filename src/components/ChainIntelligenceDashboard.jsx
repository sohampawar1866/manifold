import React, { useState, useEffect } from 'react';
import { createChainIntelligence } from '../utils/chain-intelligence.js';

/**
 * 🧠 Chain Intelligence Dashboard
 * 
 * Real-time visualization of chain intelligence data:
 * - Performance analytics
 * - Cost optimization 
 * - Load balancing
 * - Arbitrage opportunities
 * - Predictive insights
 */
function ChainIntelligenceDashboard({ config }) {
  const [intelligence, setIntelligence] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const chainIntel = createChainIntelligence(config);
    
    const fetchIntelligence = async () => {
      setIsLoading(true);
      try {
        const report = await chainIntel.generateIntelligenceReport();
        setIntelligence(report);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch intelligence:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntelligence();
    
    // Update every 5 minutes
    const interval = setInterval(fetchIntelligence, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (isLoading || !intelligence) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-600 rounded w-2/3"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: '📊 Overview', icon: '📊' },
    { id: 'performance', name: '⚡ Performance', icon: '⚡' },
    { id: 'costs', name: '💰 Costs', icon: '💰' },
    { id: 'routing', name: '🎯 Routing', icon: '🎯' },
    { id: 'arbitrage', name: '💎 Arbitrage', icon: '💎' },
    { id: 'predictions', name: '🔮 Predictions', icon: '🔮' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            🧠 Chain Intelligence
          </h2>
          <p className="text-gray-400 text-sm">
            Real-time optimization and analytics • Last update: {lastUpdate?.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${intelligence.summary.overallHealth.status === 'excellent' ? 'bg-green-500' : 
            intelligence.summary.overallHealth.status === 'good' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-300">
            Health: {intelligence.summary.overallHealth.score}/100
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-700 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.name.split(' ')[1]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab intelligence={intelligence} />}
      {activeTab === 'performance' && <PerformanceTab performance={intelligence.performance} />}
      {activeTab === 'costs' && <CostsTab costs={intelligence.costs} />}
      {activeTab === 'routing' && <RoutingTab config={config} />}
      {activeTab === 'arbitrage' && <ArbitrageTab arbitrage={intelligence.arbitrage} />}
      {activeTab === 'predictions' && <PredictionsTab predictions={intelligence.predictions} />}
    </div>
  );
}

function OverviewTab({ intelligence }) {
  const { summary, performance } = intelligence;

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Overall Health</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {summary.overallHealth.score}/100
          </div>
          <div className={`text-sm font-medium ${
            summary.overallHealth.status === 'excellent' ? 'text-green-400' :
            summary.overallHealth.status === 'good' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {summary.overallHealth.status.toUpperCase()}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Active Chains</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {summary.totalChains}
          </div>
          <div className="text-sm text-blue-400 font-medium">
            {summary.complexity.toUpperCase()} COMPLEXITY
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Best Performer</h3>
          <div className="text-2xl font-bold text-white mb-1">
            Chain {performance.overall.bestPerformer}
          </div>
          <div className="text-sm text-green-400 font-medium">
            {Math.round(performance.overall.avgResponseTime)}ms AVG
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-white mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Top Recommendations
        </h3>
        
        <div className="space-y-3">
          {summary.topRecommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-600 rounded-lg">
              <div className={`w-2 h-2 mt-2 rounded-full ${
                rec.priority === 'high' ? 'bg-red-500' : 
                rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                <p className="text-gray-300 text-xs mt-1">{rec.description}</p>
                <p className="text-blue-400 text-xs mt-1">{rec.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-600/30">
          <div className="text-sm text-blue-400 mb-1">Avg Response</div>
          <div className="text-lg font-bold text-white">
            {Math.round(performance.overall.avgResponseTime)}ms
          </div>
        </div>
        
        <div className="bg-green-600/20 rounded-lg p-3 border border-green-600/30">
          <div className="text-sm text-green-400 mb-1">Throughput</div>
          <div className="text-lg font-bold text-white">
            {Math.round(performance.overall.totalThroughput)}
          </div>
        </div>
        
        <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-600/30">
          <div className="text-sm text-purple-400 mb-1">Opportunities</div>
          <div className="text-lg font-bold text-white">
            {intelligence.arbitrage.totalOpportunities}
          </div>
        </div>
        
        <div className="bg-yellow-600/20 rounded-lg p-3 border border-yellow-600/30">
          <div className="text-sm text-yellow-400 mb-1">Health Score</div>
          <div className="text-lg font-bold text-white">
            {summary.overallHealth.score}%
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceTab({ performance }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(performance.chains).map(([chainId, metrics]) => (
          <div key={chainId} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white">Chain {chainId}</h3>
              <div className={`w-3 h-3 rounded-full ${
                metrics.status === 'optimal' ? 'bg-green-500' :
                metrics.status === 'slow' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Response Time:</span>
                <span className="text-white font-medium">{metrics.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Throughput:</span>
                <span className="text-white font-medium">{metrics.throughput}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Load:</span>
                <span className="text-white font-medium">{metrics.load}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime:</span>
                <span className="text-green-400 font-medium">{metrics.uptime.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Score:</span>
                <span className="text-blue-400 font-medium">{metrics.performanceScore}/100</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Recommendations */}
      {performance.recommendations.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-4">⚡ Performance Recommendations</h3>
          <div className="space-y-3">
            {performance.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    rec.priority === 'high' ? 'bg-red-600 text-white' :
                    rec.priority === 'medium' ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{rec.description}</p>
                <p className="text-blue-400 text-sm"><strong>Action:</strong> {rec.action}</p>
                <p className="text-green-400 text-sm"><strong>Impact:</strong> {rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CostsTab({ costs }) {
  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Price Range</h3>
          <div className="text-lg font-bold text-white mb-1">
            {costs.patterns.priceRange.spread}
          </div>
          <div className="text-sm text-gray-400">
            {costs.patterns.priceRange.min.toFixed(8)} - {costs.patterns.priceRange.max.toFixed(8)} KDA
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Volatility</h3>
          <div className="text-lg font-bold text-white mb-1">
            {costs.patterns.volatility.level.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">
            {costs.patterns.volatility.coefficientOfVariation}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Potential Savings</h3>
          <div className="text-lg font-bold text-green-400 mb-1">
            {costs.savings.potential.toFixed(6)} KDA
          </div>
          <div className="text-sm text-gray-400">
            Per transaction
          </div>
        </div>
      </div>

      {/* Chain Costs */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-white mb-4">💰 Chain Cost Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(costs.chains).map(([chainId, chainCosts]) => (
            <div key={chainId} className="bg-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Chain {chainId}</h4>
                <span className={`px-2 py-1 text-xs rounded ${
                  chainCosts.competitiveness.rating === 'excellent' ? 'bg-green-600 text-white' :
                  chainCosts.competitiveness.rating === 'good' ? 'bg-blue-600 text-white' :
                  chainCosts.competitiveness.rating === 'average' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {chainCosts.competitiveness.rating.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Gas Price:</span>
                  <span className="text-white font-mono">{chainCosts.gasPrice.toFixed(8)} KDA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Transfer Cost:</span>
                  <span className="text-white font-mono">{chainCosts.tokenTransferCost.toFixed(6)} KDA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Contract Call:</span>
                  <span className="text-white font-mono">{chainCosts.contractCallCost.toFixed(6)} KDA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Score:</span>
                  <span className={`font-medium ${chainCosts.competitiveness.score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {chainCosts.competitiveness.score > 0 ? '+' : ''}{chainCosts.competitiveness.score}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Recommendations */}
      {costs.savings.recommendations.length > 0 && (
        <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
          <h3 className="font-medium text-green-400 mb-3">💡 Cost Optimization</h3>
          {costs.savings.recommendations.map((rec, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <p className="text-white font-medium text-sm">{rec.action}</p>
              <p className="text-green-300 text-sm">{rec.savings}</p>
              <p className="text-gray-300 text-sm">{rec.impact}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoutingTab({ config }) {
  const [routingAnalysis, setRoutingAnalysis] = useState(null);

  useEffect(() => {
    const analyzeRouting = async () => {
      const intelligence = createChainIntelligence(config);
      const routing = await intelligence.optimizeRouting({ 
        type: 'cross-chain', 
        amount: 100,
        token: 'KDA'
      });
      setRoutingAnalysis(routing);
    };

    analyzeRouting();
  }, [config]);

  if (!routingAnalysis) {
    return <div className="text-gray-400">Loading routing analysis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Best Route */}
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
        <h3 className="font-medium text-blue-400 mb-3">🎯 Recommended Route</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400">Type</div>
            <div className="text-white font-medium">{routingAnalysis.recommendation.type}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Chains</div>
            <div className="text-white font-medium">{routingAnalysis.recommendation.chains.join(' → ')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Efficiency</div>
            <div className="text-green-400 font-medium">{routingAnalysis.recommendation.efficiency}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Est. Time</div>
            <div className="text-white font-medium">{routingAnalysis.recommendation.estimatedTime}s</div>
          </div>
        </div>
      </div>

      {/* All Routes */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-white mb-4">🛣️ Available Routes</h3>
        <div className="space-y-3">
          {routingAnalysis.routes.map((route, index) => (
            <div key={index} className="bg-gray-600 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
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
                </div>
                <div className="text-sm text-gray-300">
                  {route.efficiency}% efficient
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Time: </span>
                  <span className="text-white">{route.estimatedTime}s</span>
                </div>
                <div>
                  <span className="text-gray-400">Cost: </span>
                  <span className="text-white">{route.estimatedCost} KDA</span>
                </div>
                <div>
                  <span className="text-gray-400">Hops: </span>
                  <span className="text-white">{route.hops}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArbitrageTab({ arbitrage }) {
  return (
    <div className="space-y-6">
      {/* Arbitrage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Total Opportunities</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {arbitrage.totalOpportunities}
          </div>
          <div className="text-sm text-gray-400">
            Active arbitrage chances
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Best Opportunity</h3>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {arbitrage.bestOpportunity ? `${arbitrage.bestOpportunity.profitPercent.toFixed(2)}%` : 'None'}
          </div>
          <div className="text-sm text-gray-400">
            {arbitrage.bestOpportunity ? arbitrage.bestOpportunity.token : 'No profitable opportunities'}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-300 mb-2">Market Conditions</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {arbitrage.marketConditions.volatility.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">
            {arbitrage.marketConditions.arbitrageActivity} activity
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {arbitrage.opportunities.length > 0 ? (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-4">💎 Arbitrage Opportunities</h3>
          <div className="space-y-3">
            {arbitrage.opportunities.map((opp, index) => (
              <div key={index} className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-white">{opp.token}</span>
                    <span className="text-green-400 font-medium">
                      +{opp.profitPercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Chain {opp.buyChain} → Chain {opp.sellChain}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Buy at: </span>
                    <span className="text-white font-mono">{opp.buyPrice.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sell at: </span>
                    <span className="text-white font-mono">{opp.sellPrice.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <div className="text-gray-400 mb-2">💎</div>
          <h3 className="text-white font-medium mb-2">No Arbitrage Opportunities</h3>
          <p className="text-gray-400 text-sm">
            Current market conditions don't show profitable arbitrage opportunities.
            Check back later as conditions change frequently.
          </p>
        </div>
      )}
    </div>
  );
}

function PredictionsTab({ predictions }) {
  return (
    <div className="space-y-6">
      {/* Performance Predictions */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-white mb-4">⚡ Performance Forecasts</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(predictions.performanceTrends).map(([chainId, trend]) => (
            <div key={chainId} className="bg-gray-600 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3">Chain {chainId}</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Response Time Trend:</span>
                  <span className={`font-medium ${
                    trend.responseTime.trend.direction === 'increasing' ? 'text-red-400' :
                    trend.responseTime.trend.direction === 'decreasing' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {trend.responseTime.trend.direction} ({trend.responseTime.trend.magnitude})
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Predicted Response:</span>
                  <span className="text-white font-medium">{trend.responseTime.prediction}ms</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Throughput Trend:</span>
                  <span className={`font-medium ${
                    trend.throughput.trend.direction === 'increasing' ? 'text-green-400' :
                    trend.throughput.trend.direction === 'decreasing' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {trend.throughput.trend.direction} ({trend.throughput.trend.magnitude})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Forecasts */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-white mb-4">💰 Cost Forecasts</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(predictions.costForecasts).map(([chainId, forecast]) => (
            <div key={chainId} className="bg-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Chain {chainId}</h4>
                <span className={`px-2 py-1 text-xs rounded ${
                  forecast.confidence === 'high' ? 'bg-green-600 text-white' :
                  forecast.confidence === 'medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {forecast.confidence.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Current:</span>
                  <span className="text-white font-mono">{forecast.currentPrice.toFixed(8)} KDA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Predicted:</span>
                  <span className={`font-mono ${
                    forecast.predictedPrice > forecast.currentPrice ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {forecast.predictedPrice.toFixed(8)} KDA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Trend:</span>
                  <span className="text-white">{forecast.trend.direction} ({forecast.trend.magnitude})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimal Windows */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-white mb-4">🕐 Optimal Transaction Windows</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {predictions.optimalWindows.map((window, index) => (
            <div key={index} className={`rounded-lg p-3 text-center ${
              window.rating === 'excellent' ? 'bg-green-600/20 border border-green-600/30' :
              window.rating === 'good' ? 'bg-blue-600/20 border border-blue-600/30' :
              'bg-yellow-600/20 border border-yellow-600/30'
            }`}>
              <div className="text-lg font-bold text-white mb-1">
                {window.hour.toString().padStart(2, '0')}:00
              </div>
              <div className={`text-xs font-medium mb-1 ${
                window.rating === 'excellent' ? 'text-green-400' :
                window.rating === 'good' ? 'text-blue-400' : 'text-yellow-400'
              }`}>
                {window.rating.toUpperCase()}
              </div>
              <div className="text-xs text-gray-300">
                {window.averageLoad}% load
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {window.savings}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChainIntelligenceDashboard;