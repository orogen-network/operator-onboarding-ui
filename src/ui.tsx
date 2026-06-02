import { useCallback, useState } from "react";

export const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-md bg-magma-500 px-4 py-2 text-sm font-medium text-crust-950 transition-colors hover:bg-magma-400 focus:outline-none focus:ring-2 focus:ring-magma-500/60 focus:ring-offset-2 focus:ring-offset-crust-900 disabled:cursor-not-allowed disabled:opacity-60";

export const SECONDARY_BTN =
  "inline-flex items-center justify-center rounded-md border border-crust-700 bg-crust-900 px-4 py-2 text-sm font-medium text-crust-100 transition-colors hover:bg-crust-800 focus:outline-none focus:ring-2 focus:ring-magma-500/60 disabled:cursor-not-allowed disabled:opacity-50";

export const INPUT_CLASSES =
  "w-full rounded-md border border-crust-700 bg-crust-900 px-3 py-2 text-sm text-crust-100 placeholder:text-crust-500 focus:border-magma-500 focus:outline-none focus:ring-2 focus:ring-magma-500/60";

/** Code block with a copy-to-clipboard button. */
export function CodeBlock({ code, label }: { code: string; label?: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    void navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => undefined,
    );
  }, [code]);

  return (
    <div className="relative">
      {label ? (
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-crust-400">
          {label}
        </p>
      ) : null}
      <pre className="pre-block whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
        {code}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 rounded border border-crust-700 bg-crust-900/90 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-crust-300 transition-colors hover:bg-crust-800 hover:text-crust-100"
        aria-label="Copy to clipboard"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

export function ExtLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-magma-400 no-underline hover:text-magma-300"
    >
      {children}
    </a>
  );
}
