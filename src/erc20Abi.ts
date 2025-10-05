
export const erc20Abi = [
  { "type": "function", "name": "balanceOf", "inputs": [{"name": "owner", "type": "address"}], "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view" },
  { "type": "function", "name": "decimals", "inputs": [], "outputs": [{"name": "", "type": "uint8"}], "stateMutability": "view" },
  { "type": "function", "name": "symbol", "inputs": [], "outputs": [{"name": "", "type": "string"}], "stateMutability": "view" }
] as const
