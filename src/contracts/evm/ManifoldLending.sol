// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title ManifoldLending
 * @dev Decentralized lending and borrowing protocol for Chainweb EVM
 * Features: Supply/withdraw, borrow/repay, liquidations, interest rates
 */
contract ManifoldLending is ReentrancyGuard, Ownable {
    using Math for uint256;
    
    struct Market {
        IERC20 token;
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 supplyRate;
        uint256 borrowRate;
        uint256 utilizationRate;
        uint256 reserveFactor; // Percentage of interest kept as reserves
        uint256 collateralFactor; // Max borrow ratio (e.g., 75% = 7500)
        uint256 liquidationThreshold; // Liquidation trigger (e.g., 80% = 8000)
        uint256 liquidationPenalty; // Liquidator bonus (e.g., 5% = 500)
        uint256 lastUpdateTime;
        bool active;
    }
    
    struct UserAccount {
        mapping(address => uint256) supplied; // token => amount
        mapping(address => uint256) borrowed; // token => amount
        mapping(address => uint256) supplyIndex; // For interest calculations
        mapping(address => uint256) borrowIndex; // For interest calculations
        uint256 lastUpdateTime;
    }
    
    struct InterestRateModel {
        uint256 baseRate; // Base interest rate (annual)
        uint256 multiplier; // Rate multiplier below optimal utilization
        uint256 jumpMultiplier; // Rate multiplier above optimal utilization
        uint256 optimalUtilization; // Optimal utilization rate (e.g., 80% = 8000)
    }
    
    mapping(address => Market) public markets;
    mapping(address => UserAccount) private userAccounts;
    mapping(address => InterestRateModel) public interestModels;
    mapping(address => bool) public isMarketListed;
    
    address[] public allMarkets;
    
    // Events
    event MarketListed(address indexed token, uint256 collateralFactor, uint256 liquidationThreshold);
    event Supply(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, address indexed token, uint256 amount);
    event Repay(address indexed user, address indexed token, uint256 amount);
    event Liquidation(address indexed liquidator, address indexed borrower, address indexed collateralToken, address debtToken, uint256 liquidatedAmount);
    
    // Constants
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant MIN_HEALTH_FACTOR = 1e18; // 1.0 in 18 decimals
    
    constructor() {}
    
    /**
     * @dev List a new market for lending/borrowing
     */
    function listMarket(
        address token,
        uint256 collateralFactor,
        uint256 liquidationThreshold,
        uint256 liquidationPenalty,
        uint256 reserveFactor
    ) external onlyOwner {
        require(!isMarketListed[token], "Market already listed");
        require(collateralFactor <= BASIS_POINTS, "Invalid collateral factor");
        require(liquidationThreshold <= BASIS_POINTS, "Invalid liquidation threshold");
        require(liquidationThreshold > collateralFactor, "Liquidation threshold must be > collateral factor");
        
        markets[token] = Market({
            token: IERC20(token),
            totalSupplied: 0,
            totalBorrowed: 0,
            supplyRate: 0,
            borrowRate: 0,
            utilizationRate: 0,
            reserveFactor: reserveFactor,
            collateralFactor: collateralFactor,
            liquidationThreshold: liquidationThreshold,
            liquidationPenalty: liquidationPenalty,
            lastUpdateTime: block.timestamp,
            active: true
        });
        
        // Set default interest rate model
        interestModels[token] = InterestRateModel({
            baseRate: 200, // 2% base rate
            multiplier: 1000, // 10% multiplier
            jumpMultiplier: 30000, // 300% jump multiplier
            optimalUtilization: 8000 // 80% optimal utilization
        });
        
        isMarketListed[token] = true;
        allMarkets.push(token);
        
        emit MarketListed(token, collateralFactor, liquidationThreshold);
    }
    
    /**
     * @dev Supply tokens to earn interest
     */
    function supply(address token, uint256 amount) external nonReentrant {
        require(isMarketListed[token], "Market not listed");
        require(amount > 0, "Amount must be > 0");
        
        Market storage market = markets[token];
        require(market.active, "Market not active");
        
        // Update market interest
        updateMarketInterest(token);
        
        // Transfer tokens from user
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Update user account
        UserAccount storage account = userAccounts[msg.sender];
        account.supplied[token] += amount;
        account.supplyIndex[token] = block.timestamp;
        account.lastUpdateTime = block.timestamp;
        
        // Update market totals
        market.totalSupplied += amount;
        market.lastUpdateTime = block.timestamp;
        
        // Update interest rates
        updateInterestRates(token);
        
        emit Supply(msg.sender, token, amount);
    }
    
    /**
     * @dev Withdraw supplied tokens
     */
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(isMarketListed[token], "Market not listed");
        require(amount > 0, "Amount must be > 0");
        
        UserAccount storage account = userAccounts[msg.sender];
        require(account.supplied[token] >= amount, "Insufficient balance");
        
        // Update market interest
        updateMarketInterest(token);
        
        // Check if withdrawal would make account unhealthy
        uint256 healthFactor = calculateHealthFactor(msg.sender);
        if (healthFactor < MIN_HEALTH_FACTOR) {
            // Simulate withdrawal and check health factor
            account.supplied[token] -= amount;
            uint256 newHealthFactor = calculateHealthFactor(msg.sender);
            account.supplied[token] += amount; // Revert for check
            require(newHealthFactor >= MIN_HEALTH_FACTOR, "Withdrawal would liquidate account");
        }
        
        Market storage market = markets[token];
        require(market.totalSupplied >= amount, "Insufficient market liquidity");
        
        // Update user account
        account.supplied[token] -= amount;
        account.lastUpdateTime = block.timestamp;
        
        // Update market totals
        market.totalSupplied -= amount;
        market.lastUpdateTime = block.timestamp;
        
        // Transfer tokens to user
        IERC20(token).transfer(msg.sender, amount);
        
        // Update interest rates
        updateInterestRates(token);
        
        emit Withdraw(msg.sender, token, amount);
    }
    
    /**
     * @dev Borrow tokens against collateral
     */
    function borrow(address token, uint256 amount) external nonReentrant {
        require(isMarketListed[token], "Market not listed");
        require(amount > 0, "Amount must be > 0");
        
        Market storage market = markets[token];
        require(market.active, "Market not active");
        require(market.totalSupplied >= market.totalBorrowed + amount, "Insufficient market liquidity");
        
        // Update market interest
        updateMarketInterest(token);
        
        // Check borrowing capacity
        uint256 borrowCapacity = getUserBorrowCapacity(msg.sender);
        uint256 currentBorrowValue = getUserTotalBorrowValue(msg.sender);
        require(currentBorrowValue + amount <= borrowCapacity, "Insufficient collateral");
        
        // Update user account
        UserAccount storage account = userAccounts[msg.sender];
        account.borrowed[token] += amount;
        account.borrowIndex[token] = block.timestamp;
        account.lastUpdateTime = block.timestamp;
        
        // Update market totals
        market.totalBorrowed += amount;
        market.lastUpdateTime = block.timestamp;
        
        // Transfer tokens to user
        IERC20(token).transfer(msg.sender, amount);
        
        // Update interest rates
        updateInterestRates(token);
        
        emit Borrow(msg.sender, token, amount);
    }
    
    /**
     * @dev Repay borrowed tokens
     */
    function repay(address token, uint256 amount) external nonReentrant {
        require(isMarketListed[token], "Market not listed");
        require(amount > 0, "Amount must be > 0");
        
        UserAccount storage account = userAccounts[msg.sender];
        uint256 borrowedAmount = account.borrowed[token];
        require(borrowedAmount > 0, "No debt to repay");
        
        // Update market interest
        updateMarketInterest(token);
        
        // Calculate actual repay amount (can't repay more than owed)
        uint256 actualRepayAmount = amount > borrowedAmount ? borrowedAmount : amount;
        
        // Transfer tokens from user
        IERC20(token).transferFrom(msg.sender, address(this), actualRepayAmount);
        
        // Update user account
        account.borrowed[token] -= actualRepayAmount;
        account.lastUpdateTime = block.timestamp;
        
        // Update market totals
        Market storage market = markets[token];
        market.totalBorrowed -= actualRepayAmount;
        market.lastUpdateTime = block.timestamp;
        
        // Update interest rates
        updateInterestRates(token);
        
        emit Repay(msg.sender, token, actualRepayAmount);
    }
    
    /**
     * @dev Liquidate unhealthy account
     */
    function liquidate(
        address borrower,
        address debtToken,
        uint256 debtAmount,
        address collateralToken
    ) external nonReentrant {
        require(isMarketListed[debtToken] && isMarketListed[collateralToken], "Markets not listed");
        require(debtAmount > 0, "Amount must be > 0");
        
        // Check if account is liquidatable
        uint256 healthFactor = calculateHealthFactor(borrower);
        require(healthFactor < MIN_HEALTH_FACTOR, "Account is healthy");
        
        UserAccount storage borrowerAccount = userAccounts[borrower];
        require(borrowerAccount.borrowed[debtToken] >= debtAmount, "Invalid debt amount");
        require(borrowerAccount.supplied[collateralToken] > 0, "No collateral");
        
        // Update market interest
        updateMarketInterest(debtToken);
        updateMarketInterest(collateralToken);
        
        Market storage debtMarket = markets[debtToken];
        Market storage collateralMarket = markets[collateralToken];
        
        // Calculate collateral to seize (including liquidation penalty)
        uint256 collateralToSeize = debtAmount + (debtAmount * collateralMarket.liquidationPenalty / BASIS_POINTS);
        require(borrowerAccount.supplied[collateralToken] >= collateralToSeize, "Insufficient collateral");
        
        // Transfer debt tokens from liquidator
        IERC20(debtToken).transferFrom(msg.sender, address(this), debtAmount);
        
        // Update borrower account
        borrowerAccount.borrowed[debtToken] -= debtAmount;
        borrowerAccount.supplied[collateralToken] -= collateralToSeize;
        borrowerAccount.lastUpdateTime = block.timestamp;
        
        // Update market totals
        debtMarket.totalBorrowed -= debtAmount;
        collateralMarket.totalSupplied -= collateralToSeize;
        
        // Transfer collateral to liquidator
        IERC20(collateralToken).transfer(msg.sender, collateralToSeize);
        
        // Update interest rates
        updateInterestRates(debtToken);
        updateInterestRates(collateralToken);
        
        emit Liquidation(msg.sender, borrower, collateralToken, debtToken, debtAmount);
    }
    
    /**
     * @dev Update market interest rates
     */
    function updateInterestRates(address token) internal {
        Market storage market = markets[token];
        InterestRateModel storage model = interestModels[token];
        
        // Calculate utilization rate
        if (market.totalSupplied == 0) {
            market.utilizationRate = 0;
        } else {
            market.utilizationRate = (market.totalBorrowed * BASIS_POINTS) / market.totalSupplied;
        }
        
        // Calculate borrow rate
        if (market.utilizationRate <= model.optimalUtilization) {
            market.borrowRate = model.baseRate + 
                (market.utilizationRate * model.multiplier) / model.optimalUtilization;
        } else {
            uint256 excessUtilization = market.utilizationRate - model.optimalUtilization;
            market.borrowRate = model.baseRate + model.multiplier +
                (excessUtilization * model.jumpMultiplier) / (BASIS_POINTS - model.optimalUtilization);
        }
        
        // Calculate supply rate (borrow rate * utilization * (1 - reserve factor))
        market.supplyRate = (market.borrowRate * market.utilizationRate * (BASIS_POINTS - market.reserveFactor)) / 
            (BASIS_POINTS * BASIS_POINTS);
    }
    
    /**
     * @dev Update market interest accrual
     */
    function updateMarketInterest(address token) internal {
        Market storage market = markets[token];
        uint256 timeElapsed = block.timestamp - market.lastUpdateTime;
        
        if (timeElapsed > 0 && market.totalBorrowed > 0) {
            // Compound interest calculation
            uint256 borrowInterest = (market.totalBorrowed * market.borrowRate * timeElapsed) / 
                (SECONDS_PER_YEAR * BASIS_POINTS);
            
            market.totalBorrowed += borrowInterest;
            
            // Add reserves
            uint256 reserves = (borrowInterest * market.reserveFactor) / BASIS_POINTS;
            market.totalSupplied += (borrowInterest - reserves);
        }
        
        market.lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Calculate user's health factor
     */
    function calculateHealthFactor(address user) public view returns (uint256) {
        uint256 totalCollateralValue = getUserTotalCollateralValue(user);
        uint256 totalBorrowValue = getUserTotalBorrowValue(user);
        
        if (totalBorrowValue == 0) {
            return type(uint256).max; // Infinite health factor
        }
        
        uint256 liquidationThresholdValue = 0;
        UserAccount storage account = userAccounts[user];
        
        for (uint256 i = 0; i < allMarkets.length; i++) {
            address token = allMarkets[i];
            uint256 supplied = account.supplied[token];
            if (supplied > 0) {
                Market storage market = markets[token];
                liquidationThresholdValue += (supplied * market.liquidationThreshold) / BASIS_POINTS;
            }
        }
        
        return (liquidationThresholdValue * 1e18) / totalBorrowValue;
    }
    
    /**
     * @dev Get user's total collateral value
     */
    function getUserTotalCollateralValue(address user) public view returns (uint256) {
        uint256 totalValue = 0;
        UserAccount storage account = userAccounts[user];
        
        for (uint256 i = 0; i < allMarkets.length; i++) {
            address token = allMarkets[i];
            uint256 supplied = account.supplied[token];
            if (supplied > 0) {
                totalValue += supplied; // In a real implementation, multiply by token price
            }
        }
        
        return totalValue;
    }
    
    /**
     * @dev Get user's total borrow value
     */
    function getUserTotalBorrowValue(address user) public view returns (uint256) {
        uint256 totalValue = 0;
        UserAccount storage account = userAccounts[user];
        
        for (uint256 i = 0; i < allMarkets.length; i++) {
            address token = allMarkets[i];
            uint256 borrowed = account.borrowed[token];
            if (borrowed > 0) {
                totalValue += borrowed; // In a real implementation, multiply by token price
            }
        }
        
        return totalValue;
    }
    
    /**
     * @dev Get user's borrowing capacity
     */
    function getUserBorrowCapacity(address user) public view returns (uint256) {
        uint256 totalCapacity = 0;
        UserAccount storage account = userAccounts[user];
        
        for (uint256 i = 0; i < allMarkets.length; i++) {
            address token = allMarkets[i];
            uint256 supplied = account.supplied[token];
            if (supplied > 0) {
                Market storage market = markets[token];
                totalCapacity += (supplied * market.collateralFactor) / BASIS_POINTS;
            }
        }
        
        return totalCapacity;
    }
    
    /**
     * @dev Get user account info
     */
    function getUserAccount(address user, address token) external view returns (uint256 supplied, uint256 borrowed) {
        UserAccount storage account = userAccounts[user];
        return (account.supplied[token], account.borrowed[token]);
    }
    
    /**
     * @dev Get market info
     */
    function getMarket(address token) external view returns (Market memory) {
        return markets[token];
    }
    
    /**
     * @dev Get all markets
     */
    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }
    
    /**
     * @dev Emergency pause market
     */
    function pauseMarket(address token) external onlyOwner {
        markets[token].active = false;
    }
    
    /**
     * @dev Resume market
     */
    function resumeMarket(address token) external onlyOwner {
        markets[token].active = true;
    }
}