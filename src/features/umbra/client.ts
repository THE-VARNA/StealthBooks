/**
 * Umbra SDK client factory
 * Memoized per (walletAddress, network) pair.
 *
 * Source: https://sdk.umbraprivacy.com/quickstart
 * API: getUmbraClient({ signer, network, rpcUrl, rpcSubscriptionsUrl, indexerApiEndpoint? })
 * Returns: Promise<IUmbraClient>
 */

import { getUmbraClient as sdkGetUmbraClientType } from "@umbra-privacy/sdk";
type IUmbraClient = Awaited<ReturnType<typeof sdkGetUmbraClientType>>;

const clientCache = new Map<string, IUmbraClient>();

/** SDK network values per GetUmbraClientArgs.network */
export type UmbraNetwork = "mainnet" | "devnet" | "localnet";

interface GetUmbraClientOptions {
  walletAddress: string;
  network: UmbraNetwork;
  rpcUrl: string;
  rpcSubscriptionsUrl?: string;
  indexerApiEndpoint?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signer: any;
  /** Defer the master seed wallet prompt to first use (avoids early popup) */
  deferMasterSeedSignature?: boolean;
}

/**
 * Returns a memoized IUmbraClient for the given wallet + network.
 * Dynamic import keeps WASM + SDK bundle out of SSR.
 */
export async function getUmbraClient(
  options: GetUmbraClientOptions
): Promise<IUmbraClient> {
  const cacheKey = `${options.walletAddress}:${options.network}`;
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const { getUmbraClient: sdkGetUmbraClient } = await import("@umbra-privacy/sdk");

  const rpcWs =
    options.rpcSubscriptionsUrl ??
    options.rpcUrl.replace("https://", "wss://").replace("http://", "ws://");

  const client = await sdkGetUmbraClient({
    signer: options.signer,
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

/** Convert Solana cluster name → SDK network name */
export function clusterToNetwork(cluster: string): UmbraNetwork {
  if (cluster === "devnet") return "devnet";
  if (cluster === "localnet" || cluster === "localhost") return "localnet";
  return "mainnet";
}

/** Remove a cached client (call on wallet disconnect) */
export function evictUmbraClient(walletAddress: string, network: string) {
  clientCache.delete(`${walletAddress}:${network}`);
}
