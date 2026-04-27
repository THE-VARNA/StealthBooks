/**
 * Umbra Prover Isolation Adapter
 *
 * This file is the ONLY place that imports prover functions from
 * @umbra-privacy/web-zk-prover. This centralizes naming and makes it
 * easy to update if prover names change in SDK releases.
 *
 * Source of truth: https://sdk.umbraprivacy.com/sdk/mixer/creating-utxos
 *
 * Payment rail used in StealthBooks:
 *   Payer publicBalance → Umbra Mixer UTXO → Vendor publicReceived scan → Claim to ETA
 *
 * Prover required:
 *   getPublicBalanceToReceiverClaimableUtxoCreatorProver
 *   (creates a receiver-claimable UTXO funded from payer's public balance)
 */

// Dynamic import wrapper — WASM provers must only load in browser context.
// Call awaitProver() inside a useEffect or event handler, never at module level.

export type ProverModule = {
  getPublicBalanceToReceiverClaimableUtxoCreatorProver: () => Promise<unknown>;
};

let _proverModule: ProverModule | null = null;

export async function loadProverModule(): Promise<ProverModule> {
  if (_proverModule) return _proverModule;

  // Dynamic import keeps WASM out of SSR bundle
  const mod = await import("@umbra-privacy/web-zk-prover");
  _proverModule = mod as unknown as ProverModule;
  return _proverModule;
}

/**
 * Returns the prover function for the StealthBooks payment rail:
 * Public Balance → Receiver-Claimable UTXO
 */
export async function getPaymentRailProver() {
  const mod = await loadProverModule();
  return mod.getPublicBalanceToReceiverClaimableUtxoCreatorProver();
}
