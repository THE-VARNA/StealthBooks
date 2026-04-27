import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

// POST /api/orgs — Create a new organization
export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createOrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { name, slug } = parsed.data;

    // Check slug uniqueness
    const existing = await db.organization.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }

    // Create org + owner membership in a transaction
    const org = await db.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: { name, slug },
      });
      await tx.organizationMembership.create({
        data: {
          orgId: newOrg.id,
          walletAddress: session.walletAddress,
          role: "OWNER",
        },
      });
      await tx.auditLog.create({
        data: {
          orgId: newOrg.id,
          action: "ORG_CREATED",
          actorWallet: session.walletAddress,
          subjectId: newOrg.id,
          subjectType: "org",
        },
      });
      return newOrg;
    });

    // Update session with new membership
    session.orgMemberships = [
      ...(session.orgMemberships || []),
      { orgId: org.id, role: "OWNER" },
    ];
    await session.save();

    return NextResponse.json({ org }, { status: 201 });
  } catch (err) {
    console.error("[orgs] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
