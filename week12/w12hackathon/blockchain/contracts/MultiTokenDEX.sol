// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiTokenDEX is Ownable {
    struct Pool {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalLPSupply;
        bool exists;
    }

    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => mapping(address => uint256)) public lpBalances;
    mapping(bytes32 => mapping(address => uint256)) public feesEarned;
    bytes32[] public poolKeys;

    event LiquidityAdded(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 lpShares
    );

    event LiquidityRemoved(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 lpShares
    );

    event Swap(
        address indexed sender,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address to
    );

    constructor() Ownable(msg.sender) {}

    function getPair(address tokenA, address tokenB) public pure returns (address token0, address token1) {
        require(tokenA != tokenB, "MultiTokenDEX: identical addresses");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "MultiTokenDEX: zero address");
    }

    function getPairId(address tokenA, address tokenB) public pure returns (bytes32) {
        (address token0, address token1) = getPair(tokenA, tokenB);
        return keccak256(abi.encodePacked(token0, token1));
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired
    ) external returns (uint256 amountA, uint256 amountB, uint256 lpShares) {
        (address token0, address token1) = getPair(tokenA, tokenB);
        bytes32 pairId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[pairId];

        if (!pool.exists) {
            pool.token0 = token0;
            pool.token1 = token1;
            pool.exists = true;
            poolKeys.push(pairId);
        }

        uint256 amount0Desired = tokenA == token0 ? amountADesired : amountBDesired;
        uint256 amount1Desired = tokenA == token0 ? amountBDesired : amountADesired;

        uint256 amount0;
        uint256 amount1;

        if (pool.totalLPSupply == 0) {
            amount0 = amount0Desired;
            amount1 = amount1Desired;
            lpShares = sqrt(amount0 * amount1);
        } else {
            uint256 amount1Optimal = (amount0Desired * pool.reserve1) / pool.reserve0;
            if (amount1Optimal <= amount1Desired) {
                amount0 = amount0Desired;
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amount1Desired * pool.reserve0) / pool.reserve1;
                assert(amount0Optimal <= amount0Desired);
                amount0 = amount0Optimal;
                amount1 = amount1Desired;
            }

            uint256 share0 = (amount0 * pool.totalLPSupply) / pool.reserve0;
            uint256 share1 = (amount1 * pool.totalLPSupply) / pool.reserve1;
            lpShares = share0 < share1 ? share0 : share1;
        }

        require(lpShares > 0, "MultiTokenDEX: insufficient LP minted");

        // Transfer tokens from sender to DEX
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);

        pool.reserve0 += amount0;
        pool.reserve1 += amount1;
        pool.totalLPSupply += lpShares;
        lpBalances[pairId][msg.sender] += lpShares;

        amountA = tokenA == token0 ? amount0 : amount1;
        amountB = tokenA == token0 ? amount1 : amount0;

        emit LiquidityAdded(msg.sender, token0, token1, amount0, amount1, lpShares);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 lpShares
    ) external returns (uint256 amountA, uint256 amountB) {
        (address token0, address token1) = getPair(tokenA, tokenB);
        bytes32 pairId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[pairId];
        require(pool.exists, "MultiTokenDEX: pool does not exist");
        require(lpBalances[pairId][msg.sender] >= lpShares, "MultiTokenDEX: insufficient LP balance");

        uint256 amount0 = (lpShares * pool.reserve0) / pool.totalLPSupply;
        uint256 amount1 = (lpShares * pool.reserve1) / pool.totalLPSupply;

        require(amount0 > 0 && amount1 > 0, "MultiTokenDEX: insufficient liquidity burned");

        lpBalances[pairId][msg.sender] -= lpShares;
        pool.totalLPSupply -= lpShares;
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;

        IERC20(token0).transfer(msg.sender, amount0);
        IERC20(token1).transfer(msg.sender, amount1);

        amountA = tokenA == token0 ? amount0 : amount1;
        amountB = tokenA == token0 ? amount1 : amount0;

        emit LiquidityRemoved(msg.sender, token0, token1, amount0, amount1, lpShares);
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external returns (uint256 amountOut) {
        (address token0, address token1) = getPair(tokenIn, tokenOut);
        bytes32 pairId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[pairId];
        require(pool.exists, "MultiTokenDEX: pool does not exist");

        uint256 reserveIn = tokenIn == token0 ? pool.reserve0 : pool.reserve1;
        uint256 reserveOut = tokenIn == token0 ? pool.reserve1 : pool.reserve0;

        // Calculate amountOut (constant product with 0.3% fee)
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;

        require(amountOut >= minAmountOut, "MultiTokenDEX: slippage limit exceeded");

        // Execute token transfers
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(to, amountOut);

        // Update reserves
        if (tokenIn == token0) {
            pool.reserve0 += amountIn;
            pool.reserve1 -= amountOut;
        } else {
            pool.reserve1 += amountIn;
            pool.reserve0 -= amountOut;
        }

        // Track fee (0.3% of amountIn)
        uint256 fee = (amountIn * 3) / 1000;
        feesEarned[pairId][tokenIn] += fee;

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut, to);
    }

    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        (address token0, address token1) = getPair(tokenIn, tokenOut);
        bytes32 pairId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[pairId];
        require(pool.exists, "MultiTokenDEX: pool does not exist");

        uint256 reserveIn = tokenIn == token0 ? pool.reserve0 : pool.reserve1;
        uint256 reserveOut = tokenIn == token0 ? pool.reserve1 : pool.reserve0;

        require(amountIn > 0, "MultiTokenDEX: insufficient input");
        require(reserveIn > 0 && reserveOut > 0, "MultiTokenDEX: pool lacks liquidity");

        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;
    }

    function getAmountIn(
        address tokenIn,
        address tokenOut,
        uint256 amountOut
    ) public view returns (uint256 amountIn) {
        (address token0, address token1) = getPair(tokenIn, tokenOut);
        bytes32 pairId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[pairId];
        require(pool.exists, "MultiTokenDEX: pool does not exist");

        uint256 reserveIn = tokenIn == token0 ? pool.reserve0 : pool.reserve1;
        uint256 reserveOut = tokenIn == token0 ? pool.reserve1 : pool.reserve0;

        require(amountOut > 0, "MultiTokenDEX: insufficient output");
        require(amountOut < reserveOut, "MultiTokenDEX: insufficient pool depth");
        require(reserveIn > 0 && reserveOut > 0, "MultiTokenDEX: pool lacks liquidity");

        uint256 numerator = reserveIn * amountOut * 1000;
        uint256 denominator = (reserveOut - amountOut) * 997;
        amountIn = (numerator / denominator) + 1;
    }

    function getReserves(address tokenA, address tokenB) public view returns (uint256 reserveA, uint256 reserveB) {
        (address token0, address token1) = getPair(tokenA, tokenB);
        bytes32 pairId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[pairId];
        if (!pool.exists) {
            return (0, 0);
        }
        reserveA = tokenA == token0 ? pool.reserve0 : pool.reserve1;
        reserveB = tokenA == token0 ? pool.reserve1 : pool.reserve0;
    }

    function getPoolKeys() external view returns (bytes32[] memory) {
        return poolKeys;
    }

    function getLPShares(address tokenA, address tokenB, address user) external view returns (uint256) {
        bytes32 pairId = getPairId(tokenA, tokenB);
        return lpBalances[pairId][user];
    }

    function getFeesEarned(address tokenA, address tokenB, address token) external view returns (uint256) {
        bytes32 pairId = getPairId(tokenA, tokenB);
        return feesEarned[pairId][token];
    }

    // Babylonian square root method
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
