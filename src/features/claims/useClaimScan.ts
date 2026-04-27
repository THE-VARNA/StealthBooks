"use client";

import { useState, useCallback, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getUmbraClient } from "@/features/umbra/client";
import { getCursor, setCursor } from "@/lib/idb/scanCursors";

export interface ScannedUtxo {
  sourceUtxoRef: string;
  treeIndex: number;
  insertionIndex: number;
  amountMinor: bigint;
  mint: string;
}

interface UseClaimScanOptions {
  orgId: string;
  cluster: "mainnet-beta" | "devnet";
}

export type ScanStatus = "idle" | "scanning" | "done" | "error";

/**
 * useClaimScan — scans Umbra publicReceived bucket for incoming UTXOs.
 *
 * Source: https://sdk.umbraprivacy.com/sdk/mixer/fetching-utxos
 *
 * The official fetch returns 4 buckets:
 *   - received        (private encrypted receipts)
 *   - publicReceived  ← THIS IS THE ONE WE USE (receiver-claimable from public balance)
 *   - sent
 *   - publicSent
 *
 * StealthBooks uses getPublicBalanceToReceiverClaimableUtxoCreatorFunction for payments,
 * so the vendor must scan publicReceived.
 */
export function useClaimScan({ orgId, cluster }: UseClaimScanOptions) {
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [discovered, setDiscovered] = useState<ScannedUtxo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scan = useCallback(async () => {
    if (!publicKey || !signMessage || !signTransaction) {
      setError("Wallet not connected or missing signing capabilities");
      return;
    }

    // Cancel any in-progress scan
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStatus("scanning");
    setError(null);
    setDiscovered([]);

    const walletAddress = publicKey.toBase58();

    try {
      const client = await getUmbraClient({
        walletAddress,
        cluster,
        rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "",
        indexerUrl: process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL,
        relayerUrl: process.env.NEXT_PUBLIC_UMBRA_RELAYER_URL,
      });

      // Dynamically import the scanner function
      const { getClaimableUtxoScannerFunction } = await import("@umbra-privacy/sdk");

      const scannerCreator = await getClaimableUtxoScannerFunction(client);

      // Scan each known tree (0 = default genesis tree)
      const TREE_INDICES = [0];
      const allDiscovered: ScannedUtxo[] = [];

      for (const treeIndex of TREE_INDICES) {
        if (abortRef.current.signal.aborted) break;

        const fromIndex = await getCursor(walletAddress, cluster, treeIndex);

        const scanner = await scannerCreator({
          walletAdapter: {
            publicKey,
            signMessage,
            signTransaction,
          },
          treeIndex,
          fromInsertionIndex: fromIndex,
        });

        // The scanner returns a result object with the 4 buckets
        const result = await scanner.scan();

        // *** CRITICAL: only scan publicReceived — not received ***
        // publicReceived = UTXOs sent to us via public balance (our payment rail)
        const utxos = result.publicReceived ?? [];

        let maxIndex = fromIndex;

        for (const utxo of utxos) {
          if (abortRef.current.signal.aborted) break;

          allDiscovered.push({
            sourceUtxoRef: `${treeIndex}:${utxo.insertionIndex}`,
            treeIndex,
            insertionIndex: utxo.insertionIndex,
            amountMinor: BigInt(utxo.amount),
            mint: utxo.mint,
          });

          if (utxo.insertionIndex > maxIndex) {
            maxIndex = utxo.insertionIndex;
          }
        }

        // Persist cursor to avoid rescanning next time
        if (maxIndex > fromIndex) {
          await setCursor(walletAddress, cluster, treeIndex, maxIndex + 1);
        }
      }

      setDiscovered(allDiscovered);
      setStatus("done");

      // Persist discoveries to backend for invoice matching
      if (allDiscovered.length > 0) {
        await fetch("/api/claims/discoveries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            discoveries: allDiscovered.map((u) => ({
              ...u,
              amountMinor: u.amountMinor.toString(),
            })),
          }),
        }).catch(console.error);
      }
    } catch (err) {
      if (!abortRef.current?.signal.aborted) {
        const msg = err instanceof Error ? err.message : "Scan failed";
        setError(msg);
        setStatus("error");
      }
    }
  }, [publicKey, signMessage, signTransaction, cluster, orgId]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  return { scan, cancel, status, discovered, error };
}
