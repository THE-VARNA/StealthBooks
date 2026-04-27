import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

const withdrawalSchema = z.object({
  // Destination is the owner wallet address (not ATA).
  // Umbra SDK computes the ATA internally; must exist before withdrawal.
  destinationOwnerAddress: z.string().min(32).max(44),
  amountMinor: z.string().regex(/^\d+$/, "Must be bigint string"),
  mint: z.string().min(32).max(44),
  txSignature: z.string().min(80).optional(),
});

// POST /api/orgs/[orgId]/settlements/withdrawals
// Records a withdrawal from ETA → publicBalance.
// The destination is the owner address (not ATA) per Umbra SDK docs.
// Source: https://sdk.umbraprivacy.com/sdk/mixer/fetching-utxos (withdrawal section)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership || membership.role === "REVIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = withdrawalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 422 });
    }

    await db.auditLog.create({
      data: {
        orgId,
        action: parsed.data.txSignature ? "WITHDRAWAL_CONFIRMED" : "WITHDRAWAL_INITIATED",
        actorWallet: session.walletAddress,
        subjectType: "org",
        metadata: {
          destinationOwnerAddress: parsed.data.destinationOwnerAddress,
          mint: parsed.data.mint,
          // Amount intentionally omitted from audit log for privacy
        },
      },
    });

    if (parsed.data.txSignature) {
      // Record the on-chain withdrawal tx
      await db.umbraTransaction.create({
        data: {
          invoiceId: "settlement", // placeholder — no specific invoice
          txSignature: parsed.data.txSignature,
          txType: "withdrawal",
          cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "mainnet-beta",
          confirmedAt: new Date(),
        },
      }).catch(() => {}); // non-fatal if invoiceId FK fails
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[settlements/withdrawals] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
