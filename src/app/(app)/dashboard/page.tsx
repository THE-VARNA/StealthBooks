import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Inbox, Shield, FileText, ArrowRight, Plus, ScanLine, Eye, ChevronRight, Activity } from "lucide-react";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatUsdcCurrency } from "@/lib/formatting";

export const metadata: Metadata = {
  title: "Dashboard | StealthBooks",
  description: "Your private billing overview",
};

const QUICK_ACTIONS = [
  { label:"New Invoice",    href:"/invoices/new", icon:Plus,    color:"#6366f1", rowClass:"qa-row qa-row-indigo", iconBg:"rgba(99,102,241,0.15)",  iconBorder:"rgba(99,102,241,0.3)",  bg:"rgba(99,102,241,0.07)",  border:"rgba(99,102,241,0.2)" },
  { label:"Scan Claims",    href:"/claims",       icon:ScanLine,color:"#22d3ee", rowClass:"qa-row qa-row-cyan",   iconBg:"rgba(34,211,238,0.12)",  iconBorder:"rgba(34,211,238,0.28)", bg:"rgba(34,211,238,0.06)",  border:"rgba(34,211,238,0.18)" },
  { label:"New Disclosure", href:"/disclosures",  icon:Eye,     color:"#10b981", rowClass:"qa-row qa-row-green",  iconBg:"rgba(16,185,129,0.12)",  iconBorder:"rgba(16,185,129,0.28)", bg:"rgba(16,185,129,0.06)",  border:"rgba(16,185,129,0.18)" },
];

export default async function DashboardPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.walletAddress) redirect("/login");
  
  const orgId = session.orgMemberships?.[0]?.orgId;
  if (!orgId) redirect("/settings?prompt=register");

  // 1. Total Receivable (Open Invoices)
  const openInvoices = await db.invoice.aggregate({
    where: { 
      orgId, 
      status: { in: ["OPEN", "PAYMENT_INTENT_CREATED", "PAYMENT_SUBMITTED", "TX_CONFIRMED", "INDEXER_VISIBLE", "PAID_UNCLAIMED"] }
    },
    _sum: { totalMinor: true }
  });
  const receivable = openInvoices._sum.totalMinor || BigInt(0);

  // 2. Unclaimed UTXOs
  const unclaimedUtxosCount = await db.claimEvent.count({
    where: { orgId, status: { in: ["DISCOVERED", "CLAIM_SUBMITTED"] } }
  });

  // 3. Claimed Private (Balance)
  const claimedTotal = await db.claimEvent.aggregate({
    where: { orgId, status: "CLAIMED" },
    _sum: { amountMinor: true },
  });
  
  const withdrawals = await db.auditLog.findMany({
    where: { orgId, action: "WITHDRAWAL_CONFIRMED" },
    select: { metadata: true }
  });
  
  const totalWithdrawn = withdrawals.reduce((acc, log) => {
    const meta = log.metadata as { amountMinor?: string } | null;
    if (meta && meta.amountMinor) return acc + BigInt(meta.amountMinor);
    return acc;
  }, BigInt(0));

  let balanceAmount = (claimedTotal._sum.amountMinor || BigInt(0)) - totalWithdrawn;
  if (balanceAmount < BigInt(0)) balanceAmount = BigInt(0);

  // 4. Invoices Issued
  const invoicesCount = await db.invoice.count({
    where: { orgId }
  });

  const METRICS = [
    { id:"receivable", label:"Total Receivable",  value:formatUsdcCurrency(receivable), sub:"Across all open invoices",   icon:TrendingUp, color:"#6366f1", glow:"rgba(99,102,241,0.3)",  border:"rgba(99,102,241,0.25)",  bg:"rgba(99,102,241,0.08)" },
    { id:"utxos",      label:"Unclaimed UTXOs",   value:unclaimedUtxosCount.toString(), sub:"Pending in publicReceived",  icon:Inbox,      color:"#22d3ee", glow:"rgba(34,211,238,0.25)",  border:"rgba(34,211,238,0.22)",  bg:"rgba(34,211,238,0.07)" },
    { id:"claimed",    label:"Claimed Private",   value:formatUsdcCurrency(balanceAmount), sub:"In encrypted token account", icon:Shield,     color:"#10b981", glow:"rgba(16,185,129,0.25)",  border:"rgba(16,185,129,0.22)",  bg:"rgba(16,185,129,0.07)" },
    { id:"invoices",   label:"Invoices Issued",   value:invoicesCount.toString(),       sub:"All time",                   icon:FileText,   color:"#818cf8", glow:"rgba(129,140,248,0.25)", border:"rgba(129,140,248,0.22)", bg:"rgba(129,140,248,0.07)" },
  ];

  // 5. Recent Activity
  const recentLogs = await db.auditLog.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const timeAgo = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getActivityData = (log: typeof recentLogs[0]) => {
    switch(log.action) {
      case "INVOICE_CREATED": return { label: "New invoice created", dot: "#6366f1" };
      case "INVOICE_APPROVED": return { label: "Invoice approved", dot: "#10b981" };
      case "PAYMENT_SUBMITTED": return { label: "Payment received", dot: "#10b981" };
      case "CLAIM_DISCOVERED": return { label: "UTXO discovered", dot: "#22d3ee" };
      case "CLAIM_CONFIRMED": return { label: "Funds claimed privately", dot: "#10b981" };
      case "WITHDRAWAL_INITIATED": return { label: "Withdrawal initiated", dot: "#f59e0b" };
      case "WITHDRAWAL_CONFIRMED": return { label: "Withdrawal confirmed", dot: "#10b981" };
      case "DISCLOSURE_CREATED": return { label: "Disclosure link generated", dot: "#a855f7" };
      case "DISCLOSURE_ACCESSED": return { label: "Disclosure link accessed", dot: "#a855f7" };
      default: return { label: log.action.replace(/_/g, " "), dot: "#7185a5" };
    }
  };

  return (
    <div className="flex flex-col gap-7 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-1" style={{ color:"rgb(248,250,252)" }}>Dashboard</h1>
          <p className="text-body-sm mt-1" style={{ color:"rgb(71,85,105)" }}>Your private billing overview</p>
        </div>
        <Link href="/invoices/new">
          <button id="dashboard-new-invoice-btn"
            className="hover-glow-indigo flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background:"linear-gradient(135deg,#6366f1 0%,#818cf8 100%)", boxShadow:"0 0 20px rgba(99,102,241,0.4),0 2px 8px rgba(0,0,0,0.4)" }}>
            <Plus className="h-4 w-4" /> New Invoice
          </button>
        </Link>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map(({ id, label, value, sub, icon: Icon, color, glow, border, bg }) => (
          <div key={id} id={`metric-${id}`}
            className="hover-lift relative overflow-hidden rounded-2xl p-5"
            style={{ background:"rgba(14,17,38,0.6)", backdropFilter:"blur(20px)", border:`1px solid ${border}`, boxShadow:`0 0 30px ${glow},0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04)` }}>
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background:`linear-gradient(90deg,transparent,${color},transparent)` }} />
            <div className="flex items-start justify-between mb-3">
              <p className="text-label" style={{ color:"rgb(71,85,105)" }}>{label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background:bg, border:`1px solid ${border}` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <p className="text-[1.75rem] font-bold tracking-tight leading-none mb-1.5"
              style={{ color:"rgb(248,250,252)", fontVariantNumeric:"tabular-nums" }}>
              {value}
            </p>
            <p className="text-body-sm" style={{ color:"rgb(71,85,105)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background:"rgba(14,17,38,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.065)", boxShadow:"0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom:"1px solid rgba(255,255,255,0.055)" }}>
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4" style={{ color:"#6366f1" }} />
              <h2 className="text-heading-2" style={{ color:"rgb(248,250,252)" }}>Recent Activity</h2>
            </div>
            <Link href="/invoices"
              className="nav-link-hover flex items-center gap-1 text-xs font-semibold"
              style={{ color:"#6366f1" }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
            {recentLogs.length > 0 ? recentLogs.map((log) => {
              const { label, dot } = getActivityData(log);
              return (
                <li key={log.id} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                  <span className="h-2 w-2 rounded-full shrink-0"
                    style={{ background:dot, boxShadow:`0 0 6px ${dot}` }} />
                  <span className="flex-1 text-body-sm" style={{ color:"rgb(148,163,184)" }}>{label}</span>
                  <span className="text-body-sm shrink-0" style={{ color:"rgb(71,85,105)" }}>{timeAgo(log.createdAt)}</span>
                </li>
              );
            }) : (
              <li className="px-5 py-6 text-center text-body-sm text-[rgb(71,85,105)]">
                No recent activity.
              </li>
            )}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-5"
          style={{ background:"rgba(14,17,38,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.065)", boxShadow:"0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          <h2 className="text-heading-2 mb-4" style={{ color:"rgb(248,250,252)" }}>Quick Actions</h2>
          <div className="flex flex-col gap-2.5">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon, color, rowClass, iconBg, iconBorder, bg, border }) => (
              <Link key={href} href={href}>
                <div id={`quick-${label.toLowerCase().replace(/\s+/g,"-")}-btn`}
                  className={`${rowClass} flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer`}
                  style={{ background:bg, border:`1px solid ${border}` }}>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                    style={{ background:iconBg, border:`1px solid ${iconBorder}` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color:"rgb(148,163,184)" }}>{label}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" style={{ color:"rgb(71,85,105)" }} />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 rounded-xl px-3 py-2.5"
            style={{ background:"rgba(10,12,28,0.6)", border:"1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-body-sm" style={{ color:"rgb(71,85,105)" }}>
              Private balances are only available client-side. Amounts are never stored on the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
