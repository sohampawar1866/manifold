import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// Kadena Chainweb EVM Networks
const KADENA_NETWORKS = {
  20: {
    chainId: '0x1720', // 5920 in hex
    chainName: 'Kadena Chainweb EVM Chain 20',
    rpcUrls: ['https://erpc.testnet.chainweb.com/chain-20'],
    wsRpcUrls: ['wss://erpc.testnet.chainweb.com/chain-20'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['https://explorer.testnet.chainweb.com/chain-20']
  },
  21: {
    chainId: '0x1721', // 5921 in hex
    chainName: 'Kadena Chainweb EVM Chain 21',
    rpcUrls: ['https://erpc.testnet.chainweb.com/chain-21'],
    wsRpcUrls: ['wss://erpc.testnet.chainweb.com/chain-21'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['https://explorer.testnet.chainweb.com/chain-21']
  },
  22: {
    chainId: '0x1722', // 5922 in hex
    chainName: 'Kadena Chainweb EVM Chain 22',
    rpcUrls: ['https://erpc.testnet.chainweb.com/chain-22'],
    wsRpcUrls: ['wss://erpc.testnet.chainweb.com/chain-22'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['https://explorer.testnet.chainweb.com/chain-22']
  },
  23: {
    chainId: '0x1723', // 5923 in hex
    chainName: 'Kadena Chainweb EVM Chain 23',
    rpcUrls: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/23/evm/rpc'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['http://chain-23.evm-testnet-blockscout.chainweb.com/']
  },
  24: {
    chainId: '0x1724', // 5924 in hex
    chainName: 'Kadena Chainweb EVM Chain 24',
    rpcUrls: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/24/evm/rpc'],
    nativeCurrency: { name: 'KDA', symbol: 'KDA', decimals: 18 },
    blockExplorerUrls: ['http://chain-24.evm-testnet-blockscout.chainweb.com/']
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState('0')

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  // Update balance when account or chain changes
  useEffect(() => {
    if (account && provider) {
      updateBalance()
    }
  }, [account, provider, chainId])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const network = await provider.getNetwork()
          
          setAccount(accounts[0])
          setProvider(provider)
          setSigner(signer)
          setChainId(Number(network.chainId))
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not found! Please install MetaMask.')
      return false
    }

    setIsConnecting(true)
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()
      
      setAccount(accounts[0])
      setProvider(provider)
      setSigner(signer)
      setChainId(Number(network.chainId))
      
      toast.success('Wallet connected successfully!')
      return true
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setBalance('0')
    toast.success('Wallet disconnected')
  }

  const switchToChain = async (chainNumber) => {
    if (!window.ethereum) {
      toast.error('MetaMask not found!')
      return false
    }

    const network = KADENA_NETWORKS[chainNumber]
    if (!network) {
      toast.error(`Unsupported chain: ${chainNumber}`)
      return false
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      })
      
      toast.success(`Switched to ${network.chainName}`)
      return true
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          })
          
          toast.success(`Added and switched to ${network.chainName}`)
          return true
        } catch (addError) {
          console.error('Error adding network:', addError)
          toast.error('Failed to add network')
          return false
        }
      } else {
        console.error('Error switching network:', switchError)
        toast.error('Failed to switch network')
        return false
      }
    }
  }

  const updateBalance = async () => {
    if (!provider || !account) return
    
    try {
      const balance = await provider.getBalance(account)
      setBalance(ethers.formatEther(balance))
    } catch (error) {
      console.error('Error updating balance:', error)
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(Number(chainId))
    // Reload the page to reset state
    window.location.reload()
  }

  const getNetworkName = () => {
    const chain = Object.values(KADENA_NETWORKS).find(
      network => parseInt(network.chainId, 16) === chainId
    )
    return chain ? chain.chainName : 'Unknown Network'
  }

  const isKadenaNetwork = () => {
    return Object.values(KADENA_NETWORKS).some(
      network => parseInt(network.chainId, 16) === chainId
    )
  }

  return {
    // State
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnecting,
    isConnected: !!account,
    isKadenaNetwork: isKadenaNetwork(),
    networkName: getNetworkName(),
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToChain,
    updateBalance,
    
    // Network info
    supportedNetworks: KADENA_NETWORKS
  }
}

export default useWallet