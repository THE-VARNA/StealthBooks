import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Shield } from "lucide-react";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { InvoiceStatusBadge } from "@/components/layout/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatUsdcCurrency, formatDate, formatRelativeTime } from "@/lib/formatting";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Invoice Detail | StealthBooks" };

interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { invoiceId } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      lineItems: true,
      counterparty: { select: { displayName: true } },
      organization: { select: { name: true } },
      umbraTransactions: { orderBy: { confirmedAt: "desc" }, take: 5 },
    },
  });

  if (!invoice) notFound();

  const canApprove = invoice.status === "DRAFT";
  const canVoid = ["DRAFT", "APPROVED", "OPEN", "PAYMENT_INTENT_CREATED"].includes(invoice.status);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title={`Invoice ${invoice.invoiceNumber}`}
        description={`Created ${formatRelativeTime(invoice.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            {canVoid && (
              <Button id={`inv-${invoiceId}-void`} variant="destructive" size="sm">
                <XCircle className="h-4 w-4" /> Void
              </Button>
            )}
            {canApprove && (
              <Button id={`inv-${invoiceId}-approve`} size="sm">
                <CheckCircle className="h-4 w-4" /> Approve &amp; Generate Link
              </Button>
            )}
            <Link href="/invoices">
              <Button id="inv-back-btn" variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassPanel padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[hsl(var(--surface-border)/0.08)] flex items-center justify-between">
              <h2 className="text-heading-2">Line Items</h2>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <table className="w-full" aria-label="Invoice line items">
              <thead>
                <tr className="border-b border-[hsl(var(--surface-border)/0.06)]">
                  {["Description", "Qty", "Unit Price", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-label text-[hsl(var(--text-muted))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--surface-border)/0.06)]">
                {invoice.lineItems.map((li) => (
                  <tr key={li.id} className="hover:bg-[hsl(var(--surface-overlay)/0.2)] transition-colors">
                    <td className="px-5 py-3 text-body text-[hsl(var(--text-primary))]">{li.description}</td>
                    <td className="px-5 py-3 text-body-sm text-[hsl(var(--text-secondary))]">{li.quantity.toString()}</td>
                    <td className="px-5 py-3 text-mono text-body-sm">{formatUsdcCurrency(li.unitPrice)}</td>
                    <td className="px-5 py-3 text-mono font-semibold">{formatUsdcCurrency(li.amountMinor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-[hsl(var(--surface-border)/0.1)] px-5 py-4 flex flex-col gap-2 items-end">
              <div className="flex gap-8 text-body-sm text-[hsl(var(--text-secondary))]">
                <span>Subtotal</span>
                <span className="font-semibold text-[hsl(var(--text-primary))]">{formatUsdcCurrency(invoice.subtotalMinor)}</span>
              </div>
              <div className="flex gap-8 text-body-sm text-[hsl(var(--text-muted))]">
                <span>Umbra fee (~0.21%)</span>
                <span>{formatUsdcCurrency(invoice.protocolFeeMinor)}</span>
              </div>
              <Separator className="w-48" />
              <div className="flex gap-8 text-heading-2">
                <span>Total (USDC)</span>
                <span className="gradient-text">{formatUsdcCurrency(invoice.totalMinor)}</span>
              </div>
            </div>
          </GlassPanel>

          {invoice.status === "OPEN" && (
            <GlassPanel padding="md" className="border border-[hsl(var(--brand-success)/0.2)] flex items-center gap-4">
              <Shield className="h-5 w-5 text-[hsl(var(--brand-success))] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-body font-semibold">Checkout link ready</p>
                <p className="text-body-sm text-[hsl(var(--text-muted))]">Share with your payer to initiate Umbra payment</p>
                {invoice.publicTokenExpiresAt && (
                  <p className="text-body-sm text-[hsl(var(--text-muted))]">Expires: {formatDate(invoice.publicTokenExpiresAt)}</p>
                )}
              </div>
            </GlassPanel>
          )}
        </div>

        <GlassPanel padding="md" className="flex flex-col gap-3 h-fit">
          <h2 className="text-heading-2 mb-1">Details</h2>
          {[
            ["Invoice #", invoice.invoiceNumber],
            ["Org", invoice.organization.name],
            ["Counterparty", invoice.counterparty?.displayName ?? "—"],
            ["Memo", invoice.memo ?? "—"],
            ["Due Date", invoice.dueDate ? formatDate(invoice.dueDate) : "—"],
            ["Created", formatDate(invoice.createdAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-label text-[hsl(var(--text-muted))]">{label}</span>
              <span className="text-body text-[hsl(var(--text-primary))]">{value}</span>
            </div>
          ))}
        </GlassPanel>
      </div>
    </div>
  );
}
