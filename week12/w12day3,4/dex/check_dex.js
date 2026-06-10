import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const dexAddress = '0x7b9484DF3dff9cc0164225C1a2e740fE8F441342';

const tokenA = await client.readContract({
  address: dexAddress,
  abi: [
    {
      inputs: [],
      name: 'tokenA',
      outputs: [{ type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'tokenB',
      outputs: [{ type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    }
  ],
  functionName: 'tokenA'
});

const tokenB = await client.readContract({
  address: dexAddress,
  abi: [
    {
      inputs: [],
      name: 'tokenB',
      outputs: [{ type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    }
  ],
  functionName: 'tokenB'
});

console.log("DEX SimpleSwap Address:", dexAddress);
console.log("tokenA address inside DEX:", tokenA);
console.log("tokenB address inside DEX:", tokenB);
