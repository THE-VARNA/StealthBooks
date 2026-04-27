import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowRight, Lock, Eye, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/layout/GlassPanel";

export const metadata: Metadata = {
  title: "StealthBooks — Private B2B Billing on Solana",
  description: "Issue invoices and receive USDC privately through Umbra's zero-knowledge infrastructure. Built for crypto-native businesses.",
};

const FEATURES = [
  {
    icon: Lock,
    title: "Private Settlement",
    desc: "Payments flow through Umbra's mixer. Counterparties, amounts, and treasury behavior stay off the public ledger.",
  },
  {
    icon: Eye,
    title: "Selective Disclosure",
    desc: "Share scoped invoice packages with auditors via time-limited links. No live key grants required.",
  },
  {
    icon: FileText,
    title: "Invoice Workflow",
    desc: "Draft, approve, and share professional invoices with USDC amounts. Payers see a clean checkout — no wallet setup required.",
  },
  {
    icon: Zap,
    title: "ZK-Proven Claims",
    desc: "Claim UTXOs into your encrypted token account using zero-knowledge proofs, relayed by Umbra's relayer network.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--surface-border)/0.08)]" aria-label="Main navigation">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-accent))]">
            <Shield className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-heading-2 gradient-text">StealthBooks</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button id="landing-signin-btn" variant="outline" size="sm">Sign in</Button>
          </Link>
          <Link href="/dashboard">
            <Button id="landing-getstarted-btn" size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center" aria-labelledby="hero-heading">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.08)] px-4 py-1.5">
          <Shield className="h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" aria-hidden="true" />
          <span className="text-label text-[hsl(var(--brand-primary))]">Powered by Umbra Privacy</span>
        </div>

        <h1 id="hero-heading" className="text-display gradient-text max-w-3xl">
          Private B2B Billing on Solana
        </h1>
        <p className="mt-6 max-w-2xl text-body text-[hsl(var(--text-secondary))] text-lg leading-relaxed">
          Issue invoices, receive USDC through Umbra&rsquo;s zero-knowledge mixer, and share only what your auditor needs. No counterparty exposure. No treasury surveillance.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link href="/dashboard">
            <Button id="hero-start-btn" size="xl">
              Start invoicing
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button id="hero-demo-btn" variant="glass" size="xl">View demo</Button>
          </Link>
        </div>

        {/* Privacy disclaimer */}
        <p className="mt-8 text-body-sm text-[hsl(var(--text-muted))] max-w-lg">
          Payer outflows from public ATAs remain visible on-chain. Privacy applies to the vendor receiving address, UTXO routing, and treasury aggregation.
        </p>
      </section>

      {/* Features grid */}
      <section className="px-6 pb-24" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-center text-heading-1 mb-10">
          Built for privacy-native teams
        </h2>
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <GlassPanel key={title} hover padding="md" className="flex flex-col gap-3">
              <div className="rounded-xl bg-[hsl(var(--brand-primary)/0.1)] p-3 w-fit text-[hsl(var(--brand-primary))]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-heading-2">{title}</h3>
              <p className="text-body-sm text-[hsl(var(--text-secondary))]">{desc}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--surface-border)/0.08)] px-6 py-6 text-center">
        <p className="text-body-sm text-[hsl(var(--text-muted))]">
          StealthBooks — Built on{" "}
          <a href="https://www.umbraprivacy.com" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--brand-primary))] hover:underline">
            Umbra Privacy
          </a>{" "}
          · Solana · USDC
        </p>
      </footer>
    </main>
  );
}
