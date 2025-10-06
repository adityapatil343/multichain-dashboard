export type ChainConf = { 
  id: number
  key: string
  name: string
  symbol: string
  rpcUrl: string
  explorer: (addr: string) => string
  coingeckoId: string
  multicall3?: `0x${string}`
}

// Multicall3 is commonly deployed at 0xcA11bde05977b3631167028862bE2a173976CA11 on many chains.
const MC3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const

export const CHAINS: ChainConf[] = [
  // Use a free public RPC for Ethereum (Cloudflare’s gateway) instead of Ankr
  {
    id: 1,
    key: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://cloudflare-eth.com',
    explorer: a => `https://etherscan.io/address/${a}`,
    coingeckoId: 'ethereum',
    multicall3: MC3
  },
  {
    id: 137,
    key: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: a => `https://polygonscan.com/address/${a}`,
    coingeckoId: 'polygon-pos',
    multicall3: MC3
  },
  {
    id: 56,
    key: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorer: a => `https://bscscan.com/address/${a}`,
    coingeckoId: 'binancecoin',
    multicall3: MC3
  },
  {
    id: 42161,
    key: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: a => `https://arbiscan.io/address/${a}`,
    coingeckoId: 'ethereum',
    multicall3: MC3
  },
  {
    id: 10,
    key: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: a => `https://optimistic.etherscan.io/address/${a}`,
    coingeckoId: 'ethereum',
    multicall3: MC3
  },
  {
    id: 8453,
    key: 'base',
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorer: a => `https://basescan.org/address/${a}`,
    coingeckoId: 'ethereum',
    multicall3: MC3
  },
  {
    id: 43114,
    key: 'avalanche',
    name: 'Avalanche C‑Chain',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: a => `https://snowtrace.io/address/${a}`,
    coingeckoId: 'avalanche-2',
    multicall3: MC3
  },
  {
    id: 324,
    key: 'zksync',
    name: 'zkSync Era',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorer: a => `https://explorer.zksync.io/address/${a}`,
    coingeckoId: 'ethereum',
    multicall3: MC3
  }
]
