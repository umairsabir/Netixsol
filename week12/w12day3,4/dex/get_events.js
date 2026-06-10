import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

const dexAddress = '0x7b9484DF3dff9cc0164225C1a2e740fE8F441342';

const abi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'provider', type: 'address' },
      { indexed: false, name: 'amountA', type: 'uint256' },
      { indexed: false, name: 'amountB', type: 'uint256' }
    ],
    name: 'LiquidityAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: false, name: 'amountAIn', type: 'uint256' },
      { indexed: false, name: 'amountBOut', type: 'uint256' }
    ],
    name: 'SwapAforB',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: false, name: 'amountBIn', type: 'uint256' },
      { indexed: false, name: 'amountAOut', type: 'uint256' }
    ],
    name: 'SwapBforA',
    type: 'event'
  }
];

try {
  const logs = await client.getLogs({
    address: dexAddress,
    fromBlock: 'latest'
  });
  console.log("Found logs:", logs.length);
  for (const log of logs) {
    console.log(log);
  }
} catch (e) {
  console.error("Error reading logs:", e);
}
