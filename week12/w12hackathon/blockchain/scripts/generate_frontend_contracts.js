import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsDir = path.join(__dirname, "../artifacts/contracts");
const outputDir = path.join(__dirname, "../../frontend/src/lib");
const outputPath = path.join(outputDir, "contracts.ts");

const CONTRACTS = [
  { name: "PlatformToken", path: "PlatformToken.sol/PlatformToken.json" },
  { name: "TokenA", path: "TokenA.sol/TokenA.json" },
  { name: "TokenB", path: "TokenB.sol/TokenB.json" },
  { name: "TokenFaucet", path: "TokenFaucet.sol/TokenFaucet.json" },
  { name: "MultiTokenDEX", path: "MultiTokenDEX.sol/MultiTokenDEX.json" },
  { name: "NFTCollection", path: "NFTCollection.sol/NFTCollection.json" },
  { name: "NFTMarketplace", path: "NFTMarketplace.sol/NFTMarketplace.json" }
];

const ADDRESSES = {
  PlatformToken: "0xE9c471317EDF1108F8EE89C5b5bDf22AE3215b6F",
  TokenA: "0xE67ADA0705bBE549eDCe788c6c7B194FEeDeAF86",
  TokenB: "0xD42346Ee7A7dA8EA0834c3d95432584D773F72e8",
  TokenFaucet: "0x4A5CD0c24cD7408e4997E179937643C0893eafd1",
  MultiTokenDEX: "0xf35a8BCe60205fe7D478B5A586A548Ecc89F9141",
  NFTCollection: "0xa587754bD4035F83f75F6B53386C2929F56Fb3d9",
  NFTMarketplace: "0xE9487F2ae9B457592331c26E484Bb8CdE69d8e72" // Deployed in deploy_remaining.js
};

function main() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let fileContent = `// Deployed contract addresses and ABIs\n\n`;
  fileContent += `export const CONTRACT_ADDRESSES = ${JSON.stringify(ADDRESSES, null, 2)} as const;\n\n`;

  for (const c of CONTRACTS) {
    const artifactPath = path.join(artifactsDir, c.path);
    if (!fs.existsSync(artifactPath)) {
      console.error(`Artifact not found: ${artifactPath}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    fileContent += `export const ${c.name}ABI = ${JSON.stringify(data.abi, null, 2)} as const;\n\n`;
  }

  fs.writeFileSync(outputPath, fileContent, "utf-8");
  console.log(`Successfully generated ${outputPath}`);
}

main();
