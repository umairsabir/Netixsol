import { network } from "hardhat";
const { ethers } = await network.connect();

async function main() {
  const NFT = await ethers.getContractFactory("UmairNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();

  console.log("UmairNFT deployed to:", await nft.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
