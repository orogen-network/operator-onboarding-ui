/**
 * Operator quickstart steps.
 *
 * This is a guided checklist that mirrors the real wallet-cli + worker flow on
 * the live Forge testnet — not a simulation. The only client-side validation is
 * a sanity check on the ss58 address the operator pastes in for the faucet step.
 */

export const STEPS = [
  "install",
  "wallet",
  "fund",
  "register",
  "worker",
] as const;

export type StepName = (typeof STEPS)[number];

export const STEP_LABELS: Record<StepName, string> = {
  install: "Install the client",
  wallet: "Create a wallet",
  fund: "Get testnet OROG",
  register: "Register on-chain",
  worker: "Run the worker",
};
