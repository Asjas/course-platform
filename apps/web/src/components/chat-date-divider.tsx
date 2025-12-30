import { format, isToday, isYesterday } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

interface ChatDateDividerProps {
  date: Date;
}

function formatDateLabel(d: Date): string {
  if (isToday(d)) {
    return "Today";
  }
  if (isYesterday(d)) {
    return "Yesterday";
  }
  return format(d, "MMMM do, yyyy");
}

export function ChatDateDivider({ date }: ChatDateDividerProps) {
  return (
    <div
      className="relative my-4 flex items-center justify-center"
      role="separator"
      aria-label={formatDateLabel(date)}
    >
      {/* Horizontal divider line - left */}
      <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />

      {/* Date pill - centered like Slack */}
      <div className="mx-4 flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
        <span>{formatDateLabel(date)}</span>
        <ChevronDownIcon
          className="text-gray-400"
          size={12}
          aria-hidden="true"
        />
      </div>

      {/* Horizontal divider line - right */}
      <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
    </div>
  );
}
