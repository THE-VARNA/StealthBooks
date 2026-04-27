import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, NONCE_TTL_MS, type SessionData } from "@/lib/auth/session";
import { nanoid } from "nanoid";

// POST /api/auth/nonce
// Generates a one-time nonce for a given wallet address.
// The nonce is stored in the session (not the DB) with a short TTL.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    if (
      typeof walletAddress !== "string" ||
      walletAddress.length < 32 ||
      walletAddress.length > 44
    ) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    const nonce = `StealthBooks sign-in\n\nWallet: ${walletAddress}\nNonce: ${nanoid(16)}\nIssued: ${new Date().toISOString()}`;

    session.nonce = nonce;
    session.nonceCreatedAt = Date.now();
    // Store requesting wallet to validate on verify
    session.walletAddress = walletAddress;
    session.orgMemberships = [];
    await session.save();

    return NextResponse.json({ nonce });
  } catch (err) {
    console.error("[auth/nonce] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
