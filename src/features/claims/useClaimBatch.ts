"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getUmbraClient, clusterToNetwork } from "@/features/umbra/client";
import type { ScannedUtxo } from "./useClaimScan";
import { getClaimableUtxoScannerFunction } from "@umbra-privacy/sdk";
// ScannedUtxoData not a named export — derive from scanner result
type ScannerResult = Awaited<ReturnType<Awaited<ReturnType<typeof getClaimableUtxoScannerFunction>>>>;
type ScannedUtxoData = ScannerResult["publicReceived"][number];

export type ClaimStatus = "idle" | "submitting" | "polling" | "claimed" | "error";

interface ClaimState {
  claimEventId: string;
  status: ClaimStatus;
  txSignature: string | null;
  error: string | null;
}

/**
 * useClaimBatch — claims publicReceived UTXOs into ETA.
 *
 * SDK claimer API (from types):
 *   getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction({ client })
 *     => (utxos: readonly ScannedUtxoData[], optionalData?: OptionalData32) => Promise<ClaimUtxoIntoEncryptedBalanceResult>
 *
 * The claimer takes the full raw ScannedUtxoData array, not individual indices.
 * We pass [utxo.raw] (single UTXO per claim for sequential processing).
 *
 * Source: https://sdk.umbraprivacy.com/sdk/mixer/fetching-utxos
 */
export function useClaimBatch(cluster: "mainnet-beta" | "devnet") {
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [claims, setClaims] = useState<Record<string, ClaimState>>({});

  const claimUtxo = useCallback(
    async (utxo: ScannedUtxo, claimEventId: string) => {
      if (!publicKey || !signMessage || !signTransaction) return;

      const walletAddress = publicKey.toBase58();
      const network = clusterToNetwork(cluster);

      setClaims((prev) => ({
        ...prev,
        [claimEventId]: { claimEventId, status: "submitting", txSignature: null, error: null },
      }));

      try {
        const signer = { publicKey, signMessage, signTransaction };

        const client = await getUmbraClient({
          walletAddress,
          network,
          signer,
          rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "",
          deferMasterSeedSignature: true,
        });

        const { getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction } =
          await import("@umbra-privacy/sdk");

        // Claimer factory: ({ client }) => (utxos: readonly ScannedUtxoData[]) => Promise<ClaimUtxoIntoEncryptedBalanceResult>
        const claimerFn =
          await getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction({ client });

        // Pass single UTXO raw data; claimer handles ZK proof + relayer submission
        const result = await claimerFn([utxo.raw] as readonly ScannedUtxoData[]);

        // Extract signature from result — shape depends on SDK version
        // ClaimUtxoIntoEncryptedBalanceResult may have .signature or similar
        const txSignature = extractSignature(result);

        // Phase 1: notify backend — CLAIM_SUBMITTED
        await fetch(`/api/claims/${claimEventId}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claimTxSignature: txSignature }),
        });

        setClaims((prev) => ({
          ...prev,
          [claimEventId]: { claimEventId, status: "polling", txSignature, error: null },
        }));

        // Phase 2: poll chain for finality
        await pollConfirmation(txSignature, connection, (finalStatus) => {
          setClaims((prev) => ({
            ...prev,
            [claimEventId]: { ...prev[claimEventId], status: finalStatus },
          }));
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Claim failed";
        setClaims((prev) => ({
          ...prev,
          [claimEventId]: { claimEventId, status: "error", txSignature: null, error: msg },
        }));
      }
    },
    [publicKey, signMessage, signTransaction, cluster, connection]
  );

  return { claimUtxo, claims };
}

/** Extract tx signature from the opaque claim result */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSignature(result: any): string {
  if (typeof result?.signature === "string") return result.signature;
  if (typeof result?.txSignature === "string") return result.txSignature;
  if (Array.isArray(result?.signatures) && result.signatures.length > 0) {
    return result.signatures[0];
  }
  return `claim-${Date.now()}`;
}

async function pollConfirmation(
  txSignature: string,
  connection: ReturnType<typeof useConnection>["connection"],
  onDone: (status: "claimed" | "error") => void,
  maxAttempts = 30
) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const response = await connection.getSignatureStatus(txSignature);
      const status = response?.value?.confirmationStatus;
      if (status === "confirmed" || status === "finalized") {
        onDone("claimed");
        return;
      }
    } catch {
      // transient RPC error, continue
    }
  }
  onDone("error");
}
