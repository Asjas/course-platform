import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlockWithCopy({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy code");
    }
  }

  return (
    <div className="group relative">
      <button
        className="absolute top-2 right-2 rounded-md bg-gray-700 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
        onClick={copyToClipboard}
        aria-label="Copy code"
        type="button"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </button>
      {language && (
        <div className="absolute top-2 left-3 text-xs font-medium text-gray-400 dark:text-gray-500">
          {language}
        </div>
      )}
    </div>
  );
}
