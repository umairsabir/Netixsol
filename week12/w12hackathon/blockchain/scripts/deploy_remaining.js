import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Resuming deployment with the account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance (ETH):", hre.ethers.formatEther(balance));

  // Already deployed addresses
  const platformTokenAddress = "0xE9c471317EDF1108F8EE89C5b5bDf22AE3215b6F";
  const tokenAAddress = "0xE67ADA0705bBE549eDCe788c6c7B194FEeDeAF86";
  const tokenBAddress = "0xD42346Ee7A7dA8EA0834c3d95432584D773F72e8";
  const faucetAddress = "0x4A5CD0c24cD7408e4997E179937643C0893eafd1";
  const dexAddress = "0xf35a8BCe60205fe7D478B5A586A548Ecc89F9141";
  const nftCollectionAddress = "0xa587754bD4035F83f75F6B53386C2929F56Fb3d9";

  console.log("Reusing PlatformToken:", platformTokenAddress);
  console.log("Reusing TokenA:", tokenAAddress);
  console.log("Reusing TokenB:", tokenBAddress);
  console.log("Reusing TokenFaucet:", faucetAddress);
  console.log("Reusing MultiTokenDEX:", dexAddress);
  console.log("Reusing NFTCollection:", nftCollectionAddress);

  // Deploy NFTMarketplace
  console.log("Deploying NFTMarketplace...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy(nftCollectionAddress, platformTokenAddress, dexAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("NFTMarketplace deployed to:", marketplaceAddress);

  // Get NFTCollection contract instance
  const nftCollection = await hre.ethers.getContractAt("NFTCollection", nftCollectionAddress);

  // Set marketplace as owner of NFTCollection
  console.log("Transferring NFTCollection ownership to NFTMarketplace...");
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
