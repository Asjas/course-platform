import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";

// Initialize Giphy Fetch with API key from environment
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || ""; // Using public Giphy SDK key
const gf = new GiphyFetch(GIPHY_API_KEY);

// Type for a GIF from the Giphy SDK
interface GiphyGif {
  id: string | number;
  images: {
    original: {
      url: string;
    };
  };
}

interface GiphyPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

export function GiphyPicker({
  isOpen,
  onClose,
  onSelectGif,
}: GiphyPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGifs = (offset: number) => {
    if (searchTerm) {
      return gf.search(searchTerm, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  function handleGifClick(
    gif: GiphyGif,
    e: React.SyntheticEvent<HTMLElement, Event>,
  ) {
    e.preventDefault();
    const gifUrl = gif.images.original.url;
    onSelectGif(gifUrl);
    onClose();
  }

  return (
    <Dialog
      className="relative z-50"
      open={isOpen}
      onClose={onClose}
    >
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Select a GIF
            </DialogTitle>
            <button
              className="rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={onClose}
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                type="text"
                placeholder="Search for GIFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
            {GIPHY_API_KEY ? (
              <Grid
                key={searchTerm}
                width={560}
                columns={3}
                gutter={6}
                fetchGifs={fetchGifs}
                onGifClick={handleGifClick}
              />
            ) : (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2 font-medium">Giphy API Key Not Configured</p>
                <p className="text-xs">
                  Set VITE_GIPHY_API_KEY in your .env file to enable GIF search.
                </p>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Get a free API key at{" "}
                  <a
                    className="text-green-600 hover:underline dark:text-green-400"
                    href="https://developers.giphy.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    developers.giphy.com
                  </a>
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>Powered by GIPHY</p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
