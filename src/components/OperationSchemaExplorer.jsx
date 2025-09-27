import React, { useState, useEffect } from 'react';

/**
 * 📚 Operation Schema Explorer
 * 
 * Interactive documentation and schema explorer for operations:
 * - Parameter schemas and validation
 * - Response format documentation  
 * - Usage examples and code snippets
 * - Interactive testing interface
 */
function OperationSchemaExplorer({ operation, onParameterChange, parameters = {} }) {
  const [selectedTab, setSelectedTab] = useState('parameters');
  const [expandedParam, setExpandedParam] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [codeSnippets, setCodeSnippets] = useState({});

  const tabs = [
    { id: 'parameters', name: 'Parameters', icon: '⚙️' },
    { id: 'responses', name: 'Responses', icon: '📤' },
    { id: 'examples', name: 'Examples', icon: '📋' },
    { id: 'code', name: 'Code', icon: '💻' }
  ];

  useEffect(() => {
    validateParameters();
    generateCodeSnippets();
  }, [parameters, operation]);

  const validateParameters = () => {
    const errors = {};
    
    operation.parameters?.forEach(param => {
      const value = parameters[param.name];
      
      if (param.required && (!value || value === '')) {
        errors[param.name] = 'This parameter is required';
      }
      
      if (value && param.type === 'number' && isNaN(value)) {
        errors[param.name] = 'Must be a valid number';
      }
      
      if (value && param.type === 'string' && param.pattern) {
        const regex = new RegExp(param.pattern);
        if (!regex.test(value)) {
          errors[param.name] = param.patternDescription || 'Invalid format';
        }
      }
      
      if (value && param.minLength && value.length < param.minLength) {
        errors[param.name] = `Must be at least ${param.minLength} characters`;
      }
      
      if (value && param.maxLength && value.length > param.maxLength) {
        errors[param.name] = `Must be no more than ${param.maxLength} characters`;
      }
      
      if (value && param.type === 'number') {
        if (param.minimum !== undefined && value < param.minimum) {
          errors[param.name] = `Must be at least ${param.minimum}`;
        }
        if (param.maximum !== undefined && value > param.maximum) {
          errors[param.name] = `Must be no more than ${param.maximum}`;
        }
      }
    });
    
    setValidationErrors(errors);
  };

  const generateCodeSnippets = () => {
    const baseUrl = 'https://api.kadena.network/chainweb/0.0/mainnet01';
    const endpoint = operation.endpoint.replace(/\{(\w+)\}/g, (match, param) => {
      return parameters[param] || `{${param}}`;
    });
    
    const requestBody = operation.method !== 'GET' ? 
      Object.fromEntries(
        operation.parameters
          ?.filter(p => p.name !== 'chainId' && parameters[p.name])
          .map(p => [p.name, parameters[p.name]]) || []
      ) : null;

    const snippets = {
      javascript: generateJavaScriptCode(baseUrl + endpoint, operation.method, requestBody),
      curl: generateCurlCode(baseUrl + endpoint, operation.method, requestBody),
      python: generatePythonCode(baseUrl + endpoint, operation.method, requestBody),
      nodejs: generateNodeJsCode(baseUrl + endpoint, operation.method, requestBody)
    };
    
    setCodeSnippets(snippets);
  };

  const generateJavaScriptCode = (url, method, body) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key'
      }
    };
    
    if (body && Object.keys(body).length > 0) {
      options.body = JSON.stringify(body, null, 2);
    }
    
    return `// JavaScript (Browser)
const response = await fetch('${url}', ${JSON.stringify(options, null, 2)});
const data = await response.json();
console.log(data);`;
  };

  const generateCurlCode = (url, method, body) => {
    let curlCmd = `curl -X ${method} '${url}' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: your-api-key'`;
    
    if (body && Object.keys(body).length > 0) {
      curlCmd += ` \\\n  -d '${JSON.stringify(body)}'`;
    }
    
    return curlCmd;
  };

  const generatePythonCode = (url, method, body) => {
    const bodyStr = body && Object.keys(body).length > 0 ? 
      `,\n    json=${JSON.stringify(body, null, 4)}` : '';
    
    return `# Python
import requests

response = requests.${method.toLowerCase()}(
    '${url}',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key'
    }${bodyStr}
)

data = response.json()
print(data)`;
  };

  const generateNodeJsCode = (url, method, body) => {
    const bodyStr = body && Object.keys(body).length > 0 ? 
      `,\n    body: JSON.stringify(${JSON.stringify(body, null, 2)})` : '';
    
    return `// Node.js
const fetch = require('node-fetch');

const response = await fetch('${url}', {
  method: '${method}',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  }${bodyStr}
});

const data = await response.json();
console.log(data);`;
  };

  const getParameterTypeColor = (type) => {
    switch (type) {
      case 'string': return 'text-green-400';
      case 'number': return 'text-blue-400';
      case 'boolean': return 'text-purple-400';
      case 'object': return 'text-yellow-400';
      case 'array': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const renderParametersTab = () => (
    <div className="space-y-4">
      {operation.parameters?.map((param, index) => (
        <div key={index} className="border border-gray-600 rounded-lg overflow-hidden">
          <div 
            className="p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setExpandedParam(expandedParam === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white">{param.name}</span>
                  {param.required && (
                    <span className="text-red-400 text-sm">*</span>
                  )}
                </div>
                <span className={`text-sm px-2 py-1 rounded bg-gray-700 ${getParameterTypeColor(param.type)}`}>
                  {param.type}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {validationErrors[param.name] && (
                  <span className="text-red-400 text-sm">❌</span>
                )}
                <div className={`transform transition-transform duration-200 ${
                  expandedParam === index ? 'rotate-180' : ''
                }`}>
                  ⬇️
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mt-1">{param.description}</p>
            
            {validationErrors[param.name] && (
              <p className="text-red-400 text-sm mt-2">
                {validationErrors[param.name]}
              </p>
            )}
          </div>
          
          {expandedParam === index && (
            <div className="border-t border-gray-600 p-4 bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-white mb-2">Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className={getParameterTypeColor(param.type)}>
                        {param.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Required:</span>
                      <span className={param.required ? 'text-red-400' : 'text-green-400'}>
                        {param.required ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {param.minLength && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Min Length:</span>
                        <span className="text-white">{param.minLength}</span>
                      </div>
                    )}
                    {param.maxLength && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Length:</span>
                        <span className="text-white">{param.maxLength}</span>
                      </div>
                    )}
                    {param.minimum !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Minimum:</span>
                        <span className="text-white">{param.minimum}</span>
                      </div>
                    )}
                    {param.maximum !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Maximum:</span>
                        <span className="text-white">{param.maximum}</span>
                      </div>
                    )}
                    {param.pattern && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pattern:</span>
                        <code className="text-blue-400 text-xs bg-gray-700 px-1 rounded">
                          {param.pattern}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-white mb-2">Example</h5>
                  <div className="bg-gray-700 rounded p-3">
                    <code className="text-green-400 text-sm">
                      {typeof param.example === 'object' ? 
                        JSON.stringify(param.example, null, 2) : 
                        param.example?.toString() || 'No example provided'
                      }
                    </code>
                  </div>
                </div>
              </div>
              
              {param.enum && (
                <div className="mt-4">
                  <h5 className="font-medium text-white mb-2">Allowed Values</h5>
                  <div className="flex flex-wrap gap-2">
                    {param.enum.map((value, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 text-blue-400 text-sm rounded">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )) || (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <div className="text-gray-400">No parameters defined for this operation</div>
        </div>
      )}
    </div>
  );

  const renderResponsesTab = () => (
    <div className="space-y-4">
      {Object.entries(operation.responses || {}).map(([statusCode, response]) => (
        <div key={statusCode} className="border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-sm font-medium rounded ${
                statusCode.startsWith('2') ? 'bg-green-600 text-white' :
                statusCode.startsWith('4') ? 'bg-red-600 text-white' :
                statusCode.startsWith('5') ? 'bg-red-700 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {statusCode}
              </span>
              <span className="font-medium text-white">
                {statusCode.startsWith('2') ? 'Success' :
                 statusCode.startsWith('4') ? 'Client Error' :
                 statusCode.startsWith('5') ? 'Server Error' : 'Response'}
              </span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-3">{response.description}</p>
          
          {response.example && (
            <div>
              <h5 className="font-medium text-white mb-2">Example Response</h5>
              <div className="bg-gray-800 rounded p-3 overflow-x-auto">
                <pre className="text-sm text-green-400">
                  {JSON.stringify(response.example, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderExamplesTab = () => (
    <div className="space-y-4">
      {operation.examples?.map((example, index) => (
        <div key={index} className="border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">{example.name}</h4>
            <button
              onClick={() => {
                Object.entries(example.parameters).forEach(([key, value]) => {
                  onParameterChange(key, value);
                });
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
            >
              Load Example
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mb-3">{example.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-white mb-2">Parameters</h5>
              <div className="bg-gray-800 rounded p-3">
                <pre className="text-sm text-blue-400">
                  {JSON.stringify(example.parameters, null, 2)}
                </pre>
              </div>
            </div>
            
            {example.expectedResponse && (
              <div>
                <h5 className="font-medium text-white mb-2">Expected Response</h5>
                <div className="bg-gray-800 rounded p-3">
                  <pre className="text-sm text-green-400">
                    {JSON.stringify(example.expectedResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )) || (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-gray-400">No examples available for this operation</div>
        </div>
      )}
    </div>
  );

  const renderCodeTab = () => (
    <div className="space-y-4">
      {Object.entries(codeSnippets).map(([language, code]) => (
        <div key={language} className="border border-gray-600 rounded-lg overflow-hidden">
          <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
            <span className="font-medium text-white capitalize">{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500"
            >
              Copy
            </button>
          </div>
          <div className="p-4 bg-gray-800">
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'parameters': return renderParametersTab();
      case 'responses': return renderResponsesTab();
      case 'examples': return renderExamplesTab();
      case 'code': return renderCodeTab();
      default: return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              📚 {operation.name} Documentation
            </h3>
            <p className="text-gray-400 text-sm">{operation.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium text-white rounded ${
              operation.method === 'GET' ? 'bg-green-600' :
              operation.method === 'POST' ? 'bg-blue-600' :
              operation.method === 'PUT' ? 'bg-yellow-600' :
              operation.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'
            }`}>
              {operation.method}
            </span>
            <code className="text-sm text-blue-400 bg-gray-700 px-2 py-1 rounded">
              {operation.endpoint}
            </code>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors duration-200 ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default OperationSchemaExplorer;