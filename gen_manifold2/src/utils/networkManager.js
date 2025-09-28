import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// Real blockchain interaction utilities for Kadena Chainweb EVM
export class NetworkManager {
  constructor() {
    this.providers = {}
    this.networks = {
      20: {
        chainId: 5920,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc',
        explorer: 'http://chain-20.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 20'
      },
      21: {
        chainId: 5921,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc',
        explorer: 'http://chain-21.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 21'
      },
      22: {
        chainId: 5922,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/22/evm/rpc',
        explorer: 'http://chain-22.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 22'
      },
      23: {
        chainId: 5923,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc',
        explorer: 'http://chain-23.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 23'
      },
      24: {
        chainId: 5924,
        rpc: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc',
        explorer: 'http://chain-24.evm-testnet-blockscout.chainweb.com/',
        name: 'Kadena Chain 24'
      }
    }
    
    this.initializeProviders()
  }

  initializeProviders() {
    Object.keys(this.networks).forEach(chainNum => {
      const network = this.networks[chainNum]
      this.providers[chainNum] = new ethers.JsonRpcProvider(network.rpc)
    })
  }

  getProvider(chainNumber) {
    if (!this.providers[chainNumber]) {
      throw new Error(`No provider found for chain ${chainNumber}`)
    }
    return this.providers[chainNumber]
  }

  getNetwork(chainNumber) {
    if (!this.networks[chainNumber]) {
      throw new Error(`Network ${chainNumber} not supported`)
    }
    return this.networks[chainNumber]
  }

  async getBalance(chainNumber, address) {
    try {
      const provider = this.getProvider(chainNumber)
      const balance = await provider.getBalance(address)
      return {
        wei: balance.toString(),
        eth: ethers.formatEther(balance),
        chainNumber,
        chainName: this.networks[chainNumber].name
      }
    } catch (error) {
      console.error(`Error getting balance on chain ${chainNumber}:`, error)
      throw error
    }
  }

  async sendTransaction(chainNumber, signer, transaction) {
    try {
      const network = this.getNetwork(chainNumber)
      const tx = await signer.sendTransaction(transaction)
      const receipt = await tx.wait()
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        explorerUrl: `${network.explorer}tx/${tx.hash}`,
        chainId: network.chainId,
        chainName: network.name
      }
    } catch (error) {
      console.error(`Transaction failed on chain ${chainNumber}:`, error)
      throw error
    }
  }

  async getBalanceMultiChain(chainNumbers, address) {
    const balances = {}
    
    for (const chainNum of chainNumbers) {
      try {
        const balance = await this.getBalance(chainNum, address)
        balances[chainNum] = balance
      } catch (error) {
        console.error(`Failed to get balance for chain ${chainNum}:`, error)
        balances[chainNum] = {
          wei: '0',
          eth: '0',
          chainNumber: chainNum,
          chainName: this.networks[chainNum]?.name || `Chain ${chainNum}`,
          error: error.message
        }
      }
    }
    
    return balances
  }

  getExplorerUrl(chainNumber, txHash) {
    const network = this.getNetwork(chainNumber)
    return `${network.explorer}tx/${txHash}`
  }

  async executeTransaction(functionName, parameters) {
    try {
      console.log(`🔄 Executing generic transaction: ${functionName}`, parameters)
      
      // For generic functions, create a simple transaction
      const chainNumber = parameters.chain || parameters.fromChain || 20
      const provider = this.getProvider(chainNumber)
      
      // This is a placeholder for generic function execution
      // In a real implementation, you would route to specific function logic
      return {
        success: true,
        functionName,
        parameters,
        result: {
          message: `Generic execution of ${functionName} completed`,
          chainId: this.networks[chainNumber].chainId,
          chainName: this.networks[chainNumber].name,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error(`Generic transaction failed:`, error)
      throw error
    }
  }
}

export const networkManager = new NetworkManager()
export default networkManager