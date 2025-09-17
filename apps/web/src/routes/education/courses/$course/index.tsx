import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/education/courses/$course/")({
  // index child route (empty segment)
  component: CoursePage,
});

function CoursePage() {
  // This component renders inside the layout's Outlet
  return (
    <div>
      {/* your previous content goes here; keep it minimal so the layout provides header */}
      <p className="text-gray-300">Course content goes here.</p>
    </div>
  );
}
