import type { Metadata } from "next";
import { Eye, Plus, AlertTriangle } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { EmptyStatePanel } from "@/components/layout/EmptyStatePanel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Disclosures | StealthBooks" };

export default function DisclosuresPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Selective Disclosures"
        description="Share scoped invoice records with auditors or counterparties"
        actions={
          <Button id="disclosures-new-btn" size="md">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Disclosure
          </Button>
        }
      />

      {/* Model explanation */}
      <GlassPanel padding="md" className="border border-[rgba(99,102,241,0.15)]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#f59e0b] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-body font-semibold text-[rgb(248,250,252)]">
              Disclosure model — report packages only
            </p>
            <p className="text-body-sm text-[rgb(148,163,184)] mt-1">
              StealthBooks generates structured report packages from your scoped invoice data. Auditors receive a time-limited share link. No live X25519 key grants are issued — raw decryption keys never leave your wallet.
            </p>
          </div>
        </div>
      </GlassPanel>

      {/* Disclosures table */}
      <GlassPanel padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.065)]">
          <h2 className="text-heading-2">Active Disclosures</h2>
          <Button id="disclosures-create-link-btn" variant="outline" size="sm">Create link</Button>
        </div>
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-[rgba(20,24,54,0.6)] p-4 text-[rgb(71,85,105)]">
            <Eye className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="text-heading-2 text-[rgb(248,250,252)]">No disclosures yet</p>
          <p className="max-w-sm text-body-sm text-[rgb(71,85,105)]">
            Create a scoped disclosure link to share specific invoice records with auditors or counterparties.
          </p>
          <Button id="disclosures-empty-create-btn" size="md">Create disclosure</Button>
        </div>
      </GlassPanel>
    </div>
  );
}
