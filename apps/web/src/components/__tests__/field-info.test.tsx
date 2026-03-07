import type { AnyFieldApi } from "@tanstack/react-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FieldInfo from "~/components/field-info";

function makeFieldApi(
  overrides: {
    isTouched?: boolean;
    isValid?: boolean;
    isValidating?: boolean;
    errors?: { message: string }[];
  } = {},
): AnyFieldApi {
  return {
    state: {
      meta: {
        isTouched: overrides.isTouched ?? false,
        isValid: overrides.isValid ?? true,
        isValidating: overrides.isValidating ?? false,
        errors: overrides.errors ?? [],
      },
    },
  } as unknown as AnyFieldApi;
}

describe("FieldInfo", () => {
  it("renders nothing when field is untouched", () => {
    const field = makeFieldApi({ isTouched: false, isValid: false });
    const { container } = render(<FieldInfo field={field} />);
    expect(container.textContent).toBe("");
  });

  it("renders nothing when field is valid", () => {
    const field = makeFieldApi({ isTouched: true, isValid: true });
    const { container } = render(<FieldInfo field={field} />);
    expect(container.textContent).toBe("");
  });

  it("renders error messages when touched and invalid", () => {
    const field = makeFieldApi({
      isTouched: true,
      isValid: false,
      errors: [{ message: "Required" }],
    });
    render(<FieldInfo field={field} />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("joins multiple error messages", () => {
    const field = makeFieldApi({
      isTouched: true,
      isValid: false,
      errors: [{ message: "Too short" }, { message: "Invalid format" }],
    });
    render(<FieldInfo field={field} />);
    expect(screen.getByText("Too short, Invalid format")).toBeInTheDocument();
  });

  it("shows validating text when validating", () => {
    const field = makeFieldApi({ isValidating: true });
    render(<FieldInfo field={field} />);
    expect(screen.getByText("Validating...")).toBeInTheDocument();
  });
});
