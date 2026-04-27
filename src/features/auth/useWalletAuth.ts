"use client";

import { create } from "zustand";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import bs58 from "bs58";

interface OrgMembership {
  orgId: string;
  role: "OWNER" | "FINANCE_OPERATOR" | "REVIEWER";
}

type AuthStatus = "idle" | "connecting" | "signing" | "authenticated" | "error";

interface AuthState {
  status: AuthStatus;
  walletAddress: string | null;
  orgMemberships: OrgMembership[];
  error: string | null;
  setAuthenticated: (walletAddress: string, memberships: OrgMembership[]) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  walletAddress: null,
  orgMemberships: [],
  error: null,
  setAuthenticated: (walletAddress, orgMemberships) =>
    set({ status: "authenticated", walletAddress, orgMemberships, error: null }),
  setError: (error) => set({ status: "error", error }),
  reset: () =>
    set({ status: "idle", walletAddress: null, orgMemberships: [], error: null }),
}));

/** Hook: perform the full nonce → sign → verify auth flow */
export function useWalletAuth() {
  const { publicKey, signMessage } = useWallet();
  const { setAuthenticated, setError, status } = useAuthStore();

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError("Wallet not connected or does not support signing");
      return;
    }

    const walletAddress = publicKey.toBase58();

    try {
      // Step 1: Get nonce
      const nonceRes = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();

      // Step 2: Sign nonce with wallet
      const messageBytes = new TextEncoder().encode(nonce);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Step 3: Verify signature
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || "Verification failed");
      }
      const data = await verifyRes.json();

      setAuthenticated(data.walletAddress, data.orgMemberships);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      setError(message);
    }
  }, [publicKey, signMessage, setAuthenticated, setError]);

  return { signIn, status };
}
