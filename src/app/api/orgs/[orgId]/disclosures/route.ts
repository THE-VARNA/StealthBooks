import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createDisclosureSchema } from "@/lib/validation/schemas";
import crypto from "crypto";
import { nanoid } from "nanoid";

// POST /api/orgs/[orgId]/disclosures
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
    const parsed = createDisclosureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
    }

    const { label, passcode, scope, expiresInDays } = parsed.data;

    const shareId = nanoid(24);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    const passcodeHash = passcode
      ? crypto.createHash("sha256").update(passcode).digest("hex")
      : null;

    const session_ = await db.$transaction(async (tx) => {
      const ds = await tx.disclosureSession.create({
        data: {
          orgId,
          shareId,
          label,
          passcodeHash,
          scope,
          expiresAt,
          createdBy: session.walletAddress,
        },
      });
      await tx.auditLog.create({
        data: {
          orgId,
          action: "DISCLOSURE_CREATED",
          actorWallet: session.walletAddress,
          subjectId: ds.id,
          subjectType: "disclosure",
          metadata: { label, expiresAt },
        },
      });
      return ds;
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
    const shareUrl = `${appUrl}/disclosures/${shareId}`;
    return NextResponse.json({ shareUrl, expiresAt, disclosureSessionId: session_.id }, { status: 201 });
  } catch (err) {
    console.error("[disclosures] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/orgs/[orgId]/disclosures
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

    const disclosures = await db.disclosureSession.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, shareId: true, label: true, status: true,
        expiresAt: true, createdAt: true, revokedAt: true,
        scope: true, lastAccessedAt: true,
      },
    });

    return NextResponse.json({ disclosures });
  } catch (err) {
    console.error("[disclosures] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
