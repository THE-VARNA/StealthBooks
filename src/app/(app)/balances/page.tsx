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
      <GlassPanel padding="md" glow="cyan">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 shrink-0" style={{ color: "#22d3ee" }} aria-hidden="true" />
          <p className="text-body-sm" style={{ color: "rgb(148,163,184)" }}>
            Your balance is decrypted locally using your wallet keys. The server only sees the ETA account state type,
            not the amount. Connect your wallet to view your balance.
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
          accentColor="#6366f1"
        />
        <MetricTile
          label="Pending Claims"
          value="—"
          subtext="CLAIM_SUBMITTED, awaiting finality"
          icon={<RefreshCw className="h-4 w-4" />}
          accentColor="#22d3ee"
        />
        <MetricTile
          label="Available to Withdraw"
          value="—"
          subtext="Ready to sweep to public balance"
          icon={<ArrowDownRight className="h-4 w-4" />}
          accentColor="#10b981"
        />
      </div>

      {/* ETA State info */}
      <GlassPanel padding="md">
        <h2 className="text-heading-2 mb-4" style={{ color: "rgb(248,250,252)" }}>Account State</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "non_existent",  desc: "ETA not yet initialized",        color: "#ef4444" },
            { label: "uninitialized", desc: "Account exists, not yet usable", color: "#f59e0b" },
            { label: "shared",        desc: "Operational — can receive and claim", color: "#10b981" },
            { label: "mxe",           desc: "Migrated — fully private mode",  color: "#6366f1" },
          ].map(({ label, desc, color }) => (
            <div key={label}
              className="flex items-start gap-3 rounded-xl p-3.5"
              style={{ background: "rgba(20,24,54,0.5)", border: "1px solid rgba(255,255,255,0.055)" }}>
              <Badge variant="muted" className="shrink-0 font-mono text-xs" style={{ color, borderColor: `${color}40` }}>
                {label}
              </Badge>
              <p className="text-body-sm" style={{ color: "rgb(148,163,184)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
