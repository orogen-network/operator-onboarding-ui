/**
 * Wizard form schema.
 *
 * Centralised in zod so the same shape can be re-used by the backend bind
 * call (`operator-onboarding-svc`, future) without re-deriving validators.
 */

import { z } from "zod";

export const gpuClasses = ["H100-SXM-80GB", "A100-SXM-80GB", "H200", "L40S", "MI300X"] as const;

export const wizardSchema = z.object({
  gpu: z.object({
    detectedClass: z.enum(gpuClasses),
    count: z.number().int().positive().max(64),
    driver: z.string().min(1),
    cuda: z.string().min(1),
  }),
  tee: z.object({
    quoteHex: z.string().regex(/^0x[0-9a-fA-F]{32,}$/u, "quote must be hex (≥16 bytes)"),
    sgxOrSev: z.enum(["sgx", "sev-snp", "tdx", "h100-cc"]),
  }),
  wallet: z.object({
    ss58: z.string().min(46).max(50),
  }),
  stake: z.object({
    amount: z.number().positive(),
    currency: z.literal("OROG"),
  }),
  daemon: z.object({
    install: z.boolean(),
    autoUpdate: z.boolean(),
  }),
});

export type WizardData = z.infer<typeof wizardSchema>;

export const STEPS = ["gpu", "tee", "wallet", "stake", "daemon"] as const;
export type StepName = (typeof STEPS)[number];
