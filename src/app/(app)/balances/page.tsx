import type { Metadata } from "next";
import { Shield, Lock, RefreshCw, ArrowDownRight } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { MetricTile } from "@/components/layout/MetricTile";
import { RefreshBalanceButton } from "./RefreshBalanceButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatUsdcCurrency } from "@/lib/formatting";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Private Balance | StealthBooks" };

export default async function BalancesPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.walletAddress) redirect("/login");
  
  const orgId = session.orgMemberships?.[0]?.orgId;
  if (!orgId) redirect("/settings?prompt=register");

  // Sum up all CLAIMED UTXOs for this org
  const claimedTotal = await db.claimEvent.aggregate({
    where: { orgId, status: "CLAIMED" },
    _sum: { amountMinor: true },
  });

  // Sum up all DISCOVERED or CLAIM_SUBMITTED UTXOs as pending
  const pendingTotal = await db.claimEvent.aggregate({
    where: { orgId, status: { in: ["DISCOVERED", "CLAIM_SUBMITTED"] } },
    _sum: { amountMinor: true },
  });

  // Sum up all withdrawals from the audit log to deduct from balance
  const withdrawals = await db.auditLog.findMany({
    where: { orgId, action: "WITHDRAWAL_CONFIRMED" },
    select: { metadata: true }
  });

  const totalWithdrawn = withdrawals.reduce((acc, log) => {
    const meta = log.metadata as { amountMinor?: string } | null;
    if (meta && meta.amountMinor) {
      return acc + BigInt(meta.amountMinor);
    }
    return acc;
  }, BigInt(0));

  let balanceAmount = (claimedTotal._sum.amountMinor || BigInt(0)) - totalWithdrawn;
  if (balanceAmount < BigInt(0)) balanceAmount = BigInt(0);

  const pendingAmount = pendingTotal._sum.amountMinor || BigInt(0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Private Balance"
        description="Your encrypted token account (ETA) balance — decrypted client-side only"
        actions={
          <RefreshBalanceButton />
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
          value={formatUsdcCurrency(balanceAmount)}
          subtext="Encrypted token account"
          icon={<Shield className="h-4 w-4" />}
          accentColor="#6366f1"
        />
        <MetricTile
          label="Pending Claims"
          value={formatUsdcCurrency(pendingAmount)}
          subtext="Found on-chain, not yet claimed"
          icon={<RefreshCw className="h-4 w-4" />}
          accentColor="#22d3ee"
        />
        <MetricTile
          label="Available to Withdraw"
          value={formatUsdcCurrency(balanceAmount)}
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
