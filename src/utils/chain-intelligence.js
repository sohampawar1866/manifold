/**
 * 🧠 Chain Intelligence System
 * 
 * Provides intelligent recommendations for multi-chain operations:
 * - Real-time performance analytics
 * - Smart routing optimization
 * - Cost analysis and recommendations
 * - Load balancing suggestions
 * - Arbitrage opportunity detection
 */

export class ChainIntelligence {
  constructor(config) {
    this.config = config;
    this.chains = config.deployment.deployToChains;
    this.complexity = config.complexity;
    this.performanceData = new Map();
    this.costData = new Map();
    this.loadData = new Map();
  }

  /**
   * 📊 Real-time Performance Analytics
   */
  async analyzeChainPerformance() {
    const analysis = {
      timestamp: Date.now(),
      chains: {},
      recommendations: [],
      overall: {
        bestPerformer: null,
        avgResponseTime: 0,
        totalThroughput: 0
      }
    };

    let totalResponseTime = 0;
    let bestChain = { id: null, score: 0 };

    for (const chainId of this.chains) {
      const metrics = await this.getChainMetrics(chainId);
      const score = this.calculatePerformanceScore(metrics);
      
      analysis.chains[chainId] = {
        ...metrics,
        performanceScore: score,
        networkId: 5920 + chainId - 20,
        status: this.getChainStatus(metrics)
      };

      totalResponseTime += metrics.responseTime;
      
      if (score > bestChain.score) {
        bestChain = { id: chainId, score };
      }
    }

    analysis.overall.bestPerformer = bestChain.id;
    analysis.overall.avgResponseTime = totalResponseTime / this.chains.length;
    analysis.overall.totalThroughput = Object.values(analysis.chains)
      .reduce((sum, chain) => sum + chain.throughput, 0);

    // Generate performance-based recommendations
    analysis.recommendations = this.generatePerformanceRecommendations(analysis);

    return analysis;
  }

  /**
   * 🎯 Smart Routing Optimization
   */
  async optimizeRouting(operation) {
    const routes = await this.calculateOptimalRoutes(operation);
    
    return {
      operation,
      routes: routes.map(route => ({
        ...route,
        efficiency: this.calculateRouteEfficiency(route),
        estimatedTime: this.estimateTransactionTime(route),
        estimatedCost: this.estimateTransactionCost(route),
        riskLevel: this.assessRiskLevel(route)
      })),
      recommendation: this.selectBestRoute(routes),
      alternatives: this.getAlternativeRoutes(routes)
    };
  }

  /**
   * 💰 Cost Analysis and Optimization
   */
  async analyzeCosts() {
    const costAnalysis = {
      timestamp: Date.now(),
      chains: {},
      patterns: {},
      savings: {
        potential: 0,
        recommendations: []
      }
    };

    for (const chainId of this.chains) {
      const costs = await this.getChainCosts(chainId);
      costAnalysis.chains[chainId] = {
        ...costs,
        competitiveness: this.calculateCostCompetitiveness(costs, chainId)
      };
    }

    // Analyze cost patterns
    costAnalysis.patterns = this.analyzeCostPatterns(costAnalysis.chains);
    
    // Calculate potential savings
    costAnalysis.savings = this.calculatePotentialSavings(costAnalysis.chains);

    return costAnalysis;
  }

  /**
   * ⚖️ Load Balancing Intelligence
   */
  async suggestLoadBalancing() {
    const currentLoad = await this.getCurrentLoadDistribution();
    const optimalDistribution = this.calculateOptimalDistribution();
    
    return {
      current: currentLoad,
      optimal: optimalDistribution,
      rebalanceActions: this.generateRebalanceActions(currentLoad, optimalDistribution),
      projectedImprovement: this.calculateImprovementProjection(currentLoad, optimalDistribution)
    };
  }

  /**
   * 💎 Arbitrage Opportunity Detection
   */
  async detectArbitrageOpportunities() {
    if (this.chains.length < 2) {
      return { opportunities: [], message: 'Need at least 2 chains for arbitrage detection' };
    }

    const prices = await this.fetchCrosschainPrices();
    const opportunities = [];

    for (let i = 0; i < this.chains.length; i++) {
      for (let j = i + 1; j < this.chains.length; j++) {
        const chainA = this.chains[i];
        const chainB = this.chains[j];
        
        const opportunity = this.calculateArbitrageOpportunity(
          prices[chainA], 
          prices[chainB], 
          chainA, 
          chainB
        );

        if (opportunity.profitable) {
          opportunities.push(opportunity);
        }
      }
    }

    return {
      opportunities: opportunities.sort((a, b) => b.profitPercent - a.profitPercent),
      totalOpportunities: opportunities.length,
      bestOpportunity: opportunities[0] || null,
      marketConditions: this.assessMarketConditions(prices)
    };
  }

  /**
   * 🔮 Predictive Analytics
   */
  async generatePredictions() {
    const historical = await this.getHistoricalData();
    
    return {
      performanceTrends: this.predictPerformanceTrends(historical),
      costForecasts: this.forecastCosts(historical),
      congestionPredictions: this.predictCongestion(historical),
      optimalWindows: this.identifyOptimalWindows(historical)
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async getChainMetrics(chainId) {
    // Simulate real-time chain metrics
    const baseLatency = 100 + Math.random() * 200;
    const load = Math.random();
    
    return {
      responseTime: Math.round(baseLatency + (load * 100)),
      throughput: Math.round(1000 - (load * 500)),
      gasPrice: this.getSimulatedGasPrice(chainId),
      blockTime: 1 + Math.random() * 2,
      load: Math.round(load * 100),
      uptime: 95 + Math.random() * 5,
      activeNodes: 50 + Math.round(Math.random() * 50)
    };
  }

  getSimulatedGasPrice(chainId) {
    // Simulate different gas prices per chain
    const basePrices = {
      20: 0.000001,
      21: 0.0000012,
      22: 0.000001,
      23: 0.0000015,
      24: 0.000001
    };
    
    const base = basePrices[chainId] || 0.000001;
    const volatility = 0.2;
    return base * (1 + (Math.random() - 0.5) * volatility);
  }

  calculatePerformanceScore(metrics) {
    // Higher score = better performance
    const responseScore = Math.max(0, 100 - (metrics.responseTime / 5));
    const throughputScore = metrics.throughput / 10;
    const uptimeScore = metrics.uptime;
    const loadScore = Math.max(0, 100 - metrics.load);
    
    return Math.round((responseScore + throughputScore + uptimeScore + loadScore) / 4);
  }

  getChainStatus(metrics) {
    if (metrics.uptime < 98) return 'degraded';
    if (metrics.load > 80) return 'congested';
    if (metrics.responseTime > 300) return 'slow';
    return 'optimal';
  }

  generatePerformanceRecommendations(analysis) {
    const recommendations = [];
    const chains = analysis.chains;
    
    // Find bottlenecks
    const slowChains = Object.entries(chains)
      .filter(([_, metrics]) => metrics.responseTime > analysis.overall.avgResponseTime * 1.5)
      .map(([chainId]) => chainId);
    
    if (slowChains.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Slow Chain Detection',
        description: `Chain${slowChains.length > 1 ? 's' : ''} ${slowChains.join(', ')} showing slower response times`,
        action: `Consider routing transactions through chain ${analysis.overall.bestPerformer} instead`,
        impact: 'Reduced transaction times by up to 40%'
      });
    }

    // Load balancing recommendations
    const highLoadChains = Object.entries(chains)
      .filter(([_, metrics]) => metrics.load > 70)
      .map(([chainId]) => chainId);
    
    if (highLoadChains.length > 0) {
      recommendations.push({
        type: 'load-balancing',
        priority: 'medium',
        title: 'Load Balancing Opportunity',
        description: `High load detected on chain${highLoadChains.length > 1 ? 's' : ''} ${highLoadChains.join(', ')}`,
        action: 'Distribute transactions more evenly across available chains',
        impact: 'Improved overall system performance'
      });
    }

    return recommendations;
  }

  async calculateOptimalRoutes(operation) {
    const routes = [];
    
    // Direct routes
    for (const chainId of this.chains) {
      routes.push({
        type: 'direct',
        chains: [chainId],
        hops: 1,
        complexity: 'low'
      });
    }

    // Multi-hop routes (for cross-chain operations)
    if (this.chains.length >= 2 && operation.type === 'cross-chain') {
      for (let i = 0; i < this.chains.length; i++) {
        for (let j = 0; j < this.chains.length; j++) {
          if (i !== j) {
            routes.push({
              type: 'cross-chain',
              chains: [this.chains[i], this.chains[j]],
              hops: 2,
              complexity: 'medium'
            });
          }
        }
      }
    }

    return routes;
  }

  calculateRouteEfficiency(route) {
    // Simple efficiency calculation based on hops and chain performance
    const baseEfficiency = 100;
    const hopPenalty = (route.hops - 1) * 15;
    const complexityPenalty = route.complexity === 'high' ? 25 : route.complexity === 'medium' ? 10 : 0;
    
    return Math.max(10, baseEfficiency - hopPenalty - complexityPenalty);
  }

  estimateTransactionTime(route) {
    const baseTime = 2; // seconds
    const hopMultiplier = route.hops * 1.5;
    const complexityMultiplier = route.complexity === 'high' ? 2 : route.complexity === 'medium' ? 1.5 : 1;
    
    return Math.round(baseTime * hopMultiplier * complexityMultiplier);
  }

  estimateTransactionCost(route) {
    const baseCost = 0.001; // KDA
    const hopMultiplier = route.hops;
    const complexityMultiplier = route.complexity === 'high' ? 2.5 : route.complexity === 'medium' ? 1.8 : 1;
    
    return (baseCost * hopMultiplier * complexityMultiplier).toFixed(6);
  }

  assessRiskLevel(route) {
    let risk = 'low';
    
    if (route.hops > 2) risk = 'medium';
    if (route.complexity === 'high') risk = 'high';
    if (route.chains.length > 3) risk = 'high';
    
    return risk;
  }

  selectBestRoute(routes) {
    return routes.reduce((best, current) => {
      const currentScore = this.calculateRouteScore(current);
      const bestScore = this.calculateRouteScore(best);
      
      return currentScore > bestScore ? current : best;
    });
  }

  calculateRouteScore(route) {
    const efficiency = this.calculateRouteEfficiency(route);
    const timePenalty = this.estimateTransactionTime(route) * 5;
    const costPenalty = parseFloat(this.estimateTransactionCost(route)) * 1000;
    const riskPenalty = route.riskLevel === 'high' ? 30 : route.riskLevel === 'medium' ? 15 : 0;
    
    return Math.max(0, efficiency - timePenalty - costPenalty - riskPenalty);
  }

  getAlternativeRoutes(routes) {
    return routes
      .filter(route => route !== this.selectBestRoute(routes))
      .slice(0, 3); // Top 3 alternatives
  }

  async getChainCosts(chainId) {
    const gasPrice = this.getSimulatedGasPrice(chainId);
    
    return {
      gasPrice,
      avgTransactionCost: gasPrice * 21000,
      deploymentCost: gasPrice * 2000000,
      tokenTransferCost: gasPrice * 25000,
      contractCallCost: gasPrice * 50000
    };
  }

  calculateCostCompetitiveness(costs, chainId) {
    // Compare with average across all chains
    const allChainsCosts = this.chains.map(id => this.getSimulatedGasPrice(id));
    const average = allChainsCosts.reduce((a, b) => a + b) / allChainsCosts.length;
    
    const competitiveness = ((average - costs.gasPrice) / average) * 100;
    
    return {
      score: Math.round(competitiveness),
      rating: competitiveness > 20 ? 'excellent' : competitiveness > 0 ? 'good' : competitiveness > -20 ? 'average' : 'expensive'
    };
  }

  analyzeCostPatterns(chainsData) {
    const prices = Object.values(chainsData).map(data => data.gasPrice);
    const cheapest = Math.min(...prices);
    const mostExpensive = Math.max(...prices);
    
    return {
      priceRange: {
        min: cheapest,
        max: mostExpensive,
        spread: ((mostExpensive - cheapest) / cheapest * 100).toFixed(2) + '%'
      },
      volatility: this.calculateVolatility(prices),
      trend: this.detectTrend(prices)
    };
  }

  calculateVolatility(prices) {
    const mean = prices.reduce((a, b) => a + b) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      standardDeviation: stdDev,
      coefficientOfVariation: (stdDev / mean * 100).toFixed(2) + '%',
      level: stdDev / mean > 0.2 ? 'high' : stdDev / mean > 0.1 ? 'medium' : 'low'
    };
  }

  detectTrend(prices) {
    // Simple trend detection
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg * 100);
    
    return {
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      magnitude: Math.abs(change).toFixed(2) + '%'
    };
  }

  calculatePotentialSavings(chainsData) {
    const costs = Object.entries(chainsData);
    const cheapest = costs.reduce((min, [chainId, data]) => 
      data.gasPrice < min.gasPrice ? { chainId, ...data } : min
    );
    
    const totalSavings = costs.reduce((sum, [chainId, data]) => {
      if (chainId !== cheapest.chainId) {
        const savings = data.avgTransactionCost - cheapest.avgTransactionCost;
        return sum + Math.max(0, savings);
      }
      return sum;
    }, 0);

    return {
      potential: totalSavings,
      recommendations: [
        {
          action: `Route transactions through Chain ${cheapest.chainId}`,
          savings: totalSavings.toFixed(6) + ' KDA per transaction',
          impact: 'Up to ' + ((totalSavings / costs[0][1].avgTransactionCost) * 100).toFixed(1) + '% cost reduction'
        }
      ]
    };
  }

  async getCurrentLoadDistribution() {
    const distribution = {};
    
    for (const chainId of this.chains) {
      const metrics = await this.getChainMetrics(chainId);
      distribution[chainId] = {
        load: metrics.load,
        capacity: 100 - metrics.load,
        utilization: metrics.load / 100
      };
    }
    
    return distribution;
  }

  calculateOptimalDistribution() {
    const totalChains = this.chains.length;
    const optimalLoad = 100 / totalChains; // Even distribution
    
    const optimal = {};
    this.chains.forEach(chainId => {
      optimal[chainId] = {
        targetLoad: optimalLoad,
        targetUtilization: optimalLoad / 100
      };
    });
    
    return optimal;
  }

  generateRebalanceActions(current, optimal) {
    const actions = [];
    
    Object.keys(current).forEach(chainId => {
      const currentLoad = current[chainId].load;
      const targetLoad = optimal[chainId].targetLoad;
      const difference = currentLoad - targetLoad;
      
      if (Math.abs(difference) > 10) { // 10% threshold
        actions.push({
          chainId,
          currentLoad,
          targetLoad,
          action: difference > 0 ? 'reduce' : 'increase',
          magnitude: Math.abs(difference).toFixed(1) + '%',
          priority: Math.abs(difference) > 30 ? 'high' : 'medium'
        });
      }
    });
    
    return actions;
  }

  calculateImprovementProjection(current, optimal) {
    const currentVariance = this.calculateLoadVariance(
      Object.values(current).map(c => c.load)
    );
    const optimalVariance = this.calculateLoadVariance(
      Object.values(optimal).map(o => o.targetLoad)
    );
    
    return {
      loadBalance: {
        current: currentVariance.toFixed(2),
        projected: optimalVariance.toFixed(2),
        improvement: ((currentVariance - optimalVariance) / currentVariance * 100).toFixed(1) + '%'
      },
      performanceGain: '15-25%',
      stabilityIncrease: '30-40%'
    };
  }

  calculateLoadVariance(loads) {
    const mean = loads.reduce((a, b) => a + b) / loads.length;
    return loads.reduce((sum, load) => sum + Math.pow(load - mean, 2), 0) / loads.length;
  }

  async fetchCrosschainPrices() {
    // Simulate cross-chain price data
    const prices = {};
    
    this.chains.forEach(chainId => {
      prices[chainId] = {
        KDA: 1.0 + (Math.random() - 0.5) * 0.02, // Small price variations
        ETH: 2000 + (Math.random() - 0.5) * 20,
        BTC: 45000 + (Math.random() - 0.5) * 200
      };
    });
    
    return prices;
  }

  calculateArbitrageOpportunity(priceA, priceB, chainA, chainB) {
    const opportunities = [];
    
    Object.keys(priceA).forEach(token => {
      if (priceB[token]) {
        const priceDiff = priceB[token] - priceA[token];
        const profitPercent = (priceDiff / priceA[token]) * 100;
        
        if (Math.abs(profitPercent) > 0.1) { // 0.1% threshold
          opportunities.push({
            token,
            buyChain: priceDiff > 0 ? chainA : chainB,
            sellChain: priceDiff > 0 ? chainB : chainA,
            buyPrice: priceDiff > 0 ? priceA[token] : priceB[token],
            sellPrice: priceDiff > 0 ? priceB[token] : priceA[token],
            profitPercent: Math.abs(profitPercent),
            profitable: Math.abs(profitPercent) > 0.5 // Account for fees
          });
        }
      }
    });
    
    const bestOpportunity = opportunities.reduce((best, current) => 
      current.profitPercent > (best?.profitPercent || 0) ? current : best
    , null);
    
    return bestOpportunity || { profitable: false };
  }

  assessMarketConditions(prices) {
    const allPrices = Object.values(prices);
    const tokens = Object.keys(prices[this.chains[0]] || {});
    
    const volatilities = tokens.map(token => {
      const tokenPrices = allPrices.map(chainPrices => chainPrices[token]).filter(Boolean);
      return this.calculateVolatility(tokenPrices);
    });
    
    const avgVolatility = volatilities.reduce((sum, v) => sum + parseFloat(v.coefficientOfVariation), 0) / volatilities.length;
    
    return {
      volatility: avgVolatility > 5 ? 'high' : avgVolatility > 2 ? 'medium' : 'low',
      arbitrageActivity: avgVolatility > 3 ? 'active' : 'quiet',
      riskLevel: avgVolatility > 10 ? 'high' : avgVolatility > 5 ? 'medium' : 'low'
    };
  }

  async getHistoricalData() {
    // Simulate historical data for predictions
    const hours = 24;
    const data = [];
    
    for (let i = 0; i < hours; i++) {
      const timestamp = Date.now() - (i * 3600000); // Hour intervals
      const chainData = {};
      
      this.chains.forEach(chainId => {
        chainData[chainId] = {
          responseTime: 100 + Math.random() * 200,
          throughput: 800 + Math.random() * 400,
          gasPrice: this.getSimulatedGasPrice(chainId),
          load: Math.random() * 100
        };
      });
      
      data.unshift({ timestamp, chains: chainData });
    }
    
    return data;
  }

  predictPerformanceTrends(historical) {
    const trends = {};
    
    this.chains.forEach(chainId => {
      const responseTimes = historical.map(h => h.chains[chainId].responseTime);
      const throughputs = historical.map(h => h.chains[chainId].throughput);
      
      trends[chainId] = {
        responseTime: {
          trend: this.detectTrend(responseTimes),
          prediction: this.predictNextValue(responseTimes)
        },
        throughput: {
          trend: this.detectTrend(throughputs),
          prediction: this.predictNextValue(throughputs)
        }
      };
    });
    
    return trends;
  }

  predictNextValue(values) {
    // Simple linear prediction
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b);
    const sumXY = values.reduce((sum, value, index) => sum + (index * value), 0);
    const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return Math.round(slope * n + intercept);
  }

  forecastCosts(historical) {
    const forecasts = {};
    
    this.chains.forEach(chainId => {
      const gasPrices = historical.map(h => h.chains[chainId].gasPrice);
      const trend = this.detectTrend(gasPrices);
      const prediction = this.predictNextValue(gasPrices);
      
      forecasts[chainId] = {
        currentPrice: gasPrices[gasPrices.length - 1],
        predictedPrice: prediction,
        trend: trend,
        confidence: trend.direction === 'stable' ? 'high' : 'medium'
      };
    });
    
    return forecasts;
  }

  predictCongestion(historical) {
    const predictions = {};
    
    this.chains.forEach(chainId => {
      const loads = historical.map(h => h.chains[chainId].load);
      const avgLoad = loads.reduce((a, b) => a + b) / loads.length;
      const trend = this.detectTrend(loads);
      
      predictions[chainId] = {
        currentLoad: loads[loads.length - 1],
        averageLoad: avgLoad,
        trend: trend,
        congestionRisk: avgLoad > 70 ? 'high' : avgLoad > 50 ? 'medium' : 'low',
        recommendation: avgLoad > 80 ? 'Consider load balancing' : 'Normal operation'
      };
    });
    
    return predictions;
  }

  identifyOptimalWindows(historical) {
    const windows = [];
    const hourlyAverages = {};
    
    // Group by hour of day
    for (let hour = 0; hour < 24; hour++) {
      const hourData = historical.filter(h => new Date(h.timestamp).getHours() === hour);
      if (hourData.length > 0) {
        const avgLoad = hourData.reduce((sum, h) => {
          const chainLoads = Object.values(h.chains);
          const totalLoad = chainLoads.reduce((s, c) => s + c.load, 0);
          return sum + (totalLoad / chainLoads.length);
        }, 0) / hourData.length;
        
        hourlyAverages[hour] = avgLoad;
      }
    }
    
    // Find optimal windows (low load periods)
    const sortedHours = Object.entries(hourlyAverages)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 6); // Top 6 hours
    
    sortedHours.forEach(([hour, load]) => {
      windows.push({
        hour: parseInt(hour),
        averageLoad: Math.round(load),
        rating: load < 30 ? 'excellent' : load < 50 ? 'good' : 'fair',
        savings: `${Math.round((80 - load) / 2)}% faster transactions`
      });
    });
    
    return windows.sort((a, b) => a.hour - b.hour);
  }

  /**
   * 🎯 Generate Intelligence Report
   */
  async generateIntelligenceReport() {
    const [
      performance,
      costs,
      loadBalancing,
      arbitrage,
      predictions
    ] = await Promise.all([
      this.analyzeChainPerformance(),
      this.analyzeCosts(),
      this.suggestLoadBalancing(),
      this.detectArbitrageOpportunities(),
      this.generatePredictions()
    ]);

    return {
      timestamp: Date.now(),
      summary: {
        totalChains: this.chains.length,
        complexity: this.complexity,
        overallHealth: this.calculateOverallHealth(performance, costs, loadBalancing),
        topRecommendations: this.getTopRecommendations(performance, costs, loadBalancing)
      },
      performance,
      costs,
      loadBalancing,
      arbitrage,
      predictions,
      metadata: {
        reportVersion: '1.0',
        confidence: 'medium',
        nextUpdate: Date.now() + 300000 // 5 minutes
      }
    };
  }

  calculateOverallHealth(performance, costs, loadBalancing) {
    const perfScore = performance.overall.bestPerformer ? 80 : 60;
    const costScore = costs.savings.potential < 0.001 ? 90 : 70;
    const loadScore = loadBalancing.rebalanceActions.length === 0 ? 95 : 75;
    
    const overall = (perfScore + costScore + loadScore) / 3;
    
    return {
      score: Math.round(overall),
      status: overall > 85 ? 'excellent' : overall > 70 ? 'good' : overall > 50 ? 'fair' : 'poor',
      areas: {
        performance: perfScore,
        costs: costScore,
        loadBalance: loadScore
      }
    };
  }

  getTopRecommendations(performance, costs, loadBalancing) {
    const recommendations = [
      ...performance.recommendations,
      ...costs.savings.recommendations.map(r => ({ ...r, type: 'cost', priority: 'medium' })),
      ...loadBalancing.rebalanceActions.slice(0, 2).map(a => ({
        type: 'load-balancing',
        priority: a.priority,
        title: `${a.action === 'reduce' ? 'Reduce' : 'Increase'} load on Chain ${a.chainId}`,
        description: `Current load: ${a.currentLoad}%, Target: ${a.targetLoad}%`,
        action: `Redistribute ${a.magnitude} of transactions`,
        impact: 'Improved system stability'
      }))
    ];

    return recommendations
      .sort((a, b) => {
        const priorities = { high: 3, medium: 2, low: 1 };
        return priorities[b.priority] - priorities[a.priority];
      })
      .slice(0, 5);
  }
}

/**
 * Factory function to create chain intelligence instance
 */
export function createChainIntelligence(config) {
  return new ChainIntelligence(config);
}