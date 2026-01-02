import { cn } from "~/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "mt-12 flex min-h-100 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
        className,
      )}
    >
      <div className="text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">{title}</p>
        {description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
