import { describe, expect, it } from "vitest";
import { wizardSchema } from "../schema";

describe("wizard schema", () => {
  it("accepts a fully-populated wizard payload", () => {
    const r = wizardSchema.safeParse({
      gpu: { detectedClass: "H100-SXM-80GB", count: 8, driver: "555", cuda: "12.5" },
      tee: { quoteHex: "0x" + "ab".repeat(16), sgxOrSev: "h100-cc" },
      wallet: { ss58: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
      stake: { amount: 5000, currency: "OROG" },
      daemon: { install: true, autoUpdate: false },
    });
    expect(r.success).toBe(true);
  });

  it("rejects a tee quote that is not hex", () => {
    const r = wizardSchema.shape.tee.safeParse({ quoteHex: "not-hex", sgxOrSev: "sgx" });
    expect(r.success).toBe(false);
  });

  it("rejects a gpu count that is zero", () => {
    const r = wizardSchema.shape.gpu.safeParse({
      detectedClass: "H100-SXM-80GB",
      count: 0,
      driver: "1",
      cuda: "1",
    });
    expect(r.success).toBe(false);
  });
});
