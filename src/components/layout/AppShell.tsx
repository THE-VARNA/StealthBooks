"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Inbox, Wallet,
  ArrowDownUp, Eye, Settings, Shield, Menu, X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import WalletConnectStrip from "./WalletConnectStrip";
import { useAuthStore } from "@/features/auth/useWalletAuth";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",      icon: LayoutDashboard },
  { href: "/invoices",     label: "Invoices",        icon: FileText },
  { href: "/claims",       label: "Claims Inbox",    icon: Inbox },
  { href: "/balances",     label: "Private Balance", icon: Wallet },
  { href: "/settlements",  label: "Settlements",     icon: ArrowDownUp },
  { href: "/disclosures",  label: "Disclosures",     icon: Eye },
  { href: "/settings",     label: "Settings",        icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const { orgMemberships } = useAuthStore();
  
  // Use the first org membership for display if available
  const orgName = orgMemberships.length > 0 ? orgMemberships[0].orgId : null;

  return (
    <div className="flex min-h-dvh" style={{ background: "rgb(5,7,18)" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          background: "rgba(10,12,28,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.065)",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-16 items-center gap-3 px-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.065)" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)",
              boxShadow: "0 0 20px rgba(99,102,241,0.45)",
            }}
          >
            <Shield className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span
            className="text-[1.0625rem] font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            StealthBooks
          </span>
          <div
            className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}
          >
            <Zap className="h-2.5 w-2.5" style={{ color: "#22d3ee" }} />
            <span className="text-[0.625rem] font-semibold tracking-widest uppercase" style={{ color: "#22d3ee" }}>
              devnet
            </span>
          </div>
        </div>

        {/* Org */}
        {orgName && (
          <div
            className="px-5 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-label" style={{ color: "rgb(71,85,105)" }}>Organization</p>
            <p className="text-body mt-0.5 truncate font-semibold" style={{ color: "rgb(248,250,252)" }}>
              {orgName}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Main navigation">
          <ul className="flex flex-col gap-0.5" role="list">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setSidebarOpen(false)}
                    className="sidebar-nav-item"
                    style={active ? { color: "#818cf8" } : undefined}
                  >
                    {/* Active indicator */}
                    {active && (
                      <span
                        className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full"
                        style={{ background: "linear-gradient(180deg, #818cf8, #22d3ee)" }}
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                      style={{
                        background: active
                          ? "rgba(99,102,241,0.2)"
                          : "transparent",
                        transition: "background 0.2s",
                      }}
                    >
                      <Icon className="h-[15px] w-[15px]" aria-hidden="true" />
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className="px-4 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.065)" }}
        >
          {mounted && <WalletConnectStrip />}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile header */}
        <header
          className="flex h-14 items-center gap-4 px-4 lg:hidden"
          style={{
            background: "rgba(10,12,28,0.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.065)",
          }}
        >
          <button
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "rgb(148,163,184)" }}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span
            className="text-[1.0625rem] font-bold"
            style={{
              background: "linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            StealthBooks
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
