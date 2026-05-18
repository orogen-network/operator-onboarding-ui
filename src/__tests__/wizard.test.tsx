import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Wizard } from "../Wizard";

describe("wizard navigation", () => {
  it("advances through all five steps and calls onComplete with valid data", () => {
    const onComplete = vi.fn();
    render(<Wizard onComplete={onComplete} />);
    expect(screen.getByTestId("step-name").textContent).toBe("gpu");

    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
    }
    expect(screen.getByTestId("step-name").textContent).toBe("daemon");
    fireEvent.click(screen.getByRole("button", { name: /finish/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("back button is disabled on the first step", () => {
    render(<Wizard onComplete={() => undefined} />);
    const back = screen.getByRole("button", { name: /back/i }) as HTMLButtonElement;
    expect(back.disabled).toBe(true);
  });

  it("renders validation errors when a field is invalid", () => {
    render(<Wizard onComplete={() => undefined} />);
    // Advance to TEE step and enter a bad quote.
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByTestId("step-name").textContent).toBe("tee");
    const input = screen.getAllByRole("textbox")[0] as HTMLInputElement;
    fireEvent.change(input, { target: { value: "not-hex" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
