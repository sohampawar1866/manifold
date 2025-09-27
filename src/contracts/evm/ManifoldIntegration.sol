// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

// Import our DeFi contracts
import "./ManifoldDEX.sol";
import "./ManifoldLending.sol";
import "./ManifoldStaking.sol";
import "./ManifoldYieldFarming.sol";

/**
 * @title ManifoldIntegration
 * @dev Central integration hub for all Manifold DeFi protocols on Chainweb EVM
 * Features: Cross-protocol interactions, automated strategies, unified management
 */
contract ManifoldIntegration is ReentrancyGuard, Ownable {
    using Math for uint256;
    
    // Protocol contract instances
    ManifoldDEX public immutable dex;
    ManifoldLending public immutable lending;
    ManifoldStaking public immutable staking;
    ManifoldYieldFarming public immutable yieldFarming;
    
    struct IntegratedPosition {
        uint256 dexLiquidity;         // LP tokens in DEX
        uint256 lendingSupply;        // Supplied to lending
        uint256 lendingBorrow;        // Borrowed from lending
        uint256 stakingAmount;        // Staked tokens
        uint256 farmingAmount;        // LP tokens in farming
        uint256 totalValue;           // Total USD value
        uint256 lastUpdate;           // Last update timestamp
    }
    
    struct Strategy {
        string name;                  // Strategy name
        bool active;                  // Strategy status
        uint256 targetAPY;            // Target APY for strategy
        uint256 maxRisk;              // Maximum risk level (0-100)
        uint256 allocation;           // Asset allocation percentage
        address[] requiredTokens;     // Required tokens for strategy
        uint256[] targetWeights;      // Target weights for tokens
    }
    
    struct AutomationConfig {
        bool autoRebalance;           // Auto rebalance positions
        bool autoCompound;            // Auto compound rewards
        bool autoHarvest;             // Auto harvest rewards
        uint256 rebalanceThreshold;   // Rebalance trigger threshold
        uint256 harvestInterval;      // Harvest interval in seconds
        uint256 maxSlippage;          // Maximum slippage tolerance
    }
    
    mapping(address => IntegratedPosition) public userPositions;
    mapping(uint256 => Strategy) public strategies;
    mapping(address => AutomationConfig) public automationConfigs;
    mapping(address => uint256) public userStrategies;
    mapping(address => uint256) public lastHarvest;
    mapping(address => bool) public authorizedKeepers;
    
    uint256 public strategyCount;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_SLIPPAGE = 1000; // 10%
    uint256 public performanceFee = 200; // 2%
    uint256 public managementFee = 100;  // 1%
    
    address public treasury;
    address public feeRecipient;
    
    // Events
    event PositionUpdated(address indexed user, uint256 totalValue);
    event StrategyExecuted(address indexed user, uint256 strategyId, uint256 profit);
    event RebalanceExecuted(address indexed user, uint256 oldValue, uint256 newValue);
    event AutoHarvest(address indexed user, uint256[] rewards);
    event FlashLoanExecuted(address indexed user, uint256 amount, uint256 profit);
    
    constructor(
        address _dex,
        address _lending,
        address _staking,
        address _yieldFarming,
        address _treasury,
        address _feeRecipient
    ) {
        dex = ManifoldDEX(_dex);
        lending = ManifoldLending(_lending);
        staking = ManifoldStaking(_staking);
        yieldFarming = ManifoldYieldFarming(_yieldFarming);
        treasury = _treasury;
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create integrated DeFi strategy
     */
    function createStrategy(
        string memory name,
        uint256 targetAPY,
        uint256 maxRisk,
        address[] memory requiredTokens,
        uint256[] memory targetWeights
    ) external onlyOwner returns (uint256 strategyId) {
        require(requiredTokens.length == targetWeights.length, "Array length mismatch");
        require(maxRisk <= 100, "Risk too high");
        
        strategyId = strategyCount++;
        
        strategies[strategyId] = Strategy({
            name: name,
            active: true,
            targetAPY: targetAPY,
            maxRisk: maxRisk,
            allocation: 0,
            requiredTokens: requiredTokens,
            targetWeights: targetWeights
        });
    }
    
    /**
     * @dev Execute yield optimization strategy
     */
    function executeYieldStrategy(
        uint256 strategyId,
        uint256 amount,
        address token
    ) external nonReentrant {
        require(strategyId < strategyCount, "Strategy doesn't exist");
        require(amount > 0, "Amount must be > 0");
        
        Strategy storage strategy = strategies[strategyId];
        require(strategy.active, "Strategy not active");
        
        // Transfer tokens from user
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        uint256 initialValue = _calculatePositionValue(msg.sender);
        
        // Execute strategy based on market conditions
        if (strategyId == 0) {
            _executeLiquidityStrategy(msg.sender, token, amount);
        } else if (strategyId == 1) {
            _executeLeverageStrategy(msg.sender, token, amount);
        } else if (strategyId == 2) {
            _executeArbitrageStrategy(msg.sender, token, amount);
        }
        
        uint256 finalValue = _calculatePositionValue(msg.sender);
        uint256 profit = finalValue > initialValue ? finalValue - initialValue : 0;
        
        _updateUserPosition(msg.sender);
        
        emit StrategyExecuted(msg.sender, strategyId, profit);
    }
    
    /**
     * @dev Liquidity provision strategy
     */
    function _executeLiquidityStrategy(address user, address token, uint256 amount) internal {
        // 1. Provide liquidity to DEX
        uint256 liquidityAmount = amount / 2;
        IERC20(token).approve(address(dex), liquidityAmount);
        
        // 2. Stake LP tokens for additional rewards
        // 3. Lend remaining tokens
        uint256 lendAmount = amount - liquidityAmount;
        IERC20(token).approve(address(lending), lendAmount);
        lending.supply(token, lendAmount);
        
        // Update position tracking
        userPositions[user].lendingSupply += lendAmount;
    }
    
    /**
     * @dev Leverage farming strategy
     */
    function _executeLeverageStrategy(address user, address token, uint256 amount) internal {
        // 1. Supply collateral to lending
        IERC20(token).approve(address(lending), amount);
        lending.supply(token, amount);
        
        // 2. Borrow additional funds (up to safe ratio)
        uint256 borrowAmount = (amount * 7000) / BASIS_POINTS; // 70% LTV
        lending.borrow(token, borrowAmount);
        
        // 3. Use borrowed funds for yield farming
        IERC20(token).approve(address(yieldFarming), borrowAmount);
        // yieldFarming.deposit(0, borrowAmount); // Assuming farm ID 0
        
        // Update position tracking
        userPositions[user].lendingSupply += amount;
        userPositions[user].lendingBorrow += borrowAmount;
        userPositions[user].farmingAmount += borrowAmount;
    }
    
    /**
     * @dev Arbitrage strategy across protocols
     */
    function _executeArbitrageStrategy(address user, address token, uint256 amount) internal {
        // 1. Check for arbitrage opportunities
        // 2. Execute trades across DEX pools
        // 3. Profit from price differences
        
        // Simplified arbitrage logic
        IERC20(token).approve(address(dex), amount);
        // Execute swaps to capture arbitrage
        
        userPositions[user].dexLiquidity += amount;
    }
    
    /**
     * @dev Auto-rebalance user's portfolio
     */
    function rebalancePortfolio(address user) external {
        require(msg.sender == user || authorizedKeepers[msg.sender], "Not authorized");
        
        AutomationConfig storage config = automationConfigs[user];
        require(config.autoRebalance, "Auto rebalance disabled");
        
        IntegratedPosition storage position = userPositions[user];
        uint256 oldValue = position.totalValue;
        
        // 1. Calculate current allocation
        uint256[] memory currentAllocation = _getCurrentAllocation(user);
        uint256[] memory targetAllocation = _getTargetAllocation(user);
        
        // 2. Check if rebalancing is needed
        bool needsRebalance = false;
        for (uint256 i = 0; i < currentAllocation.length; i++) {
            if (_abs(currentAllocation[i], targetAllocation[i]) > config.rebalanceThreshold) {
                needsRebalance = true;
                break;
            }
        }
        
        if (!needsRebalance) return;
        
        // 3. Execute rebalancing trades
        _executeRebalance(user, currentAllocation, targetAllocation);
        
        uint256 newValue = _calculatePositionValue(user);
        _updateUserPosition(user);
        
        emit RebalanceExecuted(user, oldValue, newValue);
    }
    
    /**
     * @dev Auto-harvest rewards across all protocols
     */
    function autoHarvest(address user) external {
        require(msg.sender == user || authorizedKeepers[msg.sender], "Not authorized");
        
        AutomationConfig storage config = automationConfigs[user];
        require(config.autoHarvest, "Auto harvest disabled");
        require(block.timestamp >= lastHarvest[user] + config.harvestInterval, "Too early");
        
        uint256[] memory rewards = new uint256[](4); // Rewards from 4 protocols
        
        // 1. Harvest from staking
        // staking.claimRewards(0); // Assuming pool ID 0
        
        // 2. Harvest from yield farming
        // yieldFarming.harvest(0); // Assuming farm ID 0
        
        // 3. Collect lending interest
        // lending.withdrawInterest(user);
        
        // 4. Auto-compound if enabled
        if (config.autoCompound) {
            _autoCompoundRewards(user, rewards);
        }
        
        lastHarvest[user] = block.timestamp;
        emit AutoHarvest(user, rewards);
    }
    
    /**
     * @dev Execute flash loan arbitrage
     */
    function executeFlashArbitrage(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external nonReentrant {
        // 1. Initiate flash loan
        // 2. Execute arbitrage logic
        // 3. Repay loan with profit
        
        uint256 initialBalance = IERC20(asset).balanceOf(address(this));
        
        // Execute arbitrage strategy with flash loan
        _executeFlashArbitrageLogic(asset, amount, params);
        
        uint256 finalBalance = IERC20(asset).balanceOf(address(this));
        uint256 profit = finalBalance > initialBalance ? finalBalance - initialBalance : 0;
        
        // Charge performance fee
        if (profit > 0) {
            uint256 fee = (profit * performanceFee) / BASIS_POINTS;
            IERC20(asset).transfer(feeRecipient, fee);
            profit -= fee;
        }
        
        emit FlashLoanExecuted(msg.sender, amount, profit);
    }
    
    /**
     * @dev Flash arbitrage execution logic
     */
    function _executeFlashArbitrageLogic(
        address asset,
        uint256 amount,
        bytes memory params
    ) internal {
        // Decode parameters
        (address targetToken, uint256 targetAmount) = abi.decode(params, (address, uint256));
        
        // Execute arbitrage across DEX pools
        IERC20(asset).approve(address(dex), amount);
        
        // Swap on first pool
        // uint256 received = dex.swapExactTokensForTokens(amount, 0, ...);
        
        // Swap back on second pool for profit
        // dex.swapExactTokensForTokens(received, amount, ...);
    }
    
    /**
     * @dev Calculate total position value in USD
     */
    function _calculatePositionValue(address user) internal view returns (uint256) {
        IntegratedPosition storage position = userPositions[user];
        
        // Calculate value from each protocol
        uint256 dexValue = position.dexLiquidity; // Simplified - would need price oracles
        uint256 lendingValue = position.lendingSupply - position.lendingBorrow;
        uint256 stakingValue = position.stakingAmount;
        uint256 farmingValue = position.farmingAmount;
        
        return dexValue + lendingValue + stakingValue + farmingValue;
    }
    
    /**
     * @dev Update user's integrated position
     */
    function _updateUserPosition(address user) internal {
        IntegratedPosition storage position = userPositions[user];
        position.totalValue = _calculatePositionValue(user);
        position.lastUpdate = block.timestamp;
        
        emit PositionUpdated(user, position.totalValue);
    }
    
    /**
     * @dev Get current allocation percentages
     */
    function _getCurrentAllocation(address user) internal view returns (uint256[] memory) {
        IntegratedPosition storage position = userPositions[user];
        uint256 totalValue = position.totalValue;
        
        uint256[] memory allocation = new uint256[](4);
        if (totalValue > 0) {
            allocation[0] = (position.dexLiquidity * BASIS_POINTS) / totalValue;
            allocation[1] = (position.lendingSupply * BASIS_POINTS) / totalValue;
            allocation[2] = (position.stakingAmount * BASIS_POINTS) / totalValue;
            allocation[3] = (position.farmingAmount * BASIS_POINTS) / totalValue;
        }
        
        return allocation;
    }
    
    /**
     * @dev Get target allocation for user's strategy
     */
    function _getTargetAllocation(address user) internal view returns (uint256[] memory) {
        uint256 strategyId = userStrategies[user];
        Strategy storage strategy = strategies[strategyId];
        
        return strategy.targetWeights;
    }
    
    /**
     * @dev Execute portfolio rebalancing
     */
    function _executeRebalance(
        address user,
        uint256[] memory current,
        uint256[] memory target
    ) internal {
        // Execute trades to rebalance portfolio
        // Simplified implementation - would need detailed rebalancing logic
        
        for (uint256 i = 0; i < current.length; i++) {
            if (current[i] > target[i]) {
                // Reduce allocation
                uint256 excess = current[i] - target[i];
                _reduceAllocation(user, i, excess);
            } else if (current[i] < target[i]) {
                // Increase allocation
                uint256 deficit = target[i] - current[i];
                _increaseAllocation(user, i, deficit);
            }
        }
    }
    
    /**
     * @dev Auto-compound harvested rewards
     */
    function _autoCompoundRewards(address user, uint256[] memory rewards) internal {
        uint256 strategyId = userStrategies[user];
        
        // Reinvest rewards based on strategy
        for (uint256 i = 0; i < rewards.length; i++) {
            if (rewards[i] > 0) {
                // Compound rewards back into respective protocols
                if (i == 0) {
                    // Compound DEX rewards
                } else if (i == 1) {
                    // Compound lending rewards
                } else if (i == 2) {
                    // Compound staking rewards
                } else if (i == 3) {
                    // Compound farming rewards
                }
            }
        }
    }
    
    /**
     * @dev Helper functions
     */
    function _abs(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a - b : b - a;
    }
    
    function _reduceAllocation(address user, uint256 protocol, uint256 amount) internal {
        // Reduce allocation in specific protocol
    }
    
    function _increaseAllocation(address user, uint256 protocol, uint256 amount) internal {
        // Increase allocation in specific protocol
    }
    
    /**
     * @dev Configuration functions
     */
    function setAutomationConfig(
        bool autoRebalance,
        bool autoCompound,
        bool autoHarvest,
        uint256 rebalanceThreshold,
        uint256 harvestInterval,
        uint256 maxSlippage
    ) external {
        require(maxSlippage <= MAX_SLIPPAGE, "Slippage too high");
        
        automationConfigs[msg.sender] = AutomationConfig({
            autoRebalance: autoRebalance,
            autoCompound: autoCompound,
            autoHarvest: autoHarvest,
            rebalanceThreshold: rebalanceThreshold,
            harvestInterval: harvestInterval,
            maxSlippage: maxSlippage
        });
    }
    
    function setUserStrategy(address user, uint256 strategyId) external {
        require(msg.sender == user || msg.sender == owner(), "Not authorized");
        require(strategyId < strategyCount, "Strategy doesn't exist");
        
        userStrategies[user] = strategyId;
    }
    
    /**
     * @dev Admin functions
     */
    function addKeeper(address keeper) external onlyOwner {
        authorizedKeepers[keeper] = true;
    }
    
    function removeKeeper(address keeper) external onlyOwner {
        authorizedKeepers[keeper] = false;
    }
    
    function setFees(uint256 _performanceFee, uint256 _managementFee) external onlyOwner {
        require(_performanceFee <= 1000 && _managementFee <= 500, "Fees too high");
        performanceFee = _performanceFee;
        managementFee = _managementFee;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev View functions
     */
    function getUserPosition(address user) external view returns (
        uint256 dexLiquidity,
        uint256 lendingSupply,
        uint256 lendingBorrow,
        uint256 stakingAmount,
        uint256 farmingAmount,
        uint256 totalValue
    ) {
        IntegratedPosition storage position = userPositions[user];
        return (
            position.dexLiquidity,
            position.lendingSupply,
            position.lendingBorrow,
            position.stakingAmount,
            position.farmingAmount,
            position.totalValue
        );
    }
    
    function getStrategyInfo(uint256 strategyId) external view returns (
        string memory name,
        bool active,
        uint256 targetAPY,
        uint256 maxRisk,
        address[] memory requiredTokens,
        uint256[] memory targetWeights
    ) {
        require(strategyId < strategyCount, "Strategy doesn't exist");
        
        Strategy storage strategy = strategies[strategyId];
        return (
            strategy.name,
            strategy.active,
            strategy.targetAPY,
            strategy.maxRisk,
            strategy.requiredTokens,
            strategy.targetWeights
        );
    }
    
    /**
     * @dev Emergency functions
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}