import { describe, expect, it, vi } from "vitest";
import { Toaster } from "~/components/ui/sonner";
import { renderWithProviders } from "~/test-utils";

const { mockSonner } = vi.hoisted(() => ({
  mockSonner: vi.fn((props: unknown) => {
    void props;
    return null;
  }),
}));

vi.mock("sonner", () => ({
  Toaster: mockSonner,
}));

describe("Toaster", () => {
  it("passes expected default props to Sonner", async () => {
    await renderWithProviders(<Toaster />);

    expect(mockSonner).toHaveBeenCalled();
    const firstCall = mockSonner.mock.calls[0];
    expect(firstCall).toBeDefined();

    const firstCallProps = firstCall?.[0] as {
      closeButton: boolean;
      richColors: boolean;
      position: string;
      offset: { top: string };
      mobileOffset: { top: string };
      icons: Record<string, unknown>;
    };

    expect(firstCallProps.closeButton).toBe(true);
    expect(firstCallProps.richColors).toBe(true);
    expect(firstCallProps.position).toBe("top-right");
    expect(firstCallProps.offset).toEqual({ top: "100px" });
    expect(firstCallProps.mobileOffset).toEqual({ top: "20px" });
    expect(firstCallProps.icons).toBeDefined();
  });
});
