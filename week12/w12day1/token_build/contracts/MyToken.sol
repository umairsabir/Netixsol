// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract UmairToken is ERC20, ERC20Permit {
    constructor(uint256 initialSupply) ERC20("Umair Token", "UR") ERC20Permit("Umair Token") {
        _mint(msg.sender, initialSupply);
    }
}