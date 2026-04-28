import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatUsdcCurrency } from "@/lib/formatting";

export const metadata: Metadata = { title: "Invoices | StealthBooks" };

const TABLE_HEADERS = ["Invoice #", "Memo / Notes", "Amount", "Status"];

export default async function InvoicesPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.walletAddress) redirect("/login");
  
  const orgId = session.orgMemberships?.[0]?.orgId;
  if (!orgId) redirect("/settings?prompt=register");

  const invoices = await db.invoice.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Invoices"
        description="Issue and track private USDC invoices"
        actions={
          <Link href="/invoices/new">
            <Button id="invoices-new-btn" size="md">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Invoice
            </Button>
          </Link>
        }
      />

      <GlassPanel padding="none" className="overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[10rem_1fr_9rem_10rem] border-b border-[rgba(255,255,255,0.065)]">
          {TABLE_HEADERS.map((h) => (
            <div key={h} className="px-5 py-3 text-label" style={{ color: "rgb(71,85,105)" }}>{h}</div>
          ))}
        </div>

        {invoices.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-5 py-20 text-center px-8">
            <div className="rounded-2xl p-4"
              style={{ background: "rgba(20,24,54,0.6)", color: "rgb(71,85,105)", border: "1px solid rgba(255,255,255,0.065)" }}>
              <FileText className="h-8 w-8" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-heading-2" style={{ color: "rgb(248,250,252)" }}>No invoices yet</p>
              <p className="max-w-sm text-body-sm" style={{ color: "rgb(71,85,105)" }}>
                Create your first invoice to start receiving private USDC payments through Umbra.
              </p>
            </div>
            <Link href="/invoices/new">
              <Button id="invoices-empty-create-btn" size="md">Create invoice</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.065)]">
            {invoices.map((inv) => (
              <div key={inv.id} className="grid grid-cols-[10rem_1fr_9rem_10rem] items-center px-5 py-4 transition-colors hover:bg-white/[0.02]">
                <div className="text-body-sm font-mono text-[rgb(248,250,252)]">{inv.invoiceNumber}</div>
                <div className="text-body-sm text-[rgb(148,163,184)] truncate pr-4">{inv.memo || inv.internalNotes || "—"}</div>
                <div className="text-body-sm font-medium text-[#10b981]">{formatUsdcCurrency(inv.totalMinor)}</div>
                <div>
                  <Badge variant="muted" className="uppercase text-[0.65rem] tracking-wider text-[rgb(148,163,184)] border-[rgba(255,255,255,0.1)]">
                    {inv.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
