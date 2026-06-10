import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("TalhaNFT Contract", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("TalhaNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    return { nft, owner, user1, user2 };
  }

  it("should deploy with correct default values", async function () {
    const { nft, owner } = await deployFixture();
    expect(await nft.name()).to.equal("Talha NFT Collection");
    expect(await nft.symbol()).to.equal("TNFT");
    expect(await nft.mintPrice()).to.equal(ethers.parseEther("0.05"));
    expect(await nft.revealed()).to.be.false;
    expect(await nft.onlyWhitelist()).to.be.false;
    expect(await nft.owner()).to.equal(owner.address);
  });

  it("should permit paid minting", async function () {
    const { nft, user1 } = await deployFixture();
    const mintPrice = await nft.mintPrice();

    // Mint 2 tokens
    await expect(
      nft.connect(user1).mint(2, { value: mintPrice * 2n })
    ).to.emit(nft, "Transfer");

    expect(await nft.balanceOf(user1.address)).to.equal(2n);
    expect(await nft.ownerOf(1n)).to.equal(user1.address);
    expect(await nft.ownerOf(2n)).to.equal(user1.address);
    expect(await nft.tokenIdCounter()).to.equal(3n);
  });

  it("should fail if payment is insufficient", async function () {
    const { nft, user1 } = await deployFixture();
    const mintPrice = await nft.mintPrice();

    await expect(
      nft.connect(user1).mint(1, { value: mintPrice / 2n })
    ).to.be.revertedWith("Insufficient payment");
  });

  it("should respect onlyWhitelist restriction when enabled", async function () {
    const { nft, owner, user1, user2 } = await deployFixture();
    const mintPrice = await nft.mintPrice();

    // Enable whitelist
    await nft.connect(owner).setOnlyWhitelist(true);
    expect(await nft.onlyWhitelist()).to.be.true;

    // user1 is not whitelisted, mint should fail
    await expect(
      nft.connect(user1).mint(1, { value: mintPrice })
    ).to.be.revertedWith("Address is not whitelisted");

    // Whitelist user1
    await nft.connect(owner).setWhitelist(user1.address, true);
    expect(await nft.whitelist(user1.address)).to.be.true;

    // user1 can mint now
    await expect(
      nft.connect(user1).mint(1, { value: mintPrice })
    ).to.emit(nft, "Transfer");

    // user2 is still not whitelisted
    await expect(
      nft.connect(user2).mint(1, { value: mintPrice })
    ).to.be.revertedWith("Address is not whitelisted");
  });

  it("should return unrevealed token URI if not revealed, and base token URI if revealed", async function () {
    const { nft, owner, user1 } = await deployFixture();
    const mintPrice = await nft.mintPrice();

    await nft.connect(user1).mint(1, { value: mintPrice });
    
    // Default: not revealed
    expect(await nft.tokenURI(1n)).to.equal("ipfs://QmNotRevealedPlaceholderHash/hidden.json");

    // Reveal and set base URI
    await nft.connect(owner).setRevealed(true);
    await nft.connect(owner).setBaseURI("ipfs://QmRevealedRealHash/");

    expect(await nft.tokenURI(1n)).to.equal("ipfs://QmRevealedRealHash/1.json");
  });

  it("should verify EIP-2981 royalty structure", async function () {
    const { nft, owner } = await deployFixture();
    
    // Check royalty for token 1 sold for 10 ETH (10000 wei equivalent for simple math)
    const salePrice = ethers.parseEther("10");
    const [royaltyReceiver, royaltyAmount] = await nft.royaltyInfo(1n, salePrice);
    
    expect(royaltyReceiver).to.equal(owner.address);
    // 5% of 10 ETH is 0.5 ETH
    expect(royaltyAmount).to.equal(ethers.parseEther("0.5"));
  });

  it("should permit owner to withdraw contract balance", async function () {
    const { nft, owner, user1 } = await deployFixture();
    const mintPrice = await nft.mintPrice();

    // User mints 2 NFTs -> sends 0.1 ETH to contract
    await nft.connect(user1).mint(2, { value: mintPrice * 2n });

    const contractBalance = await ethers.provider.getBalance(await nft.getAddress());
    expect(contractBalance).to.equal(ethers.parseEther("0.1"));

    // Withdraw
    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    const tx = await nft.connect(owner).withdraw();
    const receipt = await tx.wait();
    
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

    expect(await ethers.provider.getBalance(await nft.getAddress())).to.equal(0n);
    expect(finalOwnerBalance).to.equal(initialOwnerBalance + ethers.parseEther("0.1") - gasUsed);
  });
});
