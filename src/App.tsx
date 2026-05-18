import { useState } from "react";
import { AppShell } from "./AppShell";
import { Wizard } from "./Wizard";

export function App(): JSX.Element {
  const [done, setDone] = useState(false);
  return (
    <AppShell subtitle="Operator onboarding">
      <header className="mb-6">
        <p className="heading-eyebrow">Setup</p>
        <h1 className="mt-2 text-2xl font-semibold text-crust-100 sm:text-3xl">
          Operator onboarding
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-crust-300">
          Five steps from a freshly-installed driver stack to a heartbeating
          operator. We validate each step against the same zod schema the chain
          bind call uses — no hidden surprises.
        </p>
      </header>
      <div className="divider-igneous mb-6" />

      {done ? (
        <section className="rounded-md border border-crystal-500/40 bg-crystal-500/10 p-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-3 w-3 rounded-full bg-crystal-500 shadow-[0_0_12px] shadow-crystal-500/60"
            />
            <h2 className="text-lg font-semibold text-crystal-500">All set</h2>
          </div>
          <p className="mt-3 text-sm text-crust-200">
            Your operator is registered. The daemon will start emitting
            heartbeats shortly. You can watch them appear on{" "}
            <a
              href="https://status.orogen.network"
              className="text-magma-400 no-underline hover:text-magma-300"
              rel="noopener noreferrer"
            >
              status.orogen.network
            </a>{" "}
            within a minute.
          </p>
        </section>
      ) : (
        <Wizard onComplete={() => setDone(true)} />
      )}
    </AppShell>
  );
}
