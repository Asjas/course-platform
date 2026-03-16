import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GiphyPicker } from "~/components/giphy-picker";
import { renderWithQueryClient } from "~/test-utils";

interface MockGif {
  id: string;
  title: string;
  images: {
    original: { url: string };
    fixed_width: { url: string };
  };
}

const giphyFixtures: MockGif[] = [
  {
    id: "gif-cat-1",
    title: "cat dance",
    images: {
      original: { url: "https://media.giphy.com/media/catdance/giphy.gif" },
      fixed_width: {
        url: "https://media.giphy.com/media/catdance/200w.gif",
      },
    },
  },
  {
    id: "gif-cat-2",
    title: "cat wave",
    images: {
      original: { url: "https://media.giphy.com/media/catwave/giphy.gif" },
      fixed_width: {
        url: "https://media.giphy.com/media/catwave/200w.gif",
      },
    },
  },
  {
    id: "gif-dog-1",
    title: "dog happy",
    images: {
      original: { url: "https://media.giphy.com/media/doghappy/giphy.gif" },
      fixed_width: {
        url: "https://media.giphy.com/media/doghappy/200w.gif",
      },
    },
  },
];

function searchFixtures(query: string): MockGif[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return giphyFixtures;
  }

  return giphyFixtures.filter((gif) =>
    gif.title.toLowerCase().includes(trimmed),
  );
}

// Mock the Giphy SDK
vi.mock("@giphy/js-fetch-api", () => ({
  GiphyFetch: vi.fn(function () {
    return {
      search: vi.fn(async (query: string) => ({
        data: searchFixtures(query),
      })),
      trending: vi.fn(async () => ({
        data: giphyFixtures,
      })),
    };
  }),
}));

describe("GiphyPicker", () => {
  it("shows dialog when open is true", async () => {
    renderWithQueryClient(
      <GiphyPicker
        isOpen={true}
        onClose={vi.fn()}
        onSelectGif={vi.fn()}
      />,
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("Select a GIF")).toBeInTheDocument();
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

    // Wait for GIFs to load and click the first GIF result.
    const gifButtons = await screen.findAllByRole("button", {
      name: /gif/i,
    });
    await user.click(gifButtons[0]);

    expect(handleSelectGif).toHaveBeenCalledWith(
      "https://media.giphy.com/media/catdance/giphy.gif",
    );
    expect(handleClose).toHaveBeenCalled();
  });
});
