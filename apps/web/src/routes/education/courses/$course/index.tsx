import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/education/courses/$course/")({
  component: CoursePage,
});

function CoursePage() {
  return (
    <div>
      <p className="mb-12 text-xl leading-relaxed text-gray-300">
        Learn how to use the Fastify framework to create APIs and full-stack
        websites.
      </p>
      {/* Course content */}
      <div className="mt-12 mb-16">
        <h2 className="mb-8 text-2xl font-bold text-white">Course Content</h2>
        <div className="overflow-hidden rounded-lg border border-gray-800">
          {/* Chapter Header */}
          <div className="border-b border-gray-700 bg-gray-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Getting Started</h3>
            <p className="mt-1 text-sm text-gray-400">
              Getting started with the first chapter
            </p>
          </div>
        </div>
        {/* Lesson List */}
        <div className="divide-y divide-gray-700"></div>
      </div>
    </div>
  );
}
