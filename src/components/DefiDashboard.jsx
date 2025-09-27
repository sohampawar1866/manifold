import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Import contract ABIs (would be generated from contract compilation)
import ManifoldDEXABI from '../contracts/evm/ManifoldDEX.json';
import ManifoldLendingABI from '../contracts/evm/ManifoldLending.json';
import ManifoldStakingABI from '../contracts/evm/ManifoldStaking.json';
import ManifoldYieldFarmingABI from '../contracts/evm/ManifoldYieldFarming.json';
import ManifoldIntegrationABI from '../contracts/evm/ManifoldIntegration.json';

const DefiDashboard = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolioData, setPortfolioData] = useState(null);
  const [defiPools, setDefiPools] = useState([]);
  const [userPositions, setUserPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Contract addresses (would be set after deployment)
  const CONTRACT_ADDRESSES = {
    DEX: process.env.REACT_APP_DEX_ADDRESS || '0x0000000000000000000000000000000000000000',
    LENDING: process.env.REACT_APP_LENDING_ADDRESS || '0x0000000000000000000000000000000000000000',
    STAKING: process.env.REACT_APP_STAKING_ADDRESS || '0x0000000000000000000000000000000000000000',
    YIELD_FARMING: process.env.REACT_APP_YIELD_FARMING_ADDRESS || '0x0000000000000000000000000000000000000000',
    INTEGRATION: process.env.REACT_APP_INTEGRATION_ADDRESS || '0x0000000000000000000000000000000000000000'
  };

  // Initialize Web3 connection
  useEffect(() => {
    initializeWeb3();
  }, []);

  // Load user's DeFi portfolio when connected
  useEffect(() => {
    if (isConnected && account) {
      loadPortfolioData();
      loadDefiPools();
      loadUserPositions();
    }
  }, [isConnected, account]);

  const initializeWeb3 = async () => {
    try {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        
        // Initialize contracts
        const signer = web3Provider.getSigner();
        const contractInstances = {
          dex: new ethers.Contract(CONTRACT_ADDRESSES.DEX, ManifoldDEXABI, signer),
          lending: new ethers.Contract(CONTRACT_ADDRESSES.LENDING, ManifoldLendingABI, signer),
          staking: new ethers.Contract(CONTRACT_ADDRESSES.STAKING, ManifoldStakingABI, signer),
          yieldFarming: new ethers.Contract(CONTRACT_ADDRESSES.YIELD_FARMING, ManifoldYieldFarmingABI, signer),
          integration: new ethers.Contract(CONTRACT_ADDRESSES.INTEGRATION, ManifoldIntegrationABI, signer)
        };
        setContracts(contractInstances);
        
        // Check if already connected
        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await web3Provider.listAccounts();
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } else {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      
      if (!contracts.integration) return;
      
      // Get user's integrated position
      const position = await contracts.integration.getUserPosition(account);
      
      setPortfolioData({
        totalValue: ethers.utils.formatEther(position.totalValue || '0'),
        dexLiquidity: ethers.utils.formatEther(position.dexLiquidity || '0'),
        lendingSupply: ethers.utils.formatEther(position.lendingSupply || '0'),
        lendingBorrow: ethers.utils.formatEther(position.lendingBorrow || '0'),
        stakingAmount: ethers.utils.formatEther(position.stakingAmount || '0'),
        farmingAmount: ethers.utils.formatEther(position.farmingAmount || '0')
      });
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefiPools = async () => {
    try {
      if (!contracts.dex || !contracts.yieldFarming) return;
      
      // Load DEX pools
      const dexPoolCount = await contracts.dex.poolCount();
      const dexPools = [];
      
      for (let i = 0; i < dexPoolCount.toNumber(); i++) {
        try {
          const poolInfo = await contracts.dex.getPoolInfo(i);
          dexPools.push({
            id: i,
            type: 'DEX',
            token0: poolInfo.token0,
            token1: poolInfo.token1,
            reserve0: ethers.utils.formatEther(poolInfo.reserve0 || '0'),
            reserve1: ethers.utils.formatEther(poolInfo.reserve1 || '0'),
            totalSupply: ethers.utils.formatEther(poolInfo.totalSupply || '0')
          });
        } catch (error) {
          console.error(`Error loading DEX pool ${i}:`, error);
        }
      }

      // Load staking pools
      const stakingPoolCount = await contracts.staking.poolCount();
      const stakingPools = [];
      
      for (let i = 0; i < stakingPoolCount.toNumber(); i++) {
        try {
          const poolInfo = await contracts.staking.getPoolInfo(i);
          stakingPools.push({
            id: i,
            type: 'STAKING',
            stakingToken: poolInfo.stakingToken,
            rewardToken: poolInfo.rewardToken,
            totalStaked: ethers.utils.formatEther(poolInfo.totalStaked || '0'),
            rewardRate: ethers.utils.formatEther(poolInfo.rewardRate || '0'),
            active: poolInfo.active
          });
        } catch (error) {
          console.error(`Error loading staking pool ${i}:`, error);
        }
      }

      // Load farming pools
      const farmingPoolCount = await contracts.yieldFarming.farmCount();
      const farmingPools = [];
      
      for (let i = 0; i < farmingPoolCount.toNumber(); i++) {
        try {
          const farmInfo = await contracts.yieldFarming.getFarmInfo(i);
          farmingPools.push({
            id: i,
            type: 'FARMING',
            lpToken: farmInfo.lpToken,
            rewardTokens: farmInfo.rewardTokens,
            totalStaked: ethers.utils.formatEther(farmInfo.totalStaked || '0'),
            active: farmInfo.active
          });
        } catch (error) {
          console.error(`Error loading farming pool ${i}:`, error);
        }
      }

      const allPools = [
        ...dexPools,
        ...stakingPools,
        ...farmingPools
      ];

      setDefiPools(allPools);
    } catch (error) {
      console.error('Error loading DeFi pools:', error);
    }
  };

  const loadUserPositions = async () => {
    try {
      if (!contracts.integration) return;
      
      // Get user's staking info
      const stakingInfo = await contracts.staking.getUserStakingInfo(account);
      const farmingInfo = await contracts.yieldFarming.getUserFarmingInfo(account);
      
      const positions = [
        ...stakingInfo.poolIds.map((poolId, index) => ({
          type: 'STAKING',
          poolId: poolId.toNumber(),
          amount: ethers.utils.formatEther(stakingInfo.stakedAmounts[index] || '0'),
          rewards: ethers.utils.formatEther(stakingInfo.earnedRewards[index] || '0')
        })),
        ...farmingInfo.farmIds.map((farmId, index) => ({
          type: 'FARMING', 
          poolId: farmId.toNumber(),
          amount: ethers.utils.formatEther(farmingInfo.stakedAmounts[index] || '0')
        }))
      ];
      
      setUserPositions(positions);
    } catch (error) {
      console.error('Error loading user positions:', error);
    }
  };

  const executeSwap = async (poolId, tokenA, tokenB, amountIn, minAmountOut) => {
    try {
      setLoading(true);
      
      if (!contracts.dex) return;
      
      // Approve token spending
      const tokenAContract = new ethers.Contract(tokenA, ['function approve(address,uint256)'], provider.getSigner());
      await tokenAContract.approve(CONTRACT_ADDRESSES.DEX, ethers.utils.parseEther(amountIn.toString()));
      
      // Execute swap
      const tx = await contracts.dex.swapExactTokensForTokens(
        ethers.utils.parseEther(amountIn.toString()),
        ethers.utils.parseEther(minAmountOut.toString()),
        [tokenA, tokenB],
        account,
        Math.floor(Date.now() / 1000) + 1800 // 30 min deadline
      );
      
      await tx.wait();
      console.log('Swap executed:', tx.hash);
      loadPortfolioData(); // Refresh portfolio
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLiquidity = async (poolId, tokenA, tokenB, amountA, amountB) => {
    try {
      setLoading(true);
      
      if (!contracts.dex) return;
      
      // Approve tokens
      const tokenAContract = new ethers.Contract(tokenA, ['function approve(address,uint256)'], provider.getSigner());
      const tokenBContract = new ethers.Contract(tokenB, ['function approve(address,uint256)'], provider.getSigner());
      
      await tokenAContract.approve(CONTRACT_ADDRESSES.DEX, ethers.utils.parseEther(amountA.toString()));
      await tokenBContract.approve(CONTRACT_ADDRESSES.DEX, ethers.utils.parseEther(amountB.toString()));
      
      // Add liquidity
      const tx = await contracts.dex.addLiquidity(
        tokenA,
        tokenB,
        ethers.utils.parseEther(amountA.toString()),
        ethers.utils.parseEther(amountB.toString()),
        ethers.utils.parseEther((amountA * 0.95).toString()), // 5% slippage
        ethers.utils.parseEther((amountB * 0.95).toString()),
        account,
        Math.floor(Date.now() / 1000) + 1800
      );
      
      await tx.wait();
      console.log('Liquidity added:', tx.hash);
      loadPortfolioData();
    } catch (error) {
      console.error('Add liquidity failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const supplyToLending = async (token, amount) => {
    try {
      setLoading(true);
      
      if (!contracts.lending) return;
      
      // Approve token
      const tokenContract = new ethers.Contract(token, ['function approve(address,uint256)'], provider.getSigner());
      await tokenContract.approve(CONTRACT_ADDRESSES.LENDING, ethers.utils.parseEther(amount.toString()));
      
      // Supply to lending
      const tx = await contracts.lending.supply(token, ethers.utils.parseEther(amount.toString()));
      await tx.wait();
      
      console.log('Supply successful:', tx.hash);
      loadPortfolioData();
    } catch (error) {
      console.error('Supply failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const stakeTokens = async (poolId, token, amount) => {
    try {
      setLoading(true);
      
      if (!contracts.staking) return;
      
      // Approve token
      const tokenContract = new ethers.Contract(token, ['function approve(address,uint256)'], provider.getSigner());
      await tokenContract.approve(CONTRACT_ADDRESSES.STAKING, ethers.utils.parseEther(amount.toString()));
      
      // Stake tokens
      const tx = await contracts.staking.stake(poolId, ethers.utils.parseEther(amount.toString()));
      await tx.wait();
      
      console.log('Stake successful:', tx.hash);
      loadPortfolioData();
    } catch (error) {
      console.error('Stake failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async (poolId, poolType) => {
    try {
      setLoading(true);
      
      if (poolType === 'STAKING' && contracts.staking) {
        const tx = await contracts.staking.claimRewards(poolId);
        await tx.wait();
        console.log('Staking rewards claimed:', tx.hash);
      } else if (poolType === 'FARMING' && contracts.yieldFarming) {
        const tx = await contracts.yieldFarming.harvest(poolId);
        await tx.wait();
        console.log('Farming rewards claimed:', tx.hash);
      }

      loadPortfolioData();
    } catch (error) {
      console.error('Claim rewards failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">Please connect your wallet to access Chainweb EVM DeFi features</p>
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">DeFi Dashboard</h1>
          <p className="text-gray-300">Manage your decentralized finance positions</p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Portfolio Value</h3>
            <p className="text-3xl font-bold text-green-400">
              ${portfolioData?.totalValue?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Portfolio Health</h3>
            <p className="text-3xl font-bold text-blue-400">
              {portfolioData?.portfolioHealth?.toFixed(1) || '0.0'}%
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Active Positions</h3>
            <p className="text-3xl font-bold text-purple-400">
              {userPositions?.length || 0}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {['overview', 'swap', 'liquidity', 'lending', 'staking', 'farming'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Portfolio Overview</h2>
              
              {/* Position Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userPositions.length > 0 ? (
                  userPositions.map((position, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-white">{position.type}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          position.type === 'DEX' ? 'bg-blue-500' :
                          position.type === 'LENDING' ? 'bg-green-500' :
                          position.type === 'STAKING' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}>
                          {position.type}
                        </span>
                      </div>
                      <p className="text-gray-300">Value: ${position.value?.toFixed(2)}</p>
                      <p className="text-gray-300">APY: {position.apy?.toFixed(2)}%</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-400">No active positions found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'swap' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Token Swap</h2>
              <SwapInterface onSwap={executeSwap} loading={loading} />
            </div>
          )}

          {activeTab === 'liquidity' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Liquidity Pools</h2>
              <LiquidityInterface pools={defiPools.filter(p => p.type === 'DEX')} onAddLiquidity={addLiquidity} loading={loading} />
            </div>
          )}

          {activeTab === 'lending' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Lending Protocol</h2>
              <LendingInterface onSupply={supplyToLending} loading={loading} />
            </div>
          )}

          {activeTab === 'staking' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Staking Pools</h2>
              <StakingInterface 
                pools={defiPools.filter(p => p.type === 'STAKING')} 
                onStake={stakeTokens} 
                onClaim={(poolId) => claimRewards(poolId, 'STAKING')}
                loading={loading} 
              />
            </div>
          )}

          {activeTab === 'farming' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Yield Farming</h2>
              <FarmingInterface 
                pools={defiPools.filter(p => p.type === 'FARMING')} 
                onDeposit={stakeTokens} 
                onHarvest={(poolId) => claimRewards(poolId, 'FARMING')}
                loading={loading} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Swap Interface Component
const SwapInterface = ({ onSwap, loading }) => {
  const [tokenIn, setTokenIn] = useState('KDA');
  const [tokenOut, setTokenOut] = useState('USDC');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState(0.5);

  const handleSwap = () => {
    if (!amountIn || !tokenIn || !tokenOut) return;
    
    const poolId = `${tokenIn.toLowerCase()}-${tokenOut.toLowerCase()}`;
    const minAmountOut = parseFloat(amountOut) * (1 - slippage / 100);
    
    onSwap(poolId, tokenIn, parseFloat(amountIn), minAmountOut);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/5 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
            <select
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value)}
              className="mt-2 w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="KDA">KDA</option>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </select>
          </div>

          <div className="text-center">
            <button className="bg-purple-600 hover:bg-purple-700 rounded-full p-2">
              ↕️
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
            <input
              type="number"
              value={amountOut}
              onChange={(e) => setAmountOut(e.target.value)}
              placeholder="0.0"
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
            <select
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="mt-2 w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="USDC">USDC</option>
              <option value="KDA">KDA</option>
              <option value="ETH">ETH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slippage Tolerance: {slippage}%
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleSwap}
            disabled={loading || !amountIn}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Swapping...' : 'Swap Tokens'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Liquidity Interface Component
const LiquidityInterface = ({ pools, onAddLiquidity, loading }) => {
  const [selectedPool, setSelectedPool] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');

  const handleAddLiquidity = () => {
    if (!selectedPool || !amountA || !amountB) return;
    onAddLiquidity(selectedPool, parseFloat(amountA), parseFloat(amountB));
  };

  return (
    <div className="space-y-6">
      {/* Pool Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Select Pool</label>
        <select
          value={selectedPool}
          onChange={(e) => setSelectedPool(e.target.value)}
          className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
        >
          <option value="">Choose a pool</option>
          {pools.map((pool, index) => (
            <option key={index} value={pool.poolId || pool['pool-id']}>
              {pool.tokenA || pool['token-a']} / {pool.tokenB || pool['token-b']}
            </option>
          ))}
        </select>
      </div>

      {/* Add Liquidity Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Token A Amount</label>
          <input
            type="number"
            value={amountA}
            onChange={(e) => setAmountA(e.target.value)}
            placeholder="0.0"
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Token B Amount</label>
          <input
            type="number"
            value={amountB}
            onChange={(e) => setAmountB(e.target.value)}
            placeholder="0.0"
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
          />
        </div>
      </div>

      <button
        onClick={handleAddLiquidity}
        disabled={loading || !selectedPool || !amountA || !amountB}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
      >
        {loading ? 'Adding Liquidity...' : 'Add Liquidity'}
      </button>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pools.slice(0, 3).map((pool, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              {pool.tokenA || pool['token-a']} / {pool.tokenB || pool['token-b']}
            </h3>
            <p className="text-gray-300">TVL: ${pool.tvl?.toFixed(2) || '0.00'}</p>
            <p className="text-gray-300">APR: {pool.apr?.toFixed(2) || '0.00'}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Lending Interface Component
const LendingInterface = ({ onSupply, loading }) => {
  const [selectedToken, setSelectedToken] = useState('KDA');
  const [supplyAmount, setSupplyAmount] = useState('');

  const handleSupply = () => {
    if (!selectedToken || !supplyAmount) return;
    onSupply(selectedToken, parseFloat(supplyAmount));
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
          >
            <option value="KDA">KDA</option>
            <option value="USDC">USDC</option>
            <option value="ETH">ETH</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Supply Amount</label>
          <input
            type="number"
            value={supplyAmount}
            onChange={(e) => setSupplyAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <button
          onClick={handleSupply}
          disabled={loading || !supplyAmount}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Supplying...' : 'Supply Tokens'}
        </button>
      </div>
    </div>
  );
};

// Staking Interface Component
const StakingInterface = ({ pools, onStake, onClaim, loading }) => {
  const [selectedPool, setSelectedPool] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');

  const handleStake = () => {
    if (!selectedPool || !stakeAmount) return;
    onStake(selectedPool, parseFloat(stakeAmount));
  };

  return (
    <div className="space-y-6">
      {/* Staking Form */}
      <div className="max-w-md mx-auto bg-white/5 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Pool</label>
          <select
            value={selectedPool}
            onChange={(e) => setSelectedPool(e.target.value)}
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
          >
            <option value="">Choose a staking pool</option>
            {pools.map((pool, index) => (
              <option key={index} value={pool.poolId || pool['pool-id']}>
                {pool.stakingToken || pool['staking-token']} Pool
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Stake Amount</label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <button
          onClick={handleStake}
          disabled={loading || !selectedPool || !stakeAmount}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Staking...' : 'Stake Tokens'}
        </button>
      </div>

      {/* Staking Pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map((pool, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {pool.stakingToken || pool['staking-token']} Staking
            </h3>
            <div className="space-y-2 mb-4">
              <p className="text-gray-300">APY: {pool.apy?.toFixed(2) || '0.00'}%</p>
              <p className="text-gray-300">Total Staked: {pool.totalStaked?.toFixed(2) || '0.00'}</p>
              <p className="text-gray-300">Reward Token: {pool.rewardToken || pool['reward-token']}</p>
            </div>
            <button
              onClick={() => onClaim(pool.poolId || pool['pool-id'])}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Claim Rewards
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Farming Interface Component
const FarmingInterface = ({ pools, onDeposit, onHarvest, loading }) => {
  const [selectedPool, setSelectedPool] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const handleDeposit = () => {
    if (!selectedPool || !depositAmount) return;
    onDeposit(selectedPool, parseFloat(depositAmount));
  };

  return (
    <div className="space-y-6">
      {/* Farming Form */}
      <div className="max-w-md mx-auto bg-white/5 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Farm</label>
          <select
            value={selectedPool}
            onChange={(e) => setSelectedPool(e.target.value)}
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
          >
            <option value="">Choose a farm</option>
            {pools.map((pool, index) => (
              <option key={index} value={pool.poolId || pool['pool-id']}>
                {pool.lpToken || pool['lp-token']} Farm
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Deposit Amount</label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <button
          onClick={handleDeposit}
          disabled={loading || !selectedPool || !depositAmount}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Depositing...' : 'Deposit LP Tokens'}
        </button>
      </div>

      {/* Farming Pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map((pool, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {pool.lpToken || pool['lp-token']} Farm
            </h3>
            <div className="space-y-2 mb-4">
              <p className="text-gray-300">APY: {pool.apy?.toFixed(2) || '0.00'}%</p>
              <p className="text-gray-300">TVL: ${pool.tvl?.toFixed(2) || '0.00'}</p>
              <p className="text-gray-300">Rewards: {(pool.rewardTokens || pool['reward-tokens'] || []).join(', ')}</p>
            </div>
            <button
              onClick={() => onHarvest(pool.poolId || pool['pool-id'])}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Harvest Rewards
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefiDashboard;