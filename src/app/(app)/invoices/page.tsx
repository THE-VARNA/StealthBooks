import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { EmptyStatePanel } from "@/components/layout/EmptyStatePanel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Invoices | StealthBooks" };

export default function InvoicesPage() {
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
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 border-b border-[hsl(var(--surface-border)/0.08)]">
          {["#", "Counterparty / Memo", "Amount", "Status", "Actions"].map((h) => (
            <div key={h} className="px-5 py-3 text-label text-[hsl(var(--text-muted))]">{h}</div>
          ))}
        </div>
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-[hsl(var(--surface-overlay))] p-4 text-[hsl(var(--text-muted))]">
            <FileText className="h-8 w-8" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-heading-2 text-[hsl(var(--text-primary))]">No invoices yet</p>
            <p className="max-w-sm text-body-sm text-[hsl(var(--text-muted))]">
              Create your first invoice to start receiving private USDC payments through Umbra.
            </p>
          </div>
          <Link href="/invoices/new">
            <Button id="invoices-empty-create-btn" size="md">Create invoice</Button>
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
}
