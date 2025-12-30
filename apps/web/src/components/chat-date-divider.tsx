import { format, isToday, isYesterday } from "date-fns";

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
      className="relative my-4 flex items-center"
      role="separator"
      aria-label={formatDateLabel(date)}
    >
      <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
      <span className="mx-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        {formatDateLabel(date)}
      </span>
      <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
    </div>
  );
}
