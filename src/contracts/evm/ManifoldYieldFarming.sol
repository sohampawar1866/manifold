// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title ManifoldYieldFarming
 * @dev Advanced yield farming protocol with multiple strategies for Chainweb EVM
 * Features: Multi-token farms, boost multipliers, auto-compounding, strategy management
 */
contract ManifoldYieldFarming is ReentrancyGuard, Ownable {
    using Math for uint256;
    
    struct Farm {
        address lpToken;              // LP token contract
        address[] rewardTokens;       // Multiple reward tokens
        uint256[] rewardRates;        // Reward rates per second for each token
        uint256 totalStaked;          // Total LP tokens staked
        uint256 lastUpdateTime;       // Last reward calculation time
        uint256[] rewardPerTokenStored; // Stored reward per token
        uint256 allocPoint;           // Allocation points for reward distribution
        uint256 depositFee;           // Deposit fee in basis points
        uint256 withdrawalFee;        // Withdrawal fee in basis points
        uint256 harvestLockup;        // Harvest lockup period in seconds
        bool active;                  // Farm status
        bool autoCompound;            // Auto-compound rewards
    }
    
    struct UserInfo {
        uint256 amount;               // LP tokens staked by user
        uint256[] rewardDebt;         // Reward debt for each reward token
        uint256[] pendingRewards;     // Pending rewards for each token
        uint256 lastDepositTime;      // Last deposit timestamp
        uint256 lastHarvestTime;      // Last harvest timestamp
        uint256 boostMultiplier;      // User's boost multiplier (basis points)
        uint256 totalHarvested;       // Total rewards harvested
    }
    
    struct BoostConfig {
        address boostToken;           // Token required for boost
        uint256 requiredAmount;       // Amount required for boost
        uint256 multiplier;           // Boost multiplier (basis points)
        uint256 duration;             // Boost duration in seconds
    }
    
    struct Strategy {
        address strategyContract;     // Strategy contract address
        uint256 allocation;           // % of funds allocated to strategy
        uint256 performanceFee;       // Performance fee for strategy
        bool active;                  // Strategy status
    }
    
    mapping(uint256 => Farm) public farms;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    mapping(uint256 => BoostConfig[]) public boostConfigs;
    mapping(uint256 => Strategy[]) public strategies;
    mapping(address => uint256[]) public userFarmIds;
    mapping(address => mapping(uint256 => uint256)) public userBoostExpiry;
    
    uint256 public farmCount;
    uint256 public totalAllocPoint;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_DEPOSIT_FEE = 500;  // 5%
    uint256 public constant MAX_WITHDRAWAL_FEE = 100; // 1%
    
    address public feeRecipient;
    address public treasury;
    
    // Events
    event FarmAdded(uint256 indexed farmId, address lpToken, address[] rewardTokens);
    event Deposit(address indexed user, uint256 indexed farmId, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed farmId, uint256 amount);
    event Harvest(address indexed user, uint256 indexed farmId, uint256[] amounts);
    event BoostActivated(address indexed user, uint256 indexed farmId, uint256 multiplier);
    event EmergencyWithdraw(address indexed user, uint256 indexed farmId, uint256 amount);
    
    constructor(address _feeRecipient, address _treasury) {
        feeRecipient = _feeRecipient;
        treasury = _treasury;
    }
    
    /**
     * @dev Add a new farm
     */
    function addFarm(
        address lpToken,
        address[] memory rewardTokens,
        uint256[] memory rewardRates,
        uint256 allocPoint,
        uint256 depositFee,
        uint256 withdrawalFee,
        uint256 harvestLockup,
        bool autoCompound
    ) external onlyOwner returns (uint256 farmId) {
        require(lpToken != address(0), "Invalid LP token");
        require(rewardTokens.length > 0 && rewardTokens.length == rewardRates.length, "Invalid reward config");
        require(depositFee <= MAX_DEPOSIT_FEE, "Deposit fee too high");
        require(withdrawalFee <= MAX_WITHDRAWAL_FEE, "Withdrawal fee too high");
        
        farmId = farmCount++;
        totalAllocPoint += allocPoint;
        
        uint256[] memory rewardPerTokenStored = new uint256[](rewardTokens.length);
        
        farms[farmId] = Farm({
            lpToken: lpToken,
            rewardTokens: rewardTokens,
            rewardRates: rewardRates,
            totalStaked: 0,
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: rewardPerTokenStored,
            allocPoint: allocPoint,
            depositFee: depositFee,
            withdrawalFee: withdrawalFee,
            harvestLockup: harvestLockup,
            active: true,
            autoCompound: autoCompound
        });
        
        emit FarmAdded(farmId, lpToken, rewardTokens);
    }
    
    /**
     * @dev Deposit LP tokens to farm
     */
    function deposit(uint256 farmId, uint256 amount) external nonReentrant {
        require(farmId < farmCount, "Farm doesn't exist");
        require(amount > 0, "Amount must be > 0");
        
        Farm storage farm = farms[farmId];
        require(farm.active, "Farm not active");
        
        UserInfo storage user = userInfo[farmId][msg.sender];
        
        updateFarm(farmId);
        
        if (user.amount > 0) {
            // Harvest pending rewards
            _harvestRewards(farmId, msg.sender);
        } else {
            // First deposit - add to user farm list
            userFarmIds[msg.sender].push(farmId);
        }
        
        // Transfer LP tokens
        IERC20(farm.lpToken).transferFrom(msg.sender, address(this), amount);
        
        // Calculate deposit fee
        uint256 fee = (amount * farm.depositFee) / BASIS_POINTS;
        uint256 amountAfterFee = amount - fee;
        
        if (fee > 0) {
            IERC20(farm.lpToken).transfer(feeRecipient, fee);
        }
        
        // Update user info
        user.amount += amountAfterFee;
        user.lastDepositTime = block.timestamp;
        
        // Update reward debt
        for (uint256 i = 0; i < farm.rewardTokens.length; i++) {
            user.rewardDebt[i] = (user.amount * farm.rewardPerTokenStored[i]) / 1e18;
        }
        
        // Update farm total
        farm.totalStaked += amountAfterFee;
        
        emit Deposit(msg.sender, farmId, amountAfterFee);
    }
    
    /**
     * @dev Withdraw LP tokens from farm
     */
    function withdraw(uint256 farmId, uint256 amount) external nonReentrant {
        require(farmId < farmCount, "Farm doesn't exist");
        require(amount > 0, "Amount must be > 0");
        
        UserInfo storage user = userInfo[farmId][msg.sender];
        require(user.amount >= amount, "Insufficient staked amount");
        
        updateFarm(farmId);
        
        // Harvest pending rewards
        _harvestRewards(farmId, msg.sender);
        
        Farm storage farm = farms[farmId];
        
        // Calculate withdrawal fee
        uint256 fee = (amount * farm.withdrawalFee) / BASIS_POINTS;
        uint256 amountAfterFee = amount - fee;
        
        // Update user info
        user.amount -= amount;
        
        // Update reward debt
        for (uint256 i = 0; i < farm.rewardTokens.length; i++) {
            user.rewardDebt[i] = (user.amount * farm.rewardPerTokenStored[i]) / 1e18;
        }
        
        // Update farm total
        farm.totalStaked -= amount;
        
        // Transfer tokens
        IERC20(farm.lpToken).transfer(msg.sender, amountAfterFee);
        
        if (fee > 0) {
            IERC20(farm.lpToken).transfer(feeRecipient, fee);
        }
        
        emit Withdraw(msg.sender, farmId, amountAfterFee);
    }
    
    /**
     * @dev Harvest rewards from farm
     */
    function harvest(uint256 farmId) external nonReentrant {
        require(farmId < farmCount, "Farm doesn't exist");
        
        UserInfo storage user = userInfo[farmId][msg.sender];
        require(user.amount > 0, "No staked amount");
        
        Farm storage farm = farms[farmId];
        require(block.timestamp >= user.lastHarvestTime + farm.harvestLockup, "Harvest locked");
        
        updateFarm(farmId);
        _harvestRewards(farmId, msg.sender);
    }
    
    /**
     * @dev Internal harvest function
     */
    function _harvestRewards(uint256 farmId, address userAddr) internal {
        Farm storage farm = farms[farmId];
        UserInfo storage user = userInfo[farmId][userAddr];
        
        uint256[] memory rewards = new uint256[](farm.rewardTokens.length);
        
        for (uint256 i = 0; i < farm.rewardTokens.length; i++) {
            uint256 pending = ((user.amount * farm.rewardPerTokenStored[i]) / 1e18) - user.rewardDebt[i];
            
            if (pending > 0) {
                // Apply boost multiplier
                uint256 boostedReward = (pending * _getUserBoostMultiplier(farmId, userAddr)) / BASIS_POINTS;
                rewards[i] = boostedReward;
                
                user.rewardDebt[i] = (user.amount * farm.rewardPerTokenStored[i]) / 1e18;
                user.totalHarvested += boostedReward;
                
                if (farm.autoCompound && farm.rewardTokens[i] == farm.lpToken) {
                    // Auto-compound LP tokens
                    user.amount += boostedReward;
                    farm.totalStaked += boostedReward;
                } else {
                    // Transfer reward tokens
                    IERC20(farm.rewardTokens[i]).transfer(userAddr, boostedReward);
                }
            }
        }
        
        user.lastHarvestTime = block.timestamp;
        emit Harvest(userAddr, farmId, rewards);
    }
    
    /**
     * @dev Update farm reward calculations
     */
    function updateFarm(uint256 farmId) public {
        Farm storage farm = farms[farmId];
        
        if (block.timestamp <= farm.lastUpdateTime) return;
        
        if (farm.totalStaked == 0) {
            farm.lastUpdateTime = block.timestamp;
            return;
        }
        
        uint256 timeDiff = block.timestamp - farm.lastUpdateTime;
        
        for (uint256 i = 0; i < farm.rewardTokens.length; i++) {
            uint256 reward = timeDiff * farm.rewardRates[i] * farm.allocPoint / totalAllocPoint;
            farm.rewardPerTokenStored[i] += (reward * 1e18) / farm.totalStaked;
        }
        
        farm.lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Activate boost for user
     */
    function activateBoost(uint256 farmId, uint256 boostIndex) external {
        require(farmId < farmCount, "Farm doesn't exist");
        require(boostIndex < boostConfigs[farmId].length, "Invalid boost index");
        
        BoostConfig storage boost = boostConfigs[farmId][boostIndex];
        UserInfo storage user = userInfo[farmId][msg.sender];
        
        require(user.amount > 0, "No staked amount");
        require(IERC20(boost.boostToken).balanceOf(msg.sender) >= boost.requiredAmount, "Insufficient boost tokens");
        
        // Transfer boost tokens
        IERC20(boost.boostToken).transferFrom(msg.sender, treasury, boost.requiredAmount);
        
        // Set boost expiry
        userBoostExpiry[msg.sender][farmId] = block.timestamp + boost.duration;
        user.boostMultiplier = boost.multiplier;
        
        emit BoostActivated(msg.sender, farmId, boost.multiplier);
    }
    
    /**
     * @dev Get user's current boost multiplier
     */
    function _getUserBoostMultiplier(uint256 farmId, address userAddr) internal view returns (uint256) {
        if (block.timestamp > userBoostExpiry[userAddr][farmId]) {
            return BASIS_POINTS; // 1x multiplier
        }
        
        UserInfo storage user = userInfo[farmId][userAddr];
        return user.boostMultiplier > 0 ? user.boostMultiplier : BASIS_POINTS;
    }
    
    /**
     * @dev Add boost configuration to farm
     */
    function addBoostConfig(
        uint256 farmId,
        address boostToken,
        uint256 requiredAmount,
        uint256 multiplier,
        uint256 duration
    ) external onlyOwner {
        require(farmId < farmCount, "Farm doesn't exist");
        require(boostToken != address(0), "Invalid boost token");
        require(multiplier >= BASIS_POINTS && multiplier <= BASIS_POINTS * 5, "Invalid multiplier"); // 1x to 5x
        
        boostConfigs[farmId].push(BoostConfig({
            boostToken: boostToken,
            requiredAmount: requiredAmount,
            multiplier: multiplier,
            duration: duration
        }));
    }
    
    /**
     * @dev Emergency withdraw without caring about rewards
     */
    function emergencyWithdraw(uint256 farmId) external nonReentrant {
        require(farmId < farmCount, "Farm doesn't exist");
        
        UserInfo storage user = userInfo[farmId][msg.sender];
        uint256 amount = user.amount;
        require(amount > 0, "No staked amount");
        
        Farm storage farm = farms[farmId];
        
        // Reset user info
        user.amount = 0;
        for (uint256 i = 0; i < farm.rewardTokens.length; i++) {
            user.rewardDebt[i] = 0;
            user.pendingRewards[i] = 0;
        }
        
        // Update farm total
        farm.totalStaked -= amount;
        
        // Transfer LP tokens (no fees in emergency)
        IERC20(farm.lpToken).transfer(msg.sender, amount);
        
        emit EmergencyWithdraw(msg.sender, farmId, amount);
    }
    
    /**
     * @dev Calculate pending rewards for user
     */
    function pendingRewards(uint256 farmId, address userAddr) external view returns (uint256[] memory) {
        Farm storage farm = farms[farmId];
        UserInfo storage user = userInfo[farmId][userAddr];
        
        uint256[] memory pending = new uint256[](farm.rewardTokens.length);
        
        if (user.amount == 0) return pending;
        
        uint256[] memory rewardPerToken = new uint256[](farm.rewardTokens.length);
        
        if (farm.totalStaked > 0) {
            uint256 timeDiff = block.timestamp - farm.lastUpdateTime;
            
            for (uint256 i = 0; i < farm.rewardTokens.length; i++) {
                uint256 reward = timeDiff * farm.rewardRates[i] * farm.allocPoint / totalAllocPoint;
                rewardPerToken[i] = farm.rewardPerTokenStored[i] + (reward * 1e18) / farm.totalStaked;
                
                pending[i] = ((user.amount * rewardPerToken[i]) / 1e18) - user.rewardDebt[i];
                
                // Apply boost
                uint256 boostMultiplier = _getUserBoostMultiplier(farmId, userAddr);
                pending[i] = (pending[i] * boostMultiplier) / BASIS_POINTS;
            }
        }
        
        return pending;
    }
    
    /**
     * @dev Get farm information
     */
    function getFarmInfo(uint256 farmId) external view returns (
        address lpToken,
        address[] memory rewardTokens,
        uint256[] memory rewardRates,
        uint256 totalStaked,
        uint256 allocPoint,
        bool active
    ) {
        require(farmId < farmCount, "Farm doesn't exist");
        
        Farm storage farm = farms[farmId];
        return (
            farm.lpToken,
            farm.rewardTokens,
            farm.rewardRates,
            farm.totalStaked,
            farm.allocPoint,
            farm.active
        );
    }
    
    /**
     * @dev Get user's farming info across all farms
     */
    function getUserFarmingInfo(address userAddr) external view returns (
        uint256[] memory farmIds,
        uint256[] memory stakedAmounts,
        uint256[][] memory pendingRewardsList
    ) {
        uint256[] memory userFarms = userFarmIds[userAddr];
        uint256 length = userFarms.length;
        
        farmIds = new uint256[](length);
        stakedAmounts = new uint256[](length);
        pendingRewardsList = new uint256[][](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 farmId = userFarms[i];
            UserInfo storage user = userInfo[farmId][userAddr];
            
            farmIds[i] = farmId;
            stakedAmounts[i] = user.amount;
            // Note: pendingRewards calculation omitted for brevity in view function
        }
    }
    
    /**
     * @dev Admin functions
     */
    function setFarmAllocPoint(uint256 farmId, uint256 allocPoint) external onlyOwner {
        require(farmId < farmCount, "Farm doesn't exist");
        
        updateFarm(farmId);
        
        totalAllocPoint = totalAllocPoint - farms[farmId].allocPoint + allocPoint;
        farms[farmId].allocPoint = allocPoint;
    }
    
    function setFarmStatus(uint256 farmId, bool active) external onlyOwner {
        require(farmId < farmCount, "Farm doesn't exist");
        farms[farmId].active = active;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
    
    /**
     * @dev Emergency withdrawal for admin
     */
    function adminEmergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}