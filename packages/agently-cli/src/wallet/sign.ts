import type { Chain } from "viem";
import { signWithBrowser } from "./browser.js";
import { createWalletFromMethod, type WalletMethod } from "./index.js";
import { CliError } from "../utils.js";

export interface TxRequest {
  to: `0x${string}`;
  data: `0x${string}`;
  gas?: bigint;
}

export interface SignOptions {
  browser?: { chainId: number; chainName: string; uri?: string };
}

export type SignTransactionResult = { kind: "signed"; raw: `0x${string}` } | { kind: "sent"; txHash: `0x${string}` };

export interface SignTransactionParams {
  walletMethod: WalletMethod;
  tx: TxRequest;
  chain: Chain;
  rpcUrl?: string;
  options?: SignOptions;
}

export async function signTransaction({
  walletMethod,
  tx,
  chain,
  rpcUrl,
  options,
}: SignTransactionParams): Promise<SignTransactionResult> {
  switch (walletMethod.type) {
    case "browser": {
      if (!options?.browser) {
        throw new CliError("Browser wallet requires chainId and chainName parameters");
      }
      return signViaBrowser({
        tx,
        chainId: options.browser.chainId,
        chainName: options.browser.chainName,
        uri: options.browser.uri,
      });
    }
    default: {
      const raw = await signWithWalletClient({ method: walletMethod, tx, chain, rpcUrl });
      return { kind: "signed", raw };
    }
  }
}

async function signViaBrowser({
  tx,
  chainId,
  chainName,
  uri,
}: {
  tx: TxRequest;
  chainId: number;
  chainName: string;
  uri?: string;
}): Promise<SignTransactionResult> {
  const { txHash } = await signWithBrowser({
    registryAddress: tx.to,
    calldata: tx.data,
    chainId,
    chainName,
    uri,
    gas: tx.gas,
  });

  if (!txHash.startsWith("0x")) {
    throw new CliError(`Invalid transaction hash received from browser wallet: ${txHash}`);
  }

  return { kind: "sent", txHash: txHash as `0x${string}` };
}

async function signWithWalletClient({
  method,
  tx,
  chain,
  rpcUrl,
}: {
  method: WalletMethod;
  tx: TxRequest;
  chain: Chain;
  rpcUrl?: string;
}): Promise<`0x${string}`> {
  const walletClient = await createWalletFromMethod(method, chain, rpcUrl);

  const account = walletClient.account;
  if (!account) {
    throw new Error("Wallet client does not have an account configured");
  }

  const request = await walletClient.prepareTransactionRequest({
    to: tx.to,
    data: tx.data,
    chain,
    account,
    ...(tx.gas ? { gas: tx.gas } : {}),
  });

  return walletClient.signTransaction(request);
}
