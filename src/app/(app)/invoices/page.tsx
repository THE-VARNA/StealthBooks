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
        <EmptyStatePanel
          icon={<FileText className="h-8 w-8" />}
          title="No invoices yet"
          description="Create your first invoice to start receiving private USDC payments through Umbra."
          action={{ label: "Create invoice", onClick: () => {} }}
          className="border-0 rounded-none"
        />
      </GlassPanel>
    </div>
  );
}
