// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title ManifoldDEX
 * @dev Automated Market Maker DEX for Chainweb EVM
 * Features: Token swaps, liquidity provision, LP tokens, fee collection
 */
contract ManifoldDEX is ReentrancyGuard, Ownable {
    using Math for uint256;

    // LP Token for liquidity providers
    mapping(address => mapping(address => address)) public getLPToken;
    mapping(address => Pool) public pools;
    mapping(address => bool) public isLPToken;
    
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalSupply;
        uint256 feeRate; // Fee rate in basis points (300 = 0.3%)
        uint256 lastUpdate;
        bool active;
    }
    
    struct LiquidityPosition {
        uint256 lpTokens;
        uint256 tokenAAmount;
        uint256 tokenBAmount;
        uint256 timestamp;
    }
    
    mapping(address => mapping(address => LiquidityPosition)) public liquidityPositions;
    
    // Events
    event PoolCreated(address indexed tokenA, address indexed tokenB, address lpToken);
    event LiquidityAdded(address indexed user, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 lpTokens);
    event LiquidityRemoved(address indexed user, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 lpTokens);
    event Swap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 fee);
    
    // Constants
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant DEFAULT_FEE = 300; // 0.3%
    uint256 private constant MINIMUM_LIQUIDITY = 1000;
    
    constructor() {}
    
    /**
     * @dev Create a new liquidity pool
     */
    function createPool(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (address lpToken) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(amountA > 0 && amountB > 0, "Insufficient amounts");
        
        // Order tokens
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(getLPToken[token0][token1] == address(0), "Pool exists");
        
        // Create LP token
        lpToken = address(new LPToken(
            string(abi.encodePacked("LP-", ERC20(token0).symbol(), "-", ERC20(token1).symbol())),
            string(abi.encodePacked("LP", ERC20(token0).symbol(), ERC20(token1).symbol()))
        ));
        
        getLPToken[token0][token1] = lpToken;
        isLPToken[lpToken] = true;
        
        // Initialize pool
        pools[lpToken] = Pool({
            tokenA: token0,
            tokenB: token1,
            reserveA: 0,
            reserveB: 0,
            totalSupply: 0,
            feeRate: DEFAULT_FEE,
            lastUpdate: block.timestamp,
            active: true
        });
        
        emit PoolCreated(token0, token1, lpToken);
        
        // Add initial liquidity
        addLiquidity(token0, token1, amountA, amountB, 0, 0);
        
        return lpToken;
    }
    
    /**
     * @dev Add liquidity to existing pool
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) public nonReentrant returns (uint256 amountA, uint256 amountB, uint256 lpTokens) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        address lpToken = getLPToken[token0][token1];
        require(lpToken != address(0), "Pool doesn't exist");
        
        Pool storage pool = pools[lpToken];
        require(pool.active, "Pool inactive");
        
        // Calculate optimal amounts
        if (pool.reserveA == 0 && pool.reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = (amountADesired * pool.reserveB) / pool.reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient B amount");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = (amountBDesired * pool.reserveA) / pool.reserveB;
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "Insufficient A amount");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
        
        // Transfer tokens
        IERC20(token0).transferFrom(msg.sender, address(this), amountA);
        IERC20(token1).transferFrom(msg.sender, address(this), amountB);
        
        // Calculate LP tokens to mint
        if (pool.totalSupply == 0) {
            lpTokens = Math.sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            LPToken(lpToken).mint(address(1), MINIMUM_LIQUIDITY); // Permanently lock minimum liquidity
        } else {
            lpTokens = Math.min(
                (amountA * pool.totalSupply) / pool.reserveA,
                (amountB * pool.totalSupply) / pool.reserveB
            );
        }
        
        require(lpTokens > 0, "Insufficient liquidity minted");
        
        // Update pool state
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalSupply += lpTokens;
        pool.lastUpdate = block.timestamp;
        
        // Mint LP tokens
        LPToken(lpToken).mint(msg.sender, lpTokens);
        
        // Update user position
        LiquidityPosition storage position = liquidityPositions[msg.sender][lpToken];
        position.lpTokens += lpTokens;
        position.tokenAAmount += amountA;
        position.tokenBAmount += amountB;
        position.timestamp = block.timestamp;
        
        emit LiquidityAdded(msg.sender, token0, token1, amountA, amountB, lpTokens);
    }
    
    /**
     * @dev Remove liquidity from pool
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 lpTokens,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        address lpToken = getLPToken[token0][token1];
        require(lpToken != address(0), "Pool doesn't exist");
        
        Pool storage pool = pools[lpToken];
        
        // Calculate amounts to return
        uint256 balance = IERC20(lpToken).balanceOf(msg.sender);
        require(balance >= lpTokens, "Insufficient LP tokens");
        
        amountA = (lpTokens * pool.reserveA) / pool.totalSupply;
        amountB = (lpTokens * pool.reserveB) / pool.totalSupply;
        
        require(amountA >= amountAMin && amountB >= amountBMin, "Insufficient amounts");
        
        // Burn LP tokens
        LPToken(lpToken).burnFrom(msg.sender, lpTokens);
        
        // Update pool state
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalSupply -= lpTokens;
        pool.lastUpdate = block.timestamp;
        
        // Transfer tokens back
        IERC20(token0).transfer(msg.sender, amountA);
        IERC20(token1).transfer(msg.sender, amountB);
        
        // Update user position
        LiquidityPosition storage position = liquidityPositions[msg.sender][lpToken];
        position.lpTokens -= lpTokens;
        position.tokenAAmount -= amountA;
        position.tokenBAmount -= amountB;
        
        emit LiquidityRemoved(msg.sender, token0, token1, amountA, amountB, lpTokens);
    }
    
    /**
     * @dev Swap exact tokens for tokens
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "Expired");
        require(path.length >= 2, "Invalid path");
        
        amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output amount");
        
        IERC20(path[0]).transferFrom(msg.sender, address(this), amounts[0]);
        _swap(amounts, path, to);
    }
    
    /**
     * @dev Internal swap function
     */
    function _swap(uint256[] memory amounts, address[] memory path, address to) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address tokenIn, address tokenOut) = (path[i], path[i + 1]);
            (address token0, address token1) = tokenIn < tokenOut ? (tokenIn, tokenOut) : (tokenOut, tokenIn);
            uint256 amountOut = amounts[i + 1];
            
            address lpToken = getLPToken[token0][token1];
            Pool storage pool = pools[lpToken];
            
            (uint256 amount0Out, uint256 amount1Out) = 
                tokenIn == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            
            // Calculate and deduct fee
            uint256 fee = (amounts[i] * pool.feeRate) / BASIS_POINTS;
            
            // Update reserves
            if (tokenIn == token0) {
                pool.reserveA += amounts[i];
                pool.reserveB -= amountOut;
            } else {
                pool.reserveB += amounts[i];
                pool.reserveA -= amountOut;
            }
            
            pool.lastUpdate = block.timestamp;
            
            // Transfer output tokens
            if (i == path.length - 2) {
                IERC20(tokenOut).transfer(to, amountOut);
            }
            
            emit Swap(msg.sender, tokenIn, tokenOut, amounts[i], amountOut, fee);
        }
    }
    
    /**
     * @dev Get amounts out for swap
     */
    function getAmountsOut(uint256 amountIn, address[] memory path)
        public view returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i; i < path.length - 1; i++) {
            (address tokenIn, address tokenOut) = (path[i], path[i + 1]);
            (address token0, address token1) = tokenIn < tokenOut ? (tokenIn, tokenOut) : (tokenOut, tokenIn);
            
            address lpToken = getLPToken[token0][token1];
            Pool memory pool = pools[lpToken];
            
            uint256 reserveIn = tokenIn == token0 ? pool.reserveA : pool.reserveB;
            uint256 reserveOut = tokenIn == token0 ? pool.reserveB : pool.reserveA;
            
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut, pool.feeRate);
        }
    }
    
    /**
     * @dev Calculate output amount for swap
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut, uint256 feeRate)
        public pure returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (BASIS_POINTS - feeRate);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * BASIS_POINTS) + amountInWithFee;
        amountOut = numerator / denominator;
    }
    
    /**
     * @dev Get pool information
     */
    function getPool(address tokenA, address tokenB) external view returns (Pool memory) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        address lpToken = getLPToken[token0][token1];
        return pools[lpToken];
    }
    
    /**
     * @dev Get user's liquidity position
     */
    function getUserPosition(address user, address tokenA, address tokenB) 
        external view returns (LiquidityPosition memory) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        address lpToken = getLPToken[token0][token1];
        return liquidityPositions[user][lpToken];
    }
    
    /**
     * @dev Emergency functions
     */
    function pausePool(address tokenA, address tokenB) external onlyOwner {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        address lpToken = getLPToken[token0][token1];
        pools[lpToken].active = false;
    }
    
    function unpausePool(address tokenA, address tokenB) external onlyOwner {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        address lpToken = getLPToken[token0][token1];
        pools[lpToken].active = true;
    }
}

/**
 * @title LPToken
 * @dev ERC20 token representing liquidity provider shares
 */
contract LPToken is ERC20 {
    address public dex;
    
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        dex = msg.sender;
    }
    
    modifier onlyDEX() {
        require(msg.sender == dex, "Only DEX can call");
        _;
    }
    
    function mint(address to, uint256 amount) external onlyDEX {
        _mint(to, amount);
    }
    
    function burnFrom(address from, uint256 amount) external onlyDEX {
        _burn(from, amount);
    }
}