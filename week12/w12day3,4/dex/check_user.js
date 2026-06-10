import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const userAddress = '0x2f67b4d9050ea9c0c8af665dfcc36dc1bc10d419';
const dexAddress = '0x7b9484DF3dff9cc0164225C1a2e740fE8F441342';
const tokenAAddress = '0x5f717C0FaB4f759C0e92c4B11FA407AA01Ea4b64';
const tokenBAddress = '0xcdfa30192eb4258366Fc8cde98eea1D27a66a02E';

const erc20Abi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

try {
  const balA = await client.readContract({
    address: tokenAAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [userAddress]
  });

  const balB = await client.readContract({
    address: tokenBAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [userAddress]
  });

  const allowA = await client.readContract({
    address: tokenAAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [userAddress, dexAddress]
  });

  const allowB = await client.readContract({
    address: tokenBAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [userAddress, dexAddress]
  });

  const nonce = await client.getTransactionCount({
    address: userAddress
  });

  console.log("--- User Wallet State ---");
  console.log("User Address:", userAddress);
  console.log("Transaction Count (Nonce):", nonce);
  console.log("Token A (TK911) Balance:", formatEther(balA));
  console.log("Token B (TKNB) Balance:", formatEther(balB));
  console.log("Token A Allowance to DEX:", formatEther(allowA));
  console.log("Token B Allowance to DEX:", formatEther(allowB));
} catch (e) {
  console.error("Error reading user wallet state:", e);
}
