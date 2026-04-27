import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPaymentIntentSchema } from "@/lib/validation/schemas";
import crypto from "crypto";
import { nanoid } from "nanoid";

// POST /api/public/invoices/[publicToken]/payment-intents
// Payer creates a payment intent before constructing the UTXO.
export async function POST(
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
      select: { id: true, status: true, orgId: true, totalMinor: true, protocolFeeMinor: true },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const payableStatuses = ["OPEN", "PAYMENT_INTENT_CREATED"];
    if (!payableStatuses.includes(invoice.status)) {
      return NextResponse.json({ error: `Invoice status is ${invoice.status}` }, { status: 409 });
    }

    const body = await req.json();
    const parsed = createPaymentIntentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
    }

    const idempotencyKey = `${invoice.id}:${parsed.data.payerWallet}:${nanoid(8)}`;

    const intent = await db.$transaction(async (tx) => {
      const pi = await tx.paymentIntent.create({
        data: {
          invoiceId: invoice.id,
          payerWallet: parsed.data.payerWallet,
          idempotencyKey,
          amountMinor: invoice.totalMinor,
          protocolFeeMinor: invoice.protocolFeeMinor,
        },
      });
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAYMENT_INTENT_CREATED" },
      });
      return pi;
    });

    return NextResponse.json({
      paymentIntentId: intent.id,
      amountMinor: intent.amountMinor.toString(),
      protocolFeeMinor: intent.protocolFeeMinor.toString(),
    }, { status: 201 });
  } catch (err) {
    console.error("[payment-intents] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
