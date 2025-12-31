import { createFileRoute } from "@tanstack/react-router";
import { DownloadIcon } from "lucide-react";

export const Route = createFileRoute("/downloads")({
  component: DownloadsPage,
});

function DownloadsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
            <DownloadIcon
              className="mr-2"
              size={40}
              aria-hidden="true"
            />
            Downloads
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Access course materials, resources, and tools.
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Downloads will be available here soon. Check back later!
          </p>
        </div>
      </div>
    </main>
  );
}
