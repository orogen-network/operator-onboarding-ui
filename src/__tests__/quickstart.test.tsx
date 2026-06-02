import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Quickstart } from "../Quickstart";
import { MIN_STAKE_PLANCKS } from "../config";

describe("Quickstart", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the five real steps", () => {
    render(<Quickstart />);
    for (const label of [
      "Install the client",
      "Create a wallet",
      "Get testnet OROG",
      "Register on-chain",
      "Run the worker",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("shows the real register-operator command with the MinStake plancks", () => {
    render(<Quickstart />);
    expect(
      screen.getByText((t) => t.includes("register-operator") && t.includes(MIN_STAKE_PLANCKS)),
    ).toBeInTheDocument();
  });

  it("disables the faucet button until a valid ss58 is entered", () => {
    render(<Quickstart />);
    const btn = screen.getByRole("button", { name: /request orog/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/ss58 address/i), {
      target: { value: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
    });
    expect(btn.disabled).toBe(false);
  });

  it("surfaces a CORS-block message instead of faking success when the faucet call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    render(<Quickstart />);
    fireEvent.change(screen.getByLabelText(/ss58 address/i), {
      target: { value: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
    });
    fireEvent.click(screen.getByRole("button", { name: /request orog/i }));
    await waitFor(() =>
      expect(screen.getByText(/browser blocked the direct faucet call/i)).toBeInTheDocument(),
    );
  });
});
