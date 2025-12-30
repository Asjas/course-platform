import { GiphyFetch } from "@giphy/js-fetch-api";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const giphyFetch = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY);

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

  const {
    data: gifsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["giphy", searchTerm] as const,
    queryFn: async () => {
      if (searchTerm) {
        return giphyFetch.search(searchTerm, {
          offset: 0,
          limit: 20,
          rating: "pg-13",
        });
      }
      return giphyFetch.trending({
        offset: 0,
        limit: 20,
        rating: "pg-13",
      });
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load GIFs. Please try again.");
    }
  }, [error]);

  function handleGifClick(gifUrl: string) {
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
              className="cursor-pointer rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
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

          <div className="custom-scrollbar max-h-96 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading GIFs...
                </div>
              </div>
            ) : gifsData && gifsData.data.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 p-2">
                {gifsData.data.map((gif) => (
                  <button
                    className="overflow-hidden rounded-md transition-transform hover:scale-105"
                    key={gif.id}
                    onClick={() => handleGifClick(gif.images.original.url)}
                    type="button"
                  >
                    <img
                      className="size-full object-cover"
                      src={gif.images.fixed_width.url}
                      alt="GIF"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No GIFs found
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex w-full items-center justify-center">
            <a
              className="inline-flex items-center justify-center"
              href="https://giphy.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="h-12"
                src="/PoweredBy_640_Horizontal_Light-Backgrounds_With_Logo.gif"
                alt="Powered by GIPHY"
                loading="lazy"
              />
            </a>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
