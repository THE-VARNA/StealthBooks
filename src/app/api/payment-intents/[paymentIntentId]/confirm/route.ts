import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { confirmPaymentIntentSchema } from "@/lib/validation/schemas";

// POST /api/payment-intents/[paymentIntentId]/confirm
// Called by the payer after the UTXO creation transaction is submitted.
// Stores the tx signature and advances invoice to PAYMENT_SUBMITTED.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentIntentId: string }> }
) {
  try {
    const { paymentIntentId } = await params;

    const intent = await db.paymentIntent.findUnique({
      where: { id: paymentIntentId },
      include: { invoice: { select: { status: true, orgId: true } } },
    });

    if (!intent) return NextResponse.json({ error: "Payment intent not found" }, { status: 404 });

    if (intent.invoice.status !== "PAYMENT_INTENT_CREATED") {
      return NextResponse.json(
        { error: `Invoice is in status ${intent.invoice.status}, cannot confirm` },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = confirmPaymentIntentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
    }

    const { createUtxoTxSignature, expectedUtxoTreeIndex } = parsed.data;

    await db.$transaction(async (tx) => {
      await tx.paymentIntent.update({
        where: { id: paymentIntentId },
        data: {
          createUtxoTxSignature,
          expectedUtxoTreeIndex: expectedUtxoTreeIndex ?? null,
        },
      });
      await tx.invoice.update({
        where: { id: intent.invoiceId },
        data: { status: "PAYMENT_SUBMITTED" },
      });
      await tx.umbraTransaction.create({
        data: {
          invoiceId: intent.invoiceId,
          txSignature: createUtxoTxSignature,
          txType: "utxo_create",
          cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "mainnet-beta",
        },
      });
      await tx.auditLog.create({
        data: {
          orgId: intent.invoice.orgId,
          action: "PAYMENT_SUBMITTED",
          subjectId: intent.invoiceId,
          subjectType: "invoice",
          metadata: { txSignature: createUtxoTxSignature },
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[payment-intents/confirm] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
