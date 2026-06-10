// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlatformToken is ERC20, Ownable {
    mapping(address => bool) public isMinter;

    event MinterStatusChanged(address indexed account, bool isMinter);

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "PlatformToken: caller is not minter or owner");
        _;
    }

    constructor(uint256 initialSupply) ERC20("DefiNftToken", "DNFT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**decimals());
        isMinter[msg.sender] = true;
    }

    function setMinter(address account, bool status) external onlyOwner {
        isMinter[account] = status;
        emit MinterStatusChanged(account, status);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(from == msg.sender || allowance(from, msg.sender) >= amount, "PlatformToken: burn amount exceeds allowance");
        if (from != msg.sender) {
            _approve(from, msg.sender, allowance(from, msg.sender) - amount);
        }
        _burn(from, amount);
    }
}
