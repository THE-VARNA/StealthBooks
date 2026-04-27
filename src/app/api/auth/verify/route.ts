import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, NONCE_TTL_MS, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import nacl from "tweetnacl";
import bs58 from "bs58";

// POST /api/auth/verify
// Verifies a Solana wallet signature over the nonce.
// On success, sets the session with memberships and returns the session state.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, signature } = body;

    if (typeof walletAddress !== "string" || typeof signature !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    // Validate nonce exists and hasn't expired
    if (
      !session.nonce ||
      !session.nonceCreatedAt ||
      session.walletAddress !== walletAddress
    ) {
      return NextResponse.json({ error: "No pending nonce for this wallet" }, { status: 401 });
    }

    if (Date.now() - session.nonceCreatedAt > NONCE_TTL_MS) {
      await session.destroy();
      return NextResponse.json({ error: "Nonce expired. Please try again." }, { status: 401 });
    }

    // Verify Ed25519 signature (Solana standard)
    const messageBytes = new TextEncoder().encode(session.nonce);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(walletAddress);

    const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Load org memberships for this wallet
    let memberships = await db.organizationMembership.findMany({
      where: { walletAddress },
      select: { orgId: true, role: true },
    });

    if (memberships.length === 0) {
      try {
        // Auto-provision a default org for new users in this demo environment
        const newOrg = await db.organization.create({
          data: {
            name: "My Organization",
            slug: `org-${walletAddress.slice(0, 8).toLowerCase()}-${Math.floor(Math.random() * 10000)}`,
            memberships: {
              create: {
                walletAddress,
                role: "OWNER"
              }
            }
          }
        });
        memberships = [{ orgId: newOrg.id, role: "OWNER" as any }];
      } catch (err) {
        console.error("Failed to auto-provision org:", err);
        return NextResponse.json({ error: "Failed to create default organization" }, { status: 500 });
      }
    }

    // Save authenticated session
    session.walletAddress = walletAddress;
    session.orgMemberships = memberships;
    session.nonce = undefined;
    session.nonceCreatedAt = undefined;
    await session.save();

    return NextResponse.json({
      walletAddress,
      orgMemberships: memberships,
    });
  } catch (err) {
    console.error("[auth/verify] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
