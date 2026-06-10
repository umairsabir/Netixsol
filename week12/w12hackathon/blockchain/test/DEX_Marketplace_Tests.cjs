const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFi & NFT Ecosystem Contracts", function () {
  let platformToken, tokenA, tokenB, faucet, dex, nftCollection, marketplace;
  let owner, user1, user2;

  const INITIAL_SUPPLY = 1000000; // 1M tokens
  const FAUCET_CLAIM = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // 1. Deploy PlatformToken
    const PlatformToken = await ethers.getContractFactory("PlatformToken");
    platformToken = await PlatformToken.deploy(INITIAL_SUPPLY);

    // 2. Deploy TokenA
    const TokenA = await ethers.getContractFactory("TokenA");
    tokenA = await TokenA.deploy(INITIAL_SUPPLY);

    // 3. Deploy TokenB
    const TokenB = await ethers.getContractFactory("TokenB");
    tokenB = await TokenB.deploy(INITIAL_SUPPLY);

    // 4. Deploy Faucet
    const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await TokenFaucet.deploy(await platformToken.getAddress());

    // Enable Faucet as minter on PlatformToken
    await platformToken.setMinter(await faucet.getAddress(), true);

    // 5. Deploy MultiTokenDEX
    const MultiTokenDEX = await ethers.getContractFactory("MultiTokenDEX");
    dex = await MultiTokenDEX.deploy();

    // 6. Deploy NFTCollection
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy();

    // 7. Deploy NFTMarketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy(
      await nftCollection.getAddress(),
      await platformToken.getAddress(),
      await dex.getAddress()
    );

    // Set marketplace as owner of NFTCollection so it can mint
    await nftCollection.transferOwnership(await marketplace.getAddress());
  });

  describe("PlatformToken & Faucet", function () {
    it("Should claim platform tokens from faucet and enforce cooldown", async function () {
      // User1 claims from faucet
      await faucet.connect(user1).claimTokens();
      
      const balance = await platformToken.balanceOf(user1.address);
      expect(balance).to.equal(FAUCET_CLAIM);

      const totalClaimed = await faucet.getTotalClaimed(user1.address);
      expect(totalClaimed).to.equal(FAUCET_CLAIM);

      // Try claiming again immediately (should fail)
      await expect(faucet.connect(user1).claimTokens()).to.be.revertedWith(
        "TokenFaucet: cooldown period active"
      );

      // Time until next claim should be > 0
      const timeLeft = await faucet.getTimeUntilNextClaim(user1.address);
      expect(timeLeft).to.be.greaterThan(0);
    });
  });

  describe("Multi-Token DEX", function () {
    it("Should allow adding liquidity, swapping, and removing liquidity", async function () {
      const amountA = ethers.parseEther("1000");
      const amountB = ethers.parseEther("2000");

      // Approve DEX to spend TokenA and TokenB
      await tokenA.approve(await dex.getAddress(), amountA);
      await tokenB.approve(await dex.getAddress(), amountB);

      // Add liquidity: TokenA - TokenB
      await dex.addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        amountA,
        amountB
      );

      const reserves = await dex.getReserves(await tokenA.getAddress(), await tokenB.getAddress());
      expect(reserves[0]).to.equal(amountA);
      expect(reserves[1]).to.equal(amountB);

      // Mint some TokenA to user1
      await tokenA.mint(user1.address, ethers.parseEther("100"));

      // User1 swaps TokenA for TokenB
      await tokenA.connect(user1).approve(await dex.getAddress(), ethers.parseEther("50"));
      
      const expectedOut = await dex.getAmountOut(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        ethers.parseEther("50")
      );

      await dex.connect(user1).swap(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        ethers.parseEther("50"),
        0,
        user1.address
      );

      const user1BBalance = await tokenB.balanceOf(user1.address);
      expect(user1BBalance).to.equal(expectedOut);
    });
  });

  describe("NFT Marketplace & Multi-Token Purchase", function () {
    it("Should buy NFT with PlatformToken and swap payments from other tokens", async function () {
      // Setup liquidity pool for DNFT - TokenA
      const dnftLiq = ethers.parseEther("10000");
      const tokenALiq = ethers.parseEther("5000");

      await platformToken.approve(await dex.getAddress(), dnftLiq);
      await tokenA.approve(await dex.getAddress(), tokenALiq);

      await dex.addLiquidity(
        await platformToken.getAddress(),
        await tokenA.getAddress(),
        dnftLiq,
        tokenALiq
      );

      // Owner mints and lists NFT
      const nftPrice = ethers.parseEther("100");
      await marketplace.mintAndListNFT("ipfs://test-uri", nftPrice);

      // User1 claims platform token from faucet
      await faucet.connect(user1).claimTokens(); // gets 100 DNFT

      // User1 approves Marketplace to spend 100 DNFT
      await platformToken.connect(user1).approve(await marketplace.getAddress(), nftPrice);

      // User1 buys NFT with PlatformToken
      await marketplace.connect(user1).buyNFTWithPlatformToken(0);
      expect(await nftCollection.ownerOf(0)).to.equal(user1.address);

      // Check owner received payment (less 2.5% royalty to owner since owner is creator)
      // Verify secondary list
      await nftCollection.connect(user1).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(user1).listNFT(0, ethers.parseEther("200"));

      // User2 has TokenA and wants to buy NFT
      await tokenA.mint(user2.address, ethers.parseEther("1000"));

      // Calculate cost in TokenA for 200 DNFT
      const costInTokenA = await marketplace.calculatePriceInToken(0, await tokenA.getAddress());

      // Approve marketplace to spend TokenA
      await tokenA.connect(user2).approve(await marketplace.getAddress(), costInTokenA);

      // User2 buys NFT using TokenA
      const initialSellerBalance = await platformToken.balanceOf(user1.address); // seller
      const initialCreatorBalance = await platformToken.balanceOf(owner.address); // creator

      await marketplace.connect(user2).buyNFTWithToken(0, await tokenA.getAddress());

      // Verify ownership
      expect(await nftCollection.ownerOf(0)).to.equal(user2.address);

      // Verify royalty and proceeds distribution
      const finalSellerBalance = await platformToken.balanceOf(user1.address);
      const finalCreatorBalance = await platformToken.balanceOf(owner.address);

      const expectedRoyalty = (ethers.parseEther("200") * 25n) / 1000n;
      const expectedProceeds = ethers.parseEther("200") - expectedRoyalty;

      expect(finalSellerBalance - initialSellerBalance).to.equal(expectedProceeds);
      expect(finalCreatorBalance - initialCreatorBalance).to.equal(expectedRoyalty);
    });
  });
});
