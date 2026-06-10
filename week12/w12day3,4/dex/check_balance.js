import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAddress } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config();

const pk = process.env.PRIVATE_KEY;
if (!pk) {
  console.error("No PRIVATE_KEY found in .env");
  process.exit(1);
}

const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
const address = privateKeyToAddress(formattedPk);
console.log("Address:", address);

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const balance = await client.getBalance({ address });
console.log("Balance:", formatEther(balance), "ETH");
