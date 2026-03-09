import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GiphyPicker } from "~/components/giphy-picker";
import { renderWithQueryClient } from "~/test-utils";

// Mock the Giphy SDK
vi.mock("@giphy/js-fetch-api", () => ({
  GiphyFetch: vi.fn(function () {
    return {
      search: vi.fn().mockResolvedValue({
        data: [
          {
            id: "gif1",
            images: {
              original: { url: "https://media.giphy.com/media/gif1/giphy.gif" },
            },
          },
          {
            id: "gif2",
            images: {
              original: { url: "https://media.giphy.com/media/gif2/giphy.gif" },
            },
          },
        ],
      }),
      trending: vi.fn().mockResolvedValue({
        data: [
          {
            id: "trending1",
            images: {
              original: {
                url: "https://media.giphy.com/media/trending1/giphy.gif",
              },
            },
          },
        ],
      }),
    };
  }),
}));

describe("GiphyPicker", () => {
  it("shows dialog when open is true", () => {
    renderWithQueryClient(
      <GiphyPicker
        isOpen={true}
        onClose={vi.fn()}
        onSelectGif={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Select a GIF")).toBeInTheDocument();
  });

  it("does not show dialog when open is false", () => {
    renderWithQueryClient(
      <GiphyPicker
        isOpen={false}
        onClose={vi.fn()}
        onSelectGif={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    renderWithQueryClient(
      <GiphyPicker
        isOpen={true}
        onClose={handleClose}
        onSelectGif={vi.fn()}
      />,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("allows searching for GIFs", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <GiphyPicker
        isOpen={true}
        onClose={vi.fn()}
        onSelectGif={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, "cats");

    await waitFor(() => {
      expect(searchInput).toHaveValue("cats");
    });
  });

  it("calls onSelectGif and onClose when a GIF is clicked", async () => {
    const user = userEvent.setup();
    const handleSelectGif = vi.fn();
    const handleClose = vi.fn();

    renderWithQueryClient(
      <GiphyPicker
        isOpen={true}
        onClose={handleClose}
        onSelectGif={handleSelectGif}
      />,
    );

    // Wait for GIFs to load
    await waitFor(() => {
      const gifs = screen.getAllByRole("img");
      expect(gifs.length).toBeGreaterThan(0);
    });

    const firstGif = screen.getAllByRole("img")[0];
    await user.click(firstGif);

    expect(handleSelectGif).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
