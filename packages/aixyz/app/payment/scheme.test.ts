import { describe, expect, test } from "bun:test";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { PaymentGateway, schemeForNetwork } from "./payment";
import type { AixyzConfig } from "@aixyz/config";

// CAIP-2 identifiers for Solana (genesis-hash references) — mainnet and devnet.
const SOLANA_MAINNET = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
const SOLANA_DEVNET = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";

describe("schemeForNetwork", () => {
  test("selects the SVM scheme for Solana (solana:*) networks", () => {
    expect(schemeForNetwork(SOLANA_MAINNET)).toBeInstanceOf(ExactSvmScheme);
    expect(schemeForNetwork(SOLANA_DEVNET)).toBeInstanceOf(ExactSvmScheme);
  });

  test("selects the EVM scheme for eip155:* networks", () => {
    expect(schemeForNetwork("eip155:8453")).toBeInstanceOf(ExactEvmScheme); // Base
    expect(schemeForNetwork("eip155:84532")).toBeInstanceOf(ExactEvmScheme); // Base Sepolia
    expect(schemeForNetwork("eip155:1")).toBeInstanceOf(ExactEvmScheme); // Ethereum
  });

  test("both schemes expose the exact scheme name", () => {
    expect(schemeForNetwork(SOLANA_MAINNET).scheme).toBe("exact");
    expect(schemeForNetwork("eip155:8453").scheme).toBe("exact");
  });
});

describe("PaymentGateway.register", () => {
  const config = {
    x402: { payTo: "receiver", network: SOLANA_MAINNET },
  } as unknown as AixyzConfig;

  // A non-network-touching facilitator is enough — register() only wires schemes onto the resource server.
  const facilitator = new HTTPFacilitatorClient({ url: "http://localhost:0" });

  test("registers a scheme for a Solana network", () => {
    const gateway = new PaymentGateway(facilitator, config);
    gateway.register(SOLANA_MAINNET);
    expect(gateway.resourceServer.hasRegisteredScheme(SOLANA_MAINNET, "exact")).toBe(true);
  });

  test("registers a scheme for an EVM network", () => {
    const gateway = new PaymentGateway(facilitator, config);
    gateway.register("eip155:8453");
    expect(gateway.resourceServer.hasRegisteredScheme("eip155:8453", "exact")).toBe(true);
  });
});
