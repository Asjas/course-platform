import { Link } from "@tanstack/react-router";
import { BookOpen, Clock } from "lucide-react";

interface CourseCardProps {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  totalLessons: number;
  totalDuration: number;
  progress?: number;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function CourseCard({
  id,
  name,
  description,
  thumbnailUrl,
  totalLessons,
  totalDuration,
  progress = 0,
}: CourseCardProps) {
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: id }}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {name}
        </h3>

        {description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}

        <div className="mb-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>
              {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>

        {progress > 0 && (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {progress}% complete
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
