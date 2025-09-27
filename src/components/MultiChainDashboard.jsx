import { useKadenaWallet, useMultiChainBalances, useChainInfo } from '../hooks/useKadena.js';

// Helper function to get distinct dark theme colors for each chain
function getChainColors(chainNumber) {
  const colorMaps = {
    20: {
      bg: 'bg-gray-800',
      border: 'border-purple-500/20',
      icon: 'bg-purple-600',
      text: 'text-purple-400',
      subtext: 'text-purple-300',
      accent: 'bg-purple-600/20 text-purple-400',
      indicator: 'bg-purple-500',
      button: 'bg-purple-600 hover:bg-purple-500'
    },
    21: {
      bg: 'bg-gray-800',
      border: 'border-blue-500/20',
      icon: 'bg-blue-600',
      text: 'text-blue-400',
      subtext: 'text-blue-300',
      accent: 'bg-blue-600/20 text-blue-400',
      indicator: 'bg-blue-500',
      button: 'bg-blue-600 hover:bg-blue-500'
    },
    22: {
      bg: 'bg-gray-800',
      border: 'border-red-500/20',
      icon: 'bg-red-600',
      text: 'text-red-400',
      subtext: 'text-red-300',
      accent: 'bg-red-600/20 text-red-400',
      indicator: 'bg-red-500',
      button: 'bg-red-600 hover:bg-red-500'
    },
    23: {
      bg: 'bg-gray-800',
      border: 'border-emerald-500/20',
      icon: 'bg-emerald-600',
      text: 'text-emerald-400',
      subtext: 'text-emerald-300',
      accent: 'bg-emerald-600/20 text-emerald-400',
      indicator: 'bg-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-500'
    },
    24: {
      bg: 'bg-gray-800',
      border: 'border-amber-500/20',
      icon: 'bg-amber-600',
      text: 'text-amber-400',
      subtext: 'text-amber-300',
      accent: 'bg-amber-600/20 text-amber-400',
      indicator: 'bg-amber-500',
      button: 'bg-amber-600 hover:bg-amber-500'
    }
  };
  
  return colorMaps[chainNumber] || colorMaps[20]; // Default to purple if not found
}

function ChainCard({ chain, balance, isLoading }) {
  const balanceValue = parseFloat(balance?.balance || 0);
  const hasBalance = balanceValue > 0;
  const colors = getChainColors(chain.chainNumber);
  
  return (
    <div className={`${colors.bg} rounded-lg border ${colors.border} hover:border-gray-600 transition-all duration-300 p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{chain.chainNumber}</span>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${colors.text}`}>{chain.name}</h3>
            <p className={`text-sm ${colors.subtext}`}>Kadena Testnet</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`${colors.accent} px-2 py-1 rounded text-xs font-medium`}>
            Chain {chain.chainNumber}
          </span>
          <div className={`w-2 h-2 rounded-full ${hasBalance ? colors.indicator : 'bg-gray-600'}`}></div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 font-medium text-sm">Chain ID</span>
            <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded border border-gray-700 text-gray-300">{chain.chainId}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium text-sm">Balance</span>
            {isLoading ? (
              <div className="animate-pulse bg-gray-700 h-6 w-20 rounded"></div>
            ) : (
              <div className="text-right">
                <span className={`font-mono text-lg font-bold ${colors.text}`}>
                  {balanceValue.toFixed(4)}
                </span>
                <span className="text-gray-400 ml-1 text-sm">KDA</span>
              </div>
            )}
          </div>
        </div>
        
        <a 
          href={chain.explorer} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`w-full ${colors.button} text-white py-2 px-4 rounded-lg font-medium text-center flex items-center justify-center space-x-2 transition-all duration-200 text-sm`}
        >
          <span>Explorer</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}

export function MultiChainDashboard() {
  const { isConnected, address, connect, isConnecting } = useKadenaWallet();
  const { balances, isLoading, refetch } = useMultiChainBalances(address);
  const { chains } = useChainInfo();

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <span className="text-gray-900 text-2xl font-bold">K</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Connect to Kadena Chainweb EVM
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Connect your wallet to access balances across all 5 Kadena chains
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-amber-500 rounded"></div>
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Parallel Processing</h3>
                <p className="text-sm text-gray-400">Execute operations across multiple chains</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-2 h-2 bg-amber-500 rounded"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">5 Active Chains</h3>
                <p className="text-sm text-gray-400">Access chains 20-24 with unified interface</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Ready Functions</h3>
                <p className="text-sm text-gray-400">Pre-built complex operations</p>
              </div>
            </div>
            
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-gray-900 px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isConnecting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalBalance = balances.reduce((sum, b) => sum + parseFloat(b.balance || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-6">
          Chainweb EVM Dashboard
        </h1>
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400 text-lg mb-6">
            Access Kadena's braided chain network with scalability and security
          </p>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 inline-block">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300 font-medium text-sm">Connected:</span>
              <span className="font-mono text-sm bg-gray-900 px-3 py-1 rounded border border-gray-700 text-amber-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 bg-amber-500 rounded"></div>
                <div className="w-2 h-2 bg-amber-500 rounded"></div>
                <div className="w-2 h-2 bg-amber-500 rounded"></div>
                <div className="w-2 h-2 bg-amber-500 rounded"></div>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2 text-white">{chains.length}</div>
            <div className="text-gray-300 font-medium text-lg">Active Chains</div>
            <div className="text-gray-400 text-sm mt-1">Chains 20-24</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
            </div>
            <div className="text-3xl font-bold mb-2 text-white">{totalBalance.toFixed(4)}</div>
            <div className="text-gray-300 font-medium text-lg">Total KDA</div>
            <div className="text-gray-400 text-sm mt-1">Across all chains</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 bg-amber-500 rounded"></div>
            </div>
            <button
              onClick={refetch}
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-gray-900 px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                  <span>Refreshing</span>
                </div>
              ) : (
                <span>Refresh All</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chains.map(chain => {
          const balance = balances.find(b => b.chainNumber === chain.chainNumber);
          return (
            <ChainCard
              key={chain.chainNumber}
              chain={chain}
              balance={balance}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      {/* Performance Note */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-amber-500 rounded"></div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-3">
              Braided Chain Network
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6 text-sm">
              Kadena's braided chain architecture enables scalability through parallel execution across interconnected chains.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 text-center border border-purple-500/20">
                <div className="text-purple-400 font-bold text-xl">20</div>
                <div className="text-gray-400 text-sm">Chains</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center border border-blue-500/20">
                <div className="text-blue-400 font-bold text-xl">480k</div>
                <div className="text-gray-400 text-sm">TPS</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center border border-red-500/20">
                <div className="text-red-400 font-bold text-xl">0</div>
                <div className="text-gray-400 text-sm">Gas Fees</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center border border-emerald-500/20">
                <div className="text-emerald-400 font-bold text-xl">100%</div>
                <div className="text-gray-400 text-sm">Parallel</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}