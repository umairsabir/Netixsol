import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { defineChain } from 'viem'

/**
 * Kasplex Testnet chain definition.
 */
export const sepoliaTestnet = defineChain({
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
})

export function getConfig() {
  return createConfig({
    chains: [sepoliaTestnet],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [sepoliaTestnet.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
