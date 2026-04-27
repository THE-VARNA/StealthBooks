import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

const snapshotSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  mint: z.string().min(32).max(44),
  balanceState: z.enum(["shared", "mxe", "uninitialized", "non_existent"]),
});

// POST /api/orgs/[orgId]/balances/snapshots
// Saves a balance state snapshot (not the amount — privacy) after client queries ETA.
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

    const body = await req.json();
    const parsed = snapshotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 422 });
    }

    const snapshot = await db.encryptedBalanceSnapshotMetadata.create({
      data: { orgId, ...parsed.data },
    });

    return NextResponse.json({ snapshot }, { status: 201 });
  } catch (err) {
    console.error("[balances/snapshots] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/orgs/[orgId]/balances/snapshots
// Returns the latest snapshot metadata for each mint (state type only, no amount).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.walletAddress) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const snapshots = await db.encryptedBalanceSnapshotMetadata.findMany({
      where: { orgId },
      orderBy: { snapshotAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ snapshots });
  } catch (err) {
    console.error("[balances/snapshots] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
