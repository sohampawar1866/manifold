/**
 * 🏭 Dynamic Component Generator
 * 
 * Generates different React components based on user's setup configuration.
 * Creates single/dual/triple/quad/full chain versions of components.
 */
import MultiChainDashboard from '../components/MultiChainDashboard.jsx';
import AdvancedOperations from '../components/AdvancedOperations.jsx';
import ChainIntelligenceDashboard from '../components/ChainIntelligenceDashboard.jsx';
import SmartRoutingOptimizer from '../components/SmartRoutingOptimizer.jsx';
import InteractivePlayground from '../components/InteractivePlayground.jsx';
import OperationSchemaExplorer from '../components/OperationSchemaExplorer.jsx';
import LiveExamplesSystem from '../components/LiveExamplesSystem.jsx';
import ResponseVisualizer from '../components/ResponseVisualizer.jsx';
import RealTimePerformanceMonitor from '../components/RealTimePerformanceMonitor.jsx';
import ArbitrageOpportunityDetector from '../components/ArbitrageOpportunityDetector.jsx';

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
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Kadena Multi-Chain Explorer</h1>
          <p className="text-gray-400 mt-1">
            Interactive playground for ${this.chains.length} chain${this.chains.length !== 1 ? 's' : ''}: ${this.chains.join(', ')}
          </p>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        ${components}
      </main>
    </div>
  );
}

export default App;`;
  }

  /**
   * Generate imports based on configuration
   */
  generateImports() {
    const imports = [`import WalletConnection from './components/WalletConnection';`];
    
    // Include intelligence components for dual+ configurations
    if (this.complexity === 'dual' || this.complexity === 'comprehensive') {
      imports.push(
        "import ChainIntelligenceDashboard from '../components/ChainIntelligenceDashboard.jsx';",
        "import SmartRoutingOptimizer from '../components/SmartRoutingOptimizer.jsx';",
        "import RealTimePerformanceMonitor from '../components/RealTimePerformanceMonitor.jsx';",
        "import ArbitrageOpportunityDetector from '../components/ArbitrageOpportunityDetector.jsx';"
      );
    }
    
    // Include playground components for comprehensive configurations
    if (this.complexity === 'comprehensive') {
      imports.push(
        "import InteractivePlayground from '../components/InteractivePlayground.jsx';",
        "import OperationSchemaExplorer from '../components/OperationSchemaExplorer.jsx';",
        "import LiveExamplesSystem from '../components/LiveExamplesSystem.jsx';",
        "import ResponseVisualizer from '../components/ResponseVisualizer.jsx';"
      );
    }
    
    switch (this.complexity) {
      case 'single':
        return imports.concat([
          `import SingleChainDashboard from './components/SingleChainDashboard';`,
          `import BasicContractInterface from './components/BasicContractInterface';`
        ]).join('\n');
        
      case 'dual':
        return imports.concat([
          `import DualChainDashboard from './components/DualChainDashboard';`,
          `import CrossChainTransfer from './components/CrossChainTransfer';`,
          `import ChainComparison from './components/ChainComparison';`
        ]).join('\n');
        
      case 'triple':
        return imports.concat([
          `import TripleChainDashboard from './components/TripleChainDashboard';`,
          `import CrossChainOperations from './components/CrossChainOperations';`,
          `import ChainOptimization from './components/ChainOptimization';`,
          `import ArbitrageDetection from './components/ArbitrageDetection';`
        ]).join('\n');
        
      case 'quad':
        return imports.concat([
          `import QuadChainDashboard from './components/QuadChainDashboard';`,
          `import AdvancedCrossChain from './components/AdvancedCrossChain';`,
          `import LiquidityAggregation from './components/LiquidityAggregation';`,
          `import MEVProtection from './components/MEVProtection';`
        ]).join('\n');
        
      case 'comprehensive':
        return imports.concat([
          `import MultiChainDashboard from '../components/MultiChainDashboard.jsx';`,
          `import AdvancedOperations from '../components/AdvancedOperations.jsx';`
        ]).join('\n');
        
      default:
        return imports.join('\n');
    }
  }

  /**
   * Generate component structure based on configuration
   */
  generateComponents() {
    const sections = [];
    
    // Base multi-chain dashboard
    sections.push(`
      {/* Multi-Chain Dashboard */}
      <div className="mb-8">
        <MultiChainDashboard config={${JSON.stringify(this.config)}} />
      </div>`);

    // Advanced operations for complex setups
    if (this.complexity !== 'single') {
      sections.push(`
      {/* Advanced Operations */}
      <div className="mb-8">
        <AdvancedOperations config={${JSON.stringify(this.config)}} />
      </div>`);
    }

    // Intelligence Dashboard for dual+ complexity
    if (this.complexity === 'dual' || this.complexity === 'comprehensive') {
      sections.push(`
        {/* Chain Intelligence Dashboard */}
        <div className="mb-8">
          <ChainIntelligenceDashboard config={${JSON.stringify(this.config)}} />
        </div>
        
        {/* Smart Routing Optimizer */}
        <div className="mb-8">
          <SmartRoutingOptimizer config={${JSON.stringify(this.config)}} />
        </div>
        
        {/* Real-time Performance Monitor */}
        <div className="mb-8">
          <RealTimePerformanceMonitor config={${JSON.stringify(this.config)}} />
        </div>
        
        {/* Arbitrage Opportunity Detector */}
        <div className="mb-8">
          <ArbitrageOpportunityDetector config={${JSON.stringify(this.config)}} />
        </div>`);
    }
    
    // Interactive Playground for comprehensive complexity
    if (this.complexity === 'comprehensive') {
      sections.push(`
        {/* Interactive Playground */}
        <div className="mb-8">
          <InteractivePlayground config={${JSON.stringify(this.config)}} />
        </div>
        
        {/* Live Examples System */}
        <div className="mb-8">
          <LiveExamplesSystem 
            config={${JSON.stringify(this.config)}} 
            onExecuteExample={(example, result) => {
              console.log('Example executed:', example.title, result);
            }}
          />
        </div>`);
    }

    return sections.join('\n');
  }

  /**
   * Generate wallet configuration
   */
  generateWalletConfig() {
    return {
      networks: this.chains.map(chainId => ({
        chainId,
        networkId: `kadena-chain-${chainId}`,
        name: `Kadena Chain ${chainId}`,
        type: 'kadena'
      })),
      defaultChain: this.chains[0],
      features: this.features
    };
  }

  /**
   * Generate routing configuration for multi-chain operations
   */
  generateRoutingConfig() {
    const routes = [];
    
    // Generate all possible chain pairs for cross-chain operations
    for (let i = 0; i < this.chains.length; i++) {
      for (let j = i + 1; j < this.chains.length; j++) {
        routes.push({
          from: this.chains[i],
          to: this.chains[j],
          estimatedTime: '2-5 minutes',
          fee: '0.001 KDA',
          supported: true
        });
      }
    }
    
    return {
      routes,
      defaultRoute: routes[0] || null,
      maxHops: this.chains.length > 4 ? 2 : 1,
      optimization: this.complexity === 'comprehensive' ? 'intelligent' : 'basic'
    };
  }

  /**
   * Generate feature-specific configurations
   */
  generateFeatureConfigs() {
    const configs = {};
    
    if (this.features.includes('defi')) {
      configs.defi = {
        supportedProtocols: ['KadenaSwap', 'Kaddex', 'EckoDEX'],
        defaultSlippage: 1.0,
        maxSlippage: 5.0,
        enableYieldFarming: true
      };
    }
    
    if (this.features.includes('nft')) {
      configs.nft = {
        supportedStandards: ['marmalade', 'kip'],
        marketplaces: ['Hypercent', 'Kadena NFT'],
        enableMinting: true,
        enableTrading: true
      };
    }
    
    if (this.features.includes('gaming')) {
      configs.gaming = {
        supportedGames: ['Kadena Arcade', 'Chain Games'],
        enableLeaderboards: true,
        enableRewards: true,
        enableTournaments: true
      };
    }
    
    return configs;
  }

  /**
   * Generate the complete configuration object
   */
  generateConfig() {
    return {
      ...this.config,
      wallet: this.generateWalletConfig(),
      routing: this.generateRoutingConfig(),
      features: this.generateFeatureConfigs(),
      generated: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        generator: 'Kadena Multi-Chain Template Generator'
      }
    };
  }
}

/**
 * Factory function for creating component generators
 */
export function createComponentGenerator(config) {
  return new ComponentGenerator(config);
}

/**
 * Helper function to generate React component code
 */
export function generateReactComponent(config) {
  const generator = new ComponentGenerator(config);
  return generator.generateMainApp();
}

/**
 * Helper function to generate configuration files
 */
export function generateConfigFiles(config) {
  const generator = new ComponentGenerator(config);
  return {
    appConfig: generator.generateConfig(),
    walletConfig: generator.generateWalletConfig(),
    routingConfig: generator.generateRoutingConfig(),
    featureConfigs: generator.generateFeatureConfigs()
  };
}

export {
  MultiChainDashboard,
  AdvancedOperations,
  ChainIntelligenceDashboard,
  SmartRoutingOptimizer,
  InteractivePlayground,
  OperationSchemaExplorer,
  LiveExamplesSystem,
  ResponseVisualizer,
  RealTimePerformanceMonitor,
  ArbitrageOpportunityDetector
};