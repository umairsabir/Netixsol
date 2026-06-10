import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const userAddress = '0x2f67b4d9050ea9c0c8af665dfcc36dc1bc10d419';
const dexAddress = '0x7b9484DF3dff9cc0164225C1a2e740fE8F441342';

try {
  const currentBlock = await client.getBlockNumber();
  console.log("Current block:", currentBlock);
  
  // Let's search the last 150 blocks
  const startBlock = currentBlock - 150n;
  
  console.log(`Scanning blocks from ${startBlock} to ${currentBlock} for transactions to DEX...`);
  
  for (let b = startBlock; b <= currentBlock; b++) {
    const block = await client.getBlock({
      blockNumber: b,
      includeTransactions: true
    });
    
    for (const tx of block.transactions) {
      if (tx.from.toLowerCase() === userAddress.toLowerCase() && tx.to && tx.to.toLowerCase() === dexAddress.toLowerCase()) {
        console.log(`Found transaction to DEX: ${tx.hash}`);
        const receipt = await client.getTransactionReceipt({ hash: tx.hash });
        console.log(`Status: ${receipt.status}, Gas Used: ${receipt.gasUsed}`);
      }
    }
  }
  console.log("Scan complete.");
} catch (e) {
  console.error("Error scanning blocks:", e);
}
