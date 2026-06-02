import { AppShell } from "./AppShell";
import { NetworkStatus } from "./NetworkStatus";
import { Quickstart } from "./Quickstart";
import { ExtLink } from "./ui";

export function App(): JSX.Element {
  return (
    <AppShell subtitle="Operator onboarding">
      <header className="mb-6">
        <p className="heading-eyebrow">Forge testnet</p>
        <h1 className="mt-2 text-2xl font-semibold text-crust-100 sm:text-3xl">
          Operator quickstart
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-crust-300">
          Bring a GPU operator online on the live Orogen Forge testnet in five
          steps: install the client, create a wallet, fund it from the faucet,
          register on-chain, and start a worker. Every command and link below
          targets the real testnet — copy, run, and watch your operator appear
          in the count above.
        </p>
      </header>

      <NetworkStatus />

      <div className="divider-igneous my-6" />

      <Quickstart />

      <p className="mt-6 text-xs text-crust-500">
        Need help? Read the{" "}
        <ExtLink href="https://docs.orogen.network/start/forge-testnet">
          Forge testnet guide
        </ExtLink>{" "}
        or the{" "}
        <ExtLink href="https://github.com/orogen-network/wallet-cli">
          wallet-cli README
        </ExtLink>
        .
      </p>
    </AppShell>
  );
}
