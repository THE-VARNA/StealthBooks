import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus, ClaimEventStatus } from "@prisma/client";

const INVOICE_STATUS_MAP: Record<
  InvoiceStatus,
  { label: string; variant: "default" | "primary" | "accent" | "success" | "warning" | "error" | "muted" }
> = {
  DRAFT: { label: "Draft", variant: "muted" },
  APPROVED: { label: "Approved", variant: "accent" },
  OPEN: { label: "Open", variant: "primary" },
  PAYMENT_INTENT_CREATED: { label: "Intent Created", variant: "primary" },
  PAYMENT_SUBMITTED: { label: "Submitted", variant: "warning" },
  TX_CONFIRMED: { label: "TX Confirmed", variant: "warning" },
  INDEXER_VISIBLE: { label: "Indexer Visible", variant: "warning" },
  PAID_UNCLAIMED: { label: "Paid — Unclaimed", variant: "accent" },
  CLAIM_SUBMITTED: { label: "Claiming…", variant: "accent" },
  CLAIMED_PRIVATE: { label: "Claimed Private", variant: "success" },
  VOID: { label: "Void", variant: "error" },
  EXPIRED: { label: "Expired", variant: "error" },
};

const CLAIM_STATUS_MAP: Record<
  ClaimEventStatus,
  { label: string; variant: "default" | "primary" | "accent" | "success" | "warning" | "error" | "muted" }
> = {
  DISCOVERED: { label: "Discovered", variant: "primary" },
  CLAIM_SUBMITTED: { label: "Submitting…", variant: "warning" },
  CLAIMED: { label: "Claimed", variant: "success" },
  FAILED: { label: "Failed", variant: "error" },
  DUPLICATE: { label: "Duplicate", variant: "muted" },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, variant } = INVOICE_STATUS_MAP[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function ClaimStatusBadge({ status }: { status: ClaimEventStatus }) {
  const { label, variant } = CLAIM_STATUS_MAP[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}
