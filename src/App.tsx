import React, { useEffect, useMemo, useState } from 'react'
import './index.css'
import { CHAINS } from './chains'
import { createPublicClient, http, formatEther, encodeFunctionData, Hex, isAddress, getAddress } from 'viem'
import { multicall3Abi } from './multicall3Abi'
import { erc20Abi } from './erc20Abi'
import { Loader2Icon, LinkIcon, Search } from 'lucide-react'

type Row = {
  balance: string
  usd: number | null
  loading: boolean
  error?: string
  explorerUrl?: string
  tokens?: { address: string, symbol?: string, balance: string }[]
}

function pretty(n: number, decimals = 4) {
  if (Number.isNaN(n)) return '0'
  if (n === 0) return '0'
  if (n < 0.0001) return n.toExponential(2)
  return n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

async function getUsdPrices(ids: string[]) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch prices')
  return (await res.json()) as Record<string, { usd: number }>
}

export default function App() {
  const [addrInput, setAddrInput] = useState('')
  const [address, setAddress] = useState<`0x${string}` | null>(null)
  const [rows, setRows] = useState<Record<string, Row>>(() => Object.fromEntries(CHAINS.map(c => [c.key, { balance: '-', usd: null, loading: false }])) as any)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const valid = useMemo(() => (addrInput && isAddress(addrInput)) || false, [addrInput])

  // token list state
  const [tokenListUrl, setTokenListUrl] = useState<string>('')
  const [tokenList, setTokenList] = useState<Record<string, string[]>>({})

  useEffect(() => {
    (async () => {
      try {
        const ids = Array.from(new Set(CHAINS.map(c => c.coingeckoId)))
        const data = await getUsdPrices(ids)
        const p: Record<string, number> = {}
        ids.forEach(id => p[id] = data[id]?.usd ?? 0)
        setPrices(p)
      } catch {}
    })()
  }, [])

  const fetchTokensFromUrl = async () => {
    if (!tokenListUrl) return
    const res = await fetch(tokenListUrl)
    const data = await res.json()
    setTokenList(data)
  }

  const handleLookup = async () => {
    if (!valid) return
    const checksum = getAddress(addrInput) as `0x${string}`
    setAddress(checksum)
    setRows(prev => {
      const draft = { ...prev }
      CHAINS.forEach(c => draft[c.key] = { ...draft[c.key], loading: true, error: undefined, explorerUrl: c.explorer(checksum) })
      return draft
    })

    await Promise.all(CHAINS.map(async c => {
      try {
        const client = createPublicClient({ transport: http(c.rpcUrl) })
        const wei = await client.getBalance({ address: checksum })
        const native = Number(formatEther(wei))
        const usdPrice = prices[c.coingeckoId] ?? null
        const usdVal = usdPrice ? native * usdPrice : null

        // ERC-20 balances via Multicall3 if available & token list present
        const tokenAddrs = tokenList[c.key] || []
        let tokens: { address: string, symbol?: string, balance: string }[] = []
        if (tokenAddrs.length && c.multicall3) {
          const calls = tokenAddrs.map(addr => ({
            target: addr as `0x${string}`,
            callData: encodeFunctionData({ abi: erc20Abi, functionName: 'balanceOf', args: [checksum] }) as Hex
          }))

          // multicall aggregate
          const { returnData } = await client.readContract({
            address: c.multicall3,
            abi: [{
              "inputs":[{"components":[{"internalType":"address","name":"target","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"}],"internalType":"struct Multicall3.Call[]","name":"calls","type":"tuple[]"}],
              "name":"aggregate","outputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"},{"internalType":"bytes[]","name":"returnData","type":"bytes[]"}],
              "stateMutability":"nonpayable","type":"function"
            }] as const,
            functionName: 'aggregate',
            args: [calls]
          }) as any

          // decode balances
          const balances: bigint[] = (returnData as Hex[]).map((data: Hex) => {
            try {
              const [bal] = (client.decodeFunctionResult as any)({ abi: erc20Abi, functionName: 'balanceOf', data })
              return bal as bigint
            } catch { return 0n }
          })

          // fetch decimals & symbol individually (small count)
          const meta = await Promise.all(tokenAddrs.map(async (addr) => {
            try {
              const [dec, sym] = await Promise.all([
                client.readContract({ address: addr as `0x${string}`, abi: erc20Abi, functionName: 'decimals' }) as Promise<number>,
                client.readContract({ address: addr as `0x${string}`, abi: erc20Abi, functionName: 'symbol' }) as Promise<string>,
              ])
              return { dec, sym }
            } catch { return { dec: 18, sym: 'TOKEN' } }
          }))

          tokens = tokenAddrs.map((addr, i) => {
            const bal = Number(balances[i] || 0n)
            const d = meta[i]?.dec ?? 18
            const sym = meta[i]?.sym ?? 'TOKEN'
            const human = d ? bal / (10 ** d) : bal
            return { address: addr, symbol: sym, balance: pretty(human, 6) }
          })
        }

        setRows(prev => ({ ...prev, [c.key]: { ...prev[c.key], loading: false, balance: pretty(native), usd: usdVal, tokens } }))
      } catch (e: any) {
        setRows(prev => ({ ...prev, [c.key]: { ...prev[c.key], loading: false, error: e?.message || 'Error' } }))
      }
    }))
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Multi-chain Address Dashboard</h1>
        <p className="text-slate-600 mt-2">Native balances + optional ERC-20s via token list & Multicall3.</p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input className="input md:flex-1" placeholder="0x... wallet address" value={addrInput} onChange={e => setAddrInput(e.target.value.trim())} />
          <button className="btn" onClick={handleLookup} disabled={!valid}><Search className="w-4 h-4 mr-2" />Check</button>
        </div>
        {!valid && addrInput && <p className="text-sm text-red-600 mt-2">Enter a valid EVM address.</p>}

        <div className="mt-4 flex gap-2 items-center">
          <input className="input" placeholder="Optional: URL to tokenlist JSON (by chain key)" value={tokenListUrl} onChange={e => setTokenListUrl(e.target.value)} />
          <button className="btn" onClick={fetchTokensFromUrl}>Load Tokenlist</button>
          {/* Use BASE_URL so the link works on GitHub Pages */}
          <a className="btn" href={`${import.meta.env.BASE_URL}example-tokenlist.json`} target="_blank" rel="noreferrer">Example JSON</a>
        </div>

        <div className="grid mt-8 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CHAINS.map((c) => {
            const r = rows[c.key]
            return (
              <div key={c.key} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">{c.name}</div>
                    <div className="text-xs text-slate-500">Native: {c.symbol}</div>
                  </div>
                    {address && r.explorerUrl && (
                      <a href={r.explorerUrl} target="_blank" rel="noreferrer" className="text-sm inline-flex items-center gap-1 hover:underline text-slate-600">
                        <LinkIcon className="w-4 h-4" /> Explorer
                      </a>
                    )}
                </div>

                <div className="mt-4">
                  {r.loading ? (
                    <div className="flex items-center gap-2 text-slate-600"><Loader2Icon className="w-4 h-4 animate-spin" /> Fetching…</div>
                  ) : r.error ? (
                    <div className="text-red-600 text-sm">{r.error}</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-2xl font-semibold tabular-nums">{r.balance} {c.symbol}</div>
                      <div className="text-sm text-slate-500">{r.usd != null ? `≈ $${pretty(r.usd, 2)}` : 'USD price unavailable'}</div>
                    </div>
                  )}
                </div>

                {r.tokens && r.tokens.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-1">Tokens</div>
                    <div className="space-y-1 text-sm text-slate-700">
                      {r.tokens.map(t => {
                        // Safely shorten an address when no symbol is available.
                        // Use slice() instead of Python-like slicing.
                        const shortAddr = `${t.address.slice(0, 6)}…${t.address.slice(-4)}`
                        return (
                          <div key={t.address} className="flex items-center justify-between">
                            <span className="text-slate-600">{t.symbol || shortAddr}</span>
                            <span className="tabular-nums">{t.balance}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-sm text-slate-500">
          Tip: Public RPCs may throttle. For reliability, replace rpcUrl with your own provider (e.g., Ankr/Alchemy/Infura).
        </div>
      </div>
    </div>
  )
}
