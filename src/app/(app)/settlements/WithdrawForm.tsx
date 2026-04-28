"use client";

import * as React from "react";
import { ArrowDownUp, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWithdraw } from "@/features/settlements/useWithdraw";

interface WithdrawFormProps {
  orgId: string;
  cluster: "mainnet-beta" | "devnet";
}

export function WithdrawForm({ orgId, cluster }: WithdrawFormProps) {
  const [address, setAddress] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const { withdraw, reset, status, txSignature, error } = useWithdraw(cluster);

  const isValid =
    address.length >= 32 &&
    address.length <= 44 &&
    Number(amount) > 0;

  const isSubmitting = status === "submitting";
  const isPolling = status === "polling";
  const isBusy = isSubmitting || isPolling;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    await withdraw(address, Number(amount), orgId);
  };

  const handleNewWithdrawal = () => {
    setAddress("");
    setAmount("");
    reset();
  };

  const explorerUrl = txSignature
    ? `https://solscan.io/tx/${txSignature}${cluster === "devnet" ? "?cluster=devnet" : ""}`
    : null;

  // ─── Success state ────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center animate-in zoom-in-95 duration-300">
        <div className="h-16 w-16 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[#10b981]">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-heading-2 text-[#10b981]">Withdrawal Confirmed</h3>
          <p className="text-body-sm text-[rgb(148,163,184)] mt-2">
            The Arcium MPC network has processed the withdrawal. Tokens have been transferred to the destination ATA.
          </p>
        </div>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-body-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Solscan
          </a>
        )}
        <Button variant="outline" onClick={handleNewWithdrawal}>
          New Withdrawal
        </Button>
      </div>
    );
  }

  // ─── Polling / awaiting Arcium MPC callback ───────────────────────────────────
  if (status === "polling") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center animate-in zoom-in-95 duration-300">
        <div className="h-16 w-16 rounded-full bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[#6366f1]">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
        <div>
          <h3 className="text-heading-2 text-[rgb(248,250,252)]">Awaiting MPC Callback</h3>
          <p className="text-body-sm text-[rgb(148,163,184)] mt-2 max-w-xs">
            The withdrawal instruction was submitted. The Arcium MPC network is decrypting your balance and executing the transfer.
          </p>
        </div>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-body-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Track on Solscan
          </a>
        )}
        <p className="text-body-sm text-[rgb(71,85,105)]">This may take 30–60 seconds...</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleWithdraw}>
      <Input
        id="withdrawal-destination"
        label="Destination Owner Address"
        placeholder="Solana wallet address (not ATA)"
        hint="Enter the owner's wallet address. The ATA must already exist for the USDC mint."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={isBusy}
      />
      <Input
        id="withdrawal-amount"
        label="Amount (USDC)"
        placeholder="e.g. 500.00"
        type="number"
        min="0"
        step="0.000001"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isBusy}
      />

      {/* Error state */}
      {status === "error" && error && (
        <div className="flex items-start gap-2.5 rounded-xl p-3.5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#ef4444]" />
          <p className="text-body-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      <Button
        id="withdrawal-submit-btn"
        type="submit"
        size="lg"
        className="mt-2 w-full"
        disabled={!isValid || isBusy}
        loading={isBusy}
      >
        <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
        {isSubmitting
          ? "Submitting to Arcium..."
          : "Withdraw to Public Balance"}
      </Button>
    </form>
  );
}
