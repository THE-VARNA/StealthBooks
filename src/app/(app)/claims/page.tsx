import type { Metadata } from "next";
import { Inbox, RefreshCw, Shield } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { EmptyStatePanel } from "@/components/layout/EmptyStatePanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanButton } from "./ScanButton";
import { ClaimActionButton } from "./ClaimActionButton";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatUsdcCurrency } from "@/lib/formatting";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Claims Inbox | StealthBooks" };

export default async function ClaimsPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.walletAddress) redirect("/login");
  
  const orgId = session.orgMemberships?.[0]?.orgId;
  if (!orgId) redirect("/settings");

  const claims = await db.claimEvent.findMany({
    where: { orgId },
    orderBy: { discoveredAt: "desc" },
    include: { invoice: { select: { invoiceNumber: true } } },
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Claims Inbox"
        description="Scan your wallet's publicReceived bucket and claim UTXOs into your private balance"
        actions={
          <ScanButton orgId={orgId} />
        }
      />

      {/* Scan info banner */}
      <GlassPanel padding="md" className="flex items-start gap-4">
        <div className="rounded-xl bg-[rgba(34,211,238,0.12)] p-2.5 text-[#22d3ee] shrink-0">
          <Shield className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-body font-semibold text-[rgb(248,250,252)]">
            Privacy-preserving scan
          </p>
          <p className="text-body-sm text-[rgb(148,163,184)] mt-0.5">
            The scan runs client-side using your connected wallet. UTXOs are decrypted locally — amounts never reach the server. Your scanning cursor is saved in this browser only.
          </p>
        </div>
        <Badge variant="accent" className="shrink-0">publicReceived</Badge>
      </GlassPanel>

      {/* Claims table */}
      <GlassPanel padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.065)]">
          <h2 className="text-heading-2">Discovered UTXOs</h2>
          <span className="text-body-sm text-[rgb(71,85,105)]">{claims.length} unclaimed</span>
        </div>
        
        {claims.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="rounded-2xl bg-[rgba(20,24,54,0.6)] p-4 text-[rgb(71,85,105)]">
              <Inbox className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-heading-2 text-[rgb(248,250,252)]">No UTXOs discovered</p>
            <p className="max-w-sm text-body-sm text-[rgb(71,85,105)]">
              Click &apos;Scan Now&apos; to scan your wallet&apos;s publicReceived bucket for incoming payments.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="px-5 py-2.5 text-left text-label text-[rgb(71,85,105)]">UTXO Ref</th>
                <th className="px-5 py-2.5 text-left text-label text-[rgb(71,85,105)]">Matched Invoice</th>
                <th className="px-5 py-2.5 text-left text-label text-[rgb(71,85,105)]">Amount</th>
                <th className="px-5 py-2.5 text-left text-label text-[rgb(71,85,105)]">Status</th>
                <th className="px-5 py-2.5 text-right text-label text-[rgb(71,85,105)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-[rgba(20,24,54,0.2)] transition-colors">
                  <td className="px-5 py-3 text-mono text-body-sm text-[rgb(148,163,184)] truncate max-w-[150px]">
                    {claim.sourceUtxoRef}
                  </td>
                  <td className="px-5 py-3 text-body-sm text-[rgb(248,250,252)]">
                    {claim.invoice?.invoiceNumber ?? "Unknown"}
                  </td>
                  <td className="px-5 py-3 text-mono font-semibold text-[#10b981]">
                    +{formatUsdcCurrency(claim.amountMinor)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className="border-[#6366f1] text-[#6366f1] bg-[rgba(99,102,241,0.1)]">
                      {claim.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ClaimActionButton claimId={claim.id} status={claim.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassPanel>
    </div>
  );
}
