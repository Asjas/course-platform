import type { EditorTab } from "../types";
import { cn } from "~/lib/utils";

interface EditorTabsProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  isPreviewLoading: boolean;
}

export function EditorTabs({
  activeTab,
  onTabChange,
  isPreviewLoading,
}: EditorTabsProps) {
  return (
    <div className="-mb-px pt-2.5">
      <button
        className={cn(
          "ml-2 flex-1 cursor-pointer px-4 py-2 text-sm font-medium",
          activeTab === "write"
            ? "rounded-t-md border-t border-r border-b-0 border-l border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            : "border-gray-300 bg-gray-200 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
        )}
        type="button"
        onClick={() => onTabChange("write")}
      >
        Write
      </button>
      <button
        className={cn(
          "flex-1 cursor-pointer px-4 py-2 text-sm font-medium",
          activeTab === "preview"
            ? "rounded-t-md border-t border-r border-b-0 border-l border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            : "border-gray-300 bg-gray-200 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
        )}
        type="button"
        onClick={() => onTabChange("preview")}
      >
        Preview
        {isPreviewLoading && <span className="ml-1">⟳</span>}
      </button>
    </div>
  );
}
