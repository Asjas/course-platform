import { createFileRoute } from "@tanstack/react-router";
import {
  BanIcon,
  BookOpenIcon,
  BookTextIcon,
  CheckCircle2Icon,
  ChevronRight,
  CircleUserRoundIcon,
  CreditCardIcon,
  CrossIcon,
  CrownIcon,
  GiftIcon,
  HandshakeIcon,
  HistoryIcon,
  InfoIcon,
  LaptopMinimalIcon,
  MailQuestionMarkIcon,
  NotepadTextIcon,
  ShieldHalfIcon,
  StarIcon,
  TriangleAlertIcon,
} from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex-none overflow-y-auto outline-none">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
              <NotepadTextIcon
                className="mr-2"
                size={36}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Effective Date: November 8, 2025 • Version 1.1
            </p>
          </div>

          {/* Version History */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <HistoryIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Version History
            </h2>
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left font-medium">Version</th>
                  <th className="p-2 text-left font-medium">Date</th>
                  <th className="p-2 text-left font-medium">Summary</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-green-50 dark:border-gray-600 dark:bg-green-900/20">
                  <td className="p-2 font-medium">1.1</td>
                  <td className="p-2">Nov 8, 2025</td>
                  <td className="p-2">
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>Added version history.</li>
                      <li>Elevated refunds to top-level section.</li>
                      <li>Added payments & billing section.</li>
                      <li>Strengthened user content license grant.</li>
                      <li>Added termination clause.</li>
                      <li>Added DMCA/copyright complaints.</li>
                      <li>Updated liability cap to per-course or $100.</li>
                      <li>Added force majeure clause.</li>
                      <li>Minor UI fixes: icon colors, Tailwind rotates.</li>
                      <li>Reordered sections logically.</li>
                    </ul>
                  </td>
                </tr>
                <tr className="border-t dark:border-gray-600">
                  <td className="p-2 font-medium">1.0</td>
                  <td className="p-2">Oct 1, 2025</td>
                  <td className="p-2">Initial release</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Acceptance of Terms */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <HandshakeIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing or using our Services, you agree to these Terms of
              Service. We may update these Terms from time to time. We’ll notify
              you via email or in-app banner and update the Effective Date.
              Continued use after changes means you accept them. If you do not
              agree, stop using the platform.
            </p>
          </div>

          {/* Definitions */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <BookTextIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Definitions
            </h2>
            <ul className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Services:</strong> The Codewizard Training platform and
                related features.
              </li>
              <li>
                <strong>User Content:</strong> Any text, code, media, or data
                you submit.
              </li>
              <li>
                <strong>Account:</strong> Your registered user profile.
              </li>
              <li>
                <strong>Free Course:</strong> Materials available without
                payment.
              </li>
              <li>
                <strong>Preview Course:</strong> Limited paid course content
                available without payment.
              </li>
              <li>
                <strong>Paid Course:</strong> Materials accessible only after
                payment.
              </li>
              <li>
                <strong>Force Majeure:</strong> Events beyond our control (e.g.,
                natural disasters, war).
              </li>
            </ul>
          </div>

          {/* Your Account */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CircleUserRoundIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Your Account
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold">Account Creation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You must be <strong>16+</strong> in GDPR/POPIA regions. In
                  COPPA/CCPA regions, users aged 13–15 need parental consent.
                  Provide accurate info and keep credentials secure.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Account Responsibility
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You are fully responsible for all activity under your account.
                </p>
              </div>
            </div>
          </div>

          {/* Payments & Billing */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CreditCardIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Payments & Billing
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">
              <li>
                All payments are processed securely via <strong>Polar</strong>{" "}
                (Merchant of Record).
              </li>
              <li>
                Prices are in USD and include applicable taxes unless stated
                otherwise.
              </li>
              <li>You’ll receive an invoice via email after purchase.</li>
              <li>Failed payments may suspend access until resolved.</li>
            </ul>
          </div>

          {/* Refunds */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CreditCardIcon
                className="mr-2"
                size={38}
                color="oklch(0.6882 0.1776 22.95)" // accent orange
              />
              Refunds
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You may request a <strong>full refund</strong> within{" "}
              <strong>60 days</strong> of purchase via:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>
                <a
                  className="text-green-400 underline hover:text-green-300"
                  href="/account/purchases"
                >
                  Your purchases page
                </a>{" "}
                (automatic), or
              </li>
              <li>
                Email:{" "}
                <a
                  className="text-green-400 underline hover:text-green-300"
                  href="mailto:refunds@codewizard.training"
                >
                  refunds@codewizard.training
                </a>
              </li>
            </ul>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <strong>Refunds are not available</strong> after 60 days or if
              you’ve completed over 50% of the course.
            </p>
          </div>

          {/* Course Access */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CrownIcon
                className="mr-2 -rotate-18"
                size={38}
                stroke="gold"
                fill="none"
              />
              Course Access
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold">
                  <StarIcon
                    className="mr-2"
                    fill="gray"
                    stroke="gray"
                  />
                  Free Courses
                </h3>
                <p className="text-sm">Full course content</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold">
                  <GiftIcon
                    className="mr-2"
                    color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                  />
                  Preview Courses
                </h3>
                <p className="text-sm">Limited paid content</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold">
                  <StarIcon
                    className="mr-2"
                    fill="yellow"
                    stroke="yellow"
                  />
                  Paid Courses
                </h3>
                <p className="text-sm">Full course content</p>
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="grid grid-cols-[auto_1fr] items-center text-blue-800 dark:text-blue-300">
                <InfoIcon
                  className="mr-4"
                  size={36}
                />
                <p>
                  All course types include access to community chat and
                  help-desk support.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Usage */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <LaptopMinimalIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Platform Usage
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 flex items-center text-lg font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle2Icon className="mr-2" />
                  Permitted Uses
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <ChevronRight
                      className="mt-0.5 mr-2"
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                      size={18}
                    />
                    Engage with tutorials and courses
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mt-0.5 mr-2"
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                      size={18}
                    />
                    Join community respectfully
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mt-0.5 mr-2"
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                      size={18}
                    />
                    Share knowledge and configurations
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mt-0.5 mr-2"
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                      size={18}
                    />
                    Track course progress
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 flex items-center text-lg font-semibold text-red-600 dark:text-red-400">
                  <CrossIcon
                    className="mr-2 rotate-45"
                    color="red"
                  />
                  Prohibited Uses
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <ChevronRight
                      className="mt-0.5 mr-2"
                      color="red"
                      size={18}
                    />
                    Sharing login credentials
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mt-0.5 mr-2"
                      color="red"
                      size={18}
                    />
                    Copying or redistributing course materials
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mt-0.5 mr-2"
                      color="red"
                      size={18}
                    />
                    Harassing users or posting inappropriate content
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mt-0.5 mr-2"
                      color="red"
                      size={18}
                    />
                    Engaging in illegal activities
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Content Rights */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <BookOpenIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Content Rights
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Your Contributions
                </h3>
                <p className="mb-2">
                  By submitting content (posts, code, comments), you grant us a:
                </p>
                <ul className="ml-4 list-disc space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>
                      Worldwide, non-exclusive, royalty-free license
                    </strong>{" "}
                    to use, display, modify, and distribute your content on our
                    platform.
                  </li>
                  <li>
                    You represent that your content does not infringe
                    third-party rights.
                  </li>
                  <li>We may remove or edit content at our discretion.</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold">Our Materials</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  All course materials and platform code are owned by us and
                  licensed to you for personal learning only.
                </p>
              </div>
            </div>
          </div>

          {/* Termination */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <BanIcon
                className="mr-2"
                size={38}
                color="oklch(0.6882 0.1776 22.95)" // accent orange
              />
              Termination
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">
              <li>
                We may suspend or terminate your account for violations of these
                Terms.
              </li>
              <li>
                Upon termination, access to paid content ends immediately.
              </li>
              <li>You may terminate by deleting your account at any time.</li>
              <li>
                Sections on IP, Liability, and Governing Law survive
                termination.
              </li>
            </ul>
          </div>

          {/* Disclaimers & Warranties */}
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-8 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <TriangleAlertIcon
                className="mr-2"
                size={38}
                color="oklch(0.6882 0.1776 22.95)" // accent orange
              />
              Disclaimers & Warranties
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="mb-2 font-semibold">No Guarantees</h3>
                <p>
                  Services are provided “as is” without warranties.
                  Compatibility varies across environments.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Configuration Risks</h3>
                <p>
                  Tutorials may alter your system.{" "}
                  <strong>Always back up</strong> before proceeding.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Learning Results</h3>
                <p>Proficiency requires practice beyond our courses.</p>
              </div>
            </div>
          </div>

          {/* Liability Limits */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <ShieldHalfIcon
                className="mr-2"
                size={38}
                color="oklch(0.6882 0.1776 22.95)" // accent orange
              />
              Liability Limits
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We are not responsible for:
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <CrossIcon className="mt-1 mr-2 h-5 w-5 rotate-45 text-red-600" />
                System damage from following tutorials
              </li>
              <li className="flex items-start">
                <CrossIcon className="mt-1 mr-2 h-5 w-5 rotate-45 text-red-600" />
                Lost productivity
              </li>
              <li className="flex items-start">
                <CrossIcon className="mt-1 mr-2 h-5 w-5 rotate-45 text-red-600" />
                Issues from third-party bugs, outages, or breaches
              </li>
              <li className="flex items-start">
                <CrossIcon className="mt-1 mr-2 h-5 w-5 rotate-45 text-red-600" />
                Losses from user-generated content
              </li>
              <li className="flex items-start">
                <CrossIcon className="mt-1 mr-2 h-5 w-5 rotate-45 text-red-600" />
                Data loss or corruption
              </li>
              <li className="flex items-start">
                <CrossIcon className="mt-1 mr-2 h-5 w-5 rotate-45 text-red-600" />
                Downtime or unavailability
              </li>
              <li className="flex items-start">
                <CrossIcon className="mt-1 mr-2 h-5 w-5 rotate-45 text-red-600" />
                Quality/support of free or preview content
              </li>
            </ul>
            <div className="mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Our total liability is limited to the greater of:
                <ul className="mt-2 ml-6 list-disc text-sm">
                  <li>The amount you paid for the specific course, or</li>
                  <li>
                    <strong>$100 USD</strong> if no payment was made.
                  </li>
                </ul>
              </p>
            </div>
          </div>

          {/* Indemnification */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <ShieldHalfIcon
                className="mr-2"
                size={38}
                color="oklch(0.6882 0.1776 22.95)" // accent orange
              />
              Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify and hold us harmless from claims arising
              from your breach of these Terms or use of the Services.
            </p>
          </div>

          {/* Force Majeure */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <TriangleAlertIcon
                className="mr-2"
                size={38}
                color="oklch(0.6882 0.1776 22.95)" // accent orange
              />
              Force Majeure
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We are not liable for delays or failures caused by events beyond
              our control, including natural disasters, war, cyberattacks, or
              government actions.
            </p>
          </div>

          {/* Copyright Complaints */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <InfoIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Copyright Complaints (DMCA)
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              To report infringing content, email{" "}
              <a
                className="text-green-400 underline hover:text-green-300"
                href="mailto:dmca@codewizard.training"
              >
                dmca@codewizard.training
              </a>{" "}
              with:
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1 text-sm">
              <li>Your contact information</li>
              <li>Description of the copyrighted work</li>
              <li>Location of the material</li>
              <li>Statement of good faith and accuracy</li>
            </ul>
          </div>

          {/* Governing Law */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <TriangleAlertIcon
                className="mr-2"
                size={38}
                color="red"
              />
              Governing Law & Dispute Resolution
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms are governed by the laws of{" "}
              <strong>South Africa</strong>. Disputes shall be resolved in the
              courts of <strong>Gauteng</strong>.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              EU users may use the{" "}
              <a
                className="text-green-400 underline"
                href="https://ec.europa.eu/odr"
                rel="noopener noreferrer"
                target="_blank"
              >
                European ODR platform
              </a>
              .
            </p>
          </div>

          {/* Severability & Entire Agreement */}
          <div
            className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
            id="severability"
          >
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <InfoIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Severability & Entire Agreement
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If any provision is invalid, the rest remain in effect. These
              Terms and linked policies form the entire agreement.
            </p>
          </div>

          {/* Privacy */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <InfoIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              See our{" "}
              <a
                className="text-green-400 underline hover:text-green-300"
                href="/privacy"
              >
                Privacy Policy
              </a>{" "}
              for data handling details.
            </p>
          </div>

          {/* Contact Us */}
          <div className="rounded-lg border border-gray-300 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <MailQuestionMarkIcon
                className="mr-2"
                size={40}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)" // primary green
              />
              Contact Us
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Questions? Email us at{" "}
              <a
                className="text-green-400 underline hover:text-green-300"
                href="mailto:contact@codewizard.training"
              >
                contact@codewizard.training
              </a>
            </p>
            <div className="mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-gray-600 italic dark:text-gray-300">
                Our terms are designed to be clear and fair. Reach out if
                anything needs clarification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
