import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

const pk = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`;
const account = privateKeyToAccount(pk);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const walletClient = createWalletClient({
  account: account,
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const dexAddress = '0x7b9484DF3dff9cc0164225C1a2e740fE8F441342';

const abi = [
  {
    inputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' }
    ],
    name: 'addLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

try {
  console.log("Simulating/Sending addLiquidity from:", account.address);
  const amountA = parseEther('100');
  const amountB = parseEther('100');

  // Let's first simulate
  const { request } = await publicClient.simulateContract({
    address: dexAddress,
    abi: abi,
    functionName: 'addLiquidity',
    args: [amountA, amountB],
    account: account
  });
  console.log("Simulation succeeded!");

  const hash = await walletClient.writeContract(request);
  console.log("Transaction sent. Hash:", hash);
  console.log("Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed! Status:", receipt.status);
} catch (e) {
  console.error("Error executing addLiquidity:", e);
}
