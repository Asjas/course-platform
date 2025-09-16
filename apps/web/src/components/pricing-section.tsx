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
  const [coursePurchases, setCoursePurchases] = useState(0);

  return (
    <Section>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-300">
            These skills are timeless, and essential even in an AI-driven world.
          </p>
        </div>
        <div className="mx-auto mb-12 grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Free price card */}
          <Card>
            <CardHeader>
              Try it out
              <img
                className="inline h-10"
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
            <CardAction to="/signup">Free</CardAction>
            <CardFooter>Join {coursePurchases} others!</CardFooter>
            <CardFooter>Try the course without paying.</CardFooter>
          </Card>

          {/* Paid price card */}
          <Card>
            <CardHeader>
              Full Course
              <img
                className="inline h-10"
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
            <CardAction to="/checkout">Buy full course</CardAction>
            <CardFooter>{coursePurchases} already sold!</CardFooter>
            <CardFooter>30-day money-back guarantee.</CardFooter>
          </Card>
        </div>
        <div className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span className="text-gray-300">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span className="text-gray-300">30-day guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span className="text-gray-300">Secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
