import type { Metadata } from "next";
import { Inbox, RefreshCw, Shield } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { EmptyStatePanel } from "@/components/layout/EmptyStatePanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Claims Inbox | StealthBooks" };

export default function ClaimsPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Claims Inbox"
        description="Scan your wallet's publicReceived bucket and claim UTXOs into your private balance"
        actions={
          <Button id="claims-scan-btn" size="md">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Scan Now
          </Button>
        }
      />

      {/* Scan info banner */}
      <GlassPanel padding="md" className="flex items-start gap-4">
        <div className="rounded-xl bg-[hsl(var(--brand-accent)/0.12)] p-2.5 text-[hsl(var(--brand-accent))] shrink-0">
          <Shield className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-body font-semibold text-[hsl(var(--text-primary))]">
            Privacy-preserving scan
          </p>
          <p className="text-body-sm text-[hsl(var(--text-secondary))] mt-0.5">
            The scan runs client-side using your connected wallet. UTXOs are decrypted locally — amounts never reach the server. Your scanning cursor is saved in this browser only.
          </p>
        </div>
        <Badge variant="accent" className="shrink-0">publicReceived</Badge>
      </GlassPanel>

      {/* Claims table */}
      <GlassPanel padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--surface-border)/0.08)]">
          <h2 className="text-heading-2">Discovered UTXOs</h2>
          <span className="text-body-sm text-[hsl(var(--text-muted))]">0 unclaimed</span>
        </div>
        <EmptyStatePanel
          icon={<Inbox className="h-8 w-8" />}
          title="No UTXOs discovered"
          description="Click 'Scan Now' to scan your wallet's publicReceived bucket for incoming payments."
          className="border-0 rounded-none"
        />
      </GlassPanel>
    </div>
  );
}
