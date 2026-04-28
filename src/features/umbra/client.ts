/**
 * Umbra SDK client factory — memoized per (walletAddress, network) pair.
 *
 * SIGNER ADAPTER
 * ==============
 * The SDK expects IUmbraSigner (from @solana/kit / web3.js v2):
 *   - address: string
 *   - signMessage(msg: Uint8Array): Promise<{ message, signature, signer }>
 *   - signTransaction(tx): Promise<SignedTransaction>
 *   - signTransactions(txs): Promise<SignedTransaction[]>
 *
 * @solana/wallet-adapter-react is incompatible:
 *   - publicKey: PublicKey (object, not string)
 *   - signMessage: returns Promise<Uint8Array>  ← missing .signature field → "expected Uint8Array"
 *   - signTransaction: v1 wire format
 *
 * We mirror the SDK's own convertWalletStandardAccountToIUmbraSigner (chunk-HA5FLM63.js):
 *   1. getTransactionEncoder().encode(kitTx) → Solana wire bytes
 *   2. VersionedTransaction.deserialize(wireBytes) → v1 tx for wallet to sign
 *   3. getTransactionDecoder().decode(signedVtx.serialize()) → extract kit signatures
 *   4. Spread decoded.signatures into the returned transaction
 */

import { getUmbraClient as _sdkGetUmbraClientType } from "@umbra-privacy/sdk";
import {
  getTransactionEncoder,
  getTransactionDecoder,
} from "@solana/kit";
import { VersionedTransaction } from "@solana/web3.js";

type IUmbraClient = Awaited<ReturnType<typeof _sdkGetUmbraClientType>>;

const clientCache = new Map<string, IUmbraClient>();

export type UmbraNetwork = "mainnet" | "devnet" | "localnet";

export interface WalletAdapterSigner {
  publicKey: { toBase58(): string };
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTransaction: (tx: any) => Promise<any>;
}

interface GetUmbraClientOptions {
  walletAddress: string;
  network: UmbraNetwork;
  rpcUrl: string;
  rpcSubscriptionsUrl?: string;
  indexerApiEndpoint?: string;
  signer: WalletAdapterSigner;
  deferMasterSeedSignature?: boolean;
}

/**
 * Encodes a @solana/kit Transaction to Solana wire bytes, passes it to the
 * wallet adapter for signing, then decodes the result back to kit format.
 * Mirrors convertWalletStandardAccountToIUmbraSigner in chunk-HA5FLM63.js.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function signKitTransaction(walletSigner: WalletAdapterSigner, transaction: any): Promise<any> {
  const encoder = getTransactionEncoder();
  const decoder = getTransactionDecoder();

  // Encode the @solana/kit tx to Solana binary wire format
  const wireBytes = encoder.encode(transaction) as Uint8Array;

  // Deserialize into web3.js v1 VersionedTransaction (same binary wire format)
  const vtx = VersionedTransaction.deserialize(wireBytes);

  // Have the wallet adapter sign it
  const signedVtx = await walletSigner.signTransaction(vtx);

  // Re-encode the signed v1 tx and decode with kit to get a typed signatures record
  const decoded = decoder.decode(signedVtx.serialize());

  return {
    ...transaction,
    signatures: { ...transaction.signatures, ...decoded.signatures },
  };
}

/**
 * Wraps a @solana/wallet-adapter-react signer into the IUmbraSigner shape.
 */
function buildUmbraSigner(walletSigner: WalletAdapterSigner) {
  const address = walletSigner.publicKey.toBase58();

  return {
    address,

    // SDK signMessage returns { message, signature, signer } — not plain Uint8Array
    signMessage: async (message: Uint8Array) => {
      const rawSignature = await walletSigner.signMessage(message);
      return { message, signature: rawSignature as Uint8Array, signer: address };
    },

    signTransaction: async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transaction: any
    ) => signKitTransaction(walletSigner, transaction),

    signTransactions: async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transactions: any[]
    ) => {
      const results = [];
      for (const tx of transactions) {
        results.push(await signKitTransaction(walletSigner, tx));
      }
      return results;
    },
  };
}

/**
 * Returns a memoized IUmbraClient for the given wallet + network.
 * Dynamic import keeps WASM + SDK bundle out of SSR.
 */
export async function getUmbraClient(options: GetUmbraClientOptions): Promise<IUmbraClient> {
  const cacheKey = `${options.walletAddress}:${options.network}`;
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const { getUmbraClient: sdkGetUmbraClient } = await import("@umbra-privacy/sdk");

  const rpcWs =
    options.rpcSubscriptionsUrl ??
    options.rpcUrl.replace("https://", "wss://").replace("http://", "ws://");

  const client = await sdkGetUmbraClient({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signer: buildUmbraSigner(options.signer) as any,
    network: options.network,
    rpcUrl: options.rpcUrl,
    rpcSubscriptionsUrl: rpcWs,
    indexerApiEndpoint:
      options.indexerApiEndpoint ??
      process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL ??
      "https://utxo-indexer.api.umbraprivacy.com",
    deferMasterSeedSignature: options.deferMasterSeedSignature ?? true,
  });

  clientCache.set(cacheKey, client);
  return client;
}

export function clusterToNetwork(cluster: string): UmbraNetwork {
  if (cluster === "devnet") return "devnet";
  if (cluster === "localnet" || cluster === "localhost") return "localnet";
  return "mainnet";
}

export function evictUmbraClient(walletAddress: string, network: string) {
  clientCache.delete(`${walletAddress}:${network}`);
}
