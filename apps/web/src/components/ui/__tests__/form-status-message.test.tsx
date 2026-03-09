import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormStatusMessage from "~/components/ui/form-status-message";
import { renderWithProviders } from "~/test-utils";

describe("FormStatusMessage", () => {
  it("renders success message when statusMessage is present", async () => {
    await renderWithProviders(
      <FormStatusMessage
        statusMessage="Saved successfully"
        serverError={null}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully");
  });

  it("renders server error message when no statusMessage exists", async () => {
    await renderWithProviders(
      <FormStatusMessage
        statusMessage={null}
        serverError="Server is unavailable"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Server is unavailable",
    );
  });

  it("renders an empty status region when both values are absent", async () => {
    await renderWithProviders(
      <FormStatusMessage
        statusMessage={null}
        serverError={null}
      />,
    );

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
