"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Shield, ShieldAlert, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletAuth, useAuthStore } from "@/features/auth/useWalletAuth";
import { GlassPanel } from "@/components/layout/GlassPanel";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function LoginClient() {
  const router = useRouter();
  const { connected } = useWallet();
  const { signIn } = useWalletAuth();
  const { status, error } = useAuthStore();

  useEffect(() => {
    // If the wallet connects but we haven't started signing in, start it.
    if (connected && status === "idle") {
      signIn();
    }
  }, [connected, status, signIn]);

  useEffect(() => {
    // If successfully authenticated, redirect to dashboard
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6" style={{ background: "rgb(5,7,18)", fontFamily: "var(--font-sans)" }}>
      <GlassPanel padding="lg" className="max-w-md w-full text-center flex flex-col items-center gap-8 shadow-2xl" glow="primary">
        
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
               style={{ background: "linear-gradient(135deg,#6366f1 0%,#22d3ee 100%)", boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}>
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-display mt-2" style={{ color: "rgb(248,250,252)" }}>Sign In</h1>
          <p className="text-body-sm text-[rgb(148,163,184)]">
            Connect your Solana wallet to access your private StealthBooks treasury.
          </p>
        </div>

        {error && (
          <div className="w-full flex items-start gap-3 rounded-xl p-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
            <ShieldAlert className="h-5 w-5 shrink-0 text-[#ef4444]" />
            <p className="text-body-sm text-left text-[#ef4444]">{error}</p>
          </div>
        )}

        <div className="w-full flex flex-col items-center gap-4 py-4">
          {!connected ? (
            <WalletMultiButton className="!bg-[#6366f1] hover:!bg-[#818cf8] !transition-colors !h-12 !px-8 !rounded-xl !font-semibold !text-sm" />
          ) : status !== "authenticated" ? (
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
               <p className="text-sm font-medium text-[rgb(248,250,252)]">Authenticating with server...</p>
               <p className="text-xs text-[rgb(148,163,184)] text-center max-w-[200px]">Please sign the message in your wallet to verify ownership.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
               <div className="h-8 w-8 rounded-full bg-[#10b981] flex items-center justify-center">
                 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <p className="text-sm font-medium text-[rgb(248,250,252)]">Authenticated! Redirecting...</p>
            </div>
          )}
        </div>

        <div className="w-full pt-6 border-t border-[rgba(255,255,255,0.055)]">
          <p className="text-xs text-[rgb(71,85,105)]">
            By connecting, you agree to the Terms of Service and Privacy Policy. Your keys never leave your device.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
