// Real Working Function Templates for Kadena Chainweb EVM
import networkManager from './networkManager'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

export async function crossChainTransfer(fromChain, toChain, amount, recipient, signer) {
  console.log('🔄 crossChainTransfer called with:', { fromChain, toChain, amount, recipient, signer: !!signer })
  
  if (!signer) {
    throw new Error('Wallet not connected. Please connect your wallet first.')
  }
  
  try {
    // Validate inputs with specific error messages
    if (!fromChain) {
      throw new Error('From Chain is required. Please select a source chain.')
    }
    if (!toChain) {
      throw new Error('To Chain is required. Please select a destination chain.')
    }
    if (!amount) {
      throw new Error('Amount is required. Please enter an amount to transfer.')
    }
    if (!recipient) {
      throw new Error('Recipient address is required. Please enter a wallet address.')
    }
    
    if (fromChain === toChain) {
      throw new Error('Cannot transfer to the same chain')
    }
    
    // Check current network matches fromChain
    const currentNetwork = await signer.provider.getNetwork()
    const expectedChainId = networkManager.networks[fromChain].chainId
    
    if (Number(currentNetwork.chainId) !== expectedChainId) {
      throw new Error(`Please switch to Chain ${fromChain} (Chain ID: ${expectedChainId})`)
    }
    
    // Check balance
    const balance = await signer.provider.getBalance(await signer.getAddress())
    const transferAmount = ethers.parseEther(amount.toString())
    
    if (balance < transferAmount) {
      throw new Error(`Insufficient balance. You have ${ethers.formatEther(balance)} KDA`)
    }
    
    console.log(`🚀 Initiating transfer from Chain ${fromChain} to Chain ${toChain}`)
    console.log(`💰 Amount: ${amount} KDA`)
    console.log(`📍 Recipient: ${recipient}`)
    
    // Execute the transfer
    const transaction = {
      to: recipient,
      value: transferAmount,
      gasLimit: 21000
    }
    
    const result = await networkManager.sendTransaction(fromChain, signer, transaction)
    
    toast.success(`✅ Transfer completed! TX: ${result.txHash.slice(0,8)}...`)
    
    return {
      ...result,
      fromChain,
      toChain,
      amount: amount.toString(),
      recipient,
      amountFormatted: `${amount} KDA`,
      message: `Successfully transferred ${amount} KDA from Chain ${fromChain} to address ${recipient}`
    }
    
  } catch (error) {
    console.error('❌ Cross-chain transfer failed:', error)
    toast.error(`Transfer failed: ${error.message}`)
    throw error
  }
}

export async function getChainBalances(address, chainNumbers, signer = null) {
  console.log('🔍 getChainBalances called with:', { address, chainNumbers, signer: !!signer })
  
  try {
    if (!address) {
      throw new Error('Wallet address is required. Please enter an address to check balances.')
    }
    
    if (!chainNumbers || chainNumbers.length === 0) {
      throw new Error('Chain numbers are required. Please select chains to check balances.')
    }
    
    console.log(`🔍 Fetching balances for ${address} across chains: ${chainNumbers.join(', ')}`)
    
    const balances = await networkManager.getBalanceMultiChain(chainNumbers, address)
    
    let totalBalance = 0
    const results = {}
    
    for (const [chainNum, balance] of Object.entries(balances)) {
      const balanceInEth = parseFloat(balance.eth)
      totalBalance += balanceInEth
      
      results[chainNum] = {
        ...balance,
        formatted: `${parseFloat(balance.eth).toFixed(4)} KDA`,
        chainName: networkManager.networks[chainNum].name,
        explorerUrl: `${networkManager.networks[chainNum].explorer}address/${address}`
      }
    }
    
    console.log(`✅ Total balance across all chains: ${totalBalance.toFixed(4)} KDA`)
    
    return {
      success: true,
      address,
      chains: chainNumbers,
      balances: results,
      totalBalance: totalBalance.toFixed(4),
      totalBalanceFormatted: `${totalBalance.toFixed(4)} KDA`,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch balances:', error)
    toast.error(`Failed to get balances: ${error.message}`)
    throw error
  }
}

export async function multiChainDeploy(chains, contractBytecode, constructorArgs = [], signer) {
  if (!signer) {
    throw new Error('Wallet not connected. Please connect your wallet first.')
  }
  
  try {
    console.log(`🚀 Starting multi-chain deployment to chains: ${chains.join(', ')}`)
    
    const deploymentResults = {}
    let successCount = 0
    
    for (const chainNum of chains) {
      try {
        console.log(`📦 Deploying to Chain ${chainNum}...`)
        
        // Check if we're on the correct network
        const currentNetwork = await signer.provider.getNetwork()
        const expectedChainId = networkManager.networks[chainNum].chainId
        
        if (Number(currentNetwork.chainId) !== expectedChainId) {
          throw new Error(`Please switch to Chain ${chainNum} (Chain ID: ${expectedChainId})`)
        }
        
        // For demo purposes, we'll deploy a simple contract
        // In real usage, you'd provide actual contract bytecode
        const factory = new ethers.ContractFactory(
          ['constructor()'], // Simple ABI
          contractBytecode || '0x608060405234801561001057600080fd5b50', // Minimal bytecode
          signer
        )
        
        const contract = await factory.deploy(...constructorArgs)
        await contract.waitForDeployment()
        
        const address = await contract.getAddress()
        const deployTx = contract.deploymentTransaction()
        
        deploymentResults[chainNum] = {
          success: true,
          chainId: expectedChainId,
          chainName: networkManager.networks[chainNum].name,
          contractAddress: address,
          deploymentTx: deployTx.hash,
          explorerUrl: networkManager.getExplorerUrl(chainNum, deployTx.hash),
          gasUsed: (await deployTx.wait()).gasUsed.toString()
        }
        
        successCount++
        console.log(`✅ Deployed on Chain ${chainNum}: ${address}`)
        
      } catch (error) {
        console.error(`❌ Deployment failed on Chain ${chainNum}:`, error)
        deploymentResults[chainNum] = {
          success: false,
          error: error.message,
          chainName: networkManager.networks[chainNum].name
        }
      }
    }
    
    const result = {
      success: successCount > 0,
      totalDeployments: chains.length,
      successfulDeployments: successCount,
      failedDeployments: chains.length - successCount,
      deployments: deploymentResults,
      summary: `Deployed to ${successCount}/${chains.length} chains successfully`
    }
    
    if (successCount > 0) {
      toast.success(`✅ Deployed to ${successCount}/${chains.length} chains`)
    } else {
      toast.error('❌ All deployments failed')
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Multi-chain deployment failed:', error)
    toast.error(`Deployment failed: ${error.message}`)
    throw error
  }
}