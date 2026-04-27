import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp, Inbox, Shield, FileText, ArrowRight,
  Plus, ScanLine, Eye, ChevronRight, Activity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | StealthBooks",
  description: "Your private billing overview",
};

const METRICS = [
  {
    id: "receivable",
    label: "Total Receivable",
    value: "$0.00",
    sub: "Across all open invoices",
    icon: TrendingUp,
    color: "#6366f1",
    glow: "rgba(99,102,241,0.3)",
    border: "rgba(99,102,241,0.25)",
    bg: "rgba(99,102,241,0.08)",
  },
  {
    id: "utxos",
    label: "Unclaimed UTXOs",
    value: "0",
    sub: "Pending in publicReceived",
    icon: Inbox,
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.25)",
    border: "rgba(34,211,238,0.22)",
    bg: "rgba(34,211,238,0.07)",
  },
  {
    id: "claimed",
    label: "Claimed Private",
    value: "$0.00",
    sub: "In encrypted token account",
    icon: Shield,
    color: "#10b981",
    glow: "rgba(16,185,129,0.25)",
    border: "rgba(16,185,129,0.22)",
    bg: "rgba(16,185,129,0.07)",
  },
  {
    id: "invoices",
    label: "Invoices Issued",
    value: "0",
    sub: "All time",
    icon: FileText,
    color: "#818cf8",
    glow: "rgba(129,140,248,0.25)",
    border: "rgba(129,140,248,0.22)",
    bg: "rgba(129,140,248,0.07)",
  },
];

const ACTIVITY = [
  { label: "Invoice SB-2026-000004 approved", time: "2h ago",  dot: "#6366f1" },
  { label: "Claim discovered — 500 USDC",     time: "4h ago",  dot: "#22d3ee" },
  { label: "Invoice SB-2026-000003 paid & claimed", time: "1d ago", dot: "#10b981" },
];

const QUICK_ACTIONS = [
  { label: "New Invoice",    href: "/invoices/new", icon: Plus,     color: "#6366f1", glow: "rgba(99,102,241,0.35)" },
  { label: "Scan Claims",    href: "/claims",       icon: ScanLine,  color: "#22d3ee", glow: "rgba(34,211,238,0.3)" },
  { label: "New Disclosure", href: "/disclosures",  icon: Eye,       color: "#10b981", glow: "rgba(16,185,129,0.3)" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-7 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-1" style={{ color: "rgb(248,250,252)" }}>Dashboard</h1>
          <p className="text-body-sm mt-1" style={{ color: "rgb(71,85,105)" }}>
            Your private billing overview
          </p>
        </div>
        <Link href="/invoices/new">
          <button
            id="dashboard-new-invoice-btn"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              boxShadow: "0 0 20px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </Link>
      </div>

      {/* ── Registration banner ───────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 rounded-2xl px-5 py-4"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(34,211,238,0.05) 100%)",
          border: "1px solid rgba(99,102,241,0.25)",
          boxShadow: "0 0 32px rgba(99,102,241,0.1)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          <Shield className="h-5 w-5" style={{ color: "#818cf8" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold" style={{ color: "rgb(248,250,252)" }}>
            Umbra registration required
          </p>
          <p className="text-body-sm" style={{ color: "rgb(148,163,184)" }}>
            Complete on-chain registration to start receiving private payments.
          </p>
        </div>
        <Link href="/settings">
          <button
            id="dashboard-register-btn"
            className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            style={{
              background: "rgba(99,102,241,0.18)",
              border: "1px solid rgba(99,102,241,0.35)",
              color: "#818cf8",
            }}
          >
            Register now
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>

      {/* ── Metric tiles ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map(({ id, label, value, sub, icon: Icon, color, glow, border, bg }) => (
          <div
            key={id}
            id={`metric-${id}`}
            className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "rgba(14,17,38,0.6)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${border}`,
              boxShadow: `0 0 30px ${glow}, 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Top gradient line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
            />
            <div className="flex items-start justify-between mb-3">
              <p className="text-label" style={{ color: "rgb(71,85,105)" }}>{label}</p>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <p
              className="text-[1.75rem] font-bold tracking-tight leading-none mb-1.5"
              style={{ color: "rgb(248,250,252)", fontVariantNumeric: "tabular-nums" }}
            >
              {value}
            </p>
            <p className="text-body-sm" style={{ color: "rgb(71,85,105)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Recent Activity */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(14,17,38,0.55)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.065)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4" style={{ color: "#6366f1" }} />
              <h2 className="text-heading-2" style={{ color: "rgb(248,250,252)" }}>Recent Activity</h2>
            </div>
            <Link
              href="/invoices"
              className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: "#6366f1" }}
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {ACTIVITY.map(({ label, time, dot }) => (
              <li
                key={label}
                className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: dot, boxShadow: `0 0 6px ${dot}` }}
                />
                <span className="flex-1 text-body-sm" style={{ color: "rgb(148,163,184)" }}>{label}</span>
                <span className="text-body-sm shrink-0" style={{ color: "rgb(71,85,105)" }}>{time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(14,17,38,0.55)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.065)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h2 className="text-heading-2 mb-4" style={{ color: "rgb(248,250,252)" }}>Quick Actions</h2>
          <div className="flex flex-col gap-2.5">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon, color, glow }) => (
              <Link key={href} href={href}>
                <div
                  id={`quick-${label.toLowerCase().replace(/\s+/g, "-")}-btn`}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-px cursor-pointer"
                  style={{
                    background: `rgba(${color === "#6366f1" ? "99,102,241" : color === "#22d3ee" ? "34,211,238" : "16,185,129"},0.08)`,
                    border: `1px solid ${color}30`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${glow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: "rgb(148,163,184)" }}>
                    {label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" style={{ color: "rgb(71,85,105)" }} />
                </div>
              </Link>
            ))}
          </div>

          {/* Privacy notice */}
          <div
            className="mt-5 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(10,12,28,0.6)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-body-sm" style={{ color: "rgb(71,85,105)" }}>
              Private balances are only available client-side. Amounts are never stored on the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
