import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // For the demo: find any invoices that had a payment intent created 
    // but aren't yet mapped to a claim event
    const pendingInvoices = await db.invoice.findMany({
      where: { orgId, status: "PAYMENT_INTENT_CREATED" },
    });

    console.log(`[claims/scan] Found ${pendingInvoices.length} pending invoices for org ${orgId}`);

    let newClaimsCount = 0;

    await db.$transaction(async (tx) => {
      for (const inv of pendingInvoices) {
        // Create a mock ClaimEvent for the discovered UTXO
        await tx.claimEvent.create({
          data: {
            invoiceId: inv.id,
            orgId,
            status: "DISCOVERED",
            sourceUtxoRef: `mock_utxo_${crypto.randomBytes(8).toString("hex")}`,
            treeIndex: 0,
            insertionIndex: Math.floor(Math.random() * 10000),
            amountMinor: inv.totalMinor,
            mint: process.env.NEXT_PUBLIC_USDC_MINT ?? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        });

        // Update the invoice so we don't discover it again
        await tx.invoice.update({
          where: { id: inv.id },
          data: { status: "INDEXER_VISIBLE" },
        });

        newClaimsCount++;
      }
    });

    console.log(`[claims/scan] Created ${newClaimsCount} new mock claim events`);

    return NextResponse.json({ scanned: newClaimsCount });
  } catch (err) {
    console.error("[claims/scan] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
