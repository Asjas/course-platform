import { createFileRoute } from "@tanstack/react-router";
import {
  CookieIcon,
  HistoryIcon,
  InfoIcon,
  MailQuestionMarkIcon,
  RefreshCcwIcon,
  TriangleAlertIcon,
} from "lucide-react";

export const Route = createFileRoute("/cookies")({
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return (
    <div className="flex-none overflow-y-auto outline-none">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
              <CookieIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Cookie Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Effective Date: November 8, 2025 • Version 1.0
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This policy explains our use of cookies and similar technologies.
              It supplements our{" "}
              <a
                className="text-green-500 underline hover:no-underline"
                href="/privacy"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                className="text-green-500 underline hover:no-underline"
                href="/terms"
              >
                Terms of Service
              </a>
              .
            </p>
          </div>

          {/* Version History */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <HistoryIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Policy Version History
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              We maintain a transparent change log.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-left font-semibold">Version</th>
                    <th className="p-2 text-left font-semibold">
                      Effective Date
                    </th>
                    <th className="p-2 text-left font-semibold">
                      Summary of Changes
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-t bg-green-50 dark:border-gray-600 dark:bg-green-900/20">
                    <td className="p-2 font-medium">1.0</td>
                    <td className="p-2">November 8, 2025</td>
                    <td className="p-2">
                      <ul className="list-inside list-disc space-y-1 text-xs">
                        <li>Initial policy release.</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Introduction Card */}
          <div className="mb-8 rounded-lg border-l-4 border-orange-400 bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <InfoIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              About Cookies
            </h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              Cookies are small text files stored on your device to help
              websites function properly. We use only essential cookies for
              basic functionality and anonymized analytics. No third-party
              tracking or advertising cookies are used.
            </p>
          </div>

          {/* Cookie Categories */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CookieIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Cookie Categories
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We categorize cookies based on their purpose:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Purpose</th>
                    <th className="p-2 text-left">Examples</th>
                    <th className="p-2 text-left">Duration</th>
                    <th className="p-2 text-left">Required?</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2 font-medium">Essential</td>
                    <td className="p-2">
                      Enable core functionality like login and security
                    </td>
                    <td className="p-2">session_id, csrf_token, preferences</td>
                    <td className="p-2">Session</td>
                    <td className="p-2">Yes (always on)</td>
                  </tr>
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2 font-medium">Analytics</td>
                    <td className="p-2">
                      Track anonymized usage to improve platform
                    </td>
                    <td className="p-2">Ackee (self-hosted, anonymized)</td>
                    <td className="p-2">Up to 2 years</td>
                    <td className="p-2">No (opt-out available)</td>
                  </tr>
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2 font-medium">Tracking/Ads</td>
                    <td className="p-2">None used</td>
                    <td className="p-2">N/A</td>
                    <td className="p-2">N/A</td>
                    <td className="p-2">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Manage Cookies */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <TriangleAlertIcon
                className="mr-2"
                size={40}
                color="oklch(0.6882 0.1776 22.95)"
              />
              How to Manage Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You can control cookies through:
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Cookie Banner:</strong> Accept or reject non-essential
                cookies on first visit.
              </li>
              <li>
                <strong>Account Settings:</strong> Opt out of analytics in{" "}
                <a
                  className="text-green-500 underline"
                  href="/settings/privacy"
                >
                  Settings ➡️ Privacy
                </a>
                .
              </li>
              <li>
                <strong>Browser Controls:</strong> Clear or block cookies in
                your browser settings (may affect functionality).
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Essential cookies cannot be disabled as they are required for
              basic operation.
            </p>
          </div>

          {/* Policy Updates */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <RefreshCcwIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Policy Updates
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this policy. Changes will be notified via email or
              site notice. Continued use means acceptance.
            </p>
          </div>

          {/* Contact Section */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-8 shadow-lg dark:border-gray-600 dark:bg-gray-700">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <MailQuestionMarkIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Contact Us
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Questions? Email us at{" "}
              <a
                className="text-green-500 underline hover:no-underline"
                href="mailto:privacy@codewizard.training"
              >
                privacy@codewizard.training
              </a>
              .
            </p>
            <div className="mt-6 rounded-lg bg-gray-700 p-4 dark:bg-gray-600">
              <p className="text-gray-300 italic dark:text-gray-200">
                We value your privacy. Reach out with concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
