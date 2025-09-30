const { ethers } = require('ethers');

class NetworkManager {
  constructor() {
    this.providers = new Map();
    this.contracts = new Map();
  }

  async getProvider(chainId) {
    if (!this.providers.has(chainId)) {
      // Use the appropriate RPC URL for the chain
      const rpcUrl = `https://rpc-${chainId}.kadena.io`; // Replace with actual RPC endpoints
      this.providers.set(chainId, new ethers.JsonRpcProvider(rpcUrl));
    }
    return this.providers.get(chainId);
  }

  async getContract(address, abi, chainId) {
    const key = `${chainId}-${address}`;
    if (!this.contracts.has(key)) {
      const provider = await this.getProvider(chainId);
      this.contracts.set(key, new ethers.Contract(address, abi, provider));
    }
    return this.contracts.get(key);
  }

  async executeTransaction(functionName, parameters = {}) {
    try {
      // Get the appropriate chain provider
      const chainId = parameters.chainId || 20; // Default to chain 20
      const provider = await this.getProvider(chainId);

      // Get contract instance if needed
      let contract;
      if (parameters.contractAddress && parameters.abi) {
        contract = await this.getContract(
          parameters.contractAddress,
          parameters.abi,
          chainId
        );
      }

      // Execute the transaction based on function name
      let result;
      switch (functionName) {
        case 'getBalance':
          result = await provider.getBalance(parameters.address);
          break;
        case 'sendTransaction':
          if (!parameters.to || !parameters.value) {
            throw new Error('Missing required parameters: to, value');
          }
          const tx = await provider.sendTransaction({
            to: parameters.to,
            value: ethers.parseEther(parameters.value.toString())
          });
          result = await tx.wait();
          break;
        case 'contractCall':
          if (!contract || !parameters.method) {
            throw new Error('Missing required parameters: contract, method');
          }
          result = await contract[parameters.method](...(parameters.args || []));
          break;
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }

      return {
        success: true,
        data: result,
        chainId
      };
    } catch (error) {
      console.error(`Transaction execution failed:`, error);
      return {
        success: false,
        error: error.message,
        chainId: parameters.chainId
      };
    }
  }

  // Helper methods for common operations
  async estimateGas(tx) {
    try {
      const provider = await this.getProvider(tx.chainId);
      return await provider.estimateGas(tx);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  }

  async getGasPrice(chainId) {
    try {
      const provider = await this.getProvider(chainId);
      return await provider.getGasPrice();
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw error;
    }
  }

  async getBlockNumber(chainId) {
    try {
      const provider = await this.getProvider(chainId);
      return await provider.getBlockNumber();
    } catch (error) {
      console.error('Failed to get block number:', error);
      throw error;
    }
  }
}

module.exports = NetworkManager;