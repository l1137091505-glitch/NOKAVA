# NOKAVA

NOKAVA is a one-action public signal protocol for BOT Chain. A connected wallet can send a simple on-chain acknowledgement to another EVM address. The contract keeps global, sent and received counts plus a compact recent-signal ledger.

## What is included

- Original warm-paper editorial interface, unrelated to the reference layout.
- EIP-6963 multi-wallet discovery with legacy injected-provider fallback.
- BOT Chain add/switch flow, account/network listeners and mobile MetaMask deep-link.
- Read-only preview data when no contract address is configured; writes are blocked in preview mode.
- Solidity contract with no constructor arguments and no payable functions.
- Vercel SPA configuration and Chinese deployment guide.

## Local development

```bash
cd frontend
npm install
npm run dev
```

## Contract configuration

Deploy `contracts/src/NokavaSignal.sol` on BOT Chain Mainnet (chain ID 677), then add this public Config variable to the frontend:

```text
VITE_NOKAVA_ADDRESS=0xYourDeployedContractAddress
```

The frontend validates the address and deployed bytecode before enabling writes. Contract addresses are public information; never upload a wallet private key.

See `DEPLOY-ZH.md` for the complete workflow.
