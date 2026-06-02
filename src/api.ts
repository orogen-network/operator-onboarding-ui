/**
 * Live calls against the Orogen Forge testnet. Nothing here is simulated:
 * every function performs a real network request. Where an endpoint does not
 * (yet) send CORS headers for this origin, the browser blocks the request and
 * we surface that honestly rather than fabricating a result.
 */

import {
  FAUCET_DRIP_URL,
  GATEWAY_URL,
  INDEXER_URL,
  SS58_PREFIX,
} from "./config";

export interface NetworkStatus {
  /** Indexed chain head height (from the Subsquid `squidStatus`). */
  chainHeight: number | null;
  /** Operators registered on-chain (indexer `operatorsConnection.totalCount`). */
  operatorsRegistered: number | null;
  /** Operators the gateway is currently serving (gateway `/healthz`). */
  operatorsServing: number | null;
  /** True when the gateway count could not be read (e.g. CORS-blocked). */
  gatewayBlocked: boolean;
  error: string | null;
}

async function gql<T>(query: string): Promise<T> {
  const res = await fetch(INDEXER_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`indexer HTTP ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("indexer returned no data");
  return json.data;
}

/** Read the live network status. Indexer is CORS-enabled; gateway may not be. */
export async function fetchNetworkStatus(): Promise<NetworkStatus> {
  const status: NetworkStatus = {
    chainHeight: null,
    operatorsRegistered: null,
    operatorsServing: null,
    gatewayBlocked: false,
    error: null,
  };

  try {
    const data = await gql<{
      squidStatus: { height: number } | null;
      operatorsConnection: { totalCount: number };
    }>(
      "{ squidStatus { height } operatorsConnection(orderBy: id_ASC) { totalCount } }",
    );
    status.chainHeight = data.squidStatus?.height ?? null;
    status.operatorsRegistered = data.operatorsConnection.totalCount;
  } catch (e) {
    status.error = e instanceof Error ? e.message : String(e);
  }

  // Gateway /healthz currently ships no CORS header for this origin, so a
  // cross-origin browser read is blocked. Attempt it anyway; on failure mark
  // it blocked rather than guessing a number.
  try {
    const res = await fetch(`${GATEWAY_URL.replace(/\/$/u, "")}/healthz`);
    if (res.ok) {
      const j = (await res.json()) as { operators?: number };
      status.operatorsServing = typeof j.operators === "number" ? j.operators : null;
    } else {
      status.gatewayBlocked = true;
    }
  } catch {
    status.gatewayBlocked = true;
  }

  return status;
}

export type FaucetResult =
  | { kind: "ok"; recipient: string; amount: number; txHash: string }
  | { kind: "error"; message: string }
  | { kind: "cors-blocked"; message: string };

const SS58_RE = /^[1-9A-HJ-NP-Za-km-z]{46,50}$/u;

/** Client-side sanity check (length + base58 charset) for an ss58 address. */
export function looksLikeSs58(addr: string): boolean {
  return SS58_RE.test(addr.trim());
}

/**
 * Attempt a real faucet drip from the browser. The faucet does not currently
 * send CORS headers / answer the preflight for this origin, so this call is
 * expected to be blocked in production — in that case we return `cors-blocked`
 * and the UI falls back to the exact curl command. We never fabricate success.
 */
export async function requestFaucetDrip(recipient: string): Promise<FaucetResult> {
  try {
    const res = await fetch(FAUCET_DRIP_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recipient: recipient.trim() }),
    });
    const text = await res.text();
    let body: { ok?: boolean; tx_hash?: string; amount?: number; recipient?: string; error?: string } =
      {};
    try {
      body = JSON.parse(text);
    } catch {
      /* non-JSON body */
    }
    if (res.ok && body.ok && body.tx_hash) {
      return {
        kind: "ok",
        recipient: body.recipient ?? recipient,
        amount: body.amount ?? 0,
        txHash: body.tx_hash,
      };
    }
    return {
      kind: "error",
      message: body.error ?? `faucet HTTP ${res.status}`,
    };
  } catch (e) {
    // TypeError from fetch here is the CORS / network-block signature.
    return {
      kind: "cors-blocked",
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

export const ss58Prefix = SS58_PREFIX;
