import { tool } from "ai";
import { z } from "zod";

const LAMPORTS_PER_SOL = 1_000_000_000;

export default tool({
  description: "Convert an amount between SOL and lamports (1 SOL = 1,000,000,000 lamports).",
  inputSchema: z.object({
    amount: z.number().describe("The numeric amount to convert."),
    from: z.enum(["SOL", "lamports"]).describe("The unit of the input amount."),
  }),
  execute: async ({ amount, from }) => {
    if (from === "SOL") {
      return { amount, from, to: "lamports", result: Math.round(amount * LAMPORTS_PER_SOL) };
    }
    return { amount, from, to: "SOL", result: amount / LAMPORTS_PER_SOL };
  },
});
