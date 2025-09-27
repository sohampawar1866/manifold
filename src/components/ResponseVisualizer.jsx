import React, { useState, useEffect } from 'react';

/**
 * 📊 Response Visualizer
 * 
 * Advanced response visualization and analysis:
 * - Formatted JSON with syntax highlighting
 * - Transaction details and gas analysis
 * - Visual feedback and status indicators
 * - Response comparison and history
 */
function ResponseVisualizer({ response, operation, onShare, onSave }) {
  const [viewMode, setViewMode] = useState('formatted');
  const [expandedPath, setExpandedPath] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedMatches, setHighlightedMatches] = useState([]);

  const viewModes = [
    { id: 'formatted', name: 'Formatted', icon: '🎨' },
    { id: 'raw', name: 'Raw JSON', icon: '📄' },
    { id: 'tree', name: 'Tree View', icon: '🌳' },
    { id: 'table', name: 'Table', icon: '📊' }
  ];

  useEffect(() => {
    if (searchQuery && response) {
      findMatches(response, searchQuery.toLowerCase());
    } else {
      setHighlightedMatches([]);
    }
  }, [searchQuery, response]);

  const findMatches = (obj, query, path = '') => {
    const matches = [];
    
    if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (key.toLowerCase().includes(query)) {
          matches.push({ path: currentPath, type: 'key', value: key });
        }
        
        if (typeof value === 'string' && value.toLowerCase().includes(query)) {
          matches.push({ path: currentPath, type: 'value', value });
        }
        
        if (typeof value === 'object') {
          matches.push(...findMatches(value, query, currentPath));
        }
      });
    }
    
    setHighlightedMatches(matches);
  };

  const togglePath = (path) => {
    const newExpanded = new Set(expandedPath);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPath(newExpanded);
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const downloadResponse = () => {
    const dataStr = JSON.stringify(response, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `response-${operation?.name || 'data'}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderFormattedView = () => {
    if (!response) return null;
    
    return (
      <div className="bg-gray-900 rounded p-4 overflow-auto max-h-96">
        <JsonRenderer 
          data={response} 
          expandedPaths={expandedPath}
          onTogglePath={togglePath}
          searchQuery={searchQuery}
          highlightedMatches={highlightedMatches}
        />
      </div>
    );
  };

  const renderRawView = () => {
    if (!response) return null;
    
    return (
      <div className="bg-gray-900 rounded p-4 overflow-auto max-h-96">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
    );
  };

  const renderTreeView = () => {
    if (!response) return null;
    
    return (
      <div className="bg-gray-900 rounded p-4 overflow-auto max-h-96">
        <TreeRenderer 
          data={response} 
          expandedPaths={expandedPath}
          onTogglePath={togglePath}
        />
      </div>
    );
  };

  const renderTableView = () => {
    if (!response) return null;
    
    // Convert response to table format
    const tableData = flattenForTable(response);
    
    return (
      <div className="bg-gray-900 rounded p-4 overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-2 text-gray-400">Property</th>
              <th className="text-left p-2 text-gray-400">Value</th>
              <th className="text-left p-2 text-gray-400">Type</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="p-2 text-blue-400 font-mono">{row.key}</td>
                <td className="p-2 text-gray-300 font-mono max-w-xs truncate">
                  {typeof row.value === 'object' ? JSON.stringify(row.value) : String(row.value)}
                </td>
                <td className="p-2 text-yellow-400">{row.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const flattenForTable = (obj, prefix = '') => {
    const result = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result.push({
          key: fullKey,
          value: '[Object]',
          type: 'object'
        });
        result.push(...flattenForTable(value, fullKey));
      } else {
        result.push({
          key: fullKey,
          value,
          type: Array.isArray(value) ? 'array' : typeof value
        });
      }
    });
    
    return result;
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'formatted': return renderFormattedView();
      case 'raw': return renderRawView();
      case 'tree': return renderTreeView();
      case 'table': return renderTableView();
      default: return renderFormattedView();
    }
  };

  const getStatusIcon = () => {
    if (!response) return '⏳';
    if (response.status === 'success' || response.success) return '✅';
    if (response.error || response.status === 'error') return '❌';
    return '📊';
  };

  const getStatusColor = () => {
    if (!response) return 'text-yellow-400';
    if (response.status === 'success' || response.success) return 'text-green-400';
    if (response.error || response.status === 'error') return 'text-red-400';
    return 'text-blue-400';
  };

  if (!response) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-gray-400">Waiting for response...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div>
              <h3 className="font-bold text-white">Response</h3>
              <div className="flex items-center space-x-4 mt-1">
                {response.executionTime && (
                  <span className="text-sm text-gray-400">
                    ⏱️ {response.executionTime}
                  </span>
                )}
                {response.gasUsed && (
                  <span className="text-sm text-gray-400">
                    ⛽ {response.gasUsed.toLocaleString()} gas
                  </span>
                )}
                {response.txId && (
                  <span className="text-sm text-blue-400 font-mono">
                    🔗 {response.txId.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500"
            >
              📋 Copy
            </button>
            <button
              onClick={downloadResponse}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500"
            >
              💾 Download
            </button>
            {onShare && (
              <button
                onClick={() => onShare(response)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
              >
                🔗 Share
              </button>
            )}
          </div>
        </div>

        {/* Search and View Mode Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search in response..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm w-48"
            />
            {highlightedMatches.length > 0 && (
              <span className="text-sm text-blue-400">
                {highlightedMatches.length} matches
              </span>
            )}
          </div>
          
          <div className="flex space-x-1">
            {viewModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                  viewMode === mode.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-1">{mode.icon}</span>
                {mode.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Information */}
      {(response.status || response.success !== undefined || response.error) && (
        <div className="p-4 border-b border-gray-700">
          <div className={`text-lg font-medium ${getStatusColor()}`}>
            {response.status === 'success' || response.success ? '✅ Success' : 
             response.error || response.status === 'error' ? '❌ Error' : '📊 Response'}
          </div>
          
          {response.message && (
            <p className="text-gray-300 text-sm mt-1">{response.message}</p>
          )}
          
          {response.error && typeof response.error === 'string' && (
            <p className="text-red-400 text-sm mt-1">{response.error}</p>
          )}
        </div>
      )}

      {/* Intelligence Recommendations */}
      {response.recommendations && response.recommendations.length > 0 && (
        <div className="p-4 border-b border-gray-700 bg-blue-600/10">
          <h4 className="font-medium text-blue-400 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Intelligence Recommendations
          </h4>
          <div className="space-y-1">
            {response.recommendations.map((rec, index) => (
              <div key={index} className="text-sm text-gray-300">
                • {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Content */}
      <div className="p-4">
        {renderContent()}
      </div>

      {/* Footer with additional actions */}
      <div className="p-4 border-t border-gray-700 bg-gray-700/30">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            Response size: {JSON.stringify(response).length} bytes
          </div>
          <div className="flex items-center space-x-4">
            {onSave && (
              <button
                onClick={() => onSave(response)}
                className="text-blue-400 hover:text-blue-300"
              >
                💾 Save to History
              </button>
            )}
            <button
              onClick={() => setExpandedPath(new Set())}
              className="text-gray-400 hover:text-gray-300"
            >
              🔄 Collapse All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// JSON Renderer Component with syntax highlighting
function JsonRenderer({ data, expandedPaths, onTogglePath, searchQuery, highlightedMatches }) {
  const renderValue = (value, key, path = '') => {
    const currentPath = path ? `${path}.${key}` : key;
    const isHighlighted = highlightedMatches.some(match => 
      match.path === currentPath || match.value === value
    );
    
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-purple-400">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-400">{value}</span>;
    }
    
    if (typeof value === 'string') {
      const highlighted = searchQuery && value.toLowerCase().includes(searchQuery.toLowerCase());
      return (
        <span className={`text-green-400 ${highlighted ? 'bg-yellow-400/20' : ''}`}>
          "{value}"
        </span>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <span>
          <span className="text-gray-400">[</span>
          {value.length > 0 && (
            <span className="text-blue-400 ml-1">{value.length} items</span>
          )}
          <span className="text-gray-400">]</span>
        </span>
      );
    }
    
    if (typeof value === 'object') {
      const isExpanded = expandedPaths.has(currentPath);
      const keys = Object.keys(value);
      
      return (
        <div className={isHighlighted ? 'bg-yellow-400/10 rounded' : ''}>
          <span
            className="cursor-pointer hover:bg-gray-700 inline-block px-1 rounded"
            onClick={() => onTogglePath(currentPath)}
          >
            <span className="text-gray-400 mr-1">
              {isExpanded ? '▼' : '▶'}
            </span>
            <span className="text-gray-400">{`{${keys.length} properties}`}</span>
          </span>
          
          {isExpanded && (
            <div className="ml-4 mt-2 border-l border-gray-600 pl-4">
              {keys.map(objKey => (
                <div key={objKey} className="mb-2">
                  <span className={`text-blue-300 ${
                    searchQuery && objKey.toLowerCase().includes(searchQuery.toLowerCase()) 
                      ? 'bg-yellow-400/20' : ''
                  }`}>
                    "{objKey}"
                  </span>
                  <span className="text-gray-400 mx-2">:</span>
                  {renderValue(value[objKey], objKey, currentPath)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-gray-400">{String(value)}</span>;
  };
  
  return (
    <div className="font-mono text-sm">
      {renderValue(data, 'root')}
    </div>
  );
}

// Tree Renderer Component
function TreeRenderer({ data, expandedPaths, onTogglePath }) {
  const renderNode = (value, key, path = '', level = 0) => {
    const currentPath = path ? `${path}.${key}` : key;
    const indent = '  '.repeat(level);
    
    if (typeof value === 'object' && value !== null) {
      const isExpanded = expandedPaths.has(currentPath);
      const keys = Array.isArray(value) ? value.map((_, i) => i) : Object.keys(value);
      const nodeType = Array.isArray(value) ? 'Array' : 'Object';
      
      return (
        <div key={currentPath}>
          <div
            className="cursor-pointer hover:bg-gray-700 p-1 rounded flex items-center"
            onClick={() => onTogglePath(currentPath)}
          >
            <span className="text-gray-400 w-4">
              {isExpanded ? '📂' : '📁'}
            </span>
            <span className="text-blue-300 ml-2">{key}</span>
            <span className="text-gray-400 ml-2">({nodeType})</span>
            <span className="text-gray-500 ml-2 text-xs">
              {keys.length} {keys.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          {isExpanded && (
            <div className="ml-6 border-l border-gray-600 pl-2">
              {keys.map(childKey => 
                renderNode(
                  Array.isArray(value) ? value[childKey] : value[childKey], 
                  childKey, 
                  currentPath, 
                  level + 1
                )
              )}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div key={currentPath} className="flex items-center p-1">
        <span className="text-gray-400 w-4">📄</span>
        <span className="text-blue-300 ml-2">{key}</span>
        <span className="text-gray-400 ml-2">:</span>
        <span className={`ml-2 ${
          typeof value === 'string' ? 'text-green-400' :
          typeof value === 'number' ? 'text-blue-400' :
          typeof value === 'boolean' ? 'text-purple-400' :
          'text-gray-400'
        }`}>
          {typeof value === 'string' ? `"${value}"` : String(value)}
        </span>
      </div>
    );
  };
  
  return (
    <div className="font-mono text-sm">
      {renderNode(data, 'response')}
    </div>
  );
}

export default ResponseVisualizer;