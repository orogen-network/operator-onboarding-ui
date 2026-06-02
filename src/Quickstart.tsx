import { useState } from "react";
import {
  CONTROL_PLANE_REPO,
  DOCS_FORGE_URL,
  FAUCET_DRIP_OROG,
  FAUCET_DRIP_URL,
  FORGE_RPC_WSS,
  MIN_STAKE_PLANCKS,
  WALLET_CLI_RELEASE,
  WALLET_CLI_REPO,
  WALLET_CLI_TARBALL,
  WORKER_REPO,
} from "./config";
import { STEPS, STEP_LABELS, type StepName } from "./schema";
import {
  looksLikeSs58,
  requestFaucetDrip,
  type FaucetResult,
} from "./api";
import { CodeBlock, ExtLink, INPUT_CLASSES, PRIMARY_BTN } from "./ui";

const TARBALL_NAME = "wallet-cli-0.1.0-x86_64-linux-gnu.tar.gz";

const INSTALL_CMD = `curl -fL -o ${TARBALL_NAME} \\
  ${WALLET_CLI_TARBALL}
tar -xzf ${TARBALL_NAME}
sudo mv wallet-cli /usr/local/bin/
wallet-cli --help`;

const WALLET_CMD = `export OROGEN_RPC_URL=${FORGE_RPC_WSS}

# Create an sr25519 account (mnemonic shown once — write it down).
wallet-cli new my-operator

# Print the ss58 address you'll fund + register.
wallet-cli address my-operator`;

const REGISTER_CMD = `wallet-cli register-operator my-operator \\
  --stake ${MIN_STAKE_PLANCKS} \\
  --attestation-hash 0x0000000000000000000000000000000000000000000000000000000000000000 \\
  --rpc-url ${FORGE_RPC_WSS}

# Confirm it landed:
wallet-cli balance my-operator`;

const WORKER_CMD = `git clone ${WORKER_REPO}.git
cd infer-worker-vllm

# Point the worker at a real vLLM OpenAI server (or leave the default
# mock backend to smoke-test wiring without a GPU):
OROGEN_INFER_BACKEND=vllm VLLM_BASE_URL=http://127.0.0.1:8000/v1 \\
  python -m infer_worker_vllm

# In a second process, run the control plane: it sends the RFC-0003
# heartbeat to the gateway every 12s and owns on-chain liveness.
git clone ${CONTROL_PLANE_REPO}.git`;

function faucetCurl(addr: string): string {
  const recipient = addr.trim() || "<your ss58 address>";
  return `curl -X POST ${FAUCET_DRIP_URL} \\
  -H 'Content-Type: application/json' \\
  -d '{"recipient":"${recipient}"}'`;
}

interface StepShellProps {
  index: number;
  name: StepName;
  children: React.ReactNode;
}

function StepCard({ index, name, children }: StepShellProps): JSX.Element {
  return (
    <li className="rounded-lg border border-crust-700 bg-crust-900/40 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-magma-500/50 bg-magma-500/10 font-mono text-sm text-magma-300">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-crust-100">
            {STEP_LABELS[name]}
          </h3>
          <div className="mt-3 space-y-3 text-sm text-crust-300">{children}</div>
        </div>
      </div>
    </li>
  );
}

function FundStep(): JSX.Element {
  const [addr, setAddr] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FaucetResult | null>(null);

  const valid = looksLikeSs58(addr);

  const onDrip = (): void => {
    setResult(null);
    setPending(true);
    void requestFaucetDrip(addr).then((r) => {
      setResult(r);
      setPending(false);
    });
  };

  return (
    <>
      <p>
        Fund the ss58 address from step 2 with {FAUCET_DRIP_OROG} testnet OROG
        from the public faucet. Try the live request below; if your browser
        blocks the cross-origin call, copy the exact curl underneath (it does
        the same POST).
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="5… (ss58 address from wallet-cli address)"
          spellCheck={false}
          className={`${INPUT_CLASSES} font-mono text-xs`}
          aria-label="ss58 address"
        />
        <button
          type="button"
          onClick={onDrip}
          disabled={!valid || pending}
          className={PRIMARY_BTN}
        >
          {pending ? "Requesting…" : "Request OROG"}
        </button>
      </div>
      {addr.trim() && !valid ? (
        <p className="text-xs text-amber-400">
          That doesn&apos;t look like an ss58 address (expect ~47–48 base58
          characters).
        </p>
      ) : null}

      {result?.kind === "ok" ? (
        <div className="rounded-md border border-crystal-500/40 bg-crystal-500/10 p-3 text-xs">
          <p className="font-medium text-crystal-400">
            Sent {result.amount} OROG to {result.recipient}.
          </p>
          <p className="mt-1 break-all font-mono text-crust-300">
            tx: {result.txHash}
          </p>
          <p className="mt-1 text-crust-400">
            Verify with{" "}
            <code className="text-crust-200">wallet-cli balance my-operator</code>.
          </p>
        </div>
      ) : null}

      {result?.kind === "error" ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 p-3 font-mono text-xs text-red-400">
          Faucet error: {result.message}. Use the curl command below instead.
        </p>
      ) : null}

      {result?.kind === "cors-blocked" ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
          The browser blocked the direct faucet call (the faucet has no CORS
          header for this origin yet). This is expected — run the curl below
          from any terminal; it hits the same live endpoint.
        </p>
      ) : null}

      <CodeBlock code={faucetCurl(addr)} label="Or POST it from a terminal" />
    </>
  );
}

export function Quickstart(): JSX.Element {
  return (
    <ol className="space-y-4">
      <StepCard index={0} name="install">
        <p>
          The client is <ExtLink href={WALLET_CLI_REPO}>wallet-cli</ExtLink> — it
          manages the sr25519 operator key and submits on-chain extrinsics.
          Download the{" "}
          <ExtLink href={WALLET_CLI_RELEASE}>v0.1.0-testnet</ExtLink> Linux
          x86_64 build:
        </p>
        <CodeBlock code={INSTALL_CMD} />
        <p className="text-xs text-crust-500">
          Other targets: build from source with{" "}
          <code className="text-crust-300">cargo build --release</code> (see the
          repo README).
        </p>
      </StepCard>

      <StepCard index={1} name="wallet">
        <p>
          Create an account and copy its ss58 address. The mnemonic is printed
          once and never stored in plaintext — record it offline.
        </p>
        <CodeBlock code={WALLET_CMD} />
      </StepCard>

      <StepCard index={2} name="fund">
        <FundStep />
      </StepCard>

      <StepCard index={3} name="register">
        <p>
          Register on-chain via the <code className="text-crust-200">OperatorStake</code>{" "}
          pallet. <code className="text-crust-200">--stake</code> is in plancks;
          MinStake on Forge is{" "}
          <code className="text-crust-200">{MIN_STAKE_PLANCKS}</code> = 1 OROG (12
          decimals). On Forge the attestation service issues mock quotes, so a
          zero attestation hash is accepted.
        </p>
        <CodeBlock code={REGISTER_CMD} />
      </StepCard>

      <StepCard index={4} name="worker">
        <p>
          Run an inference worker and the control plane. The worker exposes an
          OpenAI-compatible endpoint and signs RFC-0001 receipts; the{" "}
          <ExtLink href={CONTROL_PLANE_REPO}>control plane</ExtLink> pushes an
          RFC-0003 heartbeat to the gateway every 12s.
        </p>
        <CodeBlock code={WORKER_CMD} />
        <p className="rounded-md border border-crust-700 bg-crust-900/60 p-3 text-xs text-crust-400">
          Not yet available: a one-line prebuilt container. The{" "}
          <code className="text-crust-300">ghcr.io/orogen-network/infer-worker-vllm</code>{" "}
          image is not published for anonymous pull yet, so today you build the
          worker from source (above). This page will switch to the image pull
          once it ships.
        </p>
        <p>
          Full caveats for the preview testnet are in the{" "}
          <ExtLink href={DOCS_FORGE_URL}>Forge testnet docs</ExtLink>.
        </p>
      </StepCard>
    </ol>
  );
}

export { STEPS };
