import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TextField } from "~/components/ui/text-field";
import { renderWithProviders } from "~/test-utils";

const { mockUseFieldContext } = vi.hoisted(() => ({
  mockUseFieldContext: vi.fn(),
}));

vi.mock("~/lib/form.context", () => ({
  useFieldContext: mockUseFieldContext,
}));

describe("TextField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current text value", async () => {
    mockUseFieldContext.mockReturnValue({
      state: { value: "Initial title" },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
    });

    await renderWithProviders(<TextField label="Title" />);

    expect(screen.getByLabelText("Title")).toHaveValue("Initial title");
  });

  it("calls field handlers when typing and blurring", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleBlur = vi.fn();

    mockUseFieldContext.mockReturnValue({
      state: { value: "" },
      handleChange,
      handleBlur,
    });

    await renderWithProviders(<TextField label="Search" />);

    const input = screen.getByLabelText("Search");
    await user.type(input, "course");
    await user.tab();

    expect(handleChange).toHaveBeenCalled();
    expect(handleBlur).toHaveBeenCalled();
  });
});
