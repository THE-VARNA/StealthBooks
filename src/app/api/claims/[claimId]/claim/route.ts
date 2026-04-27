import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ claimId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { claimId } = await params;

    // Update the ClaimEvent to CLAIMED
    const claim = await db.claimEvent.update({
      where: { id: claimId },
      data: { status: "CLAIMED", claimedAt: new Date() },
    });

    // If there's a linked invoice, update it to CLAIMED_PRIVATE
    if (claim.invoiceId) {
      await db.invoice.update({
        where: { id: claim.invoiceId },
        data: { status: "CLAIMED_PRIVATE" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[claim/claim] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
