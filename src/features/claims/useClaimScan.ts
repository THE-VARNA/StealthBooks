"use client";

import { useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getUmbraClient, clusterToNetwork } from "@/features/umbra/client";
import { getCursor, setCursor } from "@/lib/idb/scanCursors";
import { getClaimableUtxoScannerFunction } from "@umbra-privacy/sdk";
// ScannedUtxoData is not a named export — derive it from the scanner result type
type ScannerResult = Awaited<ReturnType<Awaited<ReturnType<typeof getClaimableUtxoScannerFunction>>>>;
type ScannedUtxoData = ScannerResult["publicReceived"][number];

export interface ScannedUtxo {
  sourceUtxoRef: string;
  treeIndex: number;
  insertionIndex: number;
  amountMinor: bigint;
  /** Raw ScannedUtxoData for passing directly to the claimer function */
  raw: ScannedUtxoData;
}

interface UseClaimScanOptions {
  orgId: string;
  cluster: "mainnet-beta" | "devnet";
}

export type ScanStatus = "idle" | "scanning" | "done" | "error";

/**
 * useClaimScan — scans publicReceived bucket for incoming UTXOs.
 *
 * SDK scanner API (from types):
 *   ClaimableUtxoScannerFunction = (treeIndex: U32, startInsertionIndex: U32, endInsertionIndex?: U32)
 *     => Promise<ScannedUtxoResult>
 *
 * ScannedUtxoResult.publicReceived: ScannedUtxoData[] (= DecryptedUtxoData[])
 *
 * DecryptedUtxoData fields:
 *   amount: U64 (branded bigint), treeIndex: U32 (branded bigint),
 *   insertionIndex: U32 (branded bigint), unlockerType, h1Components, etc.
 *   NOTE: no .mint field on DecryptedUtxoData — mint comes from ClaimableUtxoData after enrichWithMerkleProof
 *
 * Source: https://sdk.umbraprivacy.com/sdk/mixer/fetching-utxos
 */
export function useClaimScan({ orgId, cluster }: UseClaimScanOptions) {
  const { publicKey, signMessage, signTransaction } = useWallet();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [discovered, setDiscovered] = useState<ScannedUtxo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scan = useCallback(async () => {
    if (!publicKey || !signMessage || !signTransaction) {
      setError("Wallet not connected or missing signing capabilities");
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStatus("scanning");
    setError(null);
    setDiscovered([]);

    const walletAddress = publicKey.toBase58();
    const network = clusterToNetwork(cluster);

    try {
      const signer = { publicKey, signMessage, signTransaction };

      const client = await getUmbraClient({
        walletAddress,
        network,
        signer,
        rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "",
        deferMasterSeedSignature: true,
      });

      const { getClaimableUtxoScannerFunction } = await import("@umbra-privacy/sdk");

      const scannerFn = await getClaimableUtxoScannerFunction({ client });

      const TREE_INDICES = [0];
      const allDiscovered: ScannedUtxo[] = [];

      for (const treeIndex of TREE_INDICES) {
        if (abortRef.current.signal.aborted) break;

        const startIndex = await getCursor(walletAddress, cluster, treeIndex);

        // U32 is a branded bigint — cast from number via BigInt()
        // ClaimableUtxoScannerFunction: (treeIndex: U32, startInsertionIndex: U32) => Promise<ScannedUtxoResult>
        const result = await scannerFn(
          BigInt(treeIndex) as Parameters<typeof scannerFn>[0],
          BigInt(startIndex) as Parameters<typeof scannerFn>[1]
        );

        // *** publicReceived only — our payment rail ***
        const utxos: ScannedUtxoData[] = result.publicReceived ?? [];

        let maxIndex = startIndex;

        for (const utxo of utxos) {
          if (abortRef.current.signal.aborted) break;

          // U32/U64 are branded bigints — cast to number/bigint for our use
          const insertionIndexNum = Number(utxo.insertionIndex);
          const amountBigInt = BigInt(utxo.amount);

          allDiscovered.push({
            sourceUtxoRef: `${treeIndex}:${insertionIndexNum}`,
            treeIndex,
            insertionIndex: insertionIndexNum,
            amountMinor: amountBigInt,
            raw: utxo,
          });

          if (insertionIndexNum > maxIndex) {
            maxIndex = insertionIndexNum;
          }
        }

        if (maxIndex > startIndex) {
          await setCursor(walletAddress, cluster, treeIndex, maxIndex + 1);
        }
      }

      setDiscovered(allDiscovered);
      setStatus("done");

      // Post discoveries to backend — no amounts sent (privacy preserved)
      if (allDiscovered.length > 0) {
        await fetch("/api/claims/discoveries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            discoveries: allDiscovered.map((u) => ({
              sourceUtxoRef: u.sourceUtxoRef,
              treeIndex: u.treeIndex,
              insertionIndex: u.insertionIndex,
              amountMinor: u.amountMinor.toString(),
              // Use USDC mint from env — DecryptedUtxoData doesn't expose mint directly
              mint: process.env.NEXT_PUBLIC_USDC_MINT ?? "",
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
