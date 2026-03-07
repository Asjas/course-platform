import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, Layers, TicketIcon, Users } from "lucide-react";

interface CourseCardProps {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  totalModules: number;
  totalLessons: number;
  totalDuration: number;
  totalEnrollments: number;
  supportTicketCount?: number;
  progress?: number;
}

export function formatDuration(seconds: number): string {
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
  totalModules,
  totalLessons,
  totalDuration,
  totalEnrollments,
  supportTicketCount,
  progress = 0,
}: CourseCardProps) {
  return (
    <Link
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      to="/courses/$courseId"
      params={{ courseId: id }}
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
        {thumbnailUrl ? (
          <img
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            src={thumbnailUrl}
            alt={name}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen
              className="h-16 w-16 text-gray-400"
              aria-hidden="true"
            />
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

        <div className="mb-3 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Layers
              className="h-4 w-4"
              aria-hidden="true"
            />
            <span>
              {totalModules} {totalModules === 1 ? "module" : "modules"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen
              className="h-4 w-4"
              aria-hidden="true"
            />
            <span>
              {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock
              className="h-4 w-4"
              aria-hidden="true"
            />
            <span>{formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users
              className="h-4 w-4"
              aria-hidden="true"
            />
            <span>
              {totalEnrollments}{" "}
              {totalEnrollments === 1 ? "student" : "students"}
            </span>
          </div>
          {supportTicketCount !== undefined && (
            <div className="flex items-center gap-1">
              <TicketIcon
                className="h-4 w-4"
                aria-hidden="true"
              />
              <span>
                {supportTicketCount}{" "}
                {supportTicketCount === 1 ? "ticket" : "tickets"}
              </span>
            </div>
          )}
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
