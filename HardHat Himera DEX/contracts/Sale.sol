/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // <-- Interfaz estándar
import "./CRASH_v2.sol";
import "./BURN_v2.sol";

contract Sale is ReentrancyGuard {
    CRASH public tokenA;
    BURN public tokenB;
    address public farm;

    uint256 public constant RATE = 100;

    // Eventos declarados
    event BuyA(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event BuyB(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);

    constructor(address _tokenA, address _tokenB, address _farm) {
        tokenA = CRASH(_tokenA);
        tokenB = BURN(_tokenB);
        farm = _farm;
    }

    function buyCRASH() external payable nonReentrant {
        _processPurchase(msg.value, IERC20(address(tokenA))); // Casting a IERC20
        emit BuyA(msg.sender, msg.value, msg.value * RATE);
    }

    function buyBURN() external payable nonReentrant {
        _processPurchase(msg.value, IERC20(address(tokenB))); // Casting a IERC20
        emit BuyB(msg.sender, msg.value, msg.value * RATE);
    }

    function _processPurchase(uint256 testAmount, IERC20 token) private {
        require(testAmount > 0, "Zero TEST");
        uint256 tokenAmount = testAmount * RATE;
        
        require(
            token.balanceOf(address(this)) >= tokenAmount,
            "Insufficient token reserve"
        );
        
        require(
            token.transfer(msg.sender, tokenAmount),
            "Token transfer failed"
        );

        (bool sent, ) = farm.call{value: testAmount}("");
        require(sent, "TEST transfer failed");
    }
}