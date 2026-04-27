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
import { InvoiceActionButtons } from "./InvoiceActionButtons";
import { CheckoutLinkDisplay } from "./CheckoutLinkDisplay";

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
        title={
          <div className="flex items-center gap-4">
            <span>Invoice {invoice.invoiceNumber}</span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        }
        description={`Created ${formatRelativeTime(invoice.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <InvoiceActionButtons
              invoiceId={invoice.id}
              orgId={invoice.orgId}
              canApprove={canApprove}
              canVoid={canVoid}
            />
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
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.065)] flex items-center justify-between">
              <h2 className="text-heading-2">Line Items</h2>
            </div>
            <table className="w-full" aria-label="Invoice line items">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  {["Description", "Qty", "Unit Price", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-label text-[rgb(71,85,105)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                {invoice.lineItems.map((li) => (
                  <tr key={li.id} className="hover:bg-[rgba(20,24,54,0.2)] transition-colors">
                    <td className="px-5 py-3 text-body text-[rgb(248,250,252)]">{li.description}</td>
                    <td className="px-5 py-3 text-body-sm text-[rgb(148,163,184)]">{li.quantity.toString()}</td>
                    <td className="px-5 py-3 text-mono text-body-sm">{formatUsdcCurrency(li.unitPrice)}</td>
                    <td className="px-5 py-3 text-mono font-semibold">{formatUsdcCurrency(li.amountMinor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-[rgba(255,255,255,0.08)] px-5 py-4 flex flex-col gap-2 items-end">
              <div className="flex gap-8 text-body-sm text-[rgb(148,163,184)]">
                <span>Subtotal</span>
                <span className="font-semibold text-[rgb(248,250,252)]">{formatUsdcCurrency(invoice.subtotalMinor)}</span>
              </div>
              <div className="flex gap-8 text-body-sm text-[rgb(71,85,105)]">
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

          <CheckoutLinkDisplay status={invoice.status} expiresAt={invoice.publicTokenExpiresAt} />
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
              <span className="text-label text-[rgb(71,85,105)]">{label}</span>
              <span className="text-body text-[rgb(248,250,252)]">{value}</span>
            </div>
          ))}
        </GlassPanel>
      </div>
    </div>
  );
}
