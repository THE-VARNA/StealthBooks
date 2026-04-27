import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";

// POST /api/orgs/[orgId]/invoices/[invoiceId]/void
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; invoiceId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId, invoiceId } = await params;
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership || membership.role === "REVIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invoice = await db.invoice.findFirst({ where: { id: invoiceId, orgId } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const voidableStatuses = ["DRAFT", "APPROVED", "OPEN", "PAYMENT_INTENT_CREATED"];
    if (!voidableStatuses.includes(invoice.status)) {
      return NextResponse.json(
        { error: `Invoice in status ${invoice.status} cannot be voided` },
        { status: 409 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.invoice.update({ where: { id: invoiceId }, data: { status: "VOID" } });
      await tx.auditLog.create({
        data: { orgId, action: "INVOICE_VOIDED", actorWallet: session.walletAddress, subjectId: invoiceId, subjectType: "invoice" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[invoices/void] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
