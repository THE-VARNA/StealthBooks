import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { confirmClaimSchema } from "@/lib/validation/schemas";

// POST /api/claims/[claimEventId]/confirm
// Records the claim tx signature and advances status to CLAIM_SUBMITTED.
// The client polls chain and calls this when confirmed.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ claimId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = await params;

    const claimEvent = await db.claimEvent.findUnique({
      where: { id: claimId },
    });
    if (!claimEvent) return NextResponse.json({ error: "Claim event not found" }, { status: 404 });

    const membership = session.orgMemberships?.find((m) => m.orgId === claimEvent.orgId);
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = confirmClaimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 422 });
    }

    await db.$transaction(async (tx) => {
      await tx.claimEvent.update({
        where: { id: claimId },
        data: {
          status: "CLAIM_SUBMITTED",
          claimTxSignature: parsed.data.claimTxSignature,
        },
      });
      if (claimEvent.invoiceId) {
        await tx.invoice.update({
          where: { id: claimEvent.invoiceId },
          data: { status: "CLAIM_SUBMITTED" },
        });
        await tx.umbraTransaction.create({
          data: {
            invoiceId: claimEvent.invoiceId,
            txSignature: parsed.data.claimTxSignature,
            txType: "claim",
            cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "mainnet-beta",
          },
        });
        await tx.auditLog.create({
          data: {
            orgId: claimEvent.orgId,
            action: "CLAIM_SUBMITTED",
            actorWallet: session.walletAddress,
            subjectId: claimEvent.invoiceId,
            subjectType: "invoice",
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[claims/confirm] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
