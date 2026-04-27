import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

const persistDiscoveriesSchema = z.object({
  orgId: z.string().cuid(),
  discoveries: z.array(
    z.object({
      sourceUtxoRef: z.string().min(1),
      treeIndex: z.number().int().min(0),
      insertionIndex: z.number().int().min(0),
      amountMinor: z.string().regex(/^\d+$/),
      mint: z.string().min(32),
    })
  ).min(1).max(100),
});

// POST /api/claims/discoveries
// Persists UTXOs found in publicReceived scan to the DB.
// Attempts to match each UTXO to an open invoice by amount + mint.
export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = persistDiscoveriesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
    }

    const { orgId, discoveries } = parsed.data;
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Load open invoices for invoice matching by amount
    const openInvoices = await db.invoice.findMany({
      where: { orgId, status: { in: ["PAID_UNCLAIMED", "TX_CONFIRMED", "INDEXER_VISIBLE", "PAYMENT_SUBMITTED"] } },
      select: { id: true, totalMinor: true, mint: true },
    });

    const results = await Promise.all(
      discoveries.map(async (d) => {
        // Skip duplicates
        const existing = await db.claimEvent.findUnique({
          where: { sourceUtxoRef: d.sourceUtxoRef },
        });
        if (existing) return { sourceUtxoRef: d.sourceUtxoRef, status: "duplicate" };

        // Best-effort invoice matching by amount + mint
        const amountMinor = BigInt(d.amountMinor);
        const matchedInvoice = openInvoices.find(
          (inv) => inv.totalMinor === amountMinor && inv.mint === d.mint
        );

        await db.claimEvent.create({
          data: {
            orgId,
            invoiceId: matchedInvoice?.id ?? null,
            sourceUtxoRef: d.sourceUtxoRef,
            treeIndex: d.treeIndex,
            insertionIndex: d.insertionIndex,
            amountMinor,
            mint: d.mint,
            status: "DISCOVERED",
          },
        });

        if (matchedInvoice) {
          await db.invoice.update({
            where: { id: matchedInvoice.id },
            data: { status: "PAID_UNCLAIMED" },
          });
          await db.auditLog.create({
            data: {
              orgId,
              action: "CLAIM_DISCOVERED",
              actorWallet: session.walletAddress,
              subjectId: matchedInvoice.id,
              subjectType: "invoice",
            },
          });
        }

        return { sourceUtxoRef: d.sourceUtxoRef, status: "created", invoiceMatch: !!matchedInvoice };
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[claims/discoveries] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
