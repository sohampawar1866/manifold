import React from 'react'

// This is the DEVELOPMENT VERSION of Manifold
// According to architecture.md, users should run `npm run setup` to generate the actual application

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="text-8xl mb-6">🚀</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Manifold
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Kadena Chainweb EVM Multi-Chain Function Generator
        </p>
        <p className="text-gray-500 mb-8">
          A Swagger-style interactive platform for generating ready-to-use multi-chain functions
        </p>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🛠️ Setup Required
          </h2>
          <p className="text-gray-600 mb-6">
            To generate your custom Kadena Chainweb EVM application, please run the setup wizard:
          </p>
          
          <div className="bg-gray-900 p-4 rounded-lg text-left mb-6">
            <code className="text-green-400 text-lg font-mono">npm run setup</code>
          </div>
          
          <div className="text-sm text-gray-500 text-left">
            <p className="mb-2"><strong>The setup wizard will:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Ask about your use case (DeFi, Gaming, NFT, Bridge, Custom)</li>
              <li>Let you select Chainweb EVM chains (20-24)</li>
              <li>Choose function generation mode (Recommended/Manual)</li>
              <li>Generate a clean project in <code className="bg-gray-100 px-1 rounded">gen_manifold/</code></li>
              <li>Provide a Swagger-style function explorer</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🌐 Chainweb EVM</h3>
            <p className="text-blue-600 text-xs">
              Chains 20-24 • Ethereum-compatible • KDA currency
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">⚡ Multi-Chain Functions</h3>
            <p className="text-green-600 text-xs">
              Cross-chain transfers • Smart contract deployment • DeFi operations
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">📚 Swagger-Style UI</h3>
            <p className="text-purple-600 text-xs">
              Interactive docs • Live testing • Code examples
            </p>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          <p>Manifold v1.0.0 • Made for Kadena Chainweb EVM • Terminal-based Setup</p>
        </div>
      </div>
    </div>
  )
}

export default App