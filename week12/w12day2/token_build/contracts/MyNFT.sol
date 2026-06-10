// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract UmairNFT is ERC721, ERC2981, Ownable {
    using Strings for uint256;

    uint256 public mintPrice = 0.01 ether;
    uint256 public constant MAX_SUPPLY = 500;
    uint256 public tokenIdCounter = 1; // Start counting from 1

    bool public revealed = false;
    string public baseURI = "ipfs://QmRevealedBaseHash/";
    string public notRevealedURI = "ipfs://QmNotRevealedPlaceholderHash/hidden.json";

    bool public onlyWhitelist = false;
    mapping(address => bool) public whitelist;

    constructor() ERC721("Umair Token", "UTNFT") Ownable(msg.sender) {
        // Set default royalty to 5% (500 basis points) to the deployer/owner
        _setDefaultRoyalty(msg.sender, 500);
    }

    // Mint function
    function mint(uint256 amount) public payable {
        require(amount > 0 && amount <= 5, "Can mint between 1 and 5 NFTs at once");
        require(tokenIdCounter + amount - 1 <= MAX_SUPPLY, "Would exceed max supply");
        require(msg.value >= mintPrice * amount, "Insufficient payment");

        if (onlyWhitelist) {
            require(whitelist[msg.sender], "Address is not whitelisted");
        }

        for (uint256 i = 0; i < amount; i++) {
            _safeMint(msg.sender, tokenIdCounter);
            tokenIdCounter++;
        }
    }

    // Dynamic tokenURI depending on reveal state
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        if (!revealed) {
            return notRevealedURI;
        }

        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }

    // Whitelist management
    function setWhitelist(address user, bool status) external onlyOwner {
        whitelist[user] = status;
    }

    function batchSetWhitelist(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
        }
    }

    // Toggle whitelist mode
    function setOnlyWhitelist(bool val) external onlyOwner {
        onlyWhitelist = val;
    }

    // Toggle reveal status
    function setRevealed(bool val) external onlyOwner {
        revealed = val;
    }

    // Set base URI
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    // Set unrevealed URI
    function setNotRevealedURI(string calldata newNotRevealedURI) external onlyOwner {
        notRevealedURI = newNotRevealedURI;
    }

    // Set mint price
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    // EIP-2981 royalty management
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    // SupportsInterface implementation override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Withdraw balance
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
