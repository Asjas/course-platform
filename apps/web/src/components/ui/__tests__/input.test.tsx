import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckboxInput, Input } from "~/components/ui/input";
import { renderWithProviders } from "~/test-utils";

describe("Input", () => {
  it("renders text input and reports validation state with errors", async () => {
    const handleChange = vi.fn();

    await renderWithProviders(
      <Input
        id="email"
        type="text"
        placeholder="Email"
        autoComplete="email"
        errorType="email-error"
        state={{
          value: "",
          meta: {
            errors: [{ message: "Email is required" }] as never,
          },
        }}
        handleChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("toggles password visibility when show/hide button is pressed", async () => {
    const user = userEvent.setup();

    await renderWithProviders(
      <Input
        id="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        errorType="password-error"
        state={{
          value: "secret",
          meta: {
            errors: [] as never,
          },
        }}
        handleChange={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });
});

describe("CheckboxInput", () => {
  it("calls handleChange with the checked state", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    await renderWithProviders(
      <CheckboxInput
        id="terms"
        value={false}
        handleChange={handleChange}
      />,
    );

    await user.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
