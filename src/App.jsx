import React from 'react';
import toast from 'react-hot-toast';

// --- SVG Icons ---
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

function App() {
  const command = 'npm run setup';

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard!');
  };

  return (
    <main className="bg-slate-50 min-h-screen w-full flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto">
        
        {/* Header Section (Updated) */}
        <header className="text-center mb-16">
          {/* Removed diamond emoji */}
          <h1 className="text-6xl font-extrabold text-gradient tracking-tight mb-4">
            Manifold
          </h1>
          <p className="text-xl text-slate-500 max-w-md mx-auto">
            Your Kadena Chainweb EVM Function Generator
          </p>
        </header>

        {/* Setup Card Section (with explicit border) */}
        <section className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              Project Setup Required
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              To begin, run the setup wizard in your terminal. This will configure your custom multi-chain application.
            </p>
          </div>
          
          <div className="relative bg-slate-100 p-4 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
            <code className="text-green-600 text-lg sm:text-xl font-mono">
              <span className="text-slate-400 mr-2">$</span>{command}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-2 rounded-md bg-white text-slate-500 hover:bg-slate-200 hover:text-slate-700 border border-slate-300 transition-colors"
              aria-label="Copy command"
            >
              <CopyIcon />
            </button>
          </div>
          
          <div className="mt-8 text-left space-y-4">
            <div className="flex items-start space-x-3">
              <CheckIcon />
              <p className="text-slate-700">Select use case: DeFi, NFT, Bridge, etc.</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckIcon />
              <p className="text-slate-700">Choose function generation mode</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckIcon />
              <p className="text-slate-700">Select target Chainweb EVM chains</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckIcon />
              <p className="text-slate-700">Generate a project in <code className="code-inline">gen_manifold/</code></p>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="grid md:grid-cols-3 gap-6 text-center">
          <div className="feature-card">
            <h3 className="font-semibold text-slate-700 mb-1">🌐 Chainweb EVM</h3>
            <p className="text-slate-500 text-sm">
              Chains 20-24 & KDA currency
            </p>
          </div>
          <div className="feature-card">
            <h3 className="font-semibold text-slate-700 mb-1">⚡ Multi-Chain Functions</h3>
            <p className="text-slate-500 text-sm">
              Cross-chain transfers & deployment
            </p>
          </div>
          <div className="feature-card">
            <h3 className="font-semibold text-slate-700 mb-1">📚 Swagger-Style UI</h3>
            <p className="text-slate-500 text-sm">
              Interactive docs & live testing
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}

export default App;