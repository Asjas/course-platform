import { createFileRoute } from "@tanstack/react-router";
import {
  BabyIcon,
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
  component: PrivacyComponent,
});

function PrivacyComponent() {
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
              Last Updated: September 1, 2025 • Version 1.0
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              We comply with South Africa&apos;s POPIA, the EU&apos;s GDPR, the
              UK-GDPR, California&apos;s CCPA/CPRA, Brazil&apos;s LGPD,
              Australia&apos;s APPs, and other applicable data protection laws.
            </p>
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
                  <li>Time spent on various features</li>
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
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <CreditCardIcon
                      className="mr-2"
                      size={24}
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <div>
                      <strong>Polar</strong> - Processes payments securely. They
                      handle your payment details directly. See their{" "}
                      <a
                        className="text-green-500 underline"
                        href="https://polar.sh/legal/privacy"
                      >
                        Privacy Policy
                      </a>
                      .
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ServerIcon
                      className="mr-2"
                      size={24}
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <div>
                      <strong>Netcup</strong> - Hosts our servers. They process
                      data but do not access personal information.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MailIcon
                      className="mr-2"
                      size={24}
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <div>
                      <strong>Proton Email</strong> - Delivers course updates,
                      authentication emails, and newsletters. See their{" "}
                      <a
                        className="text-green-500 underline"
                        href="https://proton.me/legal/privacy"
                      >
                        Privacy Policy
                      </a>
                      .
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChartBarIncreasingIcon
                      className="mr-2"
                      size={24}
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <div>
                      <strong>Self-hosted Ackee (Analytics)</strong> - Tracks
                      anonymized usage data to improve our platform. No personal
                      data is shared externally..
                    </div>
                  </li>
                  <li className="flex items-start">
                    <YoutubeIcon
                      className="mr-2"
                      size={24}
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
                    />
                    <div>
                      <strong>YouTube</strong> - Hosts course videos. May
                      collect analytics on video interactions. See their{" "}
                      <a
                        className="text-green-500 underline"
                        href="https://policies.google.com/privacy"
                      >
                        Privacy Policy
                      </a>
                      .
                    </div>
                  </li>
                  <li className="flex items-start">
                    <BugIcon
                      className="mr-2"
                      size={24}
                      color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
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
                <strong>Access</strong> - Request a copy of your personal data.
              </li>
              <li>
                <strong>Rectification</strong> - Ask us to correct inaccurate
                information.
              </li>
              <li>
                <strong>Erasure</strong> (“Right to be forgotten”) - Request
                deletion of your data.
              </li>
              <li>
                <strong>Restriction</strong> - Limit how we process your data.
              </li>
              <li>
                <strong>Portability</strong> - Receive your data in a
                transferable format.
              </li>
              <li>
                <strong>Objection</strong> - Opt-out of processing based on
                legitimate interests.
              </li>
              <li>
                <strong>Withdraw Consent</strong> - Withdraw any consents
                you&apos;ve given.
              </li>
              <li>
                <strong>CCPA/CPRA:</strong> Right to know, delete, opt-out of
                sale, and non-discrimination.
              </li>
              <li>
                <strong>POPIA:</strong> Correct/erase your data and lodge
                complaints with the Information Regulator.
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              To exercise any right, contact our Data Protection Officer below.
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
              We use essential cookies to maintain your login session and save
              preferences. We avoid third-party tracking cookies.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Essential Cookies:
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>Essential:</strong> Session, CSRF, preferences.
                  </li>
                  <li>
                    <strong>Analytics:</strong> Ackee (anonymized). Opt-out via
                    settings.
                  </li>
                </ul>
              </div>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                You can manage or withdraw consent anytime via the cookie banner
                or in your account settings.
              </p>
            </div>
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

            {/* ...existing intro... */}
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Retention by Category
            </h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Account Data:</strong> Until deletion request + 7 years
                for legal.
              </li>
              <li>
                <strong>Usage &amp; Analytics:</strong> 2 years (anonymized).
              </li>
              <li>
                <strong>Support Requests:</strong> Personal identifiers removed
                on account deletion; anonymized support transcripts retained
                indefinitely so other users can publicly access and benefit from
                common solutions.
              </li>
            </ul>
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
              Our platform is not intended for users under 16. If we discover
              data from a user under 16 without parental consent, we will delete
              it promptly. Contact us for assistance.
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
              We use Standard Contractual Clauses (SCCs) and Binding Corporate
              Rules to protect transfers between South Africa, the EU/UK, and
              other regions. Where adequacy decisions exist, we rely on them.
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
                  className="text-green-500 underline hover:no-underline"
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
                  className="text-green-500 underline hover:no-underline"
                  href="https://ico.org.uk/"
                >
                  https://ico.org.uk/
                </a>
              </li>
              <li>
                <strong>California:</strong> California Attorney General -{" "}
                <a
                  className="text-green-500 underline hover:no-underline"
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
                    className="text-green-500 underline hover:text-green-600"
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
                className="text-green-500 underline hover:text-green-600"
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
