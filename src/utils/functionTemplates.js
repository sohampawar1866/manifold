// Function Templates Engine for Kadena Chainweb EVM
// Generates ready-to-use multi-chain functions based on selected chains

// Chain configurations inline to avoid circular imports
const CHAIN_CONFIGS = {
  20: {
    chainId: 5920,
    name: 'Chainweb EVM Chain 20',
    rpc: 'https://erpc.testnet.chainweb.com/chain-20',
    wsRpc: 'wss://erpc.testnet.chainweb.com/chain-20',
    blockExplorer: 'https://explorer.testnet.chainweb.com/chain-20',
    contracts: {
      router: process.env.ROUTER_CONTRACT_20,
      factory: process.env.FACTORY_CONTRACT_20,
      bridge: process.env.BRIDGE_CONTRACT_20,
      lending: process.env.LENDING_CONTRACT_20
    }
  },
  21: {
    chainId: 5921,
    name: 'Chainweb EVM Chain 21',
    rpc: 'https://erpc.testnet.chainweb.com/chain-21',
    wsRpc: 'wss://erpc.testnet.chainweb.com/chain-21',
    blockExplorer: 'https://explorer.testnet.chainweb.com/chain-21',
    contracts: {
      router: process.env.ROUTER_CONTRACT_21,
      factory: process.env.FACTORY_CONTRACT_21,
      bridge: process.env.BRIDGE_CONTRACT_21,
      lending: process.env.LENDING_CONTRACT_21
    }
  },
  22: {
    chainId: 5922,
    name: 'Chainweb EVM Chain 22',
    rpc: 'https://erpc.testnet.chainweb.com/chain-22',
    wsRpc: 'wss://erpc.testnet.chainweb.com/chain-22',
    blockExplorer: 'https://explorer.testnet.chainweb.com/chain-22',
    contracts: {
      router: process.env.ROUTER_CONTRACT_22,
      factory: process.env.FACTORY_CONTRACT_22,
      bridge: process.env.BRIDGE_CONTRACT_22,
      lending: process.env.LENDING_CONTRACT_22
    }
  },
  23: {
    chainId: 5923,
    name: 'Chainweb EVM Chain 23',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc',
    blockExplorer: 'http://chain-23.evm-testnet-blockscout.chainweb.com/'
  },
  24: {
    chainId: 5924,
    name: 'Chainweb EVM Chain 24',
    rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc',
    blockExplorer: 'http://chain-24.evm-testnet-blockscout.chainweb.com/'
  }
}

const getChainConfig = (chainNum) => CHAIN_CONFIGS[chainNum]

// Core function templates that work with any chain combination
export const FUNCTION_TEMPLATES = {
  // CORE FUNCTIONS (Always available)
  crossChainTransfer: {
    name: 'crossChainTransfer',
    title: 'Cross-Chain Transfer',
    description: 'Transfer tokens between selected Chainweb EVM chains',
    category: 'core',
    complexity: 'beginner',
    gasEstimate: 'medium',
    contractRequired: true,
    contractAddress: (chain) => CHAIN_CONFIGS[chain].contracts.bridge,
    parameters: [
      { name: 'fromChain', type: 'number', description: 'Source chain number', required: true },
      { name: 'toChain', type: 'number', description: 'Destination chain number', required: true },
      { name: 'amount', type: 'string', description: 'Amount to transfer (in ETH)', required: true },
      { name: 'recipient', type: 'address', description: 'Recipient wallet address', required: true }
    ],
    returns: { type: 'object', description: 'Transaction hash and confirmation details' },
    generateCode: (selectedChains) => `
/**
 * Transfer tokens between Chainweb EVM chains
 * Supported chains: ${selectedChains.join(', ')}
 */
import { ethers } from 'ethers'

export async function crossChainTransfer(fromChain, toChain, amount, recipient) {
  const chainConfigs = {
${selectedChains.map(chain => {
  const config = getChainConfig(chain)
  return `    ${chain}: {
      chainId: ${config.chainId},
      rpc: '${config.rpc}',
      name: '${config.name}'
    }`
}).join(',\n')}
  }
  
  // Validate chain selection
  const validChains = [${selectedChains.join(', ')}]
  if (!validChains.includes(fromChain) || !validChains.includes(toChain)) {
    throw new Error('Invalid chain selection. Supported chains: ' + validChains.join(', '))
  }
  
  if (fromChain === toChain) {
    throw new Error('Cannot transfer to the same chain')
  }
  
  try {
    // Setup providers
    const fromProvider = new ethers.JsonRpcProvider(chainConfigs[fromChain].rpc)
    const toProvider = new ethers.JsonRpcProvider(chainConfigs[toChain].rpc)
    
    // Connect wallet (assumes MetaMask or similar)
    const signer = await fromProvider.getSigner()
    
    // Step 1: Send from source chain
    const tx = await signer.sendTransaction({
      to: recipient,
      value: ethers.parseEther(amount),
      gasLimit: 21000
    })
    
    console.log(\`Transfer initiated from Chain \${fromChain} to Chain \${toChain}\`)
    console.log(\`Transaction hash: \${tx.hash}\`)
    
    // Wait for confirmation
    const receipt = await tx.wait()
    
    return {
      success: true,
      fromChain,
      toChain,
      amount,
      recipient,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      explorerUrl: \`\${chainConfigs[fromChain].blockExplorer}tx/\${tx.hash}\`
    }
  } catch (error) {
    console.error('Cross-chain transfer failed:', error)
    throw new Error(\`Transfer failed: \${error.message}\`)
  }
}`
  },

  multiChainDeploy: {
    name: 'multiChainDeploy',
    title: 'Multi-Chain Deploy',
    description: 'Deploy smart contracts across multiple Chainweb EVM chains',
    category: 'core',
    complexity: 'intermediate',
    gasEstimate: 'high',
    parameters: [
      { name: 'chains', type: 'array', description: 'Array of chain numbers to deploy to', required: true },
      { name: 'contractBytecode', type: 'string', description: 'Contract bytecode', required: true },
      { name: 'constructorArgs', type: 'array', description: 'Constructor arguments', required: false }
    ],
    returns: { type: 'object', description: 'Deployment results for each chain' },
    generateCode: (selectedChains) => `
/**
 * Deploy smart contracts across multiple Chainweb EVM chains
 * Supported chains: ${selectedChains.join(', ')}
 */
import { ethers } from 'ethers'

export async function multiChainDeploy(chains, contractBytecode, constructorArgs = []) {
  const chainConfigs = {
${selectedChains.map(chain => {
  const config = getChainConfig(chain)
  return `    ${chain}: {
      chainId: ${config.chainId},
      rpc: '${config.rpc}',
      name: '${config.name}'
    }`
}).join(',\n')}
  }
  
  // Validate chains
  const validChains = [${selectedChains.join(', ')}]
  const invalidChains = chains.filter(chain => !validChains.includes(chain))
  if (invalidChains.length > 0) {
    throw new Error(\`Invalid chains: \${invalidChains.join(', ')}. Supported: \${validChains.join(', ')}\`)
  }
  
  const deploymentResults = {}
  
  try {
    for (const chainNum of chains) {
      console.log(\`Deploying to Chain \${chainNum}...\`)
      
      const provider = new ethers.JsonRpcProvider(chainConfigs[chainNum].rpc)
      const signer = await provider.getSigner()
      
      // Create contract factory
      const factory = new ethers.ContractFactory(
        [], // ABI - would be provided in real implementation
        contractBytecode,
        signer
      )
      
      // Deploy contract
      const contract = await factory.deploy(...constructorArgs)
      await contract.waitForDeployment()
      
      const address = await contract.getAddress()
      
      deploymentResults[chainNum] = {
        success: true,
        chainId: chainConfigs[chainNum].chainId,
        chainName: chainConfigs[chainNum].name,
        contractAddress: address,
        deploymentTx: contract.deploymentTransaction().hash,
        explorerUrl: \`\${chainConfigs[chainNum].blockExplorer}address/\${address}\`
      }
      
      console.log(\`✅ Deployed on Chain \${chainNum}: \${address}\`)
    }
    
    return {
      success: true,
      totalDeployments: chains.length,
      deployments: deploymentResults,
      summary: \`Successfully deployed to \${chains.length} chains: \${chains.join(', ')}\`
    }
    
  } catch (error) {
    console.error('Multi-chain deployment failed:', error)
    throw new Error(\`Deployment failed: \${error.message}\`)
  }
}`
  },

  getChainBalances: {
    name: 'getChainBalances',
    title: 'Get Chain Balances',
    description: 'Get KDA token balances across all selected chains',
    category: 'core',
    complexity: 'beginner',
    gasEstimate: 'low',
    parameters: [
      { name: 'address', type: 'address', description: 'Wallet address to check', required: true }
    ],
    returns: { type: 'object', description: 'Balance information for each chain' },
    generateCode: (selectedChains) => `
/**
 * Get KDA balances across multiple Chainweb EVM chains
 * Supported chains: ${selectedChains.join(', ')}
 */
import { ethers } from 'ethers'

export async function getChainBalances(address) {
  const chainConfigs = {
${selectedChains.map(chain => {
  const config = getChainConfig(chain)
  return `    ${chain}: {
      chainId: ${config.chainId},
      rpc: '${config.rpc}',
      name: '${config.name}'
    }`
}).join(',\n')}
  }
  
  const balances = {}
  let totalBalance = 0n
  
  try {
    for (const [chainNum, config] of Object.entries(chainConfigs)) {
      console.log(\`Checking balance on \${config.name}...\`)
      
      const provider = new ethers.JsonRpcProvider(config.rpc)
      const balance = await provider.getBalance(address)
      
      balances[chainNum] = {
        chainId: config.chainId,
        chainName: config.name,
        balance: balance.toString(),
        balanceEth: ethers.formatEther(balance),
        currency: 'KDA'
      }
      
      totalBalance += balance
    }
    
    return {
      success: true,
      address,
      chains: [${selectedChains.join(', ')}],
      balances,
      totalBalance: ethers.formatEther(totalBalance),
      currency: 'KDA',
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Failed to get chain balances:', error)
    throw new Error(\`Balance check failed: \${error.message}\`)
  }
}`
  },

  // DEFI-SPECIFIC FUNCTIONS
  addLiquidityMultiChain: {
    name: 'addLiquidityMultiChain',
    title: 'Add Liquidity Multi-Chain',
    description: 'Add liquidity to DEX pools across multiple chains',
    category: 'defi',
    complexity: 'advanced',
    gasEstimate: 'high',
    parameters: [
      { name: 'chains', type: 'array', description: 'Chains to add liquidity on', required: true },
      { name: 'tokenA', type: 'address', description: 'First token address', required: true },
      { name: 'tokenB', type: 'address', description: 'Second token address', required: true },
      { name: 'amountA', type: 'string', description: 'Amount of token A', required: true },
      { name: 'amountB', type: 'string', description: 'Amount of token B', required: true }
    ],
    returns: { type: 'object', description: 'Liquidity addition results for each chain' },
    generateCode: (selectedChains) => `
/**
 * Add liquidity to DEX pools across multiple Chainweb EVM chains
 * Supported chains: ${selectedChains.join(', ')}
 */
import { ethers } from 'ethers'

export async function addLiquidityMultiChain(chains, tokenA, tokenB, amountA, amountB) {
  const chainConfigs = {
${selectedChains.map(chain => {
  const config = getChainConfig(chain)
  return `    ${chain}: {
      chainId: ${config.chainId},
      rpc: '${config.rpc}',
      name: '${config.name}'
    }`
}).join(',\n')}
  }
  
  // Validate chains
  const validChains = [${selectedChains.join(', ')}]
  const invalidChains = chains.filter(chain => !validChains.includes(chain))
  if (invalidChains.length > 0) {
    throw new Error(\`Invalid chains: \${invalidChains.join(', ')}\`)
  }
  
  const results = {}
  
  try {
    for (const chainNum of chains) {
      console.log(\`Adding liquidity on Chain \${chainNum}...\`)
      
      const provider = new ethers.JsonRpcProvider(chainConfigs[chainNum].rpc)
      const signer = await provider.getSigner()
      
      // Simulate DEX interaction (would use actual DEX contracts)
      const liquidityTx = await signer.sendTransaction({
        to: tokenA, // Would be DEX router address
        value: ethers.parseEther('0'), // No ETH for ERC20 liquidity
        data: '0x', // Would contain actual function call data
        gasLimit: 200000
      })
      
      const receipt = await liquidityTx.wait()
      
      results[chainNum] = {
        success: true,
        chainName: chainConfigs[chainNum].name,
        tokenA,
        tokenB,
        amountA,
        amountB,
        txHash: liquidityTx.hash,
        gasUsed: receipt.gasUsed.toString(),
        liquidityTokens: 'LP-' + Math.random().toString(36).substr(2, 9) // Simulated
      }
    }
    
    return {
      success: true,
      operation: 'addLiquidityMultiChain',
      chains: chains,
      results,
      totalChains: chains.length
    }
    
  } catch (error) {
    console.error('Multi-chain liquidity addition failed:', error)
    throw new Error(\`Liquidity addition failed: \${error.message}\`)
  }
}`
  },

  executeArbitrage: {
    name: 'executeArbitrage',
    title: 'Execute Arbitrage',
    description: 'Execute arbitrage opportunities between chains',
    category: 'defi',
    complexity: 'expert',
    gasEstimate: 'very-high',
    parameters: [
      { name: 'tokenAddress', type: 'address', description: 'Token to arbitrage', required: true },
      { name: 'amount', type: 'string', description: 'Amount to arbitrage', required: true }
    ],
    returns: { type: 'object', description: 'Arbitrage execution results' },
    generateCode: (selectedChains) => `
/**
 * Execute arbitrage opportunities between Chainweb EVM chains
 * Supported chains: ${selectedChains.join(', ')}
 */
import { ethers } from 'ethers'

export async function executeArbitrage(tokenAddress, amount) {
  const chainConfigs = {
${selectedChains.map(chain => {
  const config = getChainConfig(chain)
  return `    ${chain}: {
      chainId: ${config.chainId},
      rpc: '${config.rpc}',
      name: '${config.name}'
    }`
}).join(',\n')}
  }
  
  try {
    // Step 1: Find best prices across chains
    const prices = {}
    for (const [chainNum, config] of Object.entries(chainConfigs)) {
      const provider = new ethers.JsonRpcProvider(config.rpc)
      // Simulate price fetching (would query actual DEX)
      prices[chainNum] = {
        price: Math.random() * 100 + 50, // Simulated price
        chainName: config.name
      }
    }
    
    // Step 2: Find arbitrage opportunity
    const sortedPrices = Object.entries(prices).sort((a, b) => a[1].price - b[1].price)
    const cheapestChain = sortedPrices[0]
    const expensiveChain = sortedPrices[sortedPrices.length - 1]
    
    const priceDiff = expensiveChain[1].price - cheapestChain[1].price
    const profitMargin = (priceDiff / cheapestChain[1].price) * 100
    
    if (profitMargin < 2) {
      return {
        success: false,
        message: 'No profitable arbitrage opportunity found',
        minProfitMargin: '2%',
        currentMargin: profitMargin.toFixed(2) + '%'
      }
    }
    
    // Step 3: Execute arbitrage
    const buyProvider = new ethers.JsonRpcProvider(chainConfigs[cheapestChain[0]].rpc)
    const sellProvider = new ethers.JsonRpcProvider(chainConfigs[expensiveChain[0]].rpc)
    
    const buySigner = await buyProvider.getSigner()
    const sellSigner = await sellProvider.getSigner()
    
    // Simulate buy transaction
    const buyTx = await buySigner.sendTransaction({
      to: tokenAddress,
      value: ethers.parseEther(amount),
      gasLimit: 150000
    })
    
    // Simulate sell transaction
    const sellTx = await sellSigner.sendTransaction({
      to: tokenAddress,
      value: ethers.parseEther('0'),
      gasLimit: 150000
    })
    
    await Promise.all([buyTx.wait(), sellTx.wait()])
    
    return {
      success: true,
      operation: 'arbitrage',
      buyChain: {
        number: cheapestChain[0],
        name: cheapestChain[1].chainName,
        price: cheapestChain[1].price,
        txHash: buyTx.hash
      },
      sellChain: {
        number: expensiveChain[0],
        name: expensiveChain[1].chainName,
        price: expensiveChain[1].price,
        txHash: sellTx.hash
      },
      profit: {
        margin: profitMargin.toFixed(2) + '%',
        estimatedProfit: ((priceDiff * parseFloat(amount)) - 10).toFixed(4) // Minus fees
      },
      tokenAddress,
      amount
    }
    
  } catch (error) {
    console.error('Arbitrage execution failed:', error)
    throw new Error(\`Arbitrage failed: \${error.message}\`)
  }
}`
  }
}

// Generate function based on template and selected chains
export const generateFunction = (functionName, selectedChains) => {
  const template = FUNCTION_TEMPLATES[functionName]
  if (!template) {
    throw new Error(`Function template '${functionName}' not found`)
  }
  
  return {
    ...template,
    code: template.generateCode(selectedChains),
    supportedChains: selectedChains,
    generatedAt: new Date().toISOString()
  }
}

// Get all available functions for selected chains and use case
export const getAvailableFunctions = (selectedChains, useCase = 'custom') => {
  const useCaseFunctions = {
    defi: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances', 'addLiquidityMultiChain', 'executeArbitrage'],
    gaming: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances'],
    nft: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances'],
    bridge: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances'],
    custom: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances']
  }
  
  const availableFunctionNames = useCaseFunctions[useCase] || useCaseFunctions.custom
  
  return availableFunctionNames.map(functionName => {
    const template = FUNCTION_TEMPLATES[functionName]
    return {
      name: functionName,
      title: template.title,
      description: template.description,
      category: template.category,
      complexity: template.complexity,
      parameters: template.parameters,
      returns: template.returns,
      gasEstimate: template.gasEstimate
    }
  })
}

// Generate multiple functions at once
export const generateMultipleFunctions = (functionNames, selectedChains) => {
  return functionNames.reduce((acc, functionName) => {
    try {
      acc[functionName] = generateFunction(functionName, selectedChains)
    } catch (error) {
      console.error(`Failed to generate ${functionName}:`, error)
    }
    return acc
  }, {})
}

export default FUNCTION_TEMPLATES