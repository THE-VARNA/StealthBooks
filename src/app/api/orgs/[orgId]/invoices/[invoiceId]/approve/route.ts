import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import crypto from "crypto";

// POST /api/orgs/[orgId]/invoices/[invoiceId]/approve
// Validates readiness (org must have umbraRegisteredAt set as cache),
// generates a secure public checkout token (returned once, only hash stored),
// moves invoice from DRAFT → APPROVED → OPEN.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; invoiceId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, invoiceId } = await params;

    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership || membership.role === "REVIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [invoice, org] = await Promise.all([
      db.invoice.findFirst({ where: { id: invoiceId, orgId } }),
      db.organization.findUnique({ where: { id: orgId }, select: { umbraRegisteredAt: true, cluster: true } }),
    ]);

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status !== "DRAFT") {
      return NextResponse.json({ error: "Only DRAFT invoices can be approved" }, { status: 409 });
    }
    // Soft readiness gate: warn if org never completed registration cache
    // (client should enforce the chain-derived check before calling this)
    if (!org?.umbraRegisteredAt) {
      return NextResponse.json(
        { error: "Organization not registered with Umbra. Complete registration first." },
        { status: 409 }
      );
    }

    // Generate public checkout token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHmac("sha256", process.env.INVOICE_TOKEN_SALT ?? "default-salt")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "OPEN",
          publicTokenHash: tokenHash,
          publicTokenExpiresAt: expiresAt,
          approvedAt: new Date(),
          approvedBy: session.walletAddress,
        },
      });
      await tx.auditLog.create({
        data: {
          orgId,
          action: "INVOICE_APPROVED",
          actorWallet: session.walletAddress,
          subjectId: invoiceId,
          subjectType: "invoice",
        },
      });
    });

    // Raw token returned once — never stored
    const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${rawToken}`;

    return NextResponse.json({ checkoutUrl, expiresAt });
  } catch (err) {
    console.error("[invoices/approve] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
