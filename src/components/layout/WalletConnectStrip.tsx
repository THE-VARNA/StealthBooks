"use client";

import * as React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth, useAuthStore } from "@/features/auth/useWalletAuth";

export default function WalletConnectStrip() {
  const { connected, publicKey } = useWallet();
  const { signIn, status } = useWalletAuth();
  const { walletAddress } = useAuthStore();

  React.useEffect(() => {
    if (connected && publicKey && status === "idle") {
      signIn();
    }
  }, [connected, publicKey, status, signIn]);

  if (walletAddress && status === "authenticated") {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)" }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full shrink-0 text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}
        >
          {walletAddress.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-label" style={{ color: "rgb(71,85,105)" }}>Wallet</p>
          <p className="text-[0.75rem] font-mono truncate" style={{ color: "rgb(148,163,184)" }}>
            {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <WalletMultiButton 
        style={{ 
          background: "rgba(99,102,241,0.15)", 
          border: "1px solid rgba(99,102,241,0.3)", 
          color: "#818cf8", 
          borderRadius: "12px",
          height: "40px",
          fontSize: "14px",
          fontWeight: 600,
          width: "100%",
          justifyContent: "center"
        }} 
      />
    </div>
  );
}
