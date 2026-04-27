import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { updateInvoiceSchema } from "@/lib/validation/schemas";

type RouteParams = { params: Promise<{ orgId: string; invoiceId: string }> };

async function getInvoiceWithGuard(
  orgId: string,
  invoiceId: string,
  walletAddress: string,
  session: SessionData
) {
  const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
  if (!membership) return { error: "Forbidden", status: 403 };

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, orgId },
    include: { lineItems: true, counterparty: { select: { displayName: true } } },
  });
  if (!invoice) return { error: "Invoice not found", status: 404 };
  return { invoice, membership };
}

// GET /api/orgs/[orgId]/invoices/[invoiceId]
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.walletAddress) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId, invoiceId } = await params;
  const result = await getInvoiceWithGuard(orgId, invoiceId, session.walletAddress, session);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ invoice: result.invoice });
}

// PATCH /api/orgs/[orgId]/invoices/[invoiceId]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.walletAddress) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId, invoiceId } = await params;
  const result = await getInvoiceWithGuard(orgId, invoiceId, session.walletAddress, session);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { invoice, membership } = result;

  if (membership.role === "REVIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (invoice.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT invoices can be edited" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = updateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await db.invoice.update({
    where: { id: invoiceId },
    data: {
      memo: parsed.data.memo,
      internalNotes: parsed.data.internalNotes,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
    include: { lineItems: true },
  });

  await db.auditLog.create({
    data: { orgId, action: "INVOICE_UPDATED", actorWallet: session.walletAddress, subjectId: invoiceId, subjectType: "invoice" },
  });

  return NextResponse.json({ invoice: updated });
}
