import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchNetworkStatus, looksLikeSs58, requestFaucetDrip } from "../api";

describe("looksLikeSs58", () => {
  it("accepts a real ss58 address", () => {
    expect(looksLikeSs58("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(true);
  });
  it("rejects junk and 0x hex", () => {
    expect(looksLikeSs58("not an address")).toBe(false);
    expect(looksLikeSs58("0xabc")).toBe(false);
    expect(looksLikeSs58("")).toBe(false);
  });
});

describe("fetchNetworkStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads chain head + operator count from the indexer and gateway count when reachable", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      const u = String(url);
      if (u.includes("graphql")) {
        return new Response(
          JSON.stringify({
            data: { squidStatus: { height: 189731 }, operatorsConnection: { totalCount: 3 } },
          }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ operators: 2 }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const s = await fetchNetworkStatus();
    expect(s.chainHeight).toBe(189731);
    expect(s.operatorsRegistered).toBe(3);
    expect(s.operatorsServing).toBe(2);
    expect(s.gatewayBlocked).toBe(false);
  });

  it("marks the gateway blocked (not faked) when the browser call fails", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url).includes("graphql")) {
        return new Response(
          JSON.stringify({
            data: { squidStatus: { height: 1 }, operatorsConnection: { totalCount: 3 } },
          }),
          { status: 200 },
        );
      }
      throw new TypeError("Failed to fetch"); // CORS-block signature
    });
    vi.stubGlobal("fetch", fetchMock);

    const s = await fetchNetworkStatus();
    expect(s.operatorsRegistered).toBe(3);
    expect(s.operatorsServing).toBeNull();
    expect(s.gatewayBlocked).toBe(true);
  });
});

describe("requestFaucetDrip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok with the real tx hash on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ ok: true, recipient: "5Grw", amount: 5, tx_hash: "0xdead" }),
          { status: 200 },
        ),
      ),
    );
    const r = await requestFaucetDrip("5Grw");
    expect(r).toEqual({ kind: "ok", recipient: "5Grw", amount: 5, txHash: "0xdead" });
  });

  it("reports cors-blocked (never fakes success) when fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    const r = await requestFaucetDrip("5Grw");
    expect(r.kind).toBe("cors-blocked");
  });
});
