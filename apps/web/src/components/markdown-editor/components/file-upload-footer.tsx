import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@packages/shared-ui/components/tooltip";
import { InfoIcon } from "lucide-react";
import {
  getAcceptString,
  getSupportedFileTypesDescription,
} from "~/lib/attachments";

interface FileUploadFooterProps {
  uploadingCount: number;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadFooter({
  uploadingCount,
  onFileSelect,
}: FileUploadFooterProps) {
  return (
    <div className="col-span-full flex items-center justify-between gap-4 border-t border-gray-300 bg-gray-200 px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
      <label className="relative inline-block w-full cursor-pointer hover:underline">
        {/* Hidden native file input */}
        <input
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          type="file"
          accept={getAcceptString()}
          multiple
          disabled={uploadingCount > 0}
          onChange={onFileSelect}
        />

        {/* Custom button — looks like GitHub */}
        <span>
          {uploadingCount > 0
            ? `Uploading... (${uploadingCount})`
            : "Paste, drop, or click to add files."}
        </span>
      </label>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex items-center gap-1 whitespace-nowrap text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              type="button"
              aria-label="View supported file types"
            >
              <InfoIcon
                size={14}
                aria-hidden={true}
              />
              <span className="hidden sm:inline">Supported file types</span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            className="max-w-xs text-left whitespace-pre-line"
            side="top"
          >
            <p className="font-semibold">Supported file types:</p>
            <p className="mt-1 text-xs opacity-90">
              {getSupportedFileTypesDescription()}
            </p>
          </TooltipContent>
        </Tooltip>
        <a
          className="text-gray-900 hover:text-green-600 dark:text-white"
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
        >
          <svg
            fill="currentColor"
            aria-hidden="true"
            height="18"
            viewBox="0 0 16 16"
            version="1.1"
            width="18"
          >
            <path d="M14.85 3c.63 0 1.15.52 1.14 1.15v7.7c0 .63-.51 1.15-1.15 1.15H1.15C.52 13 0 12.48 0 11.84V4.15C0 3.52.52 3 1.15 3ZM9 11V5H7L5.5 7 4 5H2v6h2V8l1.5 1.92L7 8v3Zm2.99.5L14.5 8H13V5h-2v3H9.5Z"></path>
          </svg>
        </a>
      </div>
    </div>
  );
}
