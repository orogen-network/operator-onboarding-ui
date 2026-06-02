import { useEffect, useState } from "react";
import { fetchNetworkStatus, type NetworkStatus as Status } from "./api";

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}): JSX.Element {
  return (
    <div className="rounded-md border border-crust-700 bg-crust-900/50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-crust-400">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums text-crust-100">{value}</p>
      {note ? <p className="mt-1 text-[11px] text-crust-500">{note}</p> : null}
    </div>
  );
}

/**
 * Live Forge-testnet status. Chain head + on-chain operator count come from the
 * indexer (CORS-enabled). The gateway's "serving" count is read when reachable;
 * if the gateway has no CORS header for this origin we say so honestly.
 */
export function NetworkStatus(): JSX.Element {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const load = (): void => {
      void fetchNetworkStatus().then((s) => {
        if (live) {
          setStatus(s);
          setLoading(false);
        }
      });
    };
    load();
    const id = window.setInterval(load, 15000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, []);

  const fmt = (n: number | null): string =>
    n === null ? "—" : n.toLocaleString("en-US");

  const live = status && (status.chainHeight !== null || status.operatorsRegistered !== null);

  return (
    <section
      aria-label="live network status"
      className="rounded-lg border border-crust-700/60 bg-crust-900/40 p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`inline-flex h-2.5 w-2.5 rounded-full ${
            live
              ? "bg-crystal-500 shadow-[0_0_10px] shadow-crystal-500/60"
              : "bg-crust-600"
          }`}
        />
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-crust-200">
          Forge testnet — live
        </h2>
        {loading && !status ? (
          <span className="text-xs text-crust-500">loading…</span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label="Indexed chain head"
          value={fmt(status?.chainHeight ?? null)}
          note="indexer.orogen.network"
        />
        <Metric
          label="Operators registered"
          value={fmt(status?.operatorsRegistered ?? null)}
          note="on-chain · OperatorStake"
        />
        <Metric
          label="Operators serving"
          value={
            status?.gatewayBlocked ? "n/a" : fmt(status?.operatorsServing ?? null)
          }
          note={
            status?.gatewayBlocked
              ? "gateway /healthz (no CORS for browser)"
              : "gateway /healthz"
          }
        />
      </div>
      {status?.error ? (
        <p className="mt-2 text-xs text-red-400">indexer error: {status.error}</p>
      ) : null}
    </section>
  );
}
