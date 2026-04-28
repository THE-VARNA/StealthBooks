import type { Metadata } from "next";
import { Eye, Plus, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Disclosures | StealthBooks" };

export default async function DisclosuresPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.walletAddress) redirect("/login");
  
  const orgId = session.orgMemberships?.[0]?.orgId;
  if (!orgId) redirect("/settings?prompt=register");

  const disclosures = await db.disclosureSession.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Selective Disclosures"
        description="Share scoped invoice records with auditors or counterparties"
        actions={
          <Link href="/disclosures/new">
            <Button id="disclosures-new-btn" size="md">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Disclosure
            </Button>
          </Link>
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
          <Link href="/disclosures/new">
            <Button id="disclosures-create-link-btn" variant="outline" size="sm">Create link</Button>
          </Link>
        </div>

        {disclosures.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="rounded-2xl bg-[rgba(20,24,54,0.6)] p-4 text-[rgb(71,85,105)]">
              <Eye className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-heading-2 text-[rgb(248,250,252)]">No disclosures yet</p>
            <p className="max-w-sm text-body-sm text-[rgb(71,85,105)]">
              Create a scoped disclosure link to share specific invoice records with auditors or counterparties.
            </p>
            <Link href="/disclosures/new">
              <Button id="disclosures-empty-create-btn" size="md">Create disclosure</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.065)]">
            <div className="grid grid-cols-[1fr_10rem_15rem_7rem] px-5 py-3 border-b border-[rgba(255,255,255,0.065)]">
              <div className="text-label text-[rgb(71,85,105)]">Disclosure Label</div>
              <div className="text-label text-[rgb(71,85,105)]">Status</div>
              <div className="text-label text-[rgb(71,85,105)]">Share ID</div>
              <div className="text-label text-[rgb(71,85,105)] text-center">View</div>
            </div>
            {disclosures.map((disc) => (
              <div key={disc.id} className="grid grid-cols-[1fr_10rem_15rem_7rem] items-center px-5 py-4 transition-colors hover:bg-white/[0.02]">
                <div className="flex flex-col">
                  <span className="text-body-sm font-semibold text-[rgb(248,250,252)]">{disc.label}</span>
                  <span className="text-xs text-[rgb(148,163,184)] mt-0.5">Expires: {disc.expiresAt.toLocaleDateString()}</span>
                </div>
                <div>
                  <Badge variant={disc.status === 'ACTIVE' ? 'success' : 'muted'} className="uppercase tracking-wider text-[0.65rem]">
                    {disc.status}
                  </Badge>
                </div>
                <div className="text-body-sm font-mono text-[rgb(148,163,184)] truncate pr-4">
                  {disc.shareId}
                </div>
                <div className="text-center flex justify-center">
                  <a href={`/disclosures/${disc.shareId}`} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-[rgba(255,255,255,0.1)]">
                      <LinkIcon className="h-4 w-4 text-[#10b981]" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
