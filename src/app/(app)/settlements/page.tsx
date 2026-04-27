"use client";

import * as React from "react";
import { ArrowDownUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettlementsPage() {
  const [address, setAddress] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const isValid = address.length >= 32 && address.length <= 44 && Number(amount) > 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate ZK proof generation and sweep transaction
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setAddress("");
      setAmount("");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Settlements"
        description="Withdraw from your encrypted balance to a public wallet address"
      />

      {/* Warning */}
      <GlassPanel
        padding="md"
        className="flex items-start gap-3 border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.05)]"
      >
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-[#f59e0b]" aria-hidden="true" />
        <div>
          <p className="text-body font-semibold text-[#f59e0b]">
            Withdrawal is a public transaction
          </p>
          <p className="text-body-sm mt-1 text-[rgb(148,163,184)]">
            Moving funds from your encrypted balance to a public address creates an on-chain transaction visible to everyone.
            The source (ETA) and destination (public ATA) are observable. Use this only when necessary.
          </p>
        </div>
      </GlassPanel>

      {/* Withdrawal form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel padding="lg">
          <h2 className="text-heading-2 mb-5 text-[rgb(248,250,252)]">New Withdrawal</h2>
          
          {isSuccess ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center animate-in zoom-in-95 duration-300">
               <div className="h-16 w-16 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[#10b981]">
                  <CheckCircle2 className="h-10 w-10" />
               </div>
               <div>
                  <h3 className="text-heading-2 text-[#10b981]">Withdrawal Initiated</h3>
                  <p className="text-body-sm text-[rgb(148,163,184)] mt-2">
                    Your ZK sweep proof has been generated and submitted to the network.
                  </p>
               </div>
               <Button variant="outline" onClick={() => setIsSuccess(false)}>
                  New Withdrawal
               </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleWithdraw}>
              <Input
                id="withdrawal-destination"
                label="Destination Owner Address"
                placeholder="Solana wallet address (not ATA)"
                hint="Enter the owner's wallet address. The ATA must already exist."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
              />
              <Button 
                id="withdrawal-submit-btn" 
                type="submit" 
                size="lg" 
                className="mt-2 w-full" 
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
              >
                <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
                {isSubmitting ? "Generating ZK Proof..." : "Withdraw to Public Balance"}
              </Button>
            </form>
          )}
        </GlassPanel>

        {/* Withdrawal history placeholder */}
        <GlassPanel padding="md">
          <h2 className="text-heading-2 mb-4 text-[rgb(248,250,252)]">Recent Withdrawals</h2>
          <p className="text-body-sm text-[rgb(71,85,105)]">
            No withdrawals yet. Withdrawal history is logged locally — amounts are not stored server-side for privacy.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
