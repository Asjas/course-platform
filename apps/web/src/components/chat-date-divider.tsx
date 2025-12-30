import { format, isToday, isYesterday } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

interface ChatDateDividerProps {
  date: Date;
}

export default function ChatDateDivider({ date }: ChatDateDividerProps) {
  function formatDateLabel(d: Date): string {
    if (isToday(d)) {
      return "Today";
    }
    if (isYesterday(d)) {
      return "Yesterday";
    }
    return format(d, "MMMM do, yyyy");
  }

  return (
    <div
      className="relative my-3 flex items-center"
      role="separator"
      aria-label={formatDateLabel(date)}
    >
      {/* Horizontal divider line */}
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />

      {/* Date pill - right aligned like Slack */}
      <div className="ml-4 flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <span>{formatDateLabel(date)}</span>
        <ChevronDownIcon
          className="text-gray-400"
          size={12}
        />
      </div>
    </div>
  );
}
