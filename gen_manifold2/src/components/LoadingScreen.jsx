import React from 'react'

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8">
          <div className="inline-block animate-pulse-slow">
            <span className="text-6xl">🌐</span>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          <span className="text-gradient">Manifold</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-lg mb-8">
          Kadena Chainweb EVM Function Generator
        </p>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-gray-500 text-sm mt-4">
          Loading your development environment...
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen