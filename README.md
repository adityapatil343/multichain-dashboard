
# Multi-chain Address Dashboard

Native balances across top EVM chains using only an address — plus optional ERC‑20 balances via a simple token list and Multicall3.

## Features
- Chains: Ethereum, Polygon, BSC, Arbitrum, Optimism, Base, Avalanche, zkSync Era
- Native balance + USD value (CoinGecko)
- Optional ERC‑20 balances (load a token list JSON by chain key)
- No server, all client‑side. Good fit for GitHub Pages.

## Quickstart
```bash
npm i
npm run dev
```

## Token List
- Serve a JSON with keys matching chain keys (ethereum, polygon, bsc, arbitrum, optimism, base, avalanche, zksync).
- Values: array of token contract addresses.
- Example at `/example-tokenlist.json`.

```json
{
  "ethereum": ["0xa0b8...USDC", "0xdAC1...USDT", "0xC02a...WETH"],
  "polygon": ["0x2791...USDC", "0x7ceB...WETH"]
}
```

## Deploy to GitHub Pages
1. Create a **public repo** and push this project.
2. Set the repo Pages base: in `vite.config.ts`, set `VITE_GH_PAGES_BASE='/REPO_NAME/'` (or define it in your build env).
3. Enable GitHub Pages on the repo (Settings → Pages → Deploy from branch: `gh-pages`).
4. Run:
   ```bash
   npm run build
   npm run deploy
   ```
   which publishes `dist` to the `gh-pages` branch.

Or use Actions:
- Add a GitHub Action for GH Pages (e.g., peaceiris/actions-gh-pages) or a simple workflow that runs `npm ci && npm run build` then deploys `dist`.

## Notes
- Public RPCs can rate-limit; consider swapping to your own RPC URLs.
- CoinGecko free endpoint is rate-limited; cache or limit refreshes in production.
- Multicall3 is assumed at the common address; some chains may differ.
