import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";

// POST /api/orgs/[orgId]/disclosures/[id]/revoke
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId, id } = await params;
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership || membership.role === "REVIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ds = await db.disclosureSession.findFirst({ where: { id, orgId } });
    if (!ds) return NextResponse.json({ error: "Disclosure not found" }, { status: 404 });
    if (ds.status === "REVOKED") {
      return NextResponse.json({ error: "Already revoked" }, { status: 409 });
    }

    await db.$transaction(async (tx) => {
      await tx.disclosureSession.update({
        where: { id },
        data: { status: "REVOKED", revokedAt: new Date(), revokedBy: session.walletAddress },
      });
      await tx.auditLog.create({
        data: {
          orgId, action: "DISCLOSURE_REVOKED",
          actorWallet: session.walletAddress,
          subjectId: id, subjectType: "disclosure",
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[disclosures/revoke] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
