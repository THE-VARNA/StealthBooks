"use client";

import { useCheckoutStore } from "./checkoutStore";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Shield, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatting";
import * as React from "react";

interface CheckoutLinkDisplayProps {
  status: string;
  expiresAt: Date | null;
}

export function CheckoutLinkDisplay({ status, expiresAt }: CheckoutLinkDisplayProps) {
  const checkoutUrl = useCheckoutStore((state) => state.checkoutUrl);
  const [copied, setCopied] = React.useState(false);

  if (status !== "OPEN") return null;

  if (!checkoutUrl) {
    return (
      <GlassPanel padding="md" className="border border-[rgba(16,185,129,0.2)] flex items-center gap-4">
        <Shield className="h-5 w-5 text-[#10b981] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold">Checkout link ready</p>
          <p className="text-body-sm text-[rgb(71,85,105)]">Share your private link with your payer to initiate the Umbra payment.</p>
          {expiresAt && (
            <p className="text-body-sm text-[rgb(71,85,105)] mt-1">Expires: {formatDate(expiresAt)}</p>
          )}
        </div>
      </GlassPanel>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassPanel padding="md" className="border border-[rgba(16,185,129,0.2)] flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-[#10b981] shrink-0" />
        <h3 className="text-body font-semibold text-[rgb(248,250,252)]">Share Checkout Link</h3>
      </div>
      <p className="text-body-sm text-[rgb(148,163,184)]">
        This is a uniquely generated private checkout URL. For security, it will only be shown this one time. Share this link directly with your payer to securely initiate the Umbra payment.
      </p>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 bg-[rgba(20,24,54,0.5)] border border-[rgba(255,255,255,0.09)] rounded-md px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-[rgb(148,163,184)]">
          {checkoutUrl}
        </div>
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="shrink-0 gap-2">
          {copied ? <Check className="h-4 w-4 text-[#10b981]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </GlassPanel>
  );
}
