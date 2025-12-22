import { createFileRoute } from "@tanstack/react-router";
import {
  BabyIcon,
  BotIcon,
  BugIcon,
  ChartBarIncreasingIcon,
  ChartNoAxesColumnIcon,
  CheckCircle2,
  CheckIcon,
  CookieIcon,
  CreditCardIcon,
  GlobeLockIcon,
  GraduationCapIcon,
  HardDriveIcon,
  HistoryIcon,
  InfoIcon,
  LockIcon,
  MailIcon,
  MailQuestionMarkIcon,
  RefreshCcwIcon,
  ScrollTextIcon,
  ServerIcon,
  Share2Icon,
  ShieldCheckIcon,
  ShieldUserIcon,
  UserCogIcon,
  UserLockIcon,
  YoutubeIcon,
} from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex-none overflow-y-auto outline-none">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
              <ShieldUserIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Effective Date: November 7, 2025 • Version 1.4
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              We comply with South Africa&apos;s <strong>POPIA</strong>, the
              EU&apos;s <strong>GDPR</strong>, the UK-GDPR, California&apos;s{" "}
              <strong>CCPA/CPRA</strong>, Brazil&apos;s <strong>LGPD</strong>,
              Australia&apos;s <strong>APPs</strong>, and other applicable data
              protection laws.
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
                  {/* Latest Version */}
                  <tr className="border-t bg-green-50 dark:border-gray-600 dark:bg-green-900/20">
                    <td className="p-2 font-medium">1.4</td>
                    <td className="p-2">November 7, 2025</td>
                    <td className="p-2">
                      <ul className="list-inside list-disc space-y-1 text-xs">
                        <li>
                          Added <strong>AI and Automated Decisions</strong>{" "}
                          section (GDPR Art. 22 compliance).
                        </li>
                        <li>
                          Clarified <strong>data storage locations</strong> in
                          Cross-Border Transfers.
                        </li>
                        <li>
                          Introduced <strong>Glossary</strong> for key terms.
                        </li>
                        <li>
                          Updated Polar.sh DPA language for clarity (automatic
                          via ToS).
                        </li>
                      </ul>
                    </td>
                  </tr>
                  {/* Previous Version */}
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2 font-medium">1.3</td>
                    <td className="p-2">November 7, 2025</td>
                    <td className="p-2">
                      <ul className="list-inside list-disc space-y-1 text-xs">
                        <li>
                          Updated Data Sharing Practices for Polar.sh GDPR
                          compliance via Terms of Service (no explicit
                          contract).
                        </li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2 font-medium">1.2</td>
                    <td className="p-2">November 7, 2025</td>
                    <td className="p-2">
                      <ul className="list-inside list-disc space-y-1 text-xs">
                        <li>
                          Added <strong>POPIA compliance section</strong> with
                          Section 34 (children)
                        </li>
                        <li>
                          Introduced <strong>sub-processors table</strong> with
                          DPA status
                        </li>
                        <li>
                          Updated <strong>data retention</strong>: backups now
                          30 days
                        </li>
                        <li>
                          Clarified <strong>Netcup DPA + SCCs signed</strong>
                        </li>
                        <li>
                          Added <strong>EU Data Act</strong> portability &
                          switching rights
                        </li>
                        <li>
                          Enhanced <strong>children&apos;s privacy</strong> (age
                          16+ per POPIA)
                        </li>
                      </ul>
                    </td>
                  </tr>
                  {/* Previous Version */}
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2">1.1</td>
                    <td className="p-2">November 7, 2025</td>
                    <td className="p-2">
                      <ul className="list-inside list-disc space-y-1 text-xs">
                        <li>
                          Added <strong>sub-processors table</strong>
                        </li>
                        <li>
                          Updated <strong>retention for backups</strong>
                        </li>
                        <li>
                          Added <strong>Netcup privacy link</strong>
                        </li>
                      </ul>
                    </td>
                  </tr>
                  {/* Initial Version */}
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2">1.0</td>
                    <td className="p-2">September 1, 2025</td>
                    <td className="p-2">
                      <ul className="list-inside list-disc space-y-1 text-xs">
                        <li>
                          Initial policy release. Established baseline for GDPR,
                          POPIA, CCPA compliance.
                        </li>
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
              <UserLockIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Our Commitment to Your Privacy
            </h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              At Codewizard Training, we prioritize transparency in how we
              handle your information. As developers ourselves, we&apos;re
              committed to avoiding invasive data practices. This policy
              outlines what data we gather, our purpose for collecting it, and
              the measures we take to secure it.
            </p>
          </div>

          {/* Scope & Compliance */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <ScrollTextIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Scope &amp; Compliance
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              This policy applies to all personal data collected from users
              worldwide. Under GDPR we rely on contract performance, consent,
              legitimate interests, and legal obligations. California residents
              have additional CCPA rights. South African users may lodge
              complaints with the Information Regulator.
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <strong>POPIA Compliance:</strong> As responsible party, we
              process data lawfully under Sections 11-12. Students under 18
              require parental consent (Section 34).
            </p>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              <strong>Data Minimization:</strong> We collect only what's
              necessary for the purposes described, and anonymize where
              possible.
            </p>
          </div>

          {/* What We Collect */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <HardDriveIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Information We Collect
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Account Details
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Email address</li>
                  <li>Full name</li>
                  <li>Username (optional, required for community chat)</li>
                  <li>Payment details (securely processed via Polar)</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Platform Usage Data
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Pages visited on our platform</li>
                  <li>Courses and lessons completed</li>
                  <li>Interaction patterns with platform tools</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Technical Information
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                  <li>IP address (anonymized)</li>
                  <li>Browser type and version</li>
                  <li>Device specifications</li>
                  <li>Referral source (e.g., search engine, social media)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use It */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <UserCogIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              How We Use Your Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <GraduationCapIcon
                    className="mr-2"
                    size={26}
                    color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                  />
                  Enhancing Your Experience
                </h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Storing your course progress</li>
                  <li>• Suggest relevant learning materials</li>
                  <li>• Tailor your platform experience</li>
                  <li>• Store your user preferences</li>
                </ul>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <ChartNoAxesColumnIcon
                    className="mr-2"
                    size={26}
                    color="oklch(0.6626 0.1358 246.81)"
                  />
                  Improving Our Services
                </h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Analyze usage trends</li>
                  <li>• Identify high-demand content</li>
                  <li>• Resolve technical issues</li>
                  <li>• Develop new platform features</li>
                </ul>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <MailIcon
                    className="mr-2"
                    size={26}
                    color="oklch(0.6637 0.1634 296.96)"
                  />
                  Communicating with You
                </h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Send course-related updates</li>
                  <li>• Provide account notifications</li>
                  <li>• Facilitate community chat messages</li>
                  <li>• Respond to support inquiries</li>
                </ul>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <ShieldCheckIcon
                    className="mr-2"
                    size={26}
                    color="oklch(0.6882 0.1776 22.95)"
                  />
                  Ensuring Security
                </h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Prevent fraudulent activities</li>
                  <li>• Detect platform abuse</li>
                  <li>• Secure user accounts</li>
                  <li>• Comply with legal obligations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Share2Icon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Data Sharing Practices
            </h2>
            <div className="space-y-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-2 flex items-center font-semibold text-green-800 dark:text-green-300">
                  <CheckCircle2
                    className="mr-2"
                    size={24}
                    color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                  />
                  We Don&apos;t Sell Your Data
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Your personal information is never sold, leased, or shared for
                  profit with third parties.
                </p>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Third-Party Service Providers
                </h3>
                <ul className="grid gap-3 text-gray-700 dark:text-gray-300">
                  {/* Polar */}
                  <li className="grid grid-cols-[24px_1fr] items-start gap-2">
                    <CreditCardIcon
                      className="shrink-0 text-green-600"
                      size={24}
                    />
                    <div>
                      <strong>Polar</strong> - Processes payments securely as
                      Merchant of Record. They handle your payment details
                      directly and act as a GDPR-compliant processor. Their{" "}
                      <a
                        className="text-green-400 underline"
                        href="https://polar.sh/legal/privacy"
                      >
                        Privacy Policy
                      </a>{" "}
                      includes a built-in DPA with SCCs, automatically applied
                      when you use their service.
                    </div>
                  </li>
                  {/* Netcup */}
                  <li className="grid grid-cols-[24px_1fr] items-start gap-2">
                    <ServerIcon
                      className="shrink-0 text-green-600"
                      size={24}
                    />
                    <div>
                      <strong>Netcup</strong> - Hosts our servers. They process
                      data but do not access personal information.
                    </div>
                  </li>
                  {/* Proton Email */}
                  <li className="grid grid-cols-[24px_1fr] items-start gap-2">
                    <MailIcon
                      className="shrink-0 text-green-600"
                      size={24}
                    />
                    <div>
                      <strong>Proton Email</strong> - Delivers course updates,
                      authentication emails, and newsletters. See their{" "}
                      <a
                        className="text-green-400 underline"
                        href="https://proton.me/legal/privacy"
                      >
                        Privacy Policy
                      </a>
                      .
                    </div>
                  </li>
                  {/* Ackee */}
                  <li className="grid grid-cols-[24px_1fr] items-start gap-2">
                    <ChartBarIncreasingIcon
                      className="shrink-0 text-green-600"
                      size={24}
                    />
                    <div>
                      <strong>Self-hosted Ackee (Analytics)</strong> - Tracks
                      anonymized usage data to improve our platform. No personal
                      data is shared externally.
                    </div>
                  </li>
                  {/* YouTube */}
                  <li className="grid grid-cols-[24px_1fr] items-start gap-2">
                    <YoutubeIcon
                      className="shrink-0 text-green-600"
                      size={24}
                    />
                    <div>
                      <strong>YouTube</strong> - Hosts course videos. May
                      collect analytics on video interactions. See their{" "}
                      <a
                        className="text-green-400 underline"
                        href="https://policies.google.com/privacy"
                      >
                        Privacy Policy
                      </a>
                      .
                    </div>
                  </li>
                  {/* Bugsink */}
                  <li className="grid grid-cols-[24px_1fr] items-start gap-2">
                    <BugIcon
                      className="shrink-0 text-green-600"
                      size={24}
                    />
                    <div>
                      <strong>Self-hosted Bugsink</strong> - Monitors errors to
                      enhance platform reliability. May include limited user
                      context. No external sharing.
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Anonymized Data
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We may share anonymized, aggregated data publicly, such as “X
                  users purchased a course.” This data cannot be linked to
                  individuals.
                </p>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Legal Obligations
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We may disclose data if compelled by law, such as a court
                  order. We&apos;ll notify you unless legally restricted.
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <LockIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Data Protection Measures
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <CheckIcon
                  className="mr-2"
                  size={20}
                  color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                />
                Data transmitted securely via HTTPS
              </li>
              <li className="flex items-start">
                <CheckIcon
                  className="mr-2"
                  size={20}
                  color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                />
                Passwords encrypted using Argon2 with additional security
              </li>
              <li className="flex items-start">
                <CheckIcon
                  className="mr-2"
                  size={20}
                  color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                />
                Restricted access to our systems
              </li>
              <li className="flex items-start">
                <CheckIcon
                  className="mr-2"
                  size={20}
                  color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                />
                Payments processed by Polar (Merchant of Record)
              </li>
              <li className="flex items-start">
                <CheckIcon
                  className="mr-2"
                  size={20}
                  color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                />
                In case of a data breach, we notify affected users and
                regulators within 72 hours (GDPR) or without unreasonable delay
                (CCPA).
              </li>
            </ul>
          </div>

          {/* Your Rights Over Your Data */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <UserLockIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Your Rights Over Your Data
            </h2>
            <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Access</strong> - Get a copy of your data in a
                structured format (CSV/JSON).
              </li>
              <li>
                <strong>Rectification</strong> - Correct inaccurate or
                incomplete data.
              </li>
              <li>
                <strong>Erasure</strong> - Delete your account and data (except
                tax records).
              </li>
              <li>
                <strong>Restriction</strong> - Pause processing during disputes.
              </li>
              <li>
                <strong>Portability & Switching (EU Data Act)</strong> - Export
                your data in JSON or migrate to another platform.
              </li>
              <li>
                <strong>Objection & Complaint (POPIA Section 23)</strong> -
                Object to processing; complain to Information Regulator within
                20 days.
              </li>
              <li>
                <strong>Withdraw Consent</strong> - Revoke any consent given.
              </li>
              <li>
                <strong>CCPA/CPRA & US States</strong> - Know, delete, opt-out
                of sale/sharing, non-discrimination (includes 2025 laws in MN,
                NE).
              </li>
              <li>
                <strong>POPIA</strong> - Correct, erase, complain to Information
                Regulator.
              </li>
            </ul>
            <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Response Time:</strong> We respond within{" "}
                <strong>30 days</strong> (POPIA/GDPR). Extensions up to{" "}
                <strong>90 days</strong> with notice. Appeal refusals to our DPO
                or regulator.
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Submit via{" "}
              <a
                className="text-green-400 underline"
                href="mailto:privacy@codewizard.training"
              >
                privacy@codewizard.training
              </a>{" "}
              or our{" "}
              <a
                className="text-green-400 underline"
                href="/dsr"
              >
                Data Request Form
              </a>
              .
            </p>
          </div>

          {/* Cookies */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CookieIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Cookies and Tracking
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We use minimal, privacy-first cookies. No third-party trackers.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">Cookie</th>
                    <th className="p-2 text-left">Purpose</th>
                    <th className="p-2 text-left">Duration</th>
                    <th className="p-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2">cw.session_token</td>
                    <td className="p-2">Maintain login</td>
                    <td className="p-2">Session</td>
                    <td className="p-2">Essential</td>
                  </tr>
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2">ackee_optout</td>
                    <td className="p-2">Respect analytics opt-out</td>
                    <td className="p-2">2 years</td>
                    <td className="p-2">Functional</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <strong>Opt-out:</strong> Disable in{" "}
              <a
                className="text-green-400 underline"
                href="/settings/privacy"
              >
                Settings ➡️ Privacy
              </a>
              .
            </p>
          </div>

          {/* AI and Automated Decisions */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <BotIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              AI and Automated Decisions
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We do not currently use AI for automated decisions affecting
              users. If introduced, we will notify you and provide opt-out
              options per GDPR Art. 22.
            </p>
          </div>

          {/* Data Retention */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <HistoryIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Data Retention Period
            </h2>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Retention by Category
            </h3>
            <ul className="ml-4 flex list-inside list-disc flex-col gap-2 space-y-1 text-gray-700 dark:text-gray-300">
              <li>
                <strong className="text-white">Account Data:</strong> Deleted
                from active systems with immediate effect upon account closure;
                backups purged within 30 days (POPIA/GDPR/CCPA compliant).
              </li>
              <li>
                <strong className="text-white">
                  Invoicing and Purchase Records:
                </strong>{" "}
                Retained <strong>7 years</strong> minimum from tax year-end per{" "}
                <em>SARS Tax Administration Act</em> and VAT Act.
              </li>
              <li>
                <strong className="text-white">Usage &amp; Analytics:</strong>{" "}
                Anonymized and kept up to <strong>2 years</strong> for service
                improvement.
              </li>
              <li>
                <strong className="text-white">Support Requests:</strong>{" "}
                Personal data removed on deletion; anonymized transcripts
                retained indefinitely for public knowledge base (legitimate
                interest).
              </li>
            </ul>
            <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              We retain personal data only as long as necessary for the purposes
              stated in this policy or as required by law (GDPR Art. 5(1)(e)).
              Where legal obligations apply (e.g., 7-year tax retention under
              South African law), we restrict processing and securely isolate
              data until deletion is permitted.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-8 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <BabyIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Protecting Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our platform is not intended for users under <strong>16</strong>{" "}
              (POPIA) or <strong>13</strong> (COPPA, USA). We do not knowingly
              collect data from children. If discovered without verifiable
              parental consent, we delete it immediately.
            </p>
          </div>

          {/* International Data Transfers */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <GlobeLockIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Cross-Border Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Data may be transferred to the EU, Switzerland, and the US. We
              rely on:
              <ul className="mt-2 ml-6 list-disc space-y-1">
                <li>
                  <strong>Standard Contractual Clauses (SCCs)</strong> - Legally
                  binding agreements with our providers (e.g., Netcup)
                </li>
                <li>
                  <strong>Adequacy Decisions</strong> - For countries like
                  Switzerland with EU-recognized privacy laws
                </li>
              </ul>
            </p>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Data is stored in secure facilities in the EU (Germany via Netcup)
              and Switzerland (Proton Mail). Transfers to the US (if any) use
              SCCs. We do not store data in non-adequate jurisdictions without
              safeguards.
            </p>
          </div>

          {/* Sub-Processors */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Sub-Processors
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              We only use sub-processors under strict Data Processing Agreements
              (DPAs).
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">Provider</th>
                    <th className="p-2 text-left">Purpose</th>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-left">Safeguard</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2">
                      <a
                        className="text-green-400 underline hover:no-underline"
                        href="https://polar.sh/legal/privacy"
                      >
                        Polar
                      </a>
                    </td>
                    <td className="p-2">Payments</td>
                    <td className="p-2">Name, email, transaction</td>
                    <td className="p-2">EU</td>
                    <td className="p-2">
                      DPA + SCCs
                      <br />
                      <span className="text-xs text-gray-500">
                        (via Polar's Terms of Service)
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2">
                      <a
                        className="text-green-400 underline hover:no-underline"
                        href="https://proton.me/legal/privacy"
                      >
                        Proton Mail
                      </a>
                    </td>
                    <td className="p-2">Email delivery</td>
                    <td className="p-2">Email, name</td>
                    <td className="p-2">Switzerland</td>
                    <td className="p-2">DPA + Adequacy</td>
                  </tr>
                  <tr className="border-t dark:border-gray-600">
                    <td className="p-2">
                      <a
                        className="text-green-400 underline hover:no-underline"
                        href="https://www.netcup.com/en/contact/data-privacy"
                      >
                        Netcup
                      </a>
                    </td>
                    <td className="p-2">Hosting</td>
                    <td className="p-2">All (encrypted)</td>
                    <td className="p-2">Germany</td>
                    <td className="p-2">DPA + SCCs (Signed: Nov 2025)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-gray-600 italic dark:text-gray-400">
              Self-hosted tools (Ackee, Bugsink) are under our full control and
              not shared with third parties.
            </p>
            <p className="mt-2 text-xs text-gray-500 italic dark:text-gray-400">
              * Polar's DPA is automatically applied when you use their service
              - no separate signature required.
            </p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-white">GDPR Compliance:</strong> We act as{" "}
              <em>data controller</em>. All processors operate under
              GDPR-compliant terms:
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-gray-400">
              <li>
                <strong className="text-white">Netcup:</strong> Explicit DPA +
                SCCs signed (November 2025)
              </li>
              <li>
                <strong className="text-white">Polar:</strong> DPA + SCCs
                automatically applied via their Terms of Service
              </li>
              <li>
                <strong className="text-white">Proton Mail:</strong> Adequacy
                decision (Switzerland)
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              EU users have full rights under Articles 15-22.
            </p>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Last reviewed: November 07, 2025
            </p>
          </div>

          {/* Supervisory Authorities */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Complaints &amp; Supervisory Authorities
            </h2>
            <ul className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
              <li>
                <strong>South Africa:</strong> Information Regulator -{" "}
                <a
                  className="text-green-400 underline hover:no-underline"
                  href="https://www.justice.gov.za/inforeg/"
                >
                  https://www.justice.gov.za/inforeg/
                </a>
              </li>
              <li>
                <strong>EU:</strong> Your local Data Protection Authority
              </li>
              <li>
                <strong>UK:</strong> Information Commissioner&apos;s Office -{" "}
                <a
                  className="text-green-400 underline hover:no-underline"
                  href="https://ico.org.uk/"
                >
                  https://ico.org.uk/
                </a>
              </li>
              <li>
                <strong>California:</strong> California Attorney General -{" "}
                <a
                  className="text-green-400 underline hover:no-underline"
                  href="https://oag.ca.gov/privacy"
                >
                  https://oag.ca.gov/privacy
                </a>
              </li>
            </ul>
          </div>

          {/* Changes to Policy */}
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
              We may update this policy periodically. Significant changes will
              be communicated via email or a notice on our platform. Continued
              use indicates acceptance of the updated policy.
            </p>
          </div>

          {/* Additional Terms */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <InfoIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Other Terms
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Terms of Service
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Review our{" "}
                  <a
                    className="text-green-400 underline hover:text-green-300"
                    href="/terms"
                  >
                    Terms of Service Policy
                  </a>{" "}
                  as it explains the rules, responsibilities, and legal
                  conditions for using this platform. Please review them
                  carefully to understand your rights and obligations.
                </p>
              </div>
            </div>
          </div>

          {/* Glossary Section */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <InfoIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Glossary
            </h2>
            <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Personal Data:</strong> Any info identifying you (e.g.,
                name, email).
              </li>
              <li>
                <strong>Processor:</strong> Third-party handling data on our
                behalf (e.g., Polar, Netcup, Proton Mail).
              </li>
              <li>
                <strong>SCCs:</strong> Standard Contractual Clauses for secure
                data transfers.
              </li>
            </ul>
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
              Questions about this policy or your data? Contact our Data
              Protection Officer:
            </p>
            <p className="text-gray-200 dark:text-gray-200">
              A-J Roos, DPO —{" "}
              <a
                className="text-green-400 underline hover:text-green-300"
                href="mailto:privacy@codewizard.training"
              >
                privacy@codewizard.training
              </a>
            </p>
            <div className="mt-6 rounded-lg bg-gray-700 p-4 dark:bg-gray-600">
              <p className="text-gray-300 italic dark:text-gray-200">
                As developers, we value your privacy. Let us know if you have
                concerns, and we&apos;ll address them promptly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
