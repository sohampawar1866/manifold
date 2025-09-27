// Template for generating real functions with NetworkManager singleton
import NetworkManager from './networkManager';

const networkManager = NetworkManager.getInstance();

export const CrossChainTransfer = async (fromChain, toChain, amount) => {
  try {
    const result = await networkManager.crossChainTransfer(fromChain, toChain, amount);
    return result;
  } catch (error) {
    console.error('Error in CrossChainTransfer:', error);
    throw error;
  }
};

export const GetChainBalances = async () => {
  try {
    const balances = await networkManager.getChainBalances();
    return balances;
  } catch (error) {
    console.error('Error in GetChainBalances:', error);
    throw error;
  }
};

export const MultiChainDeploy = async (chains, contractData) => {
  try {
    const deployResults = await networkManager.multiChainDeploy(chains, contractData);
    return deployResults;
  } catch (error) {
    console.error('Error in MultiChainDeploy:', error);
    throw error;
  }
};