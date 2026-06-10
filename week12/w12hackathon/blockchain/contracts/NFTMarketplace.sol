// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

interface INFTCollection is IERC721 {
    function mintNFT(address to, string memory tokenURI) external returns (uint256);
}

interface IMultiTokenDEX {
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external returns (uint256 amountOut);

    function getAmountIn(
        address tokenIn,
        address tokenOut,
        uint256 amountOut
    ) external view returns (uint256 amountIn);
}

contract NFTMarketplace is Ownable, ERC721Holder {
    struct Listing {
        address seller;
        uint256 price; // Price in platform token
        bool active;
    }

    IERC721 public nftCollection;
    IERC20 public platformToken;
    IMultiTokenDEX public dex;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => address) public creators;
    uint256[] public listedTokenIds;

    event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price);
    event NFTListingCancelled(address indexed seller, uint256 indexed tokenId);
    event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price, address paymentToken);
    event NFTMintedAndListed(address indexed creator, uint256 indexed tokenId, uint256 price, string tokenURI);

    constructor(
        address _nftCollection,
        address _platformToken,
        address _dex
    ) Ownable(msg.sender) {
        require(_nftCollection != address(0), "NFTMarketplace: zero address");
        require(_platformToken != address(0), "NFTMarketplace: zero address");
        require(_dex != address(0), "NFTMarketplace: zero address");

        nftCollection = IERC721(_nftCollection);
        platformToken = IERC20(_platformToken);
        dex = IMultiTokenDEX(_dex);
    }

    function mintAndListNFT(string memory tokenURI, uint256 price) external onlyOwner returns (uint256) {
        require(price > 0, "NFTMarketplace: price must be greater than zero");
        
        // Mint NFT directly to this contract for escrow
        uint256 tokenId = INFTCollection(address(nftCollection)).mintNFT(address(this), tokenURI);
        
        listings[tokenId] = Listing(msg.sender, price, true);
        creators[tokenId] = msg.sender;
        listedTokenIds.push(tokenId);

        emit NFTMintedAndListed(msg.sender, tokenId, price, tokenURI);
        emit NFTListed(msg.sender, tokenId, price);
        return tokenId;
    }

    function listNFT(uint256 tokenId, uint256 price) external {
        require(price > 0, "NFTMarketplace: price must be greater than zero");
        require(nftCollection.ownerOf(tokenId) == msg.sender, "NFTMarketplace: not the owner");
        
        // Transfer NFT to Marketplace escrow
        nftCollection.transferFrom(msg.sender, address(this), tokenId);

        listings[tokenId] = Listing(msg.sender, price, true);
        if (creators[tokenId] == address(0)) {
            creators[tokenId] = msg.sender; // Set the original creator if not set
        }
        listedTokenIds.push(tokenId);

        emit NFTListed(msg.sender, tokenId, price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "NFTMarketplace: listing not active");
        require(listing.seller == msg.sender, "NFTMarketplace: not the seller");

        listing.active = false;
        removeListedToken(tokenId);

        // Return NFT from escrow
        nftCollection.transferFrom(address(this), msg.sender, tokenId);

        emit NFTListingCancelled(msg.sender, tokenId);
    }

    function buyNFTWithPlatformToken(uint256 tokenId) public {
        Listing storage listing = listings[tokenId];
        require(listing.active, "NFTMarketplace: listing not active");
        
        uint256 price = listing.price;
        address seller = listing.seller;
        address creator = creators[tokenId];

        listing.active = false;
        removeListedToken(tokenId);

        // Pay 2.5% royalty to creator, rest to seller
        uint256 royalty = (price * 25) / 1000;
        uint256 sellerProceeds = price - royalty;

        // Pull platform token from buyer
        platformToken.transferFrom(msg.sender, address(this), price);

        // Distribute funds
        if (royalty > 0 && creator != address(0)) {
            platformToken.transfer(creator, royalty);
        }
        platformToken.transfer(seller, sellerProceeds);

        // Transfer NFT to buyer
        nftCollection.transferFrom(address(this), msg.sender, tokenId);

        emit NFTSold(seller, msg.sender, tokenId, price, address(platformToken));
    }

    function buyNFTWithToken(uint256 tokenId, address paymentToken) external {
        if (paymentToken == address(platformToken)) {
            buyNFTWithPlatformToken(tokenId);
            return;
        }

        Listing storage listing = listings[tokenId];
        require(listing.active, "NFTMarketplace: listing not active");

        uint256 price = listing.price;
        address seller = listing.seller;
        address creator = creators[tokenId];

        // Query DEX for the required amount of paymentToken
        uint256 amountIn = dex.getAmountIn(paymentToken, address(platformToken), price);

        listing.active = false;
        removeListedToken(tokenId);

        // Transfer paymentToken from buyer to Marketplace
        IERC20(paymentToken).transferFrom(msg.sender, address(this), amountIn);

        // Approve DEX and swap paymentToken to platformToken
        IERC20(paymentToken).approve(address(dex), amountIn);
        dex.swap(paymentToken, address(platformToken), amountIn, price, address(this));

        // Pay 2.5% royalty to creator, rest to seller
        uint256 royalty = (price * 25) / 1000;
        uint256 sellerProceeds = price - royalty;

        // Distribute platform tokens
        if (royalty > 0 && creator != address(0)) {
            platformToken.transfer(creator, royalty);
        }
        platformToken.transfer(seller, sellerProceeds);

        // Transfer NFT to buyer
        nftCollection.transferFrom(address(this), msg.sender, tokenId);

        emit NFTSold(seller, msg.sender, tokenId, price, paymentToken);
    }

    function calculatePriceInToken(uint256 tokenId, address paymentToken) external view returns (uint256) {
        Listing storage listing = listings[tokenId];
        require(listing.active, "NFTMarketplace: listing not active");
        uint256 price = listing.price;

        if (paymentToken == address(platformToken)) {
            return price;
        }

        return dex.getAmountIn(paymentToken, address(platformToken), price);
    }

    function listAllNFTs() external view returns (uint256[] memory) {
        return listedTokenIds;
    }

    function removeListedToken(uint256 tokenId) internal {
        uint256 length = listedTokenIds.length;
        for (uint256 i = 0; i < length; i++) {
            if (listedTokenIds[i] == tokenId) {
                listedTokenIds[i] = listedTokenIds[length - 1];
                listedTokenIds.pop();
                break;
            }
        }
    }
}
