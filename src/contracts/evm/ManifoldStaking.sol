// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title ManifoldStaking
 * @dev Token staking protocol with rewards distribution for Chainweb EVM
 * Features: Multiple pools, time-locked staking, reward boosts, penalties
 */
contract ManifoldStaking is ReentrancyGuard, Ownable {
    using Math for uint256;
    
    struct StakingPool {
        IERC20 stakingToken;
        IERC20 rewardToken;
        uint256 totalStaked;
        uint256 rewardRate; // Rewards per second
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        uint256 poolDuration;
        uint256 poolStartTime;
        uint256 poolEndTime;
        uint256 minimumStake;
        uint256 lockPeriod; // Lock period in seconds
        uint256 earlyWithdrawPenalty; // Penalty percentage (basis points)
        bool active;
    }
    
    struct UserStake {
        uint256 amount;
        uint256 rewardPerTokenPaid;
        uint256 rewards;
        uint256 stakeTime;
        uint256 unlockTime;
        uint256 lastClaimTime;
    }
    
    struct RewardDistribution {
        uint256 amount;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        address distributor;
    }
    
    mapping(uint256 => StakingPool) public stakingPools;
    mapping(uint256 => mapping(address => UserStake)) public userStakes;
    mapping(uint256 => RewardDistribution[]) public rewardDistributions;
    mapping(address => uint256[]) public userPoolIds;
    
    uint256 public poolCount;
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant SECONDS_PER_DAY = 86400;
    
    // Events
    event PoolCreated(uint256 indexed poolId, address stakingToken, address rewardToken, uint256 rewardRate);
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 penalty);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsAdded(uint256 indexed poolId, uint256 amount, uint256 duration);
    
    constructor() {}
    
    /**
     * @dev Create a new staking pool
     */
    function createPool(
        address stakingToken,
        address rewardToken,
        uint256 rewardRate,
        uint256 poolDuration,
        uint256 minimumStake,
        uint256 lockPeriod,
        uint256 earlyWithdrawPenalty
    ) external onlyOwner returns (uint256 poolId) {
        require(stakingToken != address(0) && rewardToken != address(0), "Invalid token addresses");
        require(rewardRate > 0, "Reward rate must be > 0");
        require(poolDuration > 0, "Pool duration must be > 0");
        require(earlyWithdrawPenalty <= 5000, "Penalty too high"); // Max 50%
        
        poolId = poolCount++;
        uint256 startTime = block.timestamp;
        
        stakingPools[poolId] = StakingPool({
            stakingToken: IERC20(stakingToken),
            rewardToken: IERC20(rewardToken),
            totalStaked: 0,
            rewardRate: rewardRate,
            lastUpdateTime: startTime,
            rewardPerTokenStored: 0,
            poolDuration: poolDuration,
            poolStartTime: startTime,
            poolEndTime: startTime + poolDuration,
            minimumStake: minimumStake,
            lockPeriod: lockPeriod,
            earlyWithdrawPenalty: earlyWithdrawPenalty,
            active: true
        });
        
        emit PoolCreated(poolId, stakingToken, rewardToken, rewardRate);
    }
    
    /**
     * @dev Stake tokens in a pool
     */
    function stake(uint256 poolId, uint256 amount) external nonReentrant {
        require(poolId < poolCount, "Pool doesn't exist");
        require(amount > 0, "Amount must be > 0");
        
        StakingPool storage pool = stakingPools[poolId];
        require(pool.active, "Pool not active");
        require(amount >= pool.minimumStake, "Below minimum stake");
        require(block.timestamp <= pool.poolEndTime, "Pool ended");
        
        updateReward(poolId, msg.sender);
        
        // Transfer staking tokens
        pool.stakingToken.transferFrom(msg.sender, address(this), amount);
        
        // Update user stake
        UserStake storage userStake = userStakes[poolId][msg.sender];
        if (userStake.amount == 0) {
            userPoolIds[msg.sender].push(poolId);
        }
        
        userStake.amount += amount;
        userStake.stakeTime = block.timestamp;
        userStake.unlockTime = block.timestamp + pool.lockPeriod;
        userStake.lastClaimTime = block.timestamp;
        
        // Update pool total
        pool.totalStaked += amount;
        
        emit Staked(msg.sender, poolId, amount);
    }
    
    /**
     * @dev Unstake tokens from pool
     */
    function unstake(uint256 poolId, uint256 amount) external nonReentrant {
        require(poolId < poolCount, "Pool doesn't exist");
        require(amount > 0, "Amount must be > 0");
        
        UserStake storage userStake = userStakes[poolId][msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");
        
        updateReward(poolId, msg.sender);
        
        StakingPool storage pool = stakingPools[poolId];
        uint256 penalty = 0;
        
        // Check if early withdrawal
        if (block.timestamp < userStake.unlockTime) {
            penalty = (amount * pool.earlyWithdrawPenalty) / BASIS_POINTS;
        }
        
        uint256 amountToWithdraw = amount - penalty;
        
        // Update user stake
        userStake.amount -= amount;
        
        // Update pool total
        pool.totalStaked -= amount;
        
        // Transfer tokens (minus penalty)
        pool.stakingToken.transfer(msg.sender, amountToWithdraw);
        
        // Send penalty to contract owner if applicable
        if (penalty > 0) {
            pool.stakingToken.transfer(owner(), penalty);
        }
        
        emit Unstaked(msg.sender, poolId, amountToWithdraw, penalty);
    }
    
    /**
     * @dev Claim rewards from pool
     */
    function claimRewards(uint256 poolId) external nonReentrant {
        require(poolId < poolCount, "Pool doesn't exist");
        
        updateReward(poolId, msg.sender);
        
        UserStake storage userStake = userStakes[poolId][msg.sender];
        uint256 reward = userStake.rewards;
        require(reward > 0, "No rewards to claim");
        
        userStake.rewards = 0;
        userStake.lastClaimTime = block.timestamp;
        
        StakingPool storage pool = stakingPools[poolId];
        pool.rewardToken.transfer(msg.sender, reward);
        
        emit RewardsClaimed(msg.sender, poolId, reward);
    }
    
    /**
     * @dev Update reward calculations
     */
    function updateReward(uint256 poolId, address account) internal {
        StakingPool storage pool = stakingPools[poolId];
        pool.rewardPerTokenStored = rewardPerToken(poolId);
        pool.lastUpdateTime = lastTimeRewardApplicable(poolId);
        
        if (account != address(0)) {
            UserStake storage userStake = userStakes[poolId][account];
            userStake.rewards = earned(poolId, account);
            userStake.rewardPerTokenPaid = pool.rewardPerTokenStored;
        }
    }
    
    /**
     * @dev Calculate reward per token
     */
    function rewardPerToken(uint256 poolId) public view returns (uint256) {
        StakingPool storage pool = stakingPools[poolId];
        if (pool.totalStaked == 0) {
            return pool.rewardPerTokenStored;
        }
        
        return pool.rewardPerTokenStored + 
            (((lastTimeRewardApplicable(poolId) - pool.lastUpdateTime) * 
              pool.rewardRate * 1e18) / pool.totalStaked);
    }
    
    /**
     * @dev Get last time reward is applicable
     */
    function lastTimeRewardApplicable(uint256 poolId) public view returns (uint256) {
        StakingPool storage pool = stakingPools[poolId];
        return Math.min(block.timestamp, pool.poolEndTime);
    }
    
    /**
     * @dev Calculate earned rewards for user
     */
    function earned(uint256 poolId, address account) public view returns (uint256) {
        UserStake storage userStake = userStakes[poolId][account];
        return ((userStake.amount * 
                (rewardPerToken(poolId) - userStake.rewardPerTokenPaid)) / 1e18) + 
                userStake.rewards;
    }
    
    /**
     * @dev Add rewards to pool
     */
    function addRewards(uint256 poolId, uint256 amount, uint256 duration) external onlyOwner {
        require(poolId < poolCount, "Pool doesn't exist");
        require(amount > 0 && duration > 0, "Invalid parameters");
        
        StakingPool storage pool = stakingPools[poolId];
        
        updateReward(poolId, address(0));
        
        // Transfer reward tokens
        pool.rewardToken.transferFrom(msg.sender, address(this), amount);
        
        // Update pool reward rate
        if (block.timestamp >= pool.poolEndTime) {
            pool.rewardRate = amount / duration;
        } else {
            uint256 remaining = pool.poolEndTime - block.timestamp;
            uint256 leftover = remaining * pool.rewardRate;
            pool.rewardRate = (amount + leftover) / duration;
        }
        
        pool.lastUpdateTime = block.timestamp;
        pool.poolEndTime = block.timestamp + duration;
        
        // Record distribution
        rewardDistributions[poolId].push(RewardDistribution({
            amount: amount,
            duration: duration,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            distributor: msg.sender
        }));
        
        emit RewardsAdded(poolId, amount, duration);
    }
    
    /**
     * @dev Calculate pool APY
     */
    function getPoolAPY(uint256 poolId) external view returns (uint256) {
        StakingPool storage pool = stakingPools[poolId];
        if (pool.totalStaked == 0) return 0;
        
        uint256 yearlyRewards = pool.rewardRate * 365 days;
        return (yearlyRewards * 10000) / pool.totalStaked; // Returns APY in basis points
    }
    
    /**
     * @dev Get user's staking info across all pools
     */
    function getUserStakingInfo(address user) external view returns (
        uint256[] memory poolIds,
        uint256[] memory stakedAmounts,
        uint256[] memory earnedRewards,
        uint256[] memory unlockTimes
    ) {
        uint256[] memory userPools = userPoolIds[user];
        uint256 length = userPools.length;
        
        poolIds = new uint256[](length);
        stakedAmounts = new uint256[](length);
        earnedRewards = new uint256[](length);
        unlockTimes = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 poolId = userPools[i];
            UserStake storage userStake = userStakes[poolId][user];
            
            poolIds[i] = poolId;
            stakedAmounts[i] = userStake.amount;
            earnedRewards[i] = earned(poolId, user);
            unlockTimes[i] = userStake.unlockTime;
        }
    }
    
    /**
     * @dev Get pool information
     */
    function getPoolInfo(uint256 poolId) external view returns (
        address stakingToken,
        address rewardToken,
        uint256 totalStaked,
        uint256 rewardRate,
        uint256 poolEndTime,
        uint256 minimumStake,
        uint256 lockPeriod,
        bool active
    ) {
        require(poolId < poolCount, "Pool doesn't exist");
        
        StakingPool storage pool = stakingPools[poolId];
        return (
            address(pool.stakingToken),
            address(pool.rewardToken),
            pool.totalStaked,
            pool.rewardRate,
            pool.poolEndTime,
            pool.minimumStake,
            pool.lockPeriod,
            pool.active
        );
    }
    
    /**
     * @dev Get all pool IDs
     */
    function getAllPoolIds() external view returns (uint256[] memory) {
        uint256[] memory poolIds = new uint256[](poolCount);
        for (uint256 i = 0; i < poolCount; i++) {
            poolIds[i] = i;
        }
        return poolIds;
    }
    
    /**
     * @dev Emergency functions
     */
    function pausePool(uint256 poolId) external onlyOwner {
        require(poolId < poolCount, "Pool doesn't exist");
        stakingPools[poolId].active = false;
    }
    
    function resumePool(uint256 poolId) external onlyOwner {
        require(poolId < poolCount, "Pool doesn't exist");
        stakingPools[poolId].active = true;
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}