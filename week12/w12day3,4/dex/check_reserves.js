import { createPublicClient, http, formatEther } from 'viem';
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

const abi = [
  {
    inputs: [],
    name: 'reserveA',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'reserveB',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getReserves',
    outputs: [{ type: 'uint256' }, { type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const erc20Abi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

try {
  const rA = await client.readContract({
    address: dexAddress,
    abi: abi,
    functionName: 'reserveA'
  });

  const rB = await client.readContract({
    address: dexAddress,
    abi: abi,
    functionName: 'reserveB'
  });

  const reserves = await client.readContract({
    address: dexAddress,
    abi: abi,
    functionName: 'getReserves'
  });

  const balA = await client.readContract({
    address: tokenAAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [dexAddress]
  });

  const balB = await client.readContract({
    address: tokenBAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [dexAddress]
  });

  console.log("--- Contract State ---");
  console.log("reserveA variable:", formatEther(rA));
  console.log("reserveB variable:", formatEther(rB));
  console.log("getReserves() output:", formatEther(reserves[0]), ",", formatEther(reserves[1]));
  console.log("Actual Token A balance of DEX contract:", formatEther(balA));
  console.log("Actual Token B balance of DEX contract:", formatEther(balB));
} catch (e) {
  console.error("Error reading contract reserves:", e);
}
