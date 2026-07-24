# Solana Agent

An x402 agent that gets **paid in USDC on Solana**. Solana networks are configured exactly like EVM chains — as CAIP-2 identifiers in `aixyz.config.ts` — and aixyz registers the correct payment scheme automatically.

## Quick Start

```bash
bun install

# Create .env.local with your keys
echo "OPENAI_API_KEY=sk-..." > .env.local

bun run dev
```

## Project Structure

```
app/
├── agent.ts               # Agent with a SOL/lamports conversion tool
├── accepts.ts             # Facilitator configuration (PayAI)
└── tools/
    └── sol-lamports.ts    # SOL ⇄ lamports converter
```

## How It Works

Set a Solana network (and a base58 `payTo` wallet) in `aixyz.config.ts`:

```typescript
x402: {
  payTo: process.env.X402_PAY_TO ?? "So11111111111111111111111111111111111111112",
  network:
    process.env.NODE_ENV === "production"
      ? "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" // Solana mainnet-beta
      : "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", // Solana devnet
},
```

That's the only difference from an EVM agent. When a `solana:*` network is configured (or referenced in a route's
`accepts`), aixyz registers the SVM `exact` scheme instead of the EVM one.

`app/accepts.ts` points payment verification at [PayAI's facilitator](https://facilitator.payai.network), which
settles x402 payments on Solana:

```typescript
import { HTTPFacilitatorClient } from "aixyz/accepts";

export const facilitator = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR_URL ?? "https://facilitator.payai.network",
});
```

aixyz's default facilitator (`https://x402.use-agently.com/facilitator`) also settles Solana, so `app/accepts.ts` is
optional — override `X402_FACILITATOR_URL` to point at any x402-compatible service.

## Solana Networks

| Network             | CAIP-2 ID                                 |
| ------------------- | ----------------------------------------- |
| Solana mainnet-beta | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| Solana devnet       | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |

## Environment Variables

| Variable               | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `OPENAI_API_KEY`       | OpenAI API key                                                  |
| `X402_PAY_TO`          | Solana wallet (base58) to receive payments                      |
| `X402_FACILITATOR_URL` | Custom facilitator URL (defaults to PayAI's Solana facilitator) |

## API Endpoints

| Endpoint                       | Description           |
| ------------------------------ | --------------------- |
| `/.well-known/agent-card.json` | A2A agent card        |
| `POST /agent`                  | A2A JSON-RPC endpoint |
| `POST /mcp`                    | MCP tool endpoint     |

## Payment

Charges `$0.005` per request, settled as USDC on Solana via x402.

## Build & Deploy

```bash
bun run build
vercel
```
