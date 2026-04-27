import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),

  // Solana
  NEXT_PUBLIC_SOLANA_CLUSTER: z
    .enum(["mainnet-beta", "devnet"])
    .default("mainnet-beta"),
  NEXT_PUBLIC_SOLANA_RPC_URL: z.string().url("NEXT_PUBLIC_SOLANA_RPC_URL must be a valid URL"),

  // Umbra
  NEXT_PUBLIC_UMBRA_INDEXER_URL: z
    .string()
    .url()
    .default("https://utxo-indexer.api.umbraprivacy.com"),
  NEXT_PUBLIC_UMBRA_RELAYER_URL: z
    .string()
    .url()
    .default("https://relayer.api.umbraprivacy.com"),
  NEXT_PUBLIC_USDC_MINT: z
    .string()
    .min(32)
    .default("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  INVOICE_TOKEN_SALT: z
    .string()
    .min(8, "INVOICE_TOKEN_SALT must be at least 8 characters"),
});

// Parse and validate env at startup. Throws on missing required vars.
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration. Check .env.example.");
  }
  return parsed.data;
}

// Export typed env — use this everywhere instead of raw process.env
export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
