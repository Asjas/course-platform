import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { AdminCourseDetail } from "~/lib/db.collections";

interface EditCourseSheetProps {
  course: AdminCourseDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCourseSheet({
  course,
  open,
  onOpenChange,
}: EditCourseSheetProps) {
  if (!course) {
    return null;
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="w-full max-w-3xl overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Manage Course: {course.name}</SheetTitle>
          <SheetDescription>
            View course details and manage modules and lessons.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Course Details
            </h3>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {course.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Slug
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  <code className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-600/75">
                    {course.slug}
                  </code>
                </dd>
              </div>
              {course.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {course.description}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Level
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {course.level}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Price
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {course.isFree ? (
                    <span className="text-green-600 dark:text-green-400">
                      Free
                    </span>
                  ) : (
                    <span>
                      ${course.price}
                      {course.isSaleActive && course.salePrice > 0 && (
                        <span className="ml-2 text-red-600 dark:text-red-400">
                          (Sale: ${course.salePrice})
                        </span>
                      )}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {course.published ? (
                    <span className="text-green-600 dark:text-green-400">
                      Published
                    </span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">
                      Draft
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t pt-6 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Modules & Lessons
            </h3>
            {course.modules && course.modules.length > 0 ? (
              <div className="mt-4 space-y-4">
                {course.modules
                  .sort((a, b) => a.order - b.order)
                  .map((module) => (
                    <div
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      key={module.id}
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {module.order + 1}. {module.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {module.description}
                      </p>
                      {"lessons" in module &&
                        Array.isArray(module.lessons) &&
                        module.lessons.length > 0 && (
                          <ul className="mt-3 ml-4 space-y-1">
                            {(
                              module.lessons as {
                                id: string;
                                order: number;
                                title: string;
                              }[]
                            )
                              .sort((a, b) => a.order - b.order)
                              .map((lesson) => (
                                <li
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                  key={lesson.id}
                                >
                                  {lesson.order + 1}. {lesson.title}
                                </li>
                              ))}
                          </ul>
                        )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                No modules added yet.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-6 dark:border-gray-700">
            <button
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Close
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
