import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  Play,
  Star,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { CoursesCollection, useCourseById } from "~/lib/db.collections";
import { trpcClient } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  component: CourseDetailPage,
  loader: async ({ params }) => {
    await CoursesCollection.preload();
    // If the course with full details isn't in collection, fetch it
    const courseInCollection = CoursesCollection.findOne(params.courseId);
    if (!courseInCollection?.modules) {
      const fullCourse = await trpcClient.courses.getById.query({
        courseId: params.courseId,
      });
      // Update the collection with full course details
      if (fullCourse) {
        CoursesCollection.upsert(fullCourse);
      }
    }
  },
});

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const { data: course, isLoading } = useCourseById({ courseId });
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p>Course not found</p>
      </div>
    );
  }

  // Calculate counts
  const moduleCount = course.modules?.length || 0;
  const lessonCount = course.totalLessons || 0;

  // Mock data for now - these would come from the backend
  const courseProgress = 45; // percentage
  const currentRating = 4.5; // out of 5
  const ratingCount = 127;

  const handleRatingSubmit = () => {
    // TODO: Implement rating submission via tRPC
    console.log("Rating:", rating, "Comment:", reviewComment);
    setIsRatingSheetOpen(false);
    setRating(0);
    setReviewComment("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        to="/dashboard"
      >
        <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
        Back to Courses
      </Link>

      <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">
        {course.name}
      </h1>

      {course.description && (
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          {course.description}
        </p>
      )}

      {/* Main Layout with Sidebar */}
      <div className="sidebar grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: Modules and Lessons (Scrollable) */}
        <div className="flex flex-col overflow-hidden">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Course Content
          </h2>

          <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {course.modules && course.modules.length > 0 ? (
              <div>
                {course.modules
                  .sort((a, b) => a.order - b.order)
                  .map((module, index) => (
                    <div
                      className={cn(
                        "border-b border-gray-200 dark:border-gray-700",
                        course.modules &&
                          index === course.modules.length - 1 &&
                          "border-b-0",
                      )}
                      key={module.id}
                    >
                      <div className="bg-gray-50 p-4 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {module.description}
                          </p>
                        )}
                      </div>

                      {module.lessons && module.lessons.length > 0 && (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {module.lessons
                            .sort((a, b) => a.order - b.order)
                            .map((lesson) => (
                              <li key={lesson.id}>
                                <Link
                                  className="flex items-center gap-3 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                                  to="/courses/$courseId/lessons/$lessonId"
                                  params={{
                                    courseId: course.id,
                                    lessonId: lesson.id,
                                  }}
                                >
                                  <Play className="h-5 w-5 shrink-0 text-green-600" />
                                  <span className="grow text-gray-900 dark:text-white">
                                    {lesson.title}
                                  </span>
                                  {lesson.duration && (
                                    <span className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                                      {formatDuration(lesson.duration)}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                No modules available yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Course Info Card (Static) */}
        <div className="flex flex-col gap-6">
          {/* Course Thumbnail */}
          {course.thumbnailUrl && (
            <div className="overflow-hidden rounded-lg">
              <img
                className="h-auto w-full"
                src={course.thumbnailUrl}
                alt={course.name}
              />
            </div>
          )}

          {/* Course Stats Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Course Details
            </h3>

            <div className="space-y-4">
              {/* Modules and Lessons Count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm">Modules</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {moduleCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Play className="h-5 w-5" />
                  <span className="text-sm">Lessons</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {lessonCount}
                </span>
              </div>

              {/* Time to Complete */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDuration(course.totalDuration)}
                </span>
              </div>

              {/* Progress */}
              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">Progress</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {courseProgress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                {/* Certificate Link */}
                <Link
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  to="/certificate/$courseId"
                  params={{ courseId }}
                >
                  <Award className="h-4 w-4" />
                  View Certificate
                </Link>

                {/* Rating */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({ratingCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Leave Rating Button */}
                <button
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
                  onClick={() => setIsRatingSheetOpen(true)}
                >
                  Leave a Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Sheet */}
      <Sheet
        open={isRatingSheetOpen}
        onOpenChange={setIsRatingSheetOpen}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Rate this Course</SheetTitle>
            <SheetDescription>
              Share your experience with this course. Your review may be
              published on learnfastify.com.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Star Rating */}
            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                id="rating-label"
              >
                Rating
              </label>
              <div
                className="flex gap-2"
                role="group"
                aria-labelledby="rating-label"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    className="transition-transform hover:scale-110"
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        (hoverRating || rating) >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600",
                      )}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  You rated this course {rating} out of 5 stars
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                htmlFor="review-comment"
              >
                Your Review (Optional)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                id="review-comment"
                rows={6}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us about your experience with this course..."
              />
            </div>

            {/* Notice */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> Your review may be published on our
                marketing website at learnfastify.com to help other students.
              </p>
            </div>

            {/* Submit Button */}
            <button
              className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
              onClick={handleRatingSubmit}
              disabled={rating === 0}
            >
              Submit Rating
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
