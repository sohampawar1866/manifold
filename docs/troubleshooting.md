# 🔧 Troubleshooting Guide

Having issues with your Kadena multi-chain deployment? This guide covers common problems and solutions.

## 🚨 Common Issues

### Deployment Issues

#### "No wallet configured" Error

**Problem:** Getting wallet configuration errors during deployment.

**Solution:**
1. Create a `.env` file in your project root
2. Add either:
   ```bash
   PRIVATE_KEY=your_private_key_here
   # OR
   MNEMONIC=your_mnemonic_phrase_here
   ```
3. Make sure the `.env` file is in the same directory as `package.json`

#### Contract Deployment Fails

**Problem:** Contracts fail to deploy to one or more chains.

**Solutions:**

1. **Check Chain Connectivity:**
   ```bash
   npm run test-deployment
   ```

2. **Increase Gas Limit:** Edit `deployment.config.json`:
   ```json
   {
     "deployment": {
       "gasSettings": {
         "gasLimit": 8000000,
         "gasPrice": "30000000000"
       }
     }
   }
   ```

3. **Check Wallet Balance:** Ensure you have KDA on all chains you're deploying to.

#### "Chain X is slow or unavailable"

**Problem:** Some Kadena testnet chains may be slow or temporarily unavailable.

**Solutions:**

1. **Deploy to Available Chains Only:** Edit `deployment.config.json`:
   ```json
   {
     "deployment": {
       "deployToChains": [20, 21, 22]
     }
   }
   ```

2. **Retry Deployment:** Chain issues are usually temporary:
   ```bash
   npm run deploy
   ```

### Frontend Issues

#### Wallet Connection Problems

**Problem:** MetaMask doesn't connect or shows wrong network.

**Solutions:**

1. **Add Kadena Networks to MetaMask:**
   - Network Name: `Kadena Chain 20`
   - RPC URL: `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc`
   - Chain ID: `5920`
   - Currency Symbol: `KDA`

2. **Reset MetaMask Connection:**
   - Go to MetaMask → Settings → Advanced → Reset Account

3. **Use the Auto-Add Feature:** Our template can auto-add networks:
   ```javascript
   // This happens automatically when you connect
   await addKadenaNetworksToWallet();
   ```

#### "Contract not found" Errors

**Problem:** Frontend can't find deployed contracts.

**Solutions:**

1. **Check Deployment Status:**
   ```bash
   npm run test-deployment
   ```

2. **Verify Configuration File:**
   Check `src/config/deployed-contracts.json` exists and has correct addresses.

3. **Redeploy if Needed:**
   ```bash
   npm run deploy
   ```

### Development Issues

#### Compilation Errors

**Problem:** Smart contracts don't compile.

**Solutions:**

1. **Check Solidity Version:** Ensure your contracts use compatible pragma:
   ```solidity
   pragma solidity ^0.8.0;
   ```

2. **Install Dependencies:** If using OpenZeppelin or other libraries:
   ```bash
   npm install @openzeppelin/contracts
   ```

3. **Fix Syntax Errors:** Run compilation to see detailed errors:
   ```bash
   npm run compile-contracts
   ```

#### Cross-Chain Transfer Issues

**Problem:** Cross-chain transfers fail or hang.

**Solutions:**

1. **Check Both Chains Are Working:**
   ```bash
   npm run test-deployment
   ```

2. **Verify Token Balances:** Ensure you have tokens on the source chain.

3. **Check Gas Settings:** Cross-chain operations need more gas:
   ```javascript
   const result = await crossChainTransfer(20, 21, '1.0', recipient, {
     gasLimit: 500000
   });
   ```

## 🔍 Debugging Tools

### Check Deployment Status

```bash
# Full deployment test
npm run test-deployment

# Check specific contract
node -e "
const fs = require('fs');
const contracts = JSON.parse(fs.readFileSync('src/config/deployed-contracts.json'));
console.log(contracts);
"
```

### Verify Chain Connectivity

```bash
# Test all configured chains
node -e "
import { KADENA_CHAINS } from './src/kadena/config.js';
// Test connectivity code here
"
```

### Check Wallet Balance

```bash
# Check balance on all chains
node scripts/check-balances.js
```

## 📊 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `insufficient funds` | Not enough KDA for gas | Get testnet KDA from faucet |
| `nonce too low` | Transaction nonce issues | Reset MetaMask account |
| `execution reverted` | Contract execution failed | Check contract logic and parameters |
| `network not found` | Wrong chain configuration | Verify chain ID and RPC URL |
| `timeout` | Network or RPC issues | Retry or use different RPC |

## 🆘 Getting Help

### Before Asking for Help

1. **Run the test suite:**
   ```bash
   npm run test-deployment
   ```

2. **Check the logs:** Look for specific error messages in the console.

3. **Verify your setup:** Ensure all prerequisites are met.

### Where to Get Help

1. **GitHub Issues:** [Report bugs and issues](https://github.com/sohampawar1866/manifold/issues)
2. **Kadena Discord:** [Join the community](https://discord.gg/kadena)
3. **Documentation:** Check other guides in this `docs/` folder

### When Reporting Issues

Please include:

1. **Error message:** Full error text
2. **Environment:** OS, Node.js version, npm version
3. **Configuration:** Your `deployment.config.json` (without private keys)
4. **Steps to reproduce:** What you did before the error occurred
5. **Test results:** Output from `npm run test-deployment`

## 🔄 Reset Everything

If nothing works, start fresh:

```bash
# 1. Clean up generated files
rm -rf src/config/deployed-contracts.json
rm -rf src/contracts/compiled/
rm -rf test-results.json

# 2. Reset configuration
rm deployment.config.json

# 3. Run setup again
npm run setup

# 4. Deploy fresh
npm run deploy
```

---

**Still having issues?** Check our [FAQ](./faq.md) or ask in the [community Discord](https://discord.gg/kadena).