// Default Manifold Configuration
// This file is replaced when you run the setup wizard

export const manifoldConfig = {
  useCase: 'defi',
  useCaseName: 'DeFi Protocol',
  selectedChains: [20, 21, 22],
  selectedFunctions: ['crossChainTransfer', 'multiChainDeploy', 'getChainBalances', 'addLiquidityMultiChain'],
  functionSelectionMode: 'recommended',
  chainCount: 3,
  generatedAt: new Date().toISOString(),
  isDefault: true
}

export default manifoldConfig