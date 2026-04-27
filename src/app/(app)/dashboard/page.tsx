import type { Metadata } from "next";
import { FileText, Plus, Shield, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { MetricTile } from "@/components/layout/MetricTile";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard | StealthBooks" };

const RECENT_ACTIVITY = [
  { label: "Invoice SB-2026-000004 approved", time: "2h ago", type: "invoice" },
  { label: "Claim discovered — 500 USDC", time: "4h ago", type: "claim" },
  { label: "Invoice SB-2026-000003 paid & claimed", time: "1d ago", type: "success" },
  { label: "Disclosure link shared with auditor", time: "2d ago", type: "disclosure" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <SectionToolbar
        title="Dashboard"
        description="Your private billing overview"
        actions={
          <Link href="/invoices/new">
            <Button id="dashboard-new-invoice" size="md">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Readiness Banner */}
      <GlassPanel padding="md" className="flex items-center gap-4 border border-[hsl(var(--brand-success)/0.2)]">
        <div className="rounded-xl bg-[hsl(var(--brand-success)/0.12)] p-2.5 text-[hsl(var(--brand-success))]">
          <Shield className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-body font-semibold text-[hsl(var(--text-primary))]">
            Umbra registration required
          </p>
          <p className="text-body-sm text-[hsl(var(--text-secondary))]">
            Complete on-chain registration to start receiving private payments.
          </p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto shrink-0">
          Register now
        </Button>
      </GlassPanel>

      {/* KPI Rail */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Total Receivable"
          value="$0.00"
          subtext="Across all open invoices"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricTile
          label="Unclaimed UTXOs"
          value="0"
          subtext="Pending in publicReceived"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricTile
          label="Claimed Private"
          value="$0.00"
          subtext="In encrypted token account"
          icon={<Shield className="h-4 w-4" />}
        />
        <MetricTile
          label="Invoices Issued"
          value="0"
          subtext="All time"
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <GlassPanel padding="none" className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--surface-border)/0.08)]">
            <h2 className="text-heading-2">Recent Activity</h2>
            <Link href="/invoices">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <ul className="divide-y divide-[hsl(var(--surface-border)/0.06)]">
            {RECENT_ACTIVITY.map((item, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[hsl(var(--surface-overlay)/0.3)] transition-colors">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--brand-primary))] shrink-0" aria-hidden="true" />
                <p className="flex-1 text-body text-[hsl(var(--text-primary))]">{item.label}</p>
                <span className="text-body-sm text-[hsl(var(--text-muted))] shrink-0">{item.time}</span>
              </li>
            ))}
          </ul>
        </GlassPanel>

        {/* Quick Links */}
        <GlassPanel padding="md" className="flex flex-col gap-3">
          <h2 className="text-heading-2 mb-1">Quick Actions</h2>
          <Link href="/invoices/new">
            <Button id="sidebar-new-invoice" variant="outline" className="w-full justify-start gap-3">
              <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </Link>
          <Link href="/claims">
            <Button id="sidebar-scan-claims" variant="outline" className="w-full justify-start gap-3">
              <CheckCircle className="h-4 w-4" /> Scan Claims
            </Button>
          </Link>
          <Link href="/disclosures">
            <Button id="sidebar-new-disclosure" variant="outline" className="w-full justify-start gap-3">
              <Shield className="h-4 w-4" /> New Disclosure
            </Button>
          </Link>
          <Separator />
          <p className="text-body-sm text-[hsl(var(--text-muted))]">
            Private balances are only visible to your connected wallet. They never leave your device unencrypted.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
