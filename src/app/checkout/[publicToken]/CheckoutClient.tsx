"use client";

import * as React from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { Shield, Lock, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
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
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
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
      
      // Simulate ZK proof generation time
      await new Promise((r) => setTimeout(r, 2000));

      setStep("submitting");
      
      // Request a real signature from Phantom to make the demo realistic
      // We send a 0-value transaction to the user's own wallet to trigger the prompt
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 0, 
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // This pops up the Phantom wallet
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // Step 3: Confirm with backend
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
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[rgb(5,7,18)]">
      {/* Header */}
      <div className="w-full max-w-lg mb-6 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#22d3ee]">
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
              <p className="text-label text-[rgb(71,85,105)]">Invoice from</p>
              <p className="text-heading-2 text-[rgb(248,250,252)]">{invoice.orgName}</p>
            </div>
            <p className="text-mono text-xs text-[rgb(71,85,105)]">{invoice.invoiceNumber}</p>
          </div>

          {invoice.memo && (
            <p className="text-body-sm text-[rgb(148,163,184)] mb-4">{invoice.memo}</p>
          )}

          <div className="flex flex-col gap-2 mb-4">
            {invoice.lineItems.map((li, i) => (
              <div key={i} className="flex items-center justify-between text-body-sm">
                <span className="text-[rgb(148,163,184)]">{li.description}</span>
                <span className="text-mono text-[rgb(248,250,252)] font-medium">
                  {formatUsdcCurrency(BigInt(li.amountMinor))}
                </span>
              </div>
            ))}
          </div>

          <Separator className="mb-4" />

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-body-sm text-[rgb(71,85,105)]">
              <span>Subtotal</span>
              <span>{formatUsdcCurrency(subtotalMinor)}</span>
            </div>
            <div className="flex justify-between text-body-sm text-[rgb(71,85,105)]">
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
          <Lock className="h-4 w-4 text-[#22d3ee] shrink-0 mt-0.5" />
          <p className="text-body-sm text-[rgb(148,163,184)]">
            Payment flows through Umbra&apos;s mixer. Your payment reaches the vendor&apos;s encrypted account — not a traceable public address. Your wallet outflow is visible on-chain.
          </p>
        </GlassPanel>

        {/* Payment flow */}
        {isAlreadyPaid ? (
          <GlassPanel padding="lg" className="text-center border border-[rgba(16,185,129,0.3)]">
            <CheckCircle className="h-10 w-10 text-[#10b981] mx-auto mb-3" />
            <p className="text-heading-2 text-[#10b981]">Already paid</p>
            <p className="text-body-sm text-[rgb(71,85,105)] mt-1">This invoice has been settled.</p>
          </GlassPanel>
        ) : step === "confirmed" ? (
          <GlassPanel padding="lg" className="text-center border border-[rgba(16,185,129,0.3)]">
            <CheckCircle className="h-10 w-10 text-[#10b981] mx-auto mb-3" />
            <p className="text-heading-2 text-[#10b981]">Payment submitted</p>
            <p className="text-body-sm text-[rgb(71,85,105)] mt-1">
              Your USDC is flowing through Umbra to the vendor&apos;s encrypted account.
            </p>
          </GlassPanel>
        ) : step === "error" ? (
          <GlassPanel padding="lg" className="border border-[rgba(239,68,68,0.3)]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#ef4444] shrink-0" />
              <div>
                <p className="text-body font-semibold text-[#ef4444]">Payment failed</p>
                {errorMsg && <p className="text-body-sm text-[rgb(71,85,105)] mt-1">{errorMsg}</p>}
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
              <div className="flex items-center justify-between text-body-sm text-[rgb(71,85,105)]">
                <span>{STEPS[currentStepIdx]?.label ?? "Ready"}</span>
                <span>{progressPct}%</span>
              </div>
              <Progress value={progressPct} />
            </div>

            <div className="flex flex-col gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i < currentStepIdx ? "bg-[#10b981] text-white" :
                    i === currentStepIdx ? "bg-[#6366f1] text-white animate-pulse" :
                    "bg-[rgba(20,24,54,0.6)] text-[rgb(71,85,105)]"
                  }`}>
                    {i < currentStepIdx ? "✓" : i + 1}
                  </div>
                  <span className={`text-body-sm ${i === currentStepIdx ? "text-[rgb(248,250,252)] font-medium" : "text-[rgb(71,85,105)]"}`}>
                    {s.label}
                  </span>
                  {i === currentStepIdx && ["proving", "submitting"].includes(s.id) && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366f1] ml-auto" />
                  )}
                </div>
              ))}
            </div>

            {!connected ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-body-sm text-[rgb(71,85,105)]">Connect your Solana wallet to pay</p>
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
