import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance (ETH):", hre.ethers.formatEther(balance));

  const INITIAL_SUPPLY = 1000000; // 1 million

  // 1. Deploy PlatformToken (DNFT)
  const PlatformToken = await hre.ethers.getContractFactory("PlatformToken");
  const platformToken = await PlatformToken.deploy(INITIAL_SUPPLY);
  await platformToken.waitForDeployment();
  const platformTokenAddress = await platformToken.getAddress();
  console.log("PlatformToken deployed to:", platformTokenAddress);

  // 2. Deploy TokenA (TKNA)
  const TokenA = await hre.ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy(INITIAL_SUPPLY);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log("TokenA deployed to:", tokenAAddress);

  // 3. Deploy TokenB (TKNB)
  const TokenB = await hre.ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy(INITIAL_SUPPLY);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log("TokenB deployed to:", tokenBAddress);

  // 4. Deploy TokenFaucet
  const TokenFaucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await TokenFaucet.deploy(platformTokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("TokenFaucet deployed to:", faucetAddress);

  // Set Faucet as minter on PlatformToken
  const txMinter = await platformToken.setMinter(faucetAddress, true);
  await txMinter.wait();
  console.log("Authorized TokenFaucet to mint PlatformToken");

  // 5. Deploy MultiTokenDEX
  const MultiTokenDEX = await hre.ethers.getContractFactory("MultiTokenDEX");
  const dex = await MultiTokenDEX.deploy();
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  console.log("MultiTokenDEX deployed to:", dexAddress);

  // Add Initial Liquidity to DEX pools
  const liqAmountPlatform = hre.ethers.parseEther("50000"); // 50,000 DNFT
  const liqAmountA = hre.ethers.parseEther("25000"); // 25,000 TKNA
  const liqAmountB = hre.ethers.parseEther("15000"); // 15,000 TKNB

  console.log("Approving tokens for DEX initial liquidity...");
  const txApprovePlatform = await platformToken.approve(dexAddress, liqAmountPlatform * 2n);
  await txApprovePlatform.wait();
  const txApproveA = await tokenA.approve(dexAddress, liqAmountA * 2n);
  await txApproveA.wait();
  const txApproveB = await tokenB.approve(dexAddress, liqAmountB * 2n);
  await txApproveB.wait();

  // Pool 1: Platform Token ↔ Token A
  console.log("Adding Platform-TokenA liquidity...");
  const txLiq1 = await dex.addLiquidity(platformTokenAddress, tokenAAddress, liqAmountPlatform, liqAmountA);
  await txLiq1.wait();
  console.log("Added initial liquidity to Platform-TokenA pool");

  // Pool 2: Platform Token ↔ Token B
  console.log("Adding Platform-TokenB liquidity...");
  const txLiq2 = await dex.addLiquidity(platformTokenAddress, tokenBAddress, liqAmountPlatform, liqAmountB);
  await txLiq2.wait();
  console.log("Added initial liquidity to Platform-TokenB pool");

  // Pool 3: Token A ↔ Token B
  console.log("Adding TokenA-TokenB liquidity...");
  const txLiq3 = await dex.addLiquidity(tokenAAddress, tokenBAddress, liqAmountA, liqAmountB);
  await txLiq3.wait();
  console.log("Added initial liquidity to TokenA-TokenB pool");

  // 6. Deploy NFTCollection
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollection.deploy();
  await nftCollection.waitForDeployment();
  const nftCollectionAddress = await nftCollection.getAddress();
  console.log("NFTCollection deployed to:", nftCollectionAddress);

  // 7. Deploy NFTMarketplace
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy(nftCollectionAddress, platformTokenAddress, dexAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("NFTMarketplace deployed to:", marketplaceAddress);

  // Set marketplace as owner of NFTCollection
  const txOwnership = await nftCollection.transferOwnership(marketplaceAddress);
  await txOwnership.wait();
  console.log("Transferred NFTCollection ownership to NFTMarketplace");

  // Mint and List 10 Initial NFTs
  const nfts = [
    { name: "Neon Cyber Glitch", price: "50", desc: "A glitchy digital cyberpunk artifact." },
    { name: "Nebula Voyager", price: "100", desc: "Deep space explorer vessel floating in cosmic dust." },
    { name: "Quantum Portal", price: "150", desc: "A gateway connecting parallel dimensions." },
    { name: "Synthwave Sunset", price: "200", desc: "Classic 80s aesthetics with glowing grid sun." },
    { name: "Ether Shard", price: "250", desc: "A crystalline fragment of pure decentralized energy." },
    { name: "Pixelated Potion", price: "300", desc: "Restores mana and opens local Web3 state." },
    { name: "Holographic Skull", price: "350", desc: "Digital memento mori in neon cyber space." },
    { name: "Golden Bitcoin", price: "400", desc: "A physical representation of digital gold." },
    { name: "Crypto Kitty V2", price: "450", desc: "An advanced agentic kitten with laser eyes." },
    { name: "Antigravity Core", price: "500", desc: "Powering agentic developers since 2026." },
  ];

  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    const tokenURI = `/metadata/nft_${i}.json`;
    const priceWei = hre.ethers.parseEther(nft.price);
    const txMint = await marketplace.mintAndListNFT(tokenURI, priceWei);
    await txMint.wait();
    console.log(`Minted and listed NFT #${i}: "${nft.name}" for ${nft.price} DNFT`);
  }

  console.log("\nDeployment completed successfully!");
  console.log("-----------------------------------");
  console.log("PlatformToken:", platformTokenAddress);
  console.log("TokenA:", tokenAAddress);
  console.log("TokenB:", tokenBAddress);
  console.log("TokenFaucet:", faucetAddress);
  console.log("MultiTokenDEX:", dexAddress);
  console.log("NFTCollection:", nftCollectionAddress);
  console.log("NFTMarketplace:", marketplaceAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
