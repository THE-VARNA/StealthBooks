import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";

// GET /api/orgs/[orgId]/readiness
// Returns org registration status for display (cache only).
// The AUTHORITATIVE readiness check runs client-side via getUserAccountQuerierFunction.
// This endpoint returns:
//   - cluster
//   - umbraRegisteredAt (last confirmed timestamp — display only)
//   - supportedMint (USDC address)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify membership
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { cluster: true, umbraRegisteredAt: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      cluster: org.cluster,
      // This is a cached timestamp from the last successful registration — not authoritative.
      // The client must call getUserAccountQuerierFunction for the live chain state.
      umbraRegisteredAtCache: org.umbraRegisteredAt,
      supportedMint: process.env.NEXT_PUBLIC_USDC_MINT,
    });
  } catch (err) {
    console.error("[orgs/readiness] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/orgs/[orgId]/readiness
// Called by the client after a successful getUserAccountQuerierFunction check.
// Updates the cached umbraRegisteredAt timestamp.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership || membership.role === "REVIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.organization.update({
      where: { id: orgId },
      data: { umbraRegisteredAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        orgId,
        action: "UMBRA_REGISTERED",
        actorWallet: session.walletAddress,
        subjectId: orgId,
        subjectType: "org",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[orgs/readiness] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
