import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { WithdrawForm } from "./WithdrawForm";

export const metadata: Metadata = { title: "Settlements | StealthBooks" };

export default async function SettlementsPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.walletAddress) redirect("/login");

  const orgId = session.orgMemberships?.[0]?.orgId;
  if (!orgId) redirect("/settings?prompt=register");

  const cluster =
    (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as "mainnet-beta" | "devnet") ?? "devnet";

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
            Moving funds from your encrypted balance to a public address creates an on-chain
            transaction visible to everyone. The source (ETA) and destination (public ATA) are
            observable. Use this only when necessary.
          </p>
        </div>
      </GlassPanel>

      {/* Withdrawal form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel padding="lg">
          <h2 className="text-heading-2 mb-5 text-[rgb(248,250,252)]">New Withdrawal</h2>
          <WithdrawForm orgId={orgId} cluster={cluster} />
        </GlassPanel>

        {/* Withdrawal history placeholder */}
        <GlassPanel padding="md">
          <h2 className="text-heading-2 mb-4 text-[rgb(248,250,252)]">Recent Withdrawals</h2>
          <p className="text-body-sm text-[rgb(71,85,105)]">
            No withdrawals yet. Withdrawal history is logged locally — amounts are not stored
            server-side for privacy.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
