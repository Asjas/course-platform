import { useState } from "react";
import {
  Card,
  CardAction,
  CardContentList,
  CardContentListItem,
  CardFooter,
  CardHeader,
  CardPrice,
} from "~/components/ui/card";
import Section from "~/components/ui/section";

export default function PricingSection() {
  const [coursePurchases] = useState(0);

  return (
    <Section>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-slate-300">
            These skills are timeless, and essential even in an AI-driven world.
          </p>
        </div>
        <div className="mx-auto mb-12 grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Free price card */}
          <Card>
            <CardHeader>
              Preview Course
              <img
                className="inline h-10 invert dark:invert-0"
                src="fastify-white.svg"
                alt="Fastify"
              />
            </CardHeader>
            <CardPrice>$0</CardPrice>
            <CardContentList>
              <CardContentListItem customClasses="text-purple-400">
                3 modules
              </CardContentListItem>
              <CardContentListItem>
                Stream and download DRM-free videos from any device
              </CardContentListItem>
              <CardContentListItem>
                Unlimited content updates
              </CardContentListItem>
            </CardContentList>
            <div className="mt-auto mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4 text-green-500 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>22 min</span>
                </div>

                <div className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4 text-green-500 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                  </svg>
                  <span>3 modules</span>
                </div>

                <div className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4 text-green-500 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>12 lessons</span>
                </div>
              </div>
            </div>
            <CardAction to="/signup">Free</CardAction>
            <CardFooter>Join {coursePurchases} others!</CardFooter>
            <CardFooter>Try the course without paying.</CardFooter>
          </Card>

          {/* Paid price card */}
          <Card>
            <CardHeader>
              Full Course
              <img
                className="inline h-10 invert dark:invert-0"
                src="fastify-white.svg"
                alt="Fastify"
              />
            </CardHeader>
            <CardPrice>$19</CardPrice>
            <CardContentList>
              <CardContentListItem>All modules</CardContentListItem>
              <CardContentListItem>
                Stream and download DRM-free videos from any device
              </CardContentListItem>
              <CardContentListItem>
                Unlimited content updates
              </CardContentListItem>
            </CardContentList>
            <div className="mt-auto mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4 text-green-500 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>256 min</span>
                </div>

                <div className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4 text-green-500 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                  </svg>
                  <span>13 modules</span>
                </div>

                <div className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4 text-green-500 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>88 lessons</span>
                </div>
              </div>
            </div>
            <CardAction to="/checkout">Buy full course</CardAction>
            <CardFooter>{coursePurchases} already sold!</CardFooter>
            <CardFooter>30-day money-back guarantee.</CardFooter>
          </Card>
        </div>

        <div className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="pt-1 text-gray-600 dark:text-gray-300">
                Cancel anytime
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="pt-1 text-gray-600 dark:text-gray-300">
                30-day guarantee
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="pt-1 text-gray-600 dark:text-gray-300">
                Secure payment
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
