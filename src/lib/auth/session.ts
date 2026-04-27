import { SessionOptions } from "iron-session";

export interface SessionData {
  walletAddress: string;
  orgMemberships: {
    orgId: string;
    role: "OWNER" | "FINANCE_OPERATOR" | "REVIEWER";
  }[];
  nonce?: string;
  nonceCreatedAt?: number; // epoch ms
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "stealthbooks-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

/** Nonce TTL: 5 minutes */
export const NONCE_TTL_MS = 5 * 60 * 1000;
