import { HTTPFacilitatorClient } from "aixyz/accepts";

// PayAI's facilitator verifies and settles x402 payments on Solana (and many EVM chains).
// aixyz's default facilitator (https://x402.use-agently.com/facilitator) also settles Solana —
// override with X402_FACILITATOR_URL to point at any x402-compatible service.
export const facilitator = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR_URL ?? "https://facilitator.payai.network",
});
