// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title MockTestnetToken
 * @notice A minimal ERC20 token for local testing to simulate the "real testnet token".
 *         You can mint all tokens to your deployer for demonstration.
 */
contract MockTestnetToken {
    string public name = "Mock Testnet Token";
    string public symbol = "MTT"; // or any symbol
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    /**
     * @dev Constructor mints `initialSupply` tokens (scaled by 10^18) to the deployer.
     * @param initialSupply The number of tokens (without decimals) to mint initially.
     */
    constructor(uint256 initialSupply) {
        // e.g. if initialSupply = 1000000, you get 1,000,000 * 10^18 total tokens
        totalSupply = initialSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    /**
     * @notice Standard ERC20 transfer from caller to `_to`.
     */
    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    /**
     * @notice Approve `_spender` to spend `_amount` tokens on your behalf.
     */
    function approve(address _spender, uint256 _amount) public returns (bool) {
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
     * @notice Transfer tokens from `_from` to `_to`, using allowance.
     */
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _amount, "Allowance exceeded");

        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        allowance[_from][msg.sender] -= _amount;

        emit Transfer(_from, _to, _amount);
        return true;
    }
}
