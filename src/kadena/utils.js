import { kadenaClient } from './client.js';
import { ethers } from 'ethers';

/**
 * Advanced Multi-Chain Utility Functions
 * 
 * Ready-made functions for complex operations that developers can call
 * with simple parameters like chainId, amount, etc.
 */

/**
 * Cross-Chain Token Transfer
 * Transfer tokens from one Kadena chain to another
 * 
 * @param {number} fromChain - Source chain number (20-24)
 * @param {number} toChain - Destination chain number (20-24)  
 * @param {string} amount - Amount to transfer in KDA
 * @parameter {string} recipientAddress - Recipient address on destination chain
 */
export async function crossChainTransfer(fromChain, toChain, amount, recipientAddress) {
  console.log(`🔄 Cross-chain transfer: ${amount} KDA from Chain ${fromChain} to Chain ${toChain}`);
  
  try {
    // Step 1: Lock tokens on source chain
    const lockTx = await kadenaClient.sendTransaction(
      fromChain,
      '0x1234567890123456789012345678901234567890', // Bridge contract address
      amount,
      '0x' + Buffer.from(`lock:${toChain}:${recipientAddress}`).toString('hex')
    );
    
    console.log(`✅ Tokens locked on Chain ${fromChain}:`, lockTx.hash);
    
    // Step 2: Wait for confirmation
    await lockTx.wait();
    
    // Step 3: Mint tokens on destination chain
    const mintTx = await kadenaClient.sendTransaction(
      toChain,
      '0x1234567890123456789012345678901234567890', // Bridge contract address  
      '0',
      '0x' + Buffer.from(`mint:${recipientAddress}:${amount}`).toString('hex')
    );
    
    console.log(`✅ Tokens minted on Chain ${toChain}:`, mintTx.hash);
    
    return {
      success: true,
      fromChain,
      toChain,
      amount,
      lockTx: lockTx.hash,
      mintTx: mintTx.hash
    };
    
  } catch (error) {
    console.error('❌ Cross-chain transfer failed:', error);
    throw error;
  }
}

/**
 * Multi-Chain Arbitrage
 * Find price differences across chains and execute arbitrage
 * 
 * @param {string} tokenAddress - Token contract address
 * @param {number} amount - Amount to arbitrage
 */
export async function executeArbitrage(tokenAddress, amount) {
  console.log(`💹 Executing arbitrage for ${amount} tokens across all chains`);
  
  try {
    // Step 1: Get prices from all chains simultaneously
    const pricePromises = [20, 21, 22, 23, 24].map(async (chainNumber) => {
      const price = await getTokenPrice(chainNumber, tokenAddress);
      return { chainNumber, price };
    });
    
    const prices = await Promise.all(pricePromises);
    console.log('📊 Prices across chains:', prices);
    
    // Step 2: Find best buy and sell chains
    const sortedPrices = prices.sort((a, b) => a.price - b.price);
    const buyChain = sortedPrices[0]; // Lowest price
    const sellChain = sortedPrices[sortedPrices.length - 1]; // Highest price
    
    const profit = (sellChain.price - buyChain.price) * amount;
    console.log(`💰 Potential profit: ${profit} KDA`);
    
    if (profit > 0.1) { // Only execute if profit > 0.1 KDA
      // Step 3: Buy on cheap chain
      const buyTx = await buyTokens(buyChain.chainNumber, tokenAddress, amount);
      
      // Step 4: Transfer to expensive chain
      await crossChainTransfer(buyChain.chainNumber, sellChain.chainNumber, amount, await kadenaClient.signers[sellChain.chainNumber].getAddress());
      
      // Step 5: Sell on expensive chain
      const sellTx = await sellTokens(sellChain.chainNumber, tokenAddress, amount);
      
      return {
        success: true,
        profit,
        buyChain: buyChain.chainNumber,
        sellChain: sellChain.chainNumber,
        buyTx: buyTx.hash,
        sellTx: sellTx.hash
      };
    } else {
      console.log('💡 No profitable arbitrage opportunity found');
      return { success: false, reason: 'No profitable opportunity' };
    }
    
  } catch (error) {
    console.error('❌ Arbitrage execution failed:', error);
    throw error;
  }
}

/**
 * Multi-Chain Liquidity Provision
 * Add liquidity to DEX pools across multiple chains
 * 
 * @param {Array} chainIds - Array of chain numbers to add liquidity to
 * @param {string} tokenA - First token address
 * @param {string} tokenB - Second token address
 * @param {string} amountA - Amount of token A per chain
 * @param {string} amountB - Amount of token B per chain
 */
export async function addLiquidityMultiChain(chainIds, tokenA, tokenB, amountA, amountB) {
  console.log(`🏊 Adding liquidity across ${chainIds.length} chains`);
  
  try {
    // Add liquidity to all specified chains in parallel
    const liquidityPromises = chainIds.map(async (chainId) => {
      console.log(`💧 Adding liquidity on Chain ${chainId}`);
      
      // Call DEX contract to add liquidity
      const tx = await kadenaClient.sendTransaction(
        chainId,
        '0xDEXContractAddress', // DEX contract address
        '0',
        encodeFunctionCall('addLiquidity', [tokenA, tokenB, amountA, amountB])
      );
      
      await tx.wait();
      
      return {
        chainId,
        txHash: tx.hash,
        tokenA,
        tokenB,
        amountA,
        amountB
      };
    });
    
    const results = await Promise.all(liquidityPromises);
    
    console.log('✅ Liquidity added to all chains:', results);
    
    return {
      success: true,
      results,
      totalChains: chainIds.length
    };
    
  } catch (error) {
    console.error('❌ Multi-chain liquidity provision failed:', error);
    throw error;
  }
}

/**
 * Cross-Chain Flash Loan
 * Execute flash loan across multiple chains
 * 
 * @param {number} sourceChain - Chain to borrow from
 * @param {Array} targetChains - Chains to use borrowed funds on
 * @param {string} amount - Amount to borrow
 * @param {Function} strategy - Custom strategy function to execute
 */
export async function executeFlashLoan(sourceChain, targetChains, amount, strategy) {
  console.log(`⚡ Executing flash loan: ${amount} KDA from Chain ${sourceChain}`);
  
  try {
    // Step 1: Initiate flash loan on source chain
    const flashLoanTx = await kadenaClient.sendTransaction(
      sourceChain,
      '0xFlashLoanContract',
      '0',
      encodeFunctionCall('flashLoan', [amount])
    );
    
    console.log(`💸 Flash loan initiated on Chain ${sourceChain}`);
    
    // Step 2: Execute strategy across target chains
    const strategyResults = await strategy(targetChains, amount);
    
    // Step 3: Repay flash loan with profit
    const repayTx = await kadenaClient.sendTransaction(
      sourceChain,
      '0xFlashLoanContract',
      ethers.parseEther((parseFloat(amount) * 1.001).toString()), // Amount + 0.1% fee
      encodeFunctionCall('repayFlashLoan', [])
    );
    
    console.log(`✅ Flash loan repaid on Chain ${sourceChain}`);
    
    return {
      success: true,
      sourceChain,
      targetChains,
      amount,
      flashLoanTx: flashLoanTx.hash,
      repayTx: repayTx.hash,
      strategyResults
    };
    
  } catch (error) {
    console.error('❌ Flash loan execution failed:', error);
    throw error;
  }
}

/**
 * Multi-Chain Portfolio Rebalancing
 * Automatically rebalance portfolio across all chains
 * 
 * @param {Object} targetAllocation - Desired allocation per chain (%)
 * @param {string} totalAmount - Total portfolio amount
 */
export async function rebalancePortfolio(targetAllocation, totalAmount) {
  console.log(`⚖️ Rebalancing portfolio across ${Object.keys(targetAllocation).length} chains`);
  
  try {
    // Step 1: Get current balances
    const currentBalances = await kadenaClient.getAllBalances(
      await kadenaClient.signers[20].getAddress()
    );
    
    // Step 2: Calculate required transfers
    const transfers = [];
    
    for (const [chainId, targetPercent] of Object.entries(targetAllocation)) {
      const targetAmount = (parseFloat(totalAmount) * targetPercent / 100).toString();
      const currentBalance = currentBalances.find(b => b.chainNumber === parseInt(chainId));
      const currentAmount = currentBalance ? currentBalance.balance : '0';
      
      const difference = parseFloat(targetAmount) - parseFloat(currentAmount);
      
      if (Math.abs(difference) > 0.01) { // Only transfer if difference > 0.01 KDA
        transfers.push({
          chainId: parseInt(chainId),
          targetAmount,
          currentAmount,
          difference
        });
      }
    }
    
    // Step 3: Execute transfers
    const transferPromises = transfers.map(async (transfer) => {
      if (transfer.difference > 0) {
        // Need to transfer TO this chain
        const sourceChain = findChainWithSurplus(transfers);
        return await crossChainTransfer(sourceChain, transfer.chainId, Math.abs(transfer.difference).toString(), await kadenaClient.signers[transfer.chainId].getAddress());
      }
    });
    
    const results = await Promise.all(transferPromises.filter(Boolean));
    
    console.log('✅ Portfolio rebalanced successfully');
    
    return {
      success: true,
      transfers: results,
      newAllocation: targetAllocation
    };
    
  } catch (error) {
    console.error('❌ Portfolio rebalancing failed:', error);
    throw error;
  }
}

// Helper functions
async function getTokenPrice(chainId, tokenAddress) {
  // Mock price fetching - in real implementation, query DEX contract
  return Math.random() * 100 + 50; // Random price between 50-150
}

async function buyTokens(chainId, tokenAddress, amount) {
  return await kadenaClient.sendTransaction(
    chainId,
    tokenAddress,
    ethers.parseEther(amount),
    encodeFunctionCall('buy', [amount])
  );
}

async function sellTokens(chainId, tokenAddress, amount) {
  return await kadenaClient.sendTransaction(
    chainId,
    tokenAddress,
    '0',
    encodeFunctionCall('sell', [amount])
  );
}

function encodeFunctionCall(functionName, params) {
  // Mock function encoding - in real implementation, use ethers.js ABI encoding
  return '0x' + Buffer.from(`${functionName}:${params.join(',')}`).toString('hex');
}

function findChainWithSurplus(transfers) {
  return transfers.find(t => t.difference < 0)?.chainId || 20;
}