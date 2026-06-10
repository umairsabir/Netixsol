import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const dexAddress = '0x7b9484DF3dff9cc0164225C1a2e740fE8F441342';

try {
  // We can scan starting from a reasonable Sepolia block number, e.g. 5,500,000
  // Or we can query the contract's code or balance first to make sure it exists
  const code = await client.getBytecode({ address: dexAddress });
  if (code) {
    console.log("Contract code exists at address.");
  } else {
    console.log("Contract code DOES NOT exist at address.");
  }
} catch (e) {
  console.error("Error checking bytecode:", e);
}
