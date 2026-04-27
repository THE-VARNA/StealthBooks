import { z } from "zod";

// ─── Invoice Schemas ──────────────────────────────────────────────────────────

export const lineItemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.number().positive().multipleOf(0.0001),
  unitPrice: z
    .number()
    .positive()
    .max(1_000_000) // max $1M per line item
    .describe("Unit price in USDC (not micro-units)"),
});

export const createInvoiceSchema = z.object({
  counterpartyId: z.string().cuid().optional(),
  lineItems: z.array(lineItemSchema).min(1).max(50),
  memo: z.string().max(500).optional(),
  internalNotes: z.string().max(2000).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

// ─── Org Schemas ──────────────────────────────────────────────────────────────

export const createOrgSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

// ─── Payment Intent Schemas ───────────────────────────────────────────────────

export const createPaymentIntentSchema = z.object({
  payerWallet: z.string().min(32).max(44),
});

export const confirmPaymentIntentSchema = z.object({
  createUtxoTxSignature: z.string().min(80),
  expectedUtxoTreeIndex: z.number().int().min(0).optional(),
});

// ─── Claim Schemas ────────────────────────────────────────────────────────────

export const persistDiscoverySchema = z.object({
  invoiceId: z.string().cuid().optional(),
  sourceUtxoRef: z.string().min(1),
  treeIndex: z.number().int().min(0),
  insertionIndex: z.number().int().min(0),
  amountMinor: z.string().regex(/^\d+$/, "Must be a bigint string"),
  mint: z.string().min(32).max(44),
});

export const confirmClaimSchema = z.object({
  claimTxSignature: z.string().min(80),
});

// ─── Disclosure Schemas ───────────────────────────────────────────────────────

export const createDisclosureSchema = z.object({
  label: z.string().min(1).max(120),
  passcode: z.string().min(6).optional(),
  scope: z.object({
    invoiceIds: z.array(z.string().cuid()).optional(),
    dateRangeStart: z.string().datetime().optional(),
    dateRangeEnd: z.string().datetime().optional(),
    kinds: z.array(z.enum(["invoice_report", "tvk_export", "reconciliation_summary"])).min(1),
  }),
  expiresInDays: z.number().int().min(1).max(30).default(30),
});
