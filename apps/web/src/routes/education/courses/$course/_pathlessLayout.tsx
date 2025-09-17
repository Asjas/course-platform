import { Outlet, createFileRoute } from "@tanstack/react-router";
import React from "react";
import { capitalizeFirstLetter } from "~/lib/utils";

export const Route = createFileRoute(
  "/education/courses/$course/_pathlessLayout",
)({
  // pathless layout route
  component: CourseLayout,
});

function CourseLayout() {
  // params are inherited from an ancestor that defines the `course` param
  const { course } = Route.useParams() as { course?: string };

  const courseName = course
    ? course.split("-").map(capitalizeFirstLetter).join(" ")
    : "";

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl">
        {courseName}
      </h1>

      {/* child routes will render here */}
      <Outlet />
    </div>
  );
}
