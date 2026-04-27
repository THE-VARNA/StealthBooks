"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Wallet,
  ArrowDownUp,
  Eye,
  Settings,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/claims", label: "Claims Inbox", icon: Inbox },
  { href: "/balances", label: "Private Balance", icon: Wallet },
  { href: "/settlements", label: "Settlements", icon: ArrowDownUp },
  { href: "/disclosures", label: "Disclosures", icon: Eye },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
  orgName?: string;
  walletAddress?: string;
}

export function AppShell({ children, orgName, walletAddress }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-dvh bg-[hsl(var(--surface-base))]">
      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col",
          "glass border-r border-[hsl(var(--surface-border)/0.08)]",
          "transition-transform duration-300 ease-spring lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--surface-border)/0.08)] px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-accent))]">
            <Shield className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-heading-2 gradient-text">StealthBooks</span>
        </div>

        {/* Org Name */}
        {orgName && (
          <div className="border-b border-[hsl(var(--surface-border)/0.08)] px-5 py-3">
            <p className="text-label text-[hsl(var(--text-muted))]">Organization</p>
            <p className="text-body font-semibold text-[hsl(var(--text-primary))] truncate">
              {orgName}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <ul className="flex flex-col gap-1" role="list">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-[hsl(var(--brand-primary)/0.12)] text-[hsl(var(--brand-primary))]"
                        : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-overlay)/0.5)] hover:text-[hsl(var(--text-primary))]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Wallet strip */}
        {walletAddress && (
          <div className="border-t border-[hsl(var(--surface-border)/0.08)] px-5 py-4">
            <p className="text-label text-[hsl(var(--text-muted))]">Connected Wallet</p>
            <p className="text-mono text-xs text-[hsl(var(--text-secondary))] truncate mt-0.5">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </p>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-4 border-b border-[hsl(var(--surface-border)/0.08)] px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="text-heading-2 gradient-text">StealthBooks</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
