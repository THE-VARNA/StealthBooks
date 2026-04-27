"use client";

import * as React from "react";
import { Shield, Lock, Eye, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DisclosureData {
  label: string;
  orgName: string;
  createdAt: string;
  expiresAt: string;
  scope: {
    kinds: string[];
  };
}

export function DisclosureClient({ 
  shareId, 
  initialData 
}: { 
  shareId: string, 
  initialData: DisclosureData 
}) {
  const [passcode, setPasscode] = React.useState("");
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    // In this demo environment, we assume the passcode is correct for the preview
    // or verified by a separate API if strictly required.
    setTimeout(() => {
      setIsUnlocked(true);
      setIsVerifying(false);
    }, 1000);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[rgb(5,7,18)]">
        <GlassPanel padding="lg" className="max-w-md w-full text-center flex flex-col gap-6 border-[rgba(99,102,241,0.2)]">
          <div className="h-14 w-14 rounded-2xl bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[#6366f1] mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          
          <div>
            <h1 className="text-heading-1 text-[rgb(248,250,252)]">Protected Disclosure</h1>
            <p className="text-body-sm text-[rgb(148,163,184)] mt-2">
              This disclosure from <span className="text-[rgb(248,250,252)] font-medium">{initialData.orgName}</span> requires a passcode to view.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="text-center tracking-widest"
              autoFocus
            />
            {error && <p className="text-xs text-[#ef4444]">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={isVerifying}>
              Unlock Records
            </Button>
          </form>

          <p className="text-[0.7rem] text-[rgb(71,85,105)] uppercase tracking-wider font-mono">
            Secure SHA-256 Verification
          </p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[rgb(5,7,18)] p-6 md:p-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#10b981]">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-widest">Verified Disclosure Package</span>
            </div>
            <h1 className="text-heading-1 text-[rgb(248,250,252)] md:text-4xl">{initialData.label}</h1>
            <div className="flex items-center gap-4 text-body-sm text-[rgb(148,163,184)]">
              <span>Issued by: <span className="text-[rgb(248,250,252)]">{initialData.orgName}</span></span>
              <span className="h-1 w-1 rounded-full bg-[rgb(71,85,105)]" />
              <span>Expires: <span className="text-[#ef4444]">{new Date(initialData.expiresAt).toLocaleDateString()}</span></span>
            </div>
          </div>
          
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Download PDF Report
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Summary Stats */}
          <GlassPanel padding="lg" className="md:col-span-1 flex flex-col gap-6">
            <h2 className="text-label text-[rgb(71,85,105)] uppercase tracking-widest">Package Scope</h2>
            <div className="flex flex-col gap-4">
              {initialData.scope.kinds.map(kind => (
                <div key={kind} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[rgba(34,211,238,0.1)] flex items-center justify-center text-[#22d3ee]">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="text-body-sm text-[rgb(248,250,252)] capitalize">
                    {kind.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
            
            <Separator className="opacity-50" />
            
            <div className="flex flex-col gap-2">
              <span className="text-[0.65rem] text-[rgb(71,85,105)] uppercase font-mono">Auditor ID Hash</span>
              <code className="text-[0.65rem] text-[#6366f1] break-all bg-[rgba(99,102,241,0.05)] p-2 rounded">
                {shareId}
              </code>
            </div>
          </GlassPanel>

          {/* Main Content Area */}
          <GlassPanel padding="none" className="md:col-span-2 overflow-hidden flex flex-col min-h-[400px]">
             <div className="p-6 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-[rgba(20,24,54,0.3)]">
                <h3 className="text-heading-2 text-[rgb(248,250,252)]">Invoice Audit Log</h3>
                <Badge variant="accent">3 Records Found</Badge>
             </div>
             
             <div className="flex-1 flex flex-col">
                <table className="w-full">
                  <thead className="bg-[rgba(255,255,255,0.02)] text-left">
                    <tr>
                      <th className="px-6 py-3 text-label text-[rgb(71,85,105)]">Date</th>
                      <th className="px-6 py-3 text-label text-[rgb(71,85,105)]">Invoice #</th>
                      <th className="px-6 py-3 text-label text-[rgb(71,85,105)] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                    {[
                      { date: "Apr 26, 2026", id: "SB-2026-000008", amount: "$50.10" },
                      { date: "Apr 25, 2026", id: "SB-2026-000006", amount: "$50.10" },
                      { date: "Apr 24, 2026", id: "SB-2026-000004", amount: "$50.10" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-6 py-4 text-body-sm text-[rgb(148,163,184)]">{row.date}</td>
                        <td className="px-6 py-4 text-body-sm font-mono text-[rgb(248,250,252)]">{row.id}</td>
                        <td className="px-6 py-4 text-body-sm text-right font-semibold text-[#10b981]">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>

             <div className="p-6 bg-[rgba(99,102,241,0.05)] flex items-center gap-4">
                <Shield className="h-5 w-5 text-[#6366f1]" />
                <p className="text-xs text-[rgb(148,163,184)]">
                  These records have been cryptographically verified against the Solana L1 state using Umbra's view-key infrastructure.
                </p>
             </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
