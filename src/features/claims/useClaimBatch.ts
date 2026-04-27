"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getUmbraClient } from "@/features/umbra/client";
import type { ScannedUtxo } from "./useClaimScan";

export type ClaimStatus = "idle" | "submitting" | "polling" | "claimed" | "error";

interface ClaimState {
  claimEventId: string;
  status: ClaimStatus;
  txSignature: string | null;
  error: string | null;
}

/**
 * useClaimBatch — claims discovered UTXOs into encrypted token account (ETA).
 *
 * Two-phase flow per official docs:
 *   Phase 1 — CLAIM_SUBMITTED: call getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction
 *             and submit via relayer. Record claimEventId = CLAIM_SUBMITTED.
 *   Phase 2 — CLAIMED: poll GET /api/claims/[claimEventId]/status until confirmed on chain.
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

      setClaims((prev) => ({
        ...prev,
        [claimEventId]: {
          claimEventId,
          status: "submitting",
          txSignature: null,
          error: null,
        },
      }));

      try {
        const client = await getUmbraClient({
          walletAddress,
          cluster,
          rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "",
          indexerUrl: process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL,
          relayerUrl: process.env.NEXT_PUBLIC_UMBRA_RELAYER_URL,
        });

        const { getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction } =
          await import("@umbra-privacy/sdk");

        const claimerCreator =
          await getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction(client);

        const claimer = await claimerCreator({
          walletAdapter: { publicKey, signMessage, signTransaction },
          treeIndex: utxo.treeIndex,
          insertionIndex: utxo.insertionIndex,
        });

        // Submit via relayer — returns tx signature
        const { txSignature } = await claimer.claim();

        // Mark CLAIM_SUBMITTED in backend
        await fetch(`/api/claims/${claimEventId}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claimTxSignature: txSignature }),
        });

        setClaims((prev) => ({
          ...prev,
          [claimEventId]: { claimEventId, status: "polling", txSignature, error: null },
        }));

        // Phase 2: poll for confirmation
        await pollClaimConfirmation(claimEventId, txSignature, connection, (finalStatus) => {
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

/** Poll the RPC for tx confirmation, then notify backend */
async function pollClaimConfirmation(
  claimEventId: string,
  txSignature: string,
  connection: { getSignatureStatus: (sig: string) => Promise<{ value: { confirmationStatus: string } | null }> },
  onDone: (status: "claimed" | "error") => void,
  maxAttempts = 30
) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const { value } = await connection.getSignatureStatus(txSignature);
      if (value?.confirmationStatus === "confirmed" || value?.confirmationStatus === "finalized") {
        onDone("claimed");
        return;
      }
    } catch {
      // transient RPC error, continue polling
    }
  }
  onDone("error");
}
