"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft, Send } from "lucide-react";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatUsdcCurrency, parseUsdc } from "@/lib/formatting";
import { useAuthStore } from "@/features/auth/useWalletAuth";
import Link from "next/link";

// ─── Local form schema ────────────────────────────────────────────────────────
const lineItemSchema = z.object({
  description: z.string().min(1, "Required").max(200),
  quantity: z.coerce.number().positive("Must be > 0"),
  unitPrice: z.coerce.number().positive("Must be > 0"),
});

const formSchema = z.object({
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
  memo: z.string().max(500).optional(),
  internalNotes: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PROTOCOL_FEE_RATE = 35 / 16_384; // ~0.214%

function computeLineTotal(qty: number, price: number): number {
  return isFinite(qty) && isFinite(price) ? qty * price : 0;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const { orgMemberships } = useAuthStore();
  const activeOrgId = orgMemberships.length > 0 ? orgMemberships[0].orgId : null;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const watchedItems = watch("lineItems");

  const subtotal = React.useMemo(() => {
    return watchedItems.reduce(
      (acc, li) => acc + computeLineTotal(Number(li.quantity), Number(li.unitPrice)),
      0
    );
  }, [watchedItems]);

  const protocolFee = subtotal * PROTOCOL_FEE_RATE;
  const total = subtotal + protocolFee;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);

    if (!activeOrgId) {
      setError("No active organization found. Please sign in again.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/orgs/${activeOrgId}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: values.lineItems,
          memo: values.memo || undefined,
          internalNotes: values.internalNotes || undefined,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create invoice");
      }

      const { invoice } = await res.json();
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar
        title="New Invoice"
        description="Create a USDC invoice for private settlement through Umbra"
        actions={
          <Link href="/invoices">
            <Button id="new-invoice-back-btn" variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Line Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <GlassPanel padding="none" className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.065)]">
                <h2 className="text-heading-2">Line Items</h2>
                <Button
                  id="new-invoice-add-line-btn"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add Line
                </Button>
              </div>

              {/* Header row */}
              <div className="grid grid-cols-[1fr_80px_100px_36px] gap-3 px-5 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
                {["Description", "Qty", "Unit Price (USDC)", ""].map((h) => (
                  <span key={h} className="text-label text-[rgb(71,85,105)]">{h}</span>
                ))}
              </div>

              <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.06)]">
                {fields.map((field, i) => {
                  const lineTotal = computeLineTotal(
                    Number(watchedItems[i]?.quantity),
                    Number(watchedItems[i]?.unitPrice)
                  );
                  return (
                    <div key={field.id} className="grid grid-cols-[1fr_80px_100px_36px] gap-3 items-start px-5 py-3">
                      <Input
                        id={`line-${i}-description`}
                        placeholder="Service description"
                        error={errors.lineItems?.[i]?.description?.message}
                        {...register(`lineItems.${i}.description`)}
                      />
                      <Input
                        id={`line-${i}-quantity`}
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        error={errors.lineItems?.[i]?.quantity?.message}
                        {...register(`lineItems.${i}.quantity`)}
                      />
                      <div className="flex flex-col gap-1">
                        <Input
                          id={`line-${i}-unitPrice`}
                          type="number"
                          min="0.000001"
                          step="0.000001"
                          error={errors.lineItems?.[i]?.unitPrice?.message}
                          {...register(`lineItems.${i}.unitPrice`)}
                        />
                        {lineTotal > 0 && (
                          <p className="text-[0.7rem] text-right text-[rgb(71,85,105)]">
                            = {formatUsdcCurrency(parseUsdc(lineTotal.toFixed(6)))}
                          </p>
                        )}
                      </div>
                      <Button
                        id={`line-${i}-remove-btn`}
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={fields.length === 1}
                        onClick={() => remove(i)}
                        aria-label="Remove line item"
                        className="mt-0.5"
                      >
                        <Trash2 className="h-4 w-4 text-[#ef4444]" aria-hidden="true" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {errors.lineItems?.root && (
                <p className="px-5 pb-3 text-sm text-[#ef4444]">
                  {errors.lineItems.root.message}
                </p>
              )}
            </GlassPanel>

            {/* Notes */}
            <GlassPanel padding="lg" className="flex flex-col gap-4">
              <h2 className="text-heading-2">Details</h2>
              <Input
                id="new-invoice-memo"
                label="Memo (visible to payer)"
                placeholder="e.g. Design services — April 2026"
                hint="Displayed on the payer checkout page"
                {...register("memo")}
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-invoice-internal-notes" className="text-label text-[rgb(148,163,184)]">
                  Internal Notes (private)
                </label>
                <textarea
                  id="new-invoice-internal-notes"
                  className="w-full rounded-md border border-[rgba(255,255,255,0.09)] bg-[rgba(20,24,54,0.5)] px-3 py-2.5 text-sm text-[rgb(248,250,252)] placeholder:text-[rgb(71,85,105)] focus:outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[rgba(99,102,241,0.3)] transition-all duration-200 resize-none min-h-[80px]"
                  placeholder="Never shown to payer or in disclosures"
                  {...register("internalNotes")}
                />
              </div>
              <Input
                id="new-invoice-due-date"
                label="Due Date (optional)"
                type="date"
                {...register("dueDate")}
              />
            </GlassPanel>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-4">
            <GlassPanel padding="lg" className="flex flex-col gap-4 sticky top-6">
              <h2 className="text-heading-2">Summary</h2>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-[rgb(148,163,184)]">Subtotal</span>
                  <span className="text-body font-semibold text-[rgb(248,250,252)]">
                    {formatUsdcCurrency(parseUsdc(subtotal.toFixed(6)))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-[rgb(148,163,184)]">
                    Umbra fee (~0.21%)
                  </span>
                  <span className="text-body-sm text-[rgb(71,85,105)]">
                    {formatUsdcCurrency(parseUsdc(protocolFee.toFixed(6)))}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-body font-semibold text-[rgb(248,250,252)]">
                    Total (USDC)
                  </span>
                  <span className="text-heading-2 gradient-text">
                    {formatUsdcCurrency(parseUsdc(total.toFixed(6)))}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-[rgba(20,24,54,0.4)] px-3 py-2.5">
                <p className="text-body-sm text-[rgb(71,85,105)]">
                  After creation, approve the invoice to generate a private checkout link to share with your payer.
                </p>
              </div>

              {error && (
                <p role="alert" className="text-sm text-[#ef4444]">{error}</p>
              )}

              <Button
                id="new-invoice-submit-btn"
                type="submit"
                size="lg"
                className="w-full"
                loading={submitting}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Create Invoice
              </Button>
            </GlassPanel>
          </div>
        </div>
      </form>
    </div>
  );
}
