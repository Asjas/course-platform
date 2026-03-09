import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NumberField } from "~/components/ui/number-field";
import { renderWithProviders } from "~/test-utils";

const { mockUseFieldContext } = vi.hoisted(() => ({
  mockUseFieldContext: vi.fn(),
}));

vi.mock("~/lib/form.context", () => ({
  useFieldContext: mockUseFieldContext,
}));

describe("NumberField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders value from field context", async () => {
    mockUseFieldContext.mockReturnValue({
      state: { value: 42 },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
    });

    await renderWithProviders(<NumberField label="Age" />);

    expect(screen.getByLabelText("Age")).toHaveValue(42);
  });

  it("calls field handlers on input and blur", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleBlur = vi.fn();

    mockUseFieldContext.mockReturnValue({
      state: { value: 1 },
      handleChange,
      handleBlur,
    });

    await renderWithProviders(<NumberField label="Quantity" />);

    const input = screen.getByLabelText("Quantity");
    await user.clear(input);
    await user.type(input, "12");
    await user.tab();

    expect(handleChange).toHaveBeenCalled();
    expect(handleBlur).toHaveBeenCalled();
  });
});
