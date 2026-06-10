export const TOKEN_A_ADDRESS = '0x5f717C0FaB4f759C0e92c4B11FA407AA01Ea4b64' as `0x${string}`;
export const TOKEN_B_ADDRESS = '0xcdfa30192eb4258366Fc8cde98eea1D27a66a02E' as `0x${string}`;
export const DEX_ADDRESS = '0x7b9484DF3dff9cc0164225C1a2e740fE8F441342' as `0x${string}`;

export const TOKEN_A_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' }
    ],
    name: 'balanceOf',
    outputs: [
      { name: 'balance', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [
      { name: '', type: 'bool' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [
      { name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      { name: '', type: 'uint8' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      { name: '', type: 'string' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      { name: '', type: 'string' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export const TOKEN_B_ABI = TOKEN_A_ABI;

export const DEX_ABI = [
  {
    inputs: [
      { name: '_tokenA', type: 'address' },
      { name: '_tokenB', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'tokenA',
    outputs: [
      { name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'tokenB',
    outputs: [
      { name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'reserveA',
    outputs: [
      { name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'reserveB',
    outputs: [
      { name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' }
    ],
    name: 'addLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'amountAIn', type: 'uint256' }
    ],
    name: 'swapAforB',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'amountBIn', type: 'uint256' }
    ],
    name: 'swapBforA',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'isSwapAforB', type: 'bool' }
    ],
    name: 'getSwapAmount',
    outputs: [
      { name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
