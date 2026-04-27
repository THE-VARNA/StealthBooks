import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowRight, Lock, Eye, BarChart3, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "StealthBooks — Private B2B Billing on Solana",
  description: "Issue invoices, receive USDC through Umbra's zero-knowledge mixer, and share only what your auditor needs.",
};

const FEATURES = [
  {
    icon: Shield,
    title: "Private Settlement",
    desc: "Payments flow through Umbra's ZK mixer. Your treasury balance is never exposed on-chain.",
    color: "#6366f1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.2)",  hoverClass: "hover-glow-indigo",
  },
  {
    icon: Lock,
    title: "Encrypted Balances",
    desc: "Claimed receivables land in your Encrypted Token Account — invisible to anyone without your key.",
    color: "#22d3ee", bg: "rgba(34,211,238,0.07)",   border: "rgba(34,211,238,0.18)",  hoverClass: "hover-glow-cyan",
  },
  {
    icon: Eye,
    title: "Selective Disclosure",
    desc: "Share scoped, time-limited reports with auditors. Revoke access instantly. Zero overexposure.",
    color: "#10b981", bg: "rgba(16,185,129,0.07)",   border: "rgba(16,185,129,0.18)",  hoverClass: "hover-glow-green",
  },
  {
    icon: BarChart3,
    title: "Invoice Lifecycle",
    desc: "From DRAFT to CLAIMED_PRIVATE — a full state machine built for serious B2B payment flows.",
    color: "#818cf8", bg: "rgba(129,140,248,0.08)",  border: "rgba(129,140,248,0.2)",  hoverClass: "hover-glow-violet",
  },
];

const STEPS = [
  { n: "01", title: "Issue Invoice",        desc: "Create a USDC invoice with line items, due date, and a private checkout link." },
  { n: "02", title: "Payer Completes",      desc: "Payer uses Umbra's mixer to send USDC — destination stays private." },
  { n: "03", title: "Scan & Claim",         desc: "Scan your publicReceived bucket. Claim UTXOs into your encrypted account." },
  { n: "04", title: "Disclose Selectively", desc: "Generate scoped audit packages — only the records your accountant needs." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden" style={{ background: "rgb(5,7,18)", fontFamily: "var(--font-sans)" }}>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"60vw", height:"60vw", background:"radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:"10%", right:"-15%", width:"50vw", height:"50vw", background:"radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"30%", width:"40vw", height:"40vw", background:"radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)", borderRadius:"50%" }} />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background:"rgba(5,7,18,0.7)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.055)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background:"linear-gradient(135deg,#6366f1 0%,#22d3ee 100%)", boxShadow:"0 0 18px rgba(99,102,241,0.4)" }}>
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-[1.0625rem] font-bold tracking-tight"
            style={{ background:"linear-gradient(135deg,#818cf8 0%,#22d3ee 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            StealthBooks
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: "Features",      href: "#features" },
            { label: "How it works",  href: "#how-it-works" },
            { label: "Privacy",       href: "#features" },
          ].map(({ label, href }) => (
            <a key={label} href={href}
              className="nav-link-hover text-sm font-medium"
              style={{ color: "rgb(148,163,184)" }}>
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button id="landing-signin-btn"
              className="hover-lift rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ color:"rgb(148,163,184)", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)" }}>
              Sign in
            </button>
          </Link>
          <Link href="/dashboard">
            <button id="landing-get-started-btn"
              className="hover-lift flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background:"linear-gradient(135deg,#6366f1 0%,#818cf8 100%)", boxShadow:"0 0 20px rgba(99,102,241,0.4)" }}>
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-dvh px-6 text-center pt-20">
        <div className="mb-8 flex items-center gap-2 rounded-full px-4 py-2"
          style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.3)", backdropFilter:"blur(12px)" }}>
          <Zap className="h-3.5 w-3.5" style={{ color:"#22d3ee" }} />
          <span className="text-label" style={{ color:"#22d3ee" }}>Powered by Umbra Privacy</span>
        </div>

        <h1 className="text-display max-w-4xl mx-auto mb-6">
          <span style={{ color:"rgb(248,250,252)" }}>Private B2B Billing</span>
          <br />
          <span style={{ background:"linear-gradient(135deg,#818cf8 0%,#22d3ee 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            on Solana
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-body mb-10" style={{ color:"rgb(148,163,184)", lineHeight:"1.75" }}>
          Issue invoices, receive USDC through Umbra&apos;s zero-knowledge mixer, and share only what your auditor needs.
          No counterparty exposure. No treasury surveillance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <Link href="/dashboard">
            <button id="hero-start-invoicing-btn"
              className="hover-glow-indigo flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background:"linear-gradient(135deg,#6366f1 0%,#818cf8 100%)", boxShadow:"0 0 28px rgba(99,102,241,0.45),0 4px 12px rgba(0,0,0,0.4)" }}>
              Start Invoicing <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <a href="#how-it-works" id="hero-view-demo-btn"
            className="hover-lift flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
            style={{ color:"rgb(148,163,184)", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)" }}>
            View demo
          </a>
        </div>

        <p className="text-body-sm max-w-md mx-auto" style={{ color:"rgb(71,85,105)" }}>
          Payer outflows from public ATAs remain visible on-chain. Privacy applies to the{" "}
          <span style={{ color:"rgb(148,163,184)" }}>receiving address</span>, UTXO routing, and treasury aggregation.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-label mb-3" style={{ color:"#6366f1" }}>Built for privacy-native teams</p>
            <h2 className="text-heading-1 mb-4" style={{ color:"rgb(248,250,252)" }}>Privacy where it counts</h2>
            <p className="text-body max-w-lg mx-auto" style={{ color:"rgb(148,163,184)" }}>
              Every feature is designed around Umbra&apos;s encrypted account model.
              Settlement is private by default, not by configuration.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, border, hoverClass }) => (
              <div key={title}
                className={`feature-card ${hoverClass} rounded-2xl p-6`}
                style={{ background:"rgba(14,17,38,0.6)", backdropFilter:"blur(20px)", border:`1px solid ${border}`, boxShadow:"0 4px 24px rgba(0,0,0,0.3)" }}>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background:bg, border:`1px solid ${border}` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="text-heading-2 mb-2" style={{ color:"rgb(248,250,252)" }}>{title}</h3>
                <p className="text-body-sm" style={{ color:"rgb(148,163,184)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-label mb-3" style={{ color:"#22d3ee" }}>Workflow</p>
            <h2 className="text-heading-1" style={{ color:"rgb(248,250,252)" }}>Invoice to private settlement</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n}
                className="hover-lift rounded-2xl p-6 h-full"
                style={{ background:"rgba(14,17,38,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.065)", boxShadow:"0 4px 24px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                <div className="mb-4 text-[0.6875rem] font-bold tracking-widest" style={{ color:"#6366f1" }}>{n}</div>
                <h3 className="text-heading-2 mb-2" style={{ color:"rgb(248,250,252)" }}>{title}</h3>
                <p className="text-body-sm" style={{ color:"rgb(148,163,184)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-3xl p-12"
            style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(34,211,238,0.06) 100%)", backdropFilter:"blur(20px)", border:"1px solid rgba(99,102,241,0.25)", boxShadow:"0 0 60px rgba(99,102,241,0.15)" }}>
            <h2 className="text-heading-1 mb-4" style={{ color:"rgb(248,250,252)" }}>Ready to go private?</h2>
            <p className="text-body mb-8" style={{ color:"rgb(148,163,184)" }}>
              Connect your Solana wallet, register with Umbra, and start issuing private invoices in minutes.
            </p>
            <Link href="/dashboard">
              <button id="cta-start-btn"
                className="hover-glow-indigo flex items-center gap-2 mx-auto rounded-xl px-8 py-3.5 text-sm font-semibold text-white"
                style={{ background:"linear-gradient(135deg,#6366f1 0%,#818cf8 100%)", boxShadow:"0 0 28px rgba(99,102,241,0.5),0 4px 12px rgba(0,0,0,0.4)" }}>
                Launch App <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center" style={{ borderTop:"1px solid rgba(255,255,255,0.055)" }}>
        <p className="text-body-sm" style={{ color:"rgb(71,85,105)" }}>
          StealthBooks · Built on{" "}
          <a href="https://umbraprivacy.com" target="_blank" rel="noopener noreferrer"
            className="nav-link-hover" style={{ color:"#6366f1" }}>
            Umbra Privacy
          </a>{" "}
          · Solana Devnet
        </p>
      </footer>
    </div>
  );
}
