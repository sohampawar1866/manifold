import React from 'react';
import './App.css';

// This is a placeholder App.jsx - it will be replaced during setup
// Run `node scripts/setup.js` to generate the dynamic components

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">K</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">
          Kadena Multi-Chain Template
        </h1>
        
        <p className="text-gray-400 mb-8">
          Welcome to your customizable Kadena multi-chain application template.
          This template will be automatically configured based on your setup choices.
        </p>
        
        <div className="bg-gray-800 rounded-lg p-6 text-left">
          <h2 className="text-xl font-bold mb-4 text-center">🚀 Get Started</h2>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">1.</span>
              <div>
                <p className="font-medium">Run the setup wizard:</p>
                <code className="text-sm bg-gray-700 px-2 py-1 rounded mt-1 block">
                  node scripts/setup.js
                </code>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">2.</span>
              <div>
                <p className="font-medium">Choose your configuration:</p>
                <p className="text-sm text-gray-400">
                  Guided setup for recommendations, or manual for full control
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">3.</span>
              <div>
                <p className="font-medium">Components will be generated automatically</p>
                <p className="text-sm text-gray-400">
                  Based on your complexity and chain selection
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>🌟 This app adapts to your needs - from single chain to full ecosystem!</p>
        </div>
      </div>
    </div>
  );
}

export default App;