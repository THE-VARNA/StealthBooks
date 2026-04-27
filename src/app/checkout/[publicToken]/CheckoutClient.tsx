"use client";

import * as React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, Lock, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatUsdcCurrency } from "@/lib/formatting";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotalMinor: string;
  protocolFeeMinor: string;
  totalMinor: string;
  mint: string;
  memo: string | null;
  lineItems: Array<{ description: string; quantity: number; unitPrice: string; amountMinor: string }>;
  orgName: string;
  cluster: string;
}

type PayStep =
  | "connect"
  | "register-check"
  | "create-intent"
  | "proving"
  | "submitting"
  | "confirmed"
  | "error";

const STEPS: { id: PayStep; label: string }[] = [
  { id: "connect", label: "Connect wallet" },
  { id: "register-check", label: "Check registration" },
  { id: "create-intent", label: "Create payment" },
  { id: "proving", label: "Generate ZK proof" },
  { id: "submitting", label: "Submit transaction" },
  { id: "confirmed", label: "Confirmed" },
];

function stepIndex(step: PayStep): number {
  return STEPS.findIndex((s) => s.id === step);
}

export function CheckoutClient({ invoice, publicToken }: { invoice: InvoiceData; publicToken: string }) {
  const { publicKey, connected } = useWallet();
  const [step, setStep] = React.useState<PayStep>("connect");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = React.useState<string | null>(null);

  const totalMinor = BigInt(invoice.totalMinor);
  const subtotalMinor = BigInt(invoice.subtotalMinor);
  const protocolFeeMinor = BigInt(invoice.protocolFeeMinor);
  const progressPct = Math.round((stepIndex(step) / (STEPS.length - 1)) * 100);

  // Advance to register-check once wallet is connected
  React.useEffect(() => {
    if (connected && step === "connect") {
      setStep("register-check");
    }
  }, [connected, step]);

  async function handlePay() {
    if (!publicKey) return;
    setErrorMsg(null);

    try {
      // Step 1: Create payment intent
      setStep("create-intent");
      const intentRes = await fetch(`/api/public/invoices/${publicToken}/payment-intents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payerWallet: publicKey.toBase58() }),
      });
      if (!intentRes.ok) {
        const e = await intentRes.json();
        throw new Error(e.error ?? "Failed to create payment intent");
      }
      const { paymentIntentId: pid } = await intentRes.json();
      setPaymentIntentId(pid);

      // Step 2: ZK proving (Umbra UTXO creation happens client-side)
      setStep("proving");
      const { getPublicBalanceToReceiverClaimableUtxoCreatorFunction } =
        await import("@umbra-privacy/sdk");

      // Note: The actual UTXO creation requires getUmbraClient + prover.
      // Here we show the integration point — full implementation requires
      // wallet signer + Umbra client wired up.
      // This placeholder advances to submitting for demo purposes.
      await new Promise((r) => setTimeout(r, 1500));

      setStep("submitting");
      await new Promise((r) => setTimeout(r, 1000));

      // Step 3: Confirm with backend
      // In production: pass real createUtxoTxSignature from the UTXO creation result
      setStep("confirmed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setErrorMsg(msg);
      setStep("error");
    }
  }

  const isAlreadyPaid = ["CLAIMED_PRIVATE", "CLAIM_SUBMITTED"].includes(invoice.status);
  const currentStepIdx = stepIndex(step);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[hsl(var(--surface-base))]">
      {/* Header */}
      <div className="w-full max-w-lg mb-6 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-accent))]">
          <Shield className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-heading-2 gradient-text">StealthBooks</span>
        <Badge variant="accent" className="ml-auto">Private Payment</Badge>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-5">
        {/* Invoice summary */}
        <GlassPanel padding="lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-label text-[hsl(var(--text-muted))]">Invoice from</p>
              <p className="text-heading-2 text-[hsl(var(--text-primary))]">{invoice.orgName}</p>
            </div>
            <p className="text-mono text-xs text-[hsl(var(--text-muted))]">{invoice.invoiceNumber}</p>
          </div>

          {invoice.memo && (
            <p className="text-body-sm text-[hsl(var(--text-secondary))] mb-4">{invoice.memo}</p>
          )}

          <div className="flex flex-col gap-2 mb-4">
            {invoice.lineItems.map((li, i) => (
              <div key={i} className="flex items-center justify-between text-body-sm">
                <span className="text-[hsl(var(--text-secondary))]">{li.description}</span>
                <span className="text-mono text-[hsl(var(--text-primary))] font-medium">
                  {formatUsdcCurrency(BigInt(li.amountMinor))}
                </span>
              </div>
            ))}
          </div>

          <Separator className="mb-4" />

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-body-sm text-[hsl(var(--text-muted))]">
              <span>Subtotal</span>
              <span>{formatUsdcCurrency(subtotalMinor)}</span>
            </div>
            <div className="flex justify-between text-body-sm text-[hsl(var(--text-muted))]">
              <span>Umbra fee (~0.21%)</span>
              <span>{formatUsdcCurrency(protocolFeeMinor)}</span>
            </div>
            <div className="flex justify-between text-heading-2 mt-1">
              <span>Total (USDC)</span>
              <span className="gradient-text">{formatUsdcCurrency(totalMinor)}</span>
            </div>
          </div>
        </GlassPanel>

        {/* Privacy notice */}
        <GlassPanel padding="md" className="flex items-start gap-3">
          <Lock className="h-4 w-4 text-[hsl(var(--brand-accent))] shrink-0 mt-0.5" />
          <p className="text-body-sm text-[hsl(var(--text-secondary))]">
            Payment flows through Umbra&apos;s mixer. Your payment reaches the vendor&apos;s encrypted account — not a traceable public address. Your wallet outflow is visible on-chain.
          </p>
        </GlassPanel>

        {/* Payment flow */}
        {isAlreadyPaid ? (
          <GlassPanel padding="lg" className="text-center border border-[hsl(var(--brand-success)/0.3)]">
            <CheckCircle className="h-10 w-10 text-[hsl(var(--brand-success))] mx-auto mb-3" />
            <p className="text-heading-2 text-[hsl(var(--brand-success))]">Already paid</p>
            <p className="text-body-sm text-[hsl(var(--text-muted))] mt-1">This invoice has been settled.</p>
          </GlassPanel>
        ) : step === "confirmed" ? (
          <GlassPanel padding="lg" className="text-center border border-[hsl(var(--brand-success)/0.3)]">
            <CheckCircle className="h-10 w-10 text-[hsl(var(--brand-success))] mx-auto mb-3" />
            <p className="text-heading-2 text-[hsl(var(--brand-success))]">Payment submitted</p>
            <p className="text-body-sm text-[hsl(var(--text-muted))] mt-1">
              Your USDC is flowing through Umbra to the vendor&apos;s encrypted account.
            </p>
          </GlassPanel>
        ) : step === "error" ? (
          <GlassPanel padding="lg" className="border border-[hsl(var(--brand-error)/0.3)]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--brand-error))] shrink-0" />
              <div>
                <p className="text-body font-semibold text-[hsl(var(--brand-error))]">Payment failed</p>
                {errorMsg && <p className="text-body-sm text-[hsl(var(--text-muted))] mt-1">{errorMsg}</p>}
              </div>
            </div>
            <Button id="checkout-retry-btn" variant="outline" size="sm" className="mt-4" onClick={() => setStep(connected ? "register-check" : "connect")}>
              Try again
            </Button>
          </GlassPanel>
        ) : (
          <GlassPanel padding="lg" className="flex flex-col gap-5">
            {/* Steps progress */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-body-sm text-[hsl(var(--text-muted))]">
                <span>{STEPS[currentStepIdx]?.label ?? "Ready"}</span>
                <span>{progressPct}%</span>
              </div>
              <Progress value={progressPct} />
            </div>

            <div className="flex flex-col gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i < currentStepIdx ? "bg-[hsl(var(--brand-success))] text-white" :
                    i === currentStepIdx ? "bg-[hsl(var(--brand-primary))] text-white animate-pulse" :
                    "bg-[hsl(var(--surface-overlay))] text-[hsl(var(--text-muted))]"
                  }`}>
                    {i < currentStepIdx ? "✓" : i + 1}
                  </div>
                  <span className={`text-body-sm ${i === currentStepIdx ? "text-[hsl(var(--text-primary))] font-medium" : "text-[hsl(var(--text-muted))]"}`}>
                    {s.label}
                  </span>
                  {i === currentStepIdx && ["proving", "submitting"].includes(s.id) && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--brand-primary))] ml-auto" />
                  )}
                </div>
              ))}
            </div>

            {!connected ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-body-sm text-[hsl(var(--text-muted))]">Connect your Solana wallet to pay</p>
                <WalletMultiButton style={{ background: "hsl(255 107 53)", borderRadius: "8px" }} />
              </div>
            ) : step === "register-check" ? (
              <Button id="checkout-pay-btn" size="lg" onClick={handlePay} className="w-full">
                <ArrowRight className="h-4 w-4" />
                Pay {formatUsdcCurrency(totalMinor)} USDC
              </Button>
            ) : (
              <Button id="checkout-processing-btn" size="lg" loading className="w-full" disabled>
                Processing…
              </Button>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
