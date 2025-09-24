import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpenIcon,
  BookTextIcon,
  CheckCircle2Icon,
  ChevronRight,
  CircleUserRoundIcon,
  CodeXmlIcon,
  CrossIcon,
  CrownIcon,
  GiftIcon,
  HandshakeIcon,
  InfoIcon,
  LaptopMinimalIcon,
  MailQuestionMarkIcon,
  NotepadTextIcon,
  ShieldHalfIcon,
  StarIcon,
  TriangleAlertIcon,
} from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex-none overflow-y-auto outline-none">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/*  Header Section  */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
              <NotepadTextIcon
                className="mr-2"
                size={36}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Effective Date: October 1, 2025 • Version 1.0
            </p>
          </div>

          {/* Definitions */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <BookTextIcon
                className="mr-2"
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                size={38}
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
                <strong>Account:</strong> Your registered user profile on our
                platform.
              </li>
              <li>
                <strong>Free Course:</strong> Materials available without
                payment.
              </li>
              <li>
                <strong>Preview Course:</strong> Limited materials available of
                paid content without needing to make payment.
              </li>
              <li>
                <strong>Paid Course:</strong> Materials accessible only after
                payment.
              </li>
              <li>
                <strong>Force Majeure:</strong> Circumstances beyond reasonable
                control that may delay or prevent Services.
              </li>
            </ul>
          </div>

          {/* Acceptance of Terms */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <HandshakeIcon
                className="mr-2"
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                size={38}
              />
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing or using our Services, you agree to these Terms of
              Service. We may modify these Terms from time to time; we'll notify
              you by email or in-app banner and update the Effective Date.
              Continued use after changes constitutes acceptance. If you do not
              agree, please do not use the platform.
            </p>
          </div>

          {/* Introduction Card */}
          <div className="mb-8 rounded-lg border-l-4 border-green-400 bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CodeXmlIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Our Mission
            </h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              Codewizard Training provides engaging lessons in Fastify, Coolify,
              JavaScript, and TypeScript. Learn critical web development skills
              essential for any developer, regardless of your tech stack or use
              of AI tools.
            </p>
          </div>

          {/* Your Account Section */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CircleUserRoundIcon
                className="mr-2"
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                size={38}
              />
              Your Account
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Account Creation:
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You must be at least 16 years old to create an account in
                  jurisdictions governed by GDPR or POPIA. In regions covered by
                  COPPA/CCPA, users aged 13-15 may register only with valid
                  parental consent. Always provide accurate details and keep
                  your login credentials secure.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Account Responsibility:
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You are accountable for all activities under your account. If
                  someone else accesses it, you are responsible.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Account Suspension:
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We may suspend or terminate accounts for fraud, abuse, or
                  repeated violations. Upon termination, you lose access to paid
                  content; we may retain certain data (e.g., anonymized logs) to
                  comply with legal obligations.
                </p>
              </div>
            </div>
          </div>

          {/* Free Courses */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CrownIcon
                className="-rotate-18 mr-2"
                fill="gold"
                color="gold"
                size={38}
              />
              Course Benefits
            </h2>

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <StarIcon
                    className="mr-2"
                    fill="gray"
                    color="gray"
                  />
                  Free Courses
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Access to full course content
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <GiftIcon
                    className="mr-2"
                    color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                  />
                  Preview Courses
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Access to limited course content
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <StarIcon
                    className="mr-2"
                    fill="yellow"
                    color="yellow"
                  />
                  Paid Courses
                </h3>

                <p className="text-gray-700 dark:text-gray-300">
                  Access to full course content
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="grid grid-cols-[auto_1fr] items-center text-blue-800 dark:text-blue-300">
                <InfoIcon
                  className="mr-4"
                  size={40}
                />
                <p>
                  All course types (free, preview and paid) provide access to
                  the community chat and help-desk support platform.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
              <div className="dark:text-borangelue-300 grid grid-cols-[auto_1fr] items-center text-orange-600">
                <InfoIcon
                  className="mr-4"
                  size={40}
                />
                <p>
                  <strong>Refunds:</strong> You can request a refund for a paid
                  course by going to{" "}
                  <a
                    className="inline text-orange-600 underline hover:no-underline"
                    href="/account/purchases"
                  >
                    account purchases
                  </a>{" "}
                  within 60 days and requesting an automatic refund or by
                  sending an email to{" "}
                  <a
                    className="inline text-orange-600 underline hover:no-underline"
                    href="mailto:refunds@codewizard.training"
                  >
                    refunds@codewizard.training
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Indemnification */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <ShieldHalfIcon
                className="mr-2"
                size={38}
                color="orange"
              />
              Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify and hold us harmless from any claims or
              losses arising from your breach of these Terms or your use of the
              Services.
            </p>
          </div>

          {/* Governing Law & Dispute Resolution */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <TriangleAlertIcon
                className="mr-2"
                size={38}
                color="red"
              />
              Governing Law &amp; Dispute Resolution
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms are governed by the laws of South Africa. Any dispute
              shall be resolved in the courts of Gauteng, South Africa.
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
              />
              Severability &amp; Entire Agreement
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If any provision is held invalid, the remaining provisions remain
              in effect. These Terms, together with linked policies, constitute
              the entire agreement between you and us.
            </p>
          </div>

          {/* Platform Usage */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <LaptopMinimalIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
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
                      className="mr-2"
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <span>Engage with our tutorials and courses</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mr-2"
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <span>Join community discussions respectfully</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mr-2"
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <span>Share your knowledge and configurations</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mr-2"
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <span>Track course completion progress</span>
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
                      className="mr-2"
                      color="red"
                    />
                    <span>Sharing login credentials</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mr-2"
                      color="red"
                    />
                    <span>Copying or redistributing course materials</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mr-2"
                      color="red"
                    />
                    <span>
                      Harassing users or posting inappropriate content
                    </span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight
                      className="mr-2"
                      color="red"
                    />
                    <span>Engaging in illegal activities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Content Ownership */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <BookOpenIcon
                className="mr-2"
                size={38}
                color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
              />
              Content Rights
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Your Contributions
                </h3>
                <p className="mb-2 text-gray-700 dark:text-gray-300">
                  When you share content, such as community posts or code
                  submissions:
                </p>
                <ul className="ml-4 list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    <span>You retain ownership of your contributions</span>
                  </li>
                  <li>
                    <span>
                      You grant us permission to display and reference your
                      content on our platform
                    </span>
                  </li>
                  <li>
                    <span>
                      You are responsible for any violations of third-party
                      rights
                    </span>
                  </li>
                  <li>
                    <span>We may remove content that breaches these terms</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Our Materials
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  All course materials and our platform code are owned by us and
                  licensed to you for personal learning only. You retain
                  ownership of your contributions but grant us a perpetual
                  license to display them.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Disclaimers */}
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-8 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <TriangleAlertIcon
                className="mr-2"
                size={38}
                color="red"
              />
              Disclaimers & Warranties
            </h2>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  No Guarantees:
                </h3>
                <p>
                  Our platform and materials are provided "as is" without
                  guarantees. We strive for quality, but compatibility varies
                  across development environments.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Configuration Risks:
                </h3>
                <p>
                  Our tutorials may involve system changes. While we test
                  thoroughly, there's a risk of disrupting your setup. Always
                  back up your system before proceeding.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Learning Results:
                </h3>
                <p>
                  We provide high-quality education, but becoming proficient
                  requires consistent practice beyond our courses.
                </p>
              </div>
            </div>
          </div>

          {/* Liability Limits */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <ShieldHalfIcon
                className="mr-2"
                size={38}
                color="orange"
              />
              Liability Limits
            </h2>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We are not responsible for:
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <CrossIcon
                  className="mr-2 h-[24px] min-h-[24px] w-[24px] min-w-[24px] rotate-45"
                  color="red"
                />
                <span>System damage from following our tutorials</span>
              </li>
              <li className="flex items-start">
                <CrossIcon
                  className="mr-2 h-[24px] min-h-[24px] w-[24px] min-w-[24px] rotate-45"
                  color="red"
                />
                <span>Lost productivity during your learning process</span>
              </li>
              <li className="flex items-start">
                <CrossIcon
                  className="mr-2 h-[24px] min-h-[24px] w-[24px] min-w-[24px] rotate-45"
                  color="red"
                />
                <span>
                  Issues arising from including but not limited to software
                  bugs, service outages, or data breaches caused by third
                  parties.
                </span>
              </li>
              <li className="flex items-start">
                <CrossIcon
                  className="mr-2 h-[24px] min-h-[24px] w-[24px] min-w-[24px] rotate-45"
                  color="red"
                />
                <span>
                  Damages or losses resulting from reliance on or use of
                  user-generated content, including but not limited to code,
                  configurations, or advice shared in community forums or
                  submissions.
                </span>
              </li>
              <li className="flex items-start">
                <CrossIcon
                  className="mr-2 h-[24px] min-h-[24px] w-[24px] min-w-[24px] rotate-45"
                  color="red"
                />
                <span>
                  Loss or corruption of user data, including but not limited to
                  course progress, challenge submissions, or account
                  information, due to technical failures or other issues.
                </span>
              </li>
              <li className="flex items-start">
                <CrossIcon
                  className="mr-2 h-[24px] min-h-[24px] w-[24px] min-w-[24px] rotate-45"
                  color="red"
                />
                <span>
                  Losses or inconveniences caused by platform downtime,
                  maintenance, or unavailability of services, whether planned or
                  unplanned.
                </span>
              </li>
              <li className="flex items-start">
                <CrossIcon
                  className="mr-2 h-[24px] min-h-[24px] w-[24px] min-w-[24px] rotate-45"
                  color="red"
                />
                <span>
                  Any issues related to the quality, availability, or support of
                  free courses or course previews, which are provided as-is with
                  no guarantees.
                </span>
              </li>
            </ul>

            <div className="mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Our maximum liability for any claim is limited to the amount you
                paid us in the past 12 months.
              </p>
            </div>
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
                  Privacy
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Review our{" "}
                  <a
                    className="text-green-500 underline hover:text-green-600"
                    href="/privacy"
                  >
                    Privacy Policy
                  </a>{" "}
                  to learn how we collect, use, and safeguard your personal
                  information.
                </p>
              </div>
            </div>
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
              Have questions about these terms? Contact us at{" "}
              <a
                className="text-green-500 underline hover:text-green-600"
                href="mailto:contact@codewizard.training"
              >
                contact@codewizard.training
              </a>
            </p>

            <div className="mt-6 rounded-lg bg-gray-700 p-4 dark:bg-gray-600">
              <p className="italic text-gray-300 dark:text-gray-200">
                Our terms aim to be clear and fair. Feel free to reach out if
                anything needs clarification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
