// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IMintableToken {
    function mint(address to, uint256 amount) external;
}

contract TokenFaucet is Ownable {
    IMintableToken public platformToken;
    uint256 public constant CLAIM_AMOUNT = 100 * 10**18;
    uint256 public constant COOLDOWN_TIME = 24 hours;

    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount);

    constructor(address _platformToken) Ownable(msg.sender) {
        require(_platformToken != address(0), "TokenFaucet: token address cannot be zero");
        platformToken = IMintableToken(_platformToken);
    }

    function claimTokens() external {
        require(block.timestamp >= lastClaimTime[msg.sender] + COOLDOWN_TIME, "TokenFaucet: cooldown period active");
        
        lastClaimTime[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += CLAIM_AMOUNT;

        platformToken.mint(msg.sender, CLAIM_AMOUNT);
        emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
    }

    function getTimeUntilNextClaim(address user) external view returns (uint256) {
        if (block.timestamp >= lastClaimTime[user] + COOLDOWN_TIME) {
            return 0;
        }
        return (lastClaimTime[user] + COOLDOWN_TIME) - block.timestamp;
    }

    function getTotalClaimed(address user) external view returns (uint256) {
        return totalClaimed[user];
    }
}
