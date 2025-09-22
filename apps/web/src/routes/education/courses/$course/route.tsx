import { Outlet, createFileRoute } from "@tanstack/react-router";
import InstructorCard from "~/components/instructor-card";
import { capitalizeFirstLetter } from "~/lib/utils";

export const Route = createFileRoute("/education/courses/$course")({
  component: CourseLayout,
});

function CourseLayout() {
  const { course } = Route.useParams() as { course: string };

  const courseName = course.split("-").map(capitalizeFirstLetter).join(" ");

  return (
    <main className="min-h-screen flex-1 overflow-hidden px-6">
      <div className="overflow-y-auto">
        <div className="relative min-h-screen">
          <div className="mx-auto max-w-7xl px-4 py-12">
            {/* 2 Column Grid Layout */}
            <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-10">
              {/* Left Column */}
              <div className="lg:col-span-7">
                <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl">
                  {courseName}
                </h1>
                <Outlet />
              </div>
              {/* Right Column */}
              <div className="space-y-6 lg:col-span-3">
                {/* Course Card */}
                <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-2xl">
                  <div className="relative aspect-video w-full bg-gray-700">
                    <img
                      className="object-fit h-full w-full opacity-80"
                      alt="Vim"
                      src="/fastify-white.svg"
                    />

                    <div className="absolute bottom-3 left-3 rounded bg-gray-900/80 px-2 py-1 text-sm font-medium text-white">
                      125 min
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6 space-y-3 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 715.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218.51-4.5 1.385V5.804zM10 1.91C8.755.828 7.153.25 5.5.25 3.587.25 1.774 1.053 0 2.443v13.012c1.543-.826 3.182-1.205 4.5-1.205 1.669 0 3.218.51 4.5 1.385 1.282-.875 2.831-1.385 4.5-1.385 1.318 0 2.957.379 4.5 1.205V2.443C16.226 1.053 14.413.25 12.5.25c-1.653 0-3.255.578-4.5 1.66z"></path>
                        </svg>
                        <span>25 lessons</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span>All levels</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                        <span>125 minutes total</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 715-5z"></path>
                        </svg>
                        <span>421 students enrolled</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 16a3 3 0 11-6 0 3 3 0 016 0zM19 16a3 3 0 11-6 0 3 3 0 616 0z"></path>
                        </svg>
                        <span>Updated about 2 months ago</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <a
                        className="block w-full rounded-lg bg-green-500 px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-green-600"
                        href="/education/courses/neovim-for-newbs/chapters/getting-started-with-neovim/lessons/bee12ff5-66d5-4cc0-ad79-a3635a89fdca"
                      >
                        Start Learning →
                      </a>
                    </div>
                  </div>
                </div>
                {/* Instructor Card */}
                <InstructorCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
