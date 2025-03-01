// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LP1_token.sol";
import "./LP2_token.sol";

contract Farm is ReentrancyGuard {
    address public constant DISTRIBUTOR = 0x19217e7c7a9550a824D3AbAba54443b44319F59f;
    address public owner;

    LP1_token public lp1;
    LP2_token public lp2;

    address public pool1;
    bool public poolAndLP1Set;

    address public pool2;
    bool public poolAndLP2Set;

    address[] public lp1Holders;
    address[] public lp2Holders;
    mapping(address => bool) public isLP1Holder;
    mapping(address => bool) public isLP2Holder;

    uint256 public lastDistributionTime;
    uint256 public constant DISTRIBUTION_INTERVAL = 15 minutes;
    uint256 public constant MAX_DISTRIBUTION_PER_CALL = 5 * 1e18;

    constructor() {
        owner = msg.sender;
        lastDistributionTime = block.timestamp;
    }

    receive() external payable {} // Para recibir el token nativo

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function setPoolAndLP1(address _pool1, address _lp1) external onlyOwner {
        require(!poolAndLP1Set, "Pool1 y LP1 ya configurados");
        require(_pool1 != address(0) && _lp1 != address(0), "Invalid addresses");
        pool1 = _pool1;
        lp1 = LP1_token(_lp1);
        poolAndLP1Set = true;
    }

    function setPoolAndLP2(address _pool2, address _lp2) external onlyOwner {
        require(!poolAndLP2Set, "Pool2 y LP2 ya configurados");
        require(_pool2 != address(0) && _lp2 != address(0), "Invalid addresses");
        pool2 = _pool2;
        lp2 = LP2_token(_lp2);
        poolAndLP2Set = true;
    }

    function registerLP1Holder(address holder) external {
        require(msg.sender == pool1, "Solo Pool1 puede registrar");
        if (!isLP1Holder[holder]) {
            isLP1Holder[holder] = true;
            lp1Holders.push(holder);
        }
    }

    function registerLP2Holder(address holder) external {
        require(msg.sender == pool2, "Solo Pool2 puede registrar");
        if (!isLP2Holder[holder]) {
            isLP2Holder[holder] = true;
            lp2Holders.push(holder);
        }
    }

    function unregisterLP1Holder(address holder) external {
        require(msg.sender == pool1, "Solo Pool1 puede registrar");
        if (isLP1Holder[holder]) {
            isLP1Holder[holder] = false;
            for (uint256 i = 0; i < lp1Holders.length; i++) {
                if (lp1Holders[i] == holder) {
                    lp1Holders[i] = lp1Holders[lp1Holders.length - 1];
                    lp1Holders.pop();
                    break;
                }
            }
        }
    }   

    function unregisterLP2Holder(address holder) external {
        require(msg.sender == pool2, "Solo Pool2 puede registrar");
        if (isLP2Holder[holder]) {
            isLP2Holder[holder] = false;
            for (uint256 i = 0; i < lp2Holders.length; i++) {
                if (lp2Holders[i] == holder) {
                    lp2Holders[i] = lp2Holders[lp2Holders.length - 1];
                    lp2Holders.pop();
                    break;
                }
            }
        }
    }

    function Distribute_Rewards() external nonReentrant {
        require(msg.sender == DISTRIBUTOR || msg.sender == owner, "Not authorized");
        //require(block.timestamp >= lastDistributionTime + DISTRIBUTION_INTERVAL, "Wait 15 minutes");

        uint256 balanceNative = address(this).balance;
        require(balanceNative > 0, "No funds to distribute");

        uint256 toDistribute = (balanceNative > MAX_DISTRIBUTION_PER_CALL) ? MAX_DISTRIBUTION_PER_CALL : balanceNative;

        uint256 lp1Supply = lp1.totalSupply();
        uint256 lp2Supply = lp2.totalSupply();
        uint256 totalShares = lp1Supply + lp2Supply;
        
        if (totalShares == 0) return;

        // Distribuir a LP1
        for (uint256 i = 0; i < lp1Holders.length; i++) {
            address holder = lp1Holders[i];
            uint256 holderBalance = lp1.balanceOf(holder);
            if (holderBalance > 0) {
                uint256 share = (toDistribute * holderBalance) / totalShares;
                if (share > 0) {
                    (bool success, ) = holder.call{value: share}("");
                    require(success, "Transfer to LP1 holder failed");
                }
            }
        }

        // Distribuir a LP2
        for (uint256 j = 0; j < lp2Holders.length; j++) {
            address holder = lp2Holders[j];
            uint256 holderBalance = lp2.balanceOf(holder);
            if (holderBalance > 0) {
                uint256 share = (toDistribute * holderBalance) / totalShares;
                if (share > 0) {
                    (bool success, ) = holder.call{value: share}("");
                    require(success, "Transfer to LP2 holder failed");
                }
            }
        }

        lastDistributionTime = block.timestamp;
    }
    
    function transfer(address to, uint256 amount) external nonReentrant returns (bool) {
        require(msg.sender == owner, "Not authorized");
        require(to != address(0), "Invalid address");
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        return true;
    }
}