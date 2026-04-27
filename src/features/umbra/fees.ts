/**
 * Umbra Protocol Fee Estimation
 *
 * Source: https://sdk.umbraprivacy.com/pricing
 *
 * Protocol fee = floor(amount × 35 / 16_384) ≈ 0.214%
 * Additional relayer SOL fee for on-chain transactions.
 */

/** Protocol fee numerator from official docs */
const PROTOCOL_FEE_NUMERATOR = 35n;
const PROTOCOL_FEE_DENOMINATOR = 16_384n;

/** Estimated SOL relayer fee per UTXO creation (conservative estimate) */
export const MIXER_SOL_FEE_ESTIMATE_LAMPORTS = 10_000n; // 0.00001 SOL

/**
 * Compute the Umbra protocol fee for a given USDC amount.
 * @param amountMinor USDC in micro-units (6 decimals)
 * @returns Protocol fee in USDC micro-units
 */
export function computeProtocolFee(amountMinor: bigint): bigint {
  return (amountMinor * PROTOCOL_FEE_NUMERATOR) / PROTOCOL_FEE_DENOMINATOR;
}

/**
 * Compute the full fee breakdown for a payment.
 * @param subtotalMinor Invoice subtotal in USDC micro-units
 */
export function computeFeeBreakdown(subtotalMinor: bigint): {
  subtotalMinor: bigint;
  protocolFeeMinor: bigint;
  totalMinor: bigint;
  protocolFeePercent: string;
} {
  const protocolFeeMinor = computeProtocolFee(subtotalMinor);
  const totalMinor = subtotalMinor + protocolFeeMinor;
  const pct = ((Number(protocolFeeMinor) / Number(subtotalMinor)) * 100).toFixed(3);
  return { subtotalMinor, protocolFeeMinor, totalMinor, protocolFeePercent: `${pct}%` };
}
