import React, { useState, useEffect } from 'react';
import { createChainIntelligence } from '../utils/chain-intelligence.js';

/**
 * 📊 Real-time Performance Monitor
 * 
 * Live monitoring of chain performance metrics:
 * - Response times and throughput
 * - Load balancing status
 * - Health indicators  
 * - Performance trends
 */
function RealTimePerformanceMonitor({ config }) {
  const [performanceData, setPerformanceData] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('responseTime');
  const [timeRange, setTimeRange] = useState('1h');
  const [historicalData, setHistoricalData] = useState([]);

  const metrics = [
    { id: 'responseTime', name: 'Response Time', unit: 'ms', color: 'blue' },
    { id: 'throughput', name: 'Throughput', unit: 'tps', color: 'green' },
    { id: 'load', name: 'Load', unit: '%', color: 'yellow' },
    { id: 'uptime', name: 'Uptime', unit: '%', color: 'purple' }
  ];

  const timeRanges = [
    { id: '5m', name: '5 minutes', intervals: 10 },
    { id: '1h', name: '1 hour', intervals: 12 },
    { id: '6h', name: '6 hours', intervals: 24 },
    { id: '1d', name: '1 day', intervals: 48 }
  ];

  useEffect(() => {
    const intelligence = createChainIntelligence(config);
    
    const fetchPerformanceData = async () => {
      try {
        const analysis = await intelligence.analyzeChainPerformance();
        setPerformanceData(analysis);
        
        // Add to historical data
        setHistoricalData(prev => {
          const newData = [...prev, {
            timestamp: Date.now(),
            data: analysis
          }].slice(-50); // Keep last 50 data points
          return newData;
        });
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      }
    };

    // Initial fetch
    fetchPerformanceData();
    
    // Set up real-time monitoring
    let interval;
    if (isMonitoring) {
      interval = setInterval(fetchPerformanceData, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config, isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const getMetricValue = (chain, metric) => {
    if (!chain) return 0;
    switch (metric) {
      case 'responseTime': return chain.responseTime;
      case 'throughput': return chain.throughput;
      case 'load': return chain.load;
      case 'uptime': return chain.uptime;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'text-green-500';
      case 'slow': return 'text-yellow-500';
      case 'congested': return 'text-orange-500';
      case 'degraded': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getPerformanceGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-400' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-400' };
    if (score >= 50) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
  };

  if (!performanceData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            📊 Performance Monitor
          </h2>
          <p className="text-gray-400 text-sm">
            Real-time chain performance metrics and analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-gray-300">
              {isMonitoring ? 'Live' : 'Paused'}
            </span>
          </div>
          
          <button
            onClick={toggleMonitoring}
            className={`px-3 py-1 rounded text-sm font-medium ${
              isMonitoring 
                ? 'bg-red-600 text-white hover:bg-red-500' 
                : 'bg-green-600 text-white hover:bg-green-500'
            }`}
          >
            {isMonitoring ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Overall System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Best Performer</h3>
          <div className="text-2xl font-bold text-white mb-1">
            Chain {performanceData.overall.bestPerformer}
          </div>
          <div className="text-sm text-green-400">
            Leading performance
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Avg Response</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {Math.round(performanceData.overall.avgResponseTime)}ms
          </div>
          <div className={`text-sm ${
            performanceData.overall.avgResponseTime < 200 ? 'text-green-400' : 
            performanceData.overall.avgResponseTime < 400 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {performanceData.overall.avgResponseTime < 200 ? 'Excellent' : 
             performanceData.overall.avgResponseTime < 400 ? 'Good' : 'Needs attention'}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Throughput</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {Math.round(performanceData.overall.totalThroughput)}
          </div>
          <div className="text-sm text-blue-400">
            Transactions/sec
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Active Chains</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {Object.keys(performanceData.chains).length}
          </div>
          <div className="text-sm text-purple-400">
            Online & monitoring
          </div>
        </div>
      </div>

      {/* Chain Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {Object.entries(performanceData.chains).map(([chainId, metrics]) => {
          const grade = getPerformanceGrade(metrics.performanceScore);
          
          return (
            <div key={chainId} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white">Chain {chainId}</h3>
                  <div className={`w-2 h-2 rounded-full ${
                    metrics.status === 'optimal' ? 'bg-green-500' :
                    metrics.status === 'slow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xl font-bold ${grade.color}`}>
                    {grade.grade}
                  </span>
                  <span className="text-sm text-gray-400">
                    {metrics.performanceScore}/100
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Response Time</span>
                  <span className="text-sm text-white font-medium">{metrics.responseTime}ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Throughput</span>
                  <span className="text-sm text-white font-medium">{metrics.throughput} tps</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Load</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white font-medium">{metrics.load}%</span>
                    <div className="w-16 h-2 bg-gray-600 rounded-full">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          metrics.load > 80 ? 'bg-red-500' : 
                          metrics.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${metrics.load}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Uptime</span>
                  <span className="text-sm text-green-400 font-medium">{metrics.uptime.toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className={`text-sm font-medium capitalize ${getStatusColor(metrics.status)}`}>
                    {metrics.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metric Selector and Chart */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Performance Trends</h3>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              {metrics.map(metric => (
                <option key={metric.id} value={metric.id}>
                  {metric.name}
                </option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              {timeRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Simple Text-based Chart */}
        <div className="space-y-2">
          {Object.entries(performanceData.chains).map(([chainId, chain]) => {
            const value = getMetricValue(chain, selectedMetric);
            const selectedMetricInfo = metrics.find(m => m.id === selectedMetric);
            const maxValue = selectedMetric === 'uptime' ? 100 : 
                           selectedMetric === 'load' ? 100 :
                           selectedMetric === 'responseTime' ? 500 : 1000;
            const percentage = Math.min((value / maxValue) * 100, 100);
            
            return (
              <div key={chainId} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-300">Chain {chainId}</div>
                <div className="flex-1 bg-gray-600 rounded-full h-4 relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedMetricInfo.color === 'blue' ? 'bg-blue-500' :
                      selectedMetricInfo.color === 'green' ? 'bg-green-500' :
                      selectedMetricInfo.color === 'yellow' ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                    {value}{selectedMetricInfo.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Recommendations */}
      {performanceData.recommendations.length > 0 && (
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
          <h3 className="font-medium text-blue-400 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Performance Recommendations
          </h3>
          <div className="space-y-3">
            {performanceData.recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-3">
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
                <p className="text-blue-400 text-sm mb-1"><strong>Action:</strong> {rec.action}</p>
                <p className="text-green-400 text-sm"><strong>Impact:</strong> {rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RealTimePerformanceMonitor;