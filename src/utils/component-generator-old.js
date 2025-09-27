/**
 * 🏭 Dynamic Component Generator
 * 
 * Generates different React components based on user's setup configuration.
 * Creates single/dual/triple/quad/full chain versions of components.
 */

export class ComponentGenerator {
  constructor(config) {
    this.config = config;
    this.complexity = config.complexity;
    this.chains = config.deployment.deployToChains;
    this.features = config.features.enabled;
  }

  /**
   * Generate the main App component based on configuration
   */
  generateMainApp() {
    const imports = this.generateImports();
    const components = this.generateComponents();
    
    return `import React from 'react';
import './App.css';
${imports}

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            ${this.config.projectName}
          </h1>
          <p className="text-gray-400 mt-1">${this.config.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-sm">
              ${this.complexity.charAt(0).toUpperCase() + this.complexity.slice(1)} Chain
            </span>
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
              ${this.chains.length} Chain${this.chains.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        ${components}
      </main>
    </div>
  );
}

export default App;`;
  }

  /**
   * Generate imports based on complexity
   */
  generateImports(config) {
    const imports = [`import WalletConnection from './components/WalletConnection';`];
    
    // Include intelligence components for dual+ configurations
    if (config.complexity === 'dual' || config.complexity === 'comprehensive') {
      imports.push(
        "import ChainIntelligenceDashboard from '../components/ChainIntelligenceDashboard.jsx';",
        "import SmartRoutingOptimizer from '../components/SmartRoutingOptimizer.jsx';",
        "import RealTimePerformanceMonitor from '../components/RealTimePerformanceMonitor.jsx';",
        "import ArbitrageOpportunityDetector from '../components/ArbitrageOpportunityDetector.jsx';"
      );
    }
    
    // Include playground components for comprehensive configurations
  if (config.complexity === 'comprehensive') {
    imports.push(
      "import InteractivePlayground from '../components/InteractivePlayground.jsx';",
      "import OperationSchemaExplorer from '../components/OperationSchemaExplorer.jsx';",
      "import LiveExamplesSystem from '../components/LiveExamplesSystem.jsx';",
      "import ResponseVisualizer from '../components/ResponseVisualizer.jsx';"
    );
  }
    
    switch (this.complexity) {
      case 'single':
        return baseImports.concat([
          `import SingleChainDashboard from './components/SingleChainDashboard';`,
          `import BasicContractInterface from './components/BasicContractInterface';`
        ]).join('\n');
        
      case 'dual':
        return baseImports.concat([
          `import DualChainDashboard from './components/DualChainDashboard';`,
          `import CrossChainTransfer from './components/CrossChainTransfer';`,
          `import ChainComparison from './components/ChainComparison';`
        ]).join('\n');
        
      case 'triple':
        return baseImports.concat([
          `import TripleChainDashboard from './components/TripleChainDashboard';`,
          `import CrossChainOperations from './components/CrossChainOperations';`,
          `import ChainOptimization from './components/ChainOptimization';`,
          `import ArbitrageDetection from './components/ArbitrageDetection';`
        ]).join('\n');
        
      case 'quad':
        return baseImports.concat([
          `import QuadChainDashboard from './components/QuadChainDashboard';`,
          `import AdvancedCrossChain from './components/AdvancedCrossChain';`,
          `import LiquidityAggregation from './components/LiquidityAggregation';`,
          `import MEVProtection from './components/MEVProtection';`
        ]).join('\n');
        
      case 'full':
        return baseImports.concat([
          `import FullEcosystemDashboard from './components/FullEcosystemDashboard';`,
          `import AIOptimization from './components/AIOptimization';`,
          `import AdvancedAnalytics from './components/AdvancedAnalytics';`,
          `import CrossChainGovernance from './components/CrossChainGovernance';`
        ]).join('\n');
        
      default:
        return baseImports.join('\n');
    }
  }

  /**
   * Generate main component structure
   */
  generateComponents() {
    switch (this.complexity) {
      case 'single':
        return `        <WalletConnection />
        <SingleChainDashboard chain={${this.chains[0]}} />
        <BasicContractInterface chain={${this.chains[0]}} />`;
        
      case 'dual':
        return `        <WalletConnection />
        <DualChainDashboard chains={${JSON.stringify(this.chains)}} />
        <ChainIntelligenceDashboard config={${JSON.stringify(this.config)}} />
        <CrossChainTransfer fromChain={${this.chains[0]}} toChain={${this.chains[1]}} />
        <ChainComparison chains={${JSON.stringify(this.chains)}} />`;
        
      case 'triple':
        return `        <WalletConnection />
        <TripleChainDashboard chains={${JSON.stringify(this.chains)}} />
        <ChainIntelligenceDashboard config={${JSON.stringify(this.config)}} />
        <CrossChainOperations chains={${JSON.stringify(this.chains)}} />
        <ChainOptimization chains={${JSON.stringify(this.chains)}} />
        <ArbitrageDetection chains={${JSON.stringify(this.chains)}} />`;
        
      case 'quad':
        return `        <WalletConnection />
        <QuadChainDashboard chains={${JSON.stringify(this.chains)}} />
        <ChainIntelligenceDashboard config={${JSON.stringify(this.config)}} />
        <AdvancedCrossChain chains={${JSON.stringify(this.chains)}} />
        <LiquidityAggregation chains={${JSON.stringify(this.chains)}} />
        <MEVProtection chains={${JSON.stringify(this.chains)}} />`;
        
      case 'full':
        return `        <WalletConnection />
        <FullEcosystemDashboard chains={${JSON.stringify(this.chains)}} />
        <ChainIntelligenceDashboard config={${JSON.stringify(this.config)}} />
        <AIOptimization chains={${JSON.stringify(this.chains)}} />
        <AdvancedAnalytics chains={${JSON.stringify(this.chains)}} />
        <CrossChainGovernance chains={${JSON.stringify(this.chains)}} />`;
        
      default:
        return `        <WalletConnection />
        <div>Configuration not found. Please run setup again.</div>`;
    }
  }

  /**
   * Generate dashboard component based on complexity
   */
  generateDashboard() {
    const componentName = this.getDashboardComponentName();
    
    return `import React from 'react';
import { useKadenaWallet, useMultiChainBalances } from '../hooks/useKadena';

function ${componentName}({ chains }) {
  const { isConnected, address, connect } = useKadenaWallet();
  const { balances, isLoading, error } = useMultiChainBalances(address, chains);

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
        <button
          onClick={connect}
          className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-medium"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            ${Array(this.chains.length).fill(0).map((_, i) => 
              `<div className="h-3 bg-gray-600 rounded w-full"></div>`
            ).join('\n            ')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        ${this.getDisplayTitle()} Dashboard
      </h2>
      
      <div className="grid gap-4 ${this.getGridClass()}">
        ${this.generateChainCards()}
      </div>
      
      ${this.generateComplexitySpecificFeatures()}
    </div>
  );
}

export default ${componentName};`;
  }

  getDashboardComponentName() {
    const names = {
      single: 'SingleChainDashboard',
      dual: 'DualChainDashboard', 
      triple: 'TripleChainDashboard',
      quad: 'QuadChainDashboard',
      full: 'FullEcosystemDashboard'
    };
    return names[this.complexity] || 'Dashboard';
  }

  getDisplayTitle() {
    const titles = {
      single: 'Single Chain',
      dual: 'Dual Chain',
      triple: 'Triple Chain', 
      quad: 'Quad Chain',
      full: 'Multi-Chain Ecosystem'
    };
    return titles[this.complexity] || 'Multi-Chain';
  }

  getGridClass() {
    const gridClasses = {
      single: 'grid-cols-1',
      dual: 'grid-cols-1 md:grid-cols-2',
      triple: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      quad: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      full: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
    };
    return gridClasses[this.complexity] || 'grid-cols-1';
  }

  generateChainCards() {
    return this.chains.map(chainId => `        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Chain ${chainId}</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-2xl font-bold">
            {balances[${chainId}] || '0.00'} KDA
          </p>
          <p className="text-sm text-gray-400">
            Network ID: {${5920 + chainId - 20}}
          </p>
        </div>`).join('\n');
  }

  generateComplexitySpecificFeatures() {
    switch (this.complexity) {
      case 'single':
        return `      
      <div className="mt-6 p-4 bg-blue-600/20 rounded-lg">
        <h3 className="font-medium text-blue-400 mb-2">Single Chain Features</h3>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• Simple wallet connection</li>
          <li>• Basic contract interaction</li>
          <li>• Chain information display</li>
        </ul>
      </div>`;
      
      case 'dual':
        return `      
      <div className="mt-6 p-4 bg-green-600/20 rounded-lg">
        <h3 className="font-medium text-green-400 mb-2">Dual Chain Features</h3>
        <ul className="text-sm text-green-300 space-y-1">
          <li>• Cross-chain transfers</li>
          <li>• Chain comparison tools</li>
          <li>• Dual chain analytics</li>
        </ul>
      </div>`;
      
      case 'triple':
        return `      
      <div className="mt-6 p-4 bg-purple-600/20 rounded-lg">
        <h3 className="font-medium text-purple-400 mb-2">Triple Chain Features</h3>
        <ul className="text-sm text-purple-300 space-y-1">
          <li>• Chain optimization</li>
          <li>• Arbitrage detection</li>
          <li>• Load balancing</li>
        </ul>
      </div>`;
      
      case 'quad':
        return `      
      <div className="mt-6 p-4 bg-yellow-600/20 rounded-lg">
        <h3 className="font-medium text-yellow-400 mb-2">Quad Chain Features</h3>
        <ul className="text-sm text-yellow-300 space-y-1">
          <li>• Advanced arbitrage</li>
          <li>• Liquidity aggregation</li>
          <li>• MEV protection</li>
        </ul>
      </div>`;
      
      case 'full':
        return `      
      <div className="mt-6 p-4 bg-red-600/20 rounded-lg">
        <h3 className="font-medium text-red-400 mb-2">Full Ecosystem Features</h3>
        <ul className="text-sm text-red-300 space-y-1">
          <li>• AI-powered optimization</li>
          <li>• Advanced analytics dashboard</li>
          <li>• Cross-chain governance</li>
          <li>• Professional trading tools</li>
        </ul>
      </div>`;
      
      default:
        return '';
    }
  }
}

/**
 * Helper function to generate components based on config
 */
export function generateComponents(config) {
  const generator = new ComponentGenerator(config);
  
  return {
    app: generator.generateMainApp(),
    dashboard: generator.generateDashboard()
  };
}