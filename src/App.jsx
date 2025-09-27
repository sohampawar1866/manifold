import { useState } from 'react'
import { MultiChainDashboard } from './components/MultiChainDashboard.jsx'
import { AdvancedOperations } from './components/AdvancedOperations.jsx'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Manifold
                </h1>
                <p className="text-sm text-gray-400">
                  Kadena Chainweb EVM Platform
                </p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-gray-900'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'operations'
                    ? 'bg-amber-500 text-gray-900'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Operations
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <MultiChainDashboard />}
        {activeTab === 'operations' && <AdvancedOperations />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-sm">M</span>
                </div>
                <span className="text-white font-bold text-lg">Manifold</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Enterprise multi-chain platform built on Kadena's braided chain architecture.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-amber-400 hover:text-amber-300 text-sm">Docs</a>
                <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">API</a>
                <a href="#" className="text-red-400 hover:text-red-300 text-sm">Support</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Features</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>Braided chains</li>
                <li>SPV transfers</li>
                <li>PoW security</li>
                <li>Linear scaling</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Network</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>480k TPS capacity</li>
                <li>Sub-second finality</li>
                <li>Zero gas fees</li>
                <li>EVM compatible</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-6 pt-4">
            <p className="text-gray-500 text-xs text-center">
              © 2025 Manifold Framework. Enterprise blockchain development.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
