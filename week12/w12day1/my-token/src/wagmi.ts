import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { sepolia } from 'viem/chains'

export function getConfig() {
  return createConfig({
    chains: [sepolia],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [sepolia.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
