import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Invoices | StealthBooks" };

const TABLE_HEADERS = ["#", "Counterparty / Memo", "Amount", "Status", "Actions"];

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
        {/* Table header */}
        <div className="grid grid-cols-[3rem_1fr_9rem_8rem_7rem]"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.065)" }}>
          {TABLE_HEADERS.map((h) => (
            <div key={h} className="px-5 py-3 text-label" style={{ color: "rgb(71,85,105)" }}>{h}</div>
          ))}
        </div>

        {/* Empty state */}
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
      </GlassPanel>
    </div>
  );
}
