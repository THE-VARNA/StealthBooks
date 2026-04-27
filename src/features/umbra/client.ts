// Umbra SDK client factory
// Memoized per (walletAdapter, cluster) pair so we never create duplicate instances.
// All Umbra state is wallet-scoped; only call after wallet is connected.

import { type UmbraClient } from "@umbra-privacy/sdk";

const clientCache = new Map<string, UmbraClient>();

interface GetUmbraClientOptions {
  walletAddress: string;
  cluster: "mainnet-beta" | "devnet";
  rpcUrl: string;
  indexerUrl?: string;
  relayerUrl?: string;
}

/**
 * Returns a memoized UmbraClient instance for the given wallet + cluster.
 * Call this inside a React hook after the wallet is connected.
 *
 * NOTE: We dynamically import @umbra-privacy/sdk to avoid loading the heavy
 * SDK on the server and to keep WASM loading async.
 */
export async function getUmbraClient(
  options: GetUmbraClientOptions
): Promise<UmbraClient> {
  const cacheKey = `${options.walletAddress}:${options.cluster}`;

  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const { initializeUmbraClient } = await import("@umbra-privacy/sdk");

  const client = await initializeUmbraClient({
    rpcUrl: options.rpcUrl,
    cluster: options.cluster,
    indexerUrl:
      options.indexerUrl ?? "https://utxo-indexer.api.umbraprivacy.com",
    relayerUrl: options.relayerUrl ?? "https://relayer.api.umbraprivacy.com",
  });

  clientCache.set(cacheKey, client);
  return client;
}

/** Remove a cached client (e.g. on wallet disconnect) */
export function evictUmbraClient(walletAddress: string, cluster: string) {
  clientCache.delete(`${walletAddress}:${cluster}`);
}
