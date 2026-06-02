/**
 * Live Orogen Forge-testnet endpoints.
 *
 * Defaults are the public production endpoints; each can be overridden at
 * build time with the matching `VITE_OROGEN_*` env var (see vite-env.d.ts).
 * No values are simulated — every URL here points at a real, deployed service.
 */

const env = import.meta.env;

export const INDEXER_URL =
  env.VITE_OROGEN_INDEXER_URL ?? "https://indexer.orogen.network/graphql";

export const FORGE_RPC_URL =
  env.VITE_OROGEN_FORGE_RPC_URL ?? "https://forge-rpc.orogen.network";

/** WebSocket RPC, derived from the HTTP RPC, used in wallet-cli commands. */
export const FORGE_RPC_WSS = FORGE_RPC_URL.replace(/^http/u, "ws");

export const GATEWAY_URL =
  env.VITE_OROGEN_GATEWAY_URL ?? "https://gateway.orogen.network";

export const FAUCET_URL =
  env.VITE_OROGEN_FAUCET_URL ?? "https://faucet.orogen.network";

export const FAUCET_DRIP_URL = `${FAUCET_URL.replace(/\/$/u, "")}/drip-public`;

/** wallet-cli testnet release. */
export const WALLET_CLI_RELEASE =
  "https://github.com/orogen-network/wallet-cli/releases/tag/v0.1.0-testnet";

export const WALLET_CLI_TARBALL =
  "https://github.com/orogen-network/wallet-cli/releases/download/v0.1.0-testnet/wallet-cli-0.1.0-x86_64-linux-gnu.tar.gz";

export const WALLET_CLI_REPO = "https://github.com/orogen-network/wallet-cli";

export const WORKER_REPO = "https://github.com/orogen-network/infer-worker-vllm";

export const CONTROL_PLANE_REPO =
  "https://github.com/orogen-network/worker-control-plane";

export const DOCS_FORGE_URL = "https://docs.orogen.network/start/forge-testnet";

/** Chain constants (Forge testnet). */
export const SS58_PREFIX = 42;
export const OROG_DECIMALS = 12;
/** MinStake on Forge = 1 OROG = 1e12 plancks. */
export const MIN_STAKE_PLANCKS = "1000000000000";
export const FAUCET_DRIP_OROG = 5;
