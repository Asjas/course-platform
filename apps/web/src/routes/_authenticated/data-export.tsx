import { createFileRoute } from "@tanstack/react-router";
import { DownloadIcon, FileJsonIcon, FileSpreadsheetIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/data-export")({
  component: DataExportPage,
});

/**
 * Helper function to trigger file download
 * Handles blob creation, download trigger, and cleanup
 */
function downloadFile(
  content: string,
  mimeType: string,
  fileExtension: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `my-data-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after a delay to ensure download starts
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

function DataExportPage() {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(format: "json" | "csv") {
    setIsExporting(true);
    const toastId = toast.loading(
      `Preparing your data for download (${format.toUpperCase()})...`,
    );

    try {
      const result = await trpcClient.dataExport.exportData.query({ format });

      if (result.format === "json") {
        downloadFile(
          JSON.stringify(result.data, null, 2),
          "application/json",
          "json",
        );
      } else {
        downloadFile(result.data, "text/csv", "csv");
      }

      toast.success("Your data has been downloaded successfully!", {
        id: toastId,
      });
    } catch (error) {
      console.error("Export error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to export your data. Please try again.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto mt-20 mb-20 w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <h1 className="text-2xl/9 font-semibold text-gray-900 dark:text-white">
        Download My Data
      </h1>

      <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
        Export all your personal data in compliance with GDPR, POPIA, and other
        data protection regulations.
      </p>

      <div className="mt-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          What data is included?
        </h2>
        <ul className="mb-6 list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
          <li>Your profile information (name, email, username)</li>
          <li>Course enrollments and access details</li>
          <li>Learning progress and completed lessons</li>
          <li>Purchase history and payment records</li>
          <li>Notifications and support tickets</li>
          <li>Course wishlist and reviews</li>
          <li>Direct messages and chat reports</li>
          <li>Completion certificates</li>
        </ul>

        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Choose Your Format
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-green-600 bg-green-50 px-6 py-4 text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
            disabled={isExporting}
            onClick={() => handleExport("json")}
            aria-busy={isExporting}
            aria-live="polite"
          >
            <FileJsonIcon
              className="h-6 w-6"
              aria-hidden="true"
            />
            <div className="text-left">
              <div className="font-semibold">JSON Format</div>
              <div className="text-sm">
                Structured data, ideal for developers
              </div>
            </div>
            <DownloadIcon
              className="ml-auto h-5 w-5"
              aria-hidden="true"
            />
            {isExporting && (
              <span className="sr-only">Export in progress...</span>
            )}
          </button>

          <button
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-blue-50 px-6 py-4 text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            disabled={isExporting}
            onClick={() => handleExport("csv")}
            aria-busy={isExporting}
            aria-live="polite"
          >
            <FileSpreadsheetIcon
              className="h-6 w-6"
              aria-hidden="true"
            />
            <div className="text-left">
              <div className="font-semibold">CSV Format</div>
              <div className="text-sm">Spreadsheet format, easy to read</div>
            </div>
            <DownloadIcon
              className="ml-auto h-5 w-5"
              aria-hidden="true"
            />
            {isExporting && (
              <span className="sr-only">Export in progress...</span>
            )}
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-900 dark:text-yellow-200">
            <strong>Note:</strong> Your data export will include all personal
            information stored in our system. Please handle this file securely
            as it contains sensitive information.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
          Questions about your data?
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          For more information about how we handle your data, please review our{" "}
          <a
            className="text-green-600 underline hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            href="/privacy"
          >
            Privacy Policy
          </a>
          . If you have specific questions or concerns, contact us at{" "}
          <a
            className="text-green-600 underline hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            href="mailto:privacy@codewizard.training"
          >
            privacy@codewizard.training
          </a>
          .
        </p>
      </div>
    </div>
  );
}
