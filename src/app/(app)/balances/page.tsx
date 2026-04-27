import type { Metadata } from "next";
import { Shield, Lock, RefreshCw, ArrowDownRight } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { MetricTile } from "@/components/layout/MetricTile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Private Balance | StealthBooks" };

export default function BalancesPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Private Balance"
        description="Your encrypted token account (ETA) balance — decrypted client-side only"
        actions={
          <Button id="balances-refresh-btn" variant="outline" size="md">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      {/* Privacy notice */}
      <GlassPanel padding="md" glow="accent" className="border border-[hsl(var(--brand-accent)/0.2)]">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-[hsl(var(--brand-accent))] shrink-0" aria-hidden="true" />
          <p className="text-body-sm text-[hsl(var(--text-secondary))]">
            Your balance is decrypted locally using your wallet keys. The server only sees the ETA account state type, not the amount. Connect your wallet to view your balance.
          </p>
        </div>
      </GlassPanel>

      {/* Balance tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile
          label="USDC Private Balance"
          value="Connect wallet"
          subtext="Encrypted token account"
          icon={<Shield className="h-4 w-4" />}
          glow="accent"
        />
        <MetricTile
          label="Pending Claims"
          value="—"
          subtext="CLAIM_SUBMITTED, awaiting finality"
          icon={<RefreshCw className="h-4 w-4" />}
        />
        <MetricTile
          label="Available to Withdraw"
          value="—"
          subtext="Ready to sweep to public balance"
          icon={<ArrowDownRight className="h-4 w-4" />}
        />
      </div>

      {/* ETA State info */}
      <GlassPanel padding="md">
        <h2 className="text-heading-2 mb-4">Account State</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "non_existent", desc: "ETA not yet initialized" },
            { label: "uninitialized", desc: "Account exists, not yet usable" },
            { label: "shared", desc: "Operational — can receive and claim" },
            { label: "mxe", desc: "Migrated — fully private mode" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-3 rounded-lg bg-[hsl(var(--surface-overlay)/0.4)] p-3">
              <Badge variant="muted" className="shrink-0 font-mono text-xs">{label}</Badge>
              <p className="text-body-sm text-[hsl(var(--text-secondary))]">{desc}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
