"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, ArrowLeft, Shield, Lock, Send, Link as LinkIcon, Calendar } from "lucide-react";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/useWalletAuth";
import Link from "next/link";

// ─── Local form schema ────────────────────────────────────────────────────────
const formSchema = z.object({
  label: z.string().min(1, "Required").max(120),
  passcode: z.string().min(6, "Passcode must be at least 6 characters").optional().or(z.literal("")),
  expiresInDays: z.coerce.number().int().min(1).max(30),
  kinds: z.array(z.string()).min(1, "Select at least one report kind"),
});

type FormValues = z.infer<typeof formSchema>;

const KINDS = [
  { id: "invoice_report", label: "Invoice Audit Report", desc: "Detailed breakdown of all scoped invoices" },
  { id: "tvk_export", label: "Transaction Viewing Keys", desc: "Allows external verification of on-chain state" },
  { id: "reconciliation_summary", label: "Reconciliation Summary", desc: "Simplified accounting rollup" },
];

export default function NewDisclosurePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  
  const { orgMemberships } = useAuthStore();
  const activeOrgId = orgMemberships.length > 0 ? orgMemberships[0].orgId : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      expiresInDays: 7,
      kinds: ["invoice_report"],
    },
  });

  const watchedKinds = watch("kinds");

  const toggleKind = (kind: string) => {
    const current = watchedKinds;
    if (current.includes(kind)) {
      setValue("kinds", current.filter(k => k !== kind));
    } else {
      setValue("kinds", [...current, kind]);
    }
  };

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);

    if (!activeOrgId) {
      setError("No active organization found. Please sign in again.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/orgs/${activeOrgId}/disclosures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: values.label,
          passcode: values.passcode || undefined,
          expiresInDays: values.expiresInDays,
          scope: {
            kinds: values.kinds,
          }
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create disclosure");
      }

      const data = await res.json();
      setShareUrl(data.shareUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  if (shareUrl) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto py-12">
        <GlassPanel padding="lg" className="text-center flex flex-col items-center gap-6 border-[#10b981]">
          <div className="h-16 w-16 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[#10b981]">
            <LinkIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-heading-1 text-[rgb(248,250,252)]">Disclosure Link Ready</h1>
            <p className="text-body-sm text-[rgb(148,163,184)] mt-2">
              Share this link with your auditor. It will expire based on your selection.
            </p>
          </div>

          <div className="w-full p-4 rounded-xl bg-[rgba(20,24,54,0.6)] border border-[rgba(255,255,255,0.06)] flex items-center gap-3">
            <code className="flex-1 text-left text-mono text-xs text-[#22d3ee] truncate">
              {shareUrl}
            </code>
            <Button size="sm" variant="outline" onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              alert("Link copied to clipboard!");
            }}>
              Copy
            </Button>
          </div>

          <div className="flex items-center gap-4 w-full">
            <Link href="/disclosures" className="flex-1">
              <Button variant="ghost" className="w-full">Done</Button>
            </Link>
            <Button variant="accent" className="flex-1" onClick={() => window.open(shareUrl, '_blank')}>
              Open Preview
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="Create Disclosure"
        description="Configure a scoped report package for external viewing"
        actions={
          <Link href="/disclosures">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassPanel padding="lg" className="flex flex-col gap-6">
            <h2 className="text-heading-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#6366f1]" />
              Basic Information
            </h2>
            
            <Input
              id="disclosure-label"
              label="Disclosure Label"
              placeholder="e.g. Q2 2026 Tax Audit"
              hint="For your internal tracking"
              error={errors.label?.message}
              {...register("label")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="disclosure-passcode"
                label="Passcode (Optional)"
                type="password"
                placeholder="••••••"
                hint="Auditor must enter this to view"
                error={errors.passcode?.message}
                {...register("passcode")}
              />
              <Input
                id="disclosure-expiry"
                label="Expiration (Days)"
                type="number"
                min="1"
                max="30"
                hint="Link valid for this duration"
                error={errors.expiresInDays?.message}
                {...register("expiresInDays")}
              />
            </div>
          </GlassPanel>

          <GlassPanel padding="lg" className="flex flex-col gap-6">
            <h2 className="text-heading-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#22d3ee]" />
              Report Package Scoping
            </h2>
            
            <div className="flex flex-col gap-3">
              <label className="text-label text-[rgb(148,163,184)]">Include Data Kinds</label>
              <div className="grid gap-3">
                {KINDS.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleKind(k.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                      watchedKinds.includes(k.id)
                        ? "bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.4)]"
                        : "bg-[rgba(20,24,54,0.4)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <div className={`mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      watchedKinds.includes(k.id) ? "border-[#6366f1] bg-[#6366f1]" : "border-[rgb(71,85,105)]"
                    }`}>
                      {watchedKinds.includes(k.id) && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-body font-medium ${watchedKinds.includes(k.id) ? "text-[rgb(248,250,252)]" : "text-[rgb(148,163,184)]"}`}>
                        {k.label}
                      </p>
                      <p className="text-body-sm text-[rgb(71,85,105)] mt-0.5">{k.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {errors.kinds && <p className="text-xs text-[#ef4444]">{errors.kinds.message}</p>}
            </div>
          </GlassPanel>
        </div>

        <div className="flex flex-col gap-4">
          <GlassPanel padding="lg" className="flex flex-col gap-6 sticky top-6">
            <h2 className="text-heading-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#10b981]" />
              Security Policy
            </h2>
            
            <div className="text-body-sm text-[rgb(148,163,184)] flex flex-col gap-4">
              <p>
                By creating this disclosure, you are generating a scoped view of your private invoice data. 
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-2">
                <li>No private keys are shared</li>
                <li>Access is read-only and time-limited</li>
                <li>Audit log will record all access events</li>
              </ul>
            </div>

            {error && <p className="text-sm text-[#ef4444]">{error}</p>}

            <Button
              id="create-disclosure-btn"
              type="submit"
              size="lg"
              className="w-full"
              loading={submitting}
            >
              <Send className="h-4 w-4" />
              Generate Link
            </Button>
          </GlassPanel>
        </div>
      </form>
    </div>
  );
}
