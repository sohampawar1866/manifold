const { ethers } = require('ethers');
const NetworkManager = require('./networkManager.cjs');

async function crossChainTransfer(fromChain, toChain, amount, recipient, signer) {
    try {
        const networkManager = new NetworkManager();
        
        // Verify chains are valid
        if (fromChain === toChain) {
            throw new Error('Source and destination chains must be different');
        }

        // Convert amount to Wei
        const valueInWei = ethers.parseEther(amount.toString());

        // Get bridge contract address for the source chain
        const bridgeAddress = process.env.BRIDGE_CONTRACT_20 || '0x...'; // Should be configured in .env
        
        // Bridge contract ABI (simplified version)
        const bridgeABI = [
            "function transfer(uint256 toChain, address recipient) public payable",
            "function getBalance(address account) public view returns (uint256)"
        ];

        // Get contract instance
        const bridgeContract = new ethers.Contract(bridgeAddress, bridgeABI, signer);

        // Check if user has sufficient balance
        const balance = await networkManager.getProvider(fromChain).getBalance(await signer.getAddress());
        if (balance.lt(valueInWei)) {
            throw new Error('Insufficient balance for transfer');
        }

        // Execute the cross-chain transfer
        const tx = await bridgeContract.transfer(toChain, recipient, {
            value: valueInWei
        });

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        return {
            success: true,
            transactionHash: receipt.hash,
            fromChain,
            toChain,
            amount,
            recipient
        };

    } catch (error) {
        console.error('Cross-chain transfer failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function getChainBalances(address, chains, signer) {
    try {
        const networkManager = new NetworkManager();
        const balances = {};

        // Get balance for each chain
        for (const chainId of chains) {
            const provider = await networkManager.getProvider(chainId);
            const balance = await provider.getBalance(address);
            balances[chainId] = ethers.formatEther(balance);
        }

        return {
            success: true,
            balances,
            address
        };

    } catch (error) {
        console.error('Failed to get chain balances:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function multiChainDeploy(chains, contractBytecode, constructorArgs, signer) {
    try {
        const networkManager = new NetworkManager();
        const deployments = {};

        // Deploy to each chain
        for (const chainId of chains) {
            // Create contract factory
            const factory = new ethers.ContractFactory([], contractBytecode, signer);
            
            // Estimate gas for deployment
            const gasEstimate = await factory.getDeployTransaction(...constructorArgs)
                .then(tx => networkManager.estimateGas({ ...tx, chainId }));

            // Deploy with appropriate gas settings
            const contract = await factory.deploy(...constructorArgs, {
                gasLimit: gasEstimate.mul(12).div(10) // Add 20% buffer
            });

            // Wait for deployment
            await contract.waitForDeployment();

            deployments[chainId] = {
                address: await contract.getAddress(),
                transactionHash: contract.deploymentTransaction().hash
            };
        }

        return {
            success: true,
            deployments
        };

    } catch (error) {
        console.error('Multi-chain deployment failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    crossChainTransfer,
    getChainBalances,
    multiChainDeploy
};