import type { AixyzConfig } from "aixyz/config";

const config: AixyzConfig = {
  name: "Solana Agent",
  description: "An x402 agent that gets paid in USDC on Solana.",
  version: "0.1.0",
  x402: {
    // The Solana wallet (base58) that receives payments. Replace with your own, or set X402_PAY_TO.
    payTo: process.env.X402_PAY_TO ?? "So11111111111111111111111111111111111111112",
    // Solana networks are CAIP-2 identifiers, just like EVM chains.
    network:
      process.env.NODE_ENV === "production"
        ? "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" // Solana mainnet-beta
        : "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", // Solana devnet
  },
};

export default config;
