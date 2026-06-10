import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const dexAddress = '0x7b9484DF3dff9cc0164225C1a2e740fE8F441342';
const tokenAAddress = '0x5f717C0FaB4f759C0e92c4B11FA407AA01Ea4b64';
const tokenBAddress = '0xcdfa30192eb4258366Fc8cde98eea1D27a66a02E';

const erc20Abi = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const dexAbi = [
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
];

try {
  const nameA = await client.readContract({
    address: tokenAAddress,
    abi: erc20Abi,
    functionName: 'name'
  });
  const symbolA = await client.readContract({
    address: tokenAAddress,
    abi: erc20Abi,
    functionName: 'symbol'
  });

  const nameB = await client.readContract({
    address: tokenBAddress,
    abi: erc20Abi,
    functionName: 'name'
  });
  const symbolB = await client.readContract({
    address: tokenBAddress,
    abi: erc20Abi,
    functionName: 'symbol'
  });

  const dexTokenA = await client.readContract({
    address: dexAddress,
    abi: dexAbi,
    functionName: 'tokenA'
  });

  const dexTokenB = await client.readContract({
    address: dexAddress,
    abi: dexAbi,
    functionName: 'tokenB'
  });

  console.log("Token A Name:", nameA, "Symbol:", symbolA);
  console.log("Token B Name:", nameB, "Symbol:", symbolB);
  console.log("DEX tokenA address:", dexTokenA);
  console.log("DEX tokenB address:", dexTokenB);
} catch (e) {
  console.error("Error reading token metadata:", e);
}
