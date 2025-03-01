// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Farm.sol";
import "./CRASH_v2.sol";
import "./BURN_v2.sol";
import "./LP2_token.sol";

/**
 * @title Pool1
 * @notice Constant-product AMM for A-B that issues LP1 tokens.
 */
contract Pool2 {
    IERC20 public tokenA;
    IERC20 public tokenB;
    LP2_token public lpToken; // The LP token for this pool
    Farm public farm; // The farm for this pool

    uint256 public reserveA;
    uint256 public reserveB;

    event AddLiquidity(address indexed provider, uint256 amountA, uint256 amountB, uint256 shares);
    event RemoveLiquidity(address indexed provider, uint256 amountA, uint256 amountB, uint256 shares);
    event Swap(address indexed trader, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB, address payable _farm) {
        farm = Farm(_farm);
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);

        // Deploy LP1 from here, so 'pool' in LP1 = address(this)
        lpToken = new LP2_token(address(this));
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        // Transfer in tokens
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        // Verificación contra front-running:
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        require(balanceA >= reserveA + amountA, "Insufficient A received");
        require(balanceB >= reserveB + amountB, "Insufficient B received");

        uint256 sharesToMint;
        if (reserveA == 0 && reserveB == 0) {
            // First liquidity
            sharesToMint = amountA + amountB; 
        } else {
            // Proportional share calc
            // For simplicity, we do: shares ~ min( (amountA * totalShares)/reserveA , (amountB * totalShares)/reserveB )
            uint256 totalShares = lpToken.totalSupply();
            uint256 shareA = (amountA * totalShares) / reserveA;
            uint256 shareB = (amountB * totalShares) / reserveB;
            sharesToMint = shareA < shareB ? shareA : shareB;
        }

        // Actualizar reservas con los balances reales:
        reserveA = balanceA;
        reserveB = balanceB;

        // Mint LP tokens to the provider
        lpToken.mint(msg.sender, sharesToMint);
        farm.registerLP2Holder(msg.sender);

        emit AddLiquidity(msg.sender, amountA, amountB, sharesToMint);
    }

    function removeLiquidity(uint256 shares) external {
        require(shares > 0, "Shares = 0");
        uint256 totalShares = lpToken.totalSupply();
        require(shares <= lpToken.balanceOf(msg.sender), "Not enough shares");

        // Calculate how much A/B to send back
        uint256 amountA = (shares * reserveA) / totalShares;
        uint256 amountB = (shares * reserveB) / totalShares;

        // Burn LP tokens
        lpToken.burn(msg.sender, shares);
        uint256 newBalance = lpToken.balanceOf(msg.sender);
        if (newBalance == 0) {
            farm.unregisterLP2Holder(msg.sender);
        }

        // Update reserves
        reserveA -= amountA;
        reserveB -= amountB;

        // Transfer A and B to the user
        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);

        emit RemoveLiquidity(msg.sender, amountA, amountB, shares);
    }

    function swapAforB(uint256 amountIn) external {
        require(amountIn > 0, "Zero amountIn");
        tokenA.transferFrom(msg.sender, address(this), amountIn);

        // 0.3% fee example => inEffective = amountIn * 997 / 1000
        uint256 inWithFee = (amountIn * 997) / 1000;
        uint256 amountOut = (reserveB * inWithFee) / (reserveA + inWithFee);

        reserveA += amountIn;
        reserveB -= amountOut;

        tokenB.transfer(msg.sender, amountOut);

        emit Swap(msg.sender, address(tokenA), amountIn, amountOut);
    }

    function swapBforA(uint256 amountIn) external {
        require(amountIn > 0, "Zero amountIn");
        tokenB.transferFrom(msg.sender, address(this), amountIn);

        // 0.3% fee
        uint256 inWithFee = (amountIn * 997) / 1000;
        uint256 amountOut = (reserveA * inWithFee) / (reserveB + inWithFee);

        reserveB += amountIn;
        reserveA -= amountOut;

        tokenA.transfer(msg.sender, amountOut);

        emit Swap(msg.sender, address(tokenB), amountIn, amountOut);
    }
}
