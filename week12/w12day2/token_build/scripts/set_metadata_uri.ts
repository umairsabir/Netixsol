import { network } from "hardhat";
const { ethers } = await network.connect();
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const contractAddress = "0xD07Cb3A4d33F2aB3F7231ffC4362e3855d00a0e5";
  const newBaseURI = "ipfs://QmY4w3GKFikRQv9tbLYkTgZ96wxYkRwXy7dcapE2PDw8PG/";

  console.log("Connecting to contract...");
  const MyNFT = await ethers.getContractAt("UmairNFT", contractAddress);

  console.log(`Setting baseURI to: ${newBaseURI}...`);
  const tx1 = await MyNFT.setBaseURI(newBaseURI);
  console.log(`Transaction sent: ${tx1.hash}. Waiting for confirmation...`);
  await tx1.wait();
  console.log("baseURI set successfully!");

  console.log("Setting revealed status to true...");
  const tx2 = await MyNFT.setRevealed(true);
  console.log(`Transaction sent: ${tx2.hash}. Waiting for confirmation...`);
  await tx2.wait();
  console.log("Revealed status set successfully!");

  console.log("All setup successfully finalized!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
