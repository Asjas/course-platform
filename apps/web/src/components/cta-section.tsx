import { Link } from "@tanstack/react-router";
import Section from "~/components/ui/section";

export default function CTASection() {
  return (
    <Section>
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
          Ready to level up your skills?
        </h2>
        <p className="mt-8 mb-4 text-xl text-gray-600 dark:text-slate-300">
          Create a free account.
        </p>
        <p className="mb-12 text-xl text-gray-600 dark:text-slate-300">
          Watch a few free modules and then decide on whether you want to buy
          the course or not.
        </p>
        <div className="flex justify-center">
          <Link
            className="inline-flex transform items-center justify-center rounded-lg bg-linear-to-r from-yellow-600 to-green-600 px-16 py-5 text-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-yellow-700 hover:to-green-700 hover:shadow-xl"
            to="/signup"
          >
            Try it free
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Cancel anytime. 30-Day money-back guarantee.
        </p>
      </div>
    </Section>
  );
}
