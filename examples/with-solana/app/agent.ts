import { openai } from "@ai-sdk/openai";
import { stepCountIs, ToolLoopAgent } from "ai";
import type { Accepts } from "aixyz/accepts";

import solLamports from "./tools/sol-lamports";

// Price is a USD string — the facilitator settles it as USDC on the configured Solana network.
export const accepts: Accepts = {
  scheme: "exact",
  price: "$0.005",
};

export default new ToolLoopAgent({
  model: openai("gpt-4o-mini"),
  instructions: "Solana Agent",
  tools: { solLamports },
  stopWhen: stepCountIs(10),
});
