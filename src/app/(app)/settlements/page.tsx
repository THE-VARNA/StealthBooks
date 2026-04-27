"use client";

import { ArrowDownUp, AlertTriangle } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



export default function SettlementsPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Settlements"
        description="Withdraw from your encrypted balance to a public wallet address"
      />

      {/* Warning */}
      <GlassPanel padding="md" className="flex items-start gap-3 border border-[hsl(var(--brand-warning)/0.25)]">
        <AlertTriangle className="h-5 w-5 text-[hsl(var(--brand-warning))] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-body font-semibold text-[hsl(var(--brand-warning))]">
            Withdrawal is a public transaction
          </p>
          <p className="text-body-sm text-[hsl(var(--text-secondary))] mt-1">
            Moving funds from your encrypted balance to a public address creates an on-chain transaction visible to everyone. The source (ETA) and destination (public ATA) are observable. Use this only when necessary.
          </p>
        </div>
      </GlassPanel>

      {/* Withdrawal form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel padding="lg">
          <h2 className="text-heading-2 mb-5">New Withdrawal</h2>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <Input
              id="withdrawal-destination"
              label="Destination Owner Address"
              placeholder="Solana wallet address (not ATA)"
              hint="Enter the owner's wallet address. The ATA will be resolved automatically. The ATA must already exist."
            />
            <Input
              id="withdrawal-amount"
              label="Amount (USDC)"
              placeholder="e.g. 500.00"
              type="number"
              min="0"
              step="0.000001"
            />
            <Button id="withdrawal-submit-btn" type="submit" size="lg" className="mt-2" disabled>
              <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
              Withdraw to Public Balance
            </Button>
          </form>
        </GlassPanel>

        {/* Withdrawal history placeholder */}
        <GlassPanel padding="md">
          <h2 className="text-heading-2 mb-4">Recent Withdrawals</h2>
          <p className="text-body-sm text-[hsl(var(--text-muted))]">
            No withdrawals yet. Withdrawal history is logged locally — amounts are not stored server-side for privacy.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
