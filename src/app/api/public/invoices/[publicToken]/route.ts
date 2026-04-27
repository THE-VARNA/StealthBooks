import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

// GET /api/public/invoices/[publicToken]
// Resolves a raw checkout token to the invoice for the payer checkout page.
// No auth required — token is the proof of access.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicToken: string }> }
) {
  try {
    const { publicToken } = await params;

    const tokenHash = crypto
      .createHmac("sha256", process.env.INVOICE_TOKEN_SALT ?? "default-salt")
      .update(publicToken)
      .digest("hex");

    const invoice = await db.invoice.findFirst({
      where: { publicTokenHash: tokenHash },
      include: {
        lineItems: true,
        counterparty: { select: { displayName: true } },
        organization: { select: { name: true, cluster: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "VOID" || invoice.status === "EXPIRED") {
      return NextResponse.json({ error: "This invoice is no longer valid" }, { status: 410 });
    }
    if (invoice.publicTokenExpiresAt && invoice.publicTokenExpiresAt < new Date()) {
      // Expire it
      await db.invoice.update({ where: { id: invoice.id }, data: { status: "EXPIRED" } });
      return NextResponse.json({ error: "This invoice link has expired" }, { status: 410 });
    }
    if (invoice.status === "CLAIMED_PRIVATE") {
      return NextResponse.json({ error: "This invoice has already been paid" }, { status: 409 });
    }

    // Return safe subset — never return internalNotes or org details beyond name
    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        subtotalMinor: invoice.subtotalMinor.toString(),
        protocolFeeMinor: invoice.protocolFeeMinor.toString(),
        totalMinor: invoice.totalMinor.toString(),
        mint: invoice.mint,
        memo: invoice.memo,
        dueDate: invoice.dueDate,
        lineItems: invoice.lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice.toString(),
          amountMinor: li.amountMinor.toString(),
        })),
        counterpartyName: invoice.counterparty?.displayName ?? null,
        orgName: invoice.organization.name,
        cluster: invoice.organization.cluster,
      },
    });
  } catch (err) {
    console.error("[public/invoices] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
