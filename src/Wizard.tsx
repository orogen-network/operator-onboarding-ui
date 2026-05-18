import { useState } from "react";
import { STEPS, wizardSchema, type StepName, type WizardData } from "./schema";

interface WizardProps {
  onComplete: (data: WizardData) => void;
}

const initial: WizardData = {
  gpu: { detectedClass: "H100-SXM-80GB", count: 1, driver: "555.42.06", cuda: "12.5" },
  tee: { quoteHex: "0x" + "ab".repeat(16), sgxOrSev: "h100-cc" },
  wallet: { ss58: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
  stake: { amount: 5000, currency: "OROG" },
  daemon: { install: true, autoUpdate: true },
};

const STEP_LABELS: Record<StepName, string> = {
  gpu: "GPU detection",
  tee: "TEE attestation",
  wallet: "Operator wallet",
  stake: "Stake bind",
  daemon: "Daemon install",
};

const INPUT_CLASSES =
  "w-full rounded-md border border-crust-700 bg-crust-900 px-3 py-2 text-sm text-crust-100 placeholder:text-crust-500 focus:border-magma-500 focus:outline-none focus:ring-2 focus:ring-magma-500/60";

const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-md bg-magma-500 px-4 py-2 text-sm font-medium text-crust-950 transition-colors hover:bg-magma-400 focus:outline-none focus:ring-2 focus:ring-magma-500/60 focus:ring-offset-2 focus:ring-offset-crust-900 disabled:cursor-not-allowed disabled:opacity-60";

const SECONDARY_BTN =
  "inline-flex items-center justify-center rounded-md border border-crust-700 bg-crust-900 px-4 py-2 text-sm font-medium text-crust-100 transition-colors hover:bg-crust-800 focus:outline-none focus:ring-2 focus:ring-magma-500/60 disabled:cursor-not-allowed disabled:opacity-50";

export function Wizard({ onComplete }: WizardProps): JSX.Element {
  const [step, setStep] = useState<StepName>("gpu");
  const [data, setData] = useState<WizardData>(initial);
  const [errors, setErrors] = useState<string[]>([]);

  const idx = STEPS.indexOf(step);
  const isLast = idx === STEPS.length - 1;

  const validateStep = (s: StepName, d: WizardData): string[] => {
    const result = wizardSchema.shape[s].safeParse(d[s]);
    return result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  };

  const onNext = (): void => {
    const errs = validateStep(step, data);
    setErrors(errs);
    if (errs.length > 0) return;
    if (isLast) {
      const final = wizardSchema.safeParse(data);
      if (!final.success) {
        setErrors(final.error.issues.map((i) => i.message));
        return;
      }
      onComplete(final.data);
    } else {
      setStep(STEPS[idx + 1]);
    }
  };

  const onBack = (): void => {
    setErrors([]);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  return (
    <section aria-label="wizard">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-crust-400">
          <span>
            Step <span className="font-mono tabular-nums text-magma-400">{idx + 1}</span> of{" "}
            <span className="font-mono tabular-nums">{STEPS.length}</span>
          </span>
          <span className="font-mono tabular-nums text-crust-300">
            {Math.round(((idx + 1) / STEPS.length) * 100)}%
          </span>
        </div>
        <progress
          value={idx + 1}
          max={STEPS.length}
          className="block h-1 w-full overflow-hidden rounded bg-crust-800 [&::-moz-progress-bar]:bg-magma-500 [&::-webkit-progress-bar]:bg-crust-800 [&::-webkit-progress-value]:bg-magma-500"
        />
        <ol className="mt-3 flex flex-wrap gap-2 text-xs">
          {STEPS.map((s, i) => {
            const state =
              i < idx ? "done" : i === idx ? "current" : "upcoming";
            const styles =
              state === "current"
                ? "border-magma-500/60 bg-magma-500/10 text-magma-300"
                : state === "done"
                ? "border-crystal-500/40 bg-crystal-500/5 text-crystal-500"
                : "border-crust-700 bg-crust-900/40 text-crust-400";
            return (
              <li
                key={s}
                className={`rounded border px-2 py-0.5 font-mono uppercase tracking-[0.12em] ${styles}`}
              >
                {i + 1}. {s}
              </li>
            );
          })}
        </ol>
      </div>

      <h2 className="text-lg font-semibold text-crust-100">
        Step {idx + 1} of {STEPS.length}:{" "}
        <span data-testid="step-name" className="font-mono text-magma-400">
          {step}
        </span>
        <span className="ml-2 text-sm font-normal text-crust-400">— {STEP_LABELS[step]}</span>
      </h2>

      <div className="mt-4">
        {step === "gpu" ? <GpuStep data={data} setData={setData} /> : null}
        {step === "tee" ? <TeeStep data={data} setData={setData} /> : null}
        {step === "wallet" ? <WalletStep data={data} setData={setData} /> : null}
        {step === "stake" ? <StakeStep data={data} setData={setData} /> : null}
        {step === "daemon" ? <DaemonStep data={data} setData={setData} /> : null}
      </div>

      {errors.length > 0 ? (
        <ul
          role="alert"
          className="mt-4 list-disc space-y-1 rounded-md border border-red-500/40 bg-red-500/10 pl-8 pr-3 py-2 font-mono text-sm text-red-400"
        >
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex items-center gap-3 border-t border-crust-800 pt-4">
        <button type="button" onClick={onBack} disabled={idx === 0} className={SECONDARY_BTN}>
          Back
        </button>
        <button type="button" onClick={onNext} className={PRIMARY_BTN}>
          {isLast ? "Finish" : "Next"}
        </button>
      </div>
    </section>
  );
}

interface StepFormProps {
  data: WizardData;
  setData: (d: WizardData) => void;
}

const FIELDSET_CLASSES =
  "rounded-md border border-crust-700 bg-crust-900/40 p-4 space-y-3";
const LEGEND_CLASSES =
  "px-1 text-xs font-medium uppercase tracking-[0.18em] text-magma-400";
const LABEL_CLASSES = "block";
const LABEL_TEXT = "mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-crust-400";

function GpuStep({ data, setData }: StepFormProps): JSX.Element {
  return (
    <fieldset className={FIELDSET_CLASSES}>
      <legend className={LEGEND_CLASSES}>GPU</legend>
      <label className={LABEL_CLASSES}>
        <span className={LABEL_TEXT}>Class</span>
        <input
          value={data.gpu.detectedClass}
          onChange={(e) =>
            setData({
              ...data,
              gpu: { ...data.gpu, detectedClass: e.target.value as WizardData["gpu"]["detectedClass"] },
            })
          }
          className={`${INPUT_CLASSES} font-mono`}
        />
      </label>
      <label className={LABEL_CLASSES}>
        <span className={LABEL_TEXT}>Count</span>
        <input
          type="number"
          value={data.gpu.count}
          onChange={(e) =>
            setData({ ...data, gpu: { ...data.gpu, count: Number(e.target.value) } })
          }
          className={`${INPUT_CLASSES} font-mono tabular-nums`}
        />
      </label>
    </fieldset>
  );
}

function TeeStep({ data, setData }: StepFormProps): JSX.Element {
  return (
    <fieldset className={FIELDSET_CLASSES}>
      <legend className={LEGEND_CLASSES}>TEE quote</legend>
      <label className={LABEL_CLASSES}>
        <span className={LABEL_TEXT}>Quote (hex)</span>
        <input
          value={data.tee.quoteHex}
          onChange={(e) => setData({ ...data, tee: { ...data.tee, quoteHex: e.target.value } })}
          className={`${INPUT_CLASSES} font-mono text-xs`}
          spellCheck={false}
        />
      </label>
    </fieldset>
  );
}

function WalletStep({ data, setData }: StepFormProps): JSX.Element {
  return (
    <fieldset className={FIELDSET_CLASSES}>
      <legend className={LEGEND_CLASSES}>Operator wallet</legend>
      <label className={LABEL_CLASSES}>
        <span className={LABEL_TEXT}>SS58 address</span>
        <input
          value={data.wallet.ss58}
          onChange={(e) => setData({ ...data, wallet: { ...data.wallet, ss58: e.target.value } })}
          className={`${INPUT_CLASSES} font-mono text-xs`}
          spellCheck={false}
        />
      </label>
    </fieldset>
  );
}

function StakeStep({ data, setData }: StepFormProps): JSX.Element {
  return (
    <fieldset className={FIELDSET_CLASSES}>
      <legend className={LEGEND_CLASSES}>Stake bind</legend>
      <label className={LABEL_CLASSES}>
        <span className={LABEL_TEXT}>Amount (OROG)</span>
        <input
          type="number"
          value={data.stake.amount}
          onChange={(e) =>
            setData({ ...data, stake: { ...data.stake, amount: Number(e.target.value) } })
          }
          className={`${INPUT_CLASSES} font-mono tabular-nums`}
        />
      </label>
    </fieldset>
  );
}

function DaemonStep({ data, setData }: StepFormProps): JSX.Element {
  return (
    <fieldset className={FIELDSET_CLASSES}>
      <legend className={LEGEND_CLASSES}>Daemon install</legend>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-crust-100">
        <input
          type="checkbox"
          checked={data.daemon.install}
          onChange={(e) =>
            setData({ ...data, daemon: { ...data.daemon, install: e.target.checked } })
          }
          className="h-4 w-4 rounded border-crust-700 bg-crust-900 text-magma-500 accent-magma-500 focus:outline-none focus:ring-2 focus:ring-magma-500/60"
        />
        Install systemd service
      </label>
    </fieldset>
  );
}
