import { createFileRoute } from "@tanstack/react-router";
import CTASection from "~/components/cta-section";
import InstructorCard from "~/components/instructor-card";
import PricingSection from "~/components/pricing-section";
import Section from "~/components/ui/section";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  return (
    <main className="px-4">
      {/* Hero Section */}
      <div className="pt-20 text-center">
        <h1 className="mb-6 bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text pb-12 text-5xl font-bold text-transparent md:text-7xl dark:from-white dark:to-slate-300">
          Master Lasting{" "}
          <span className="text-green-500 dark:text-green-400">
            Web Dev Skills
          </span>
        </h1>
        <p className="mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-600 md:text-2xl dark:text-slate-300">
          Interactive course lessons in Fastify, JavaScript and TypeScript.
          Master the essential web development skills every developer needs,
          regardless of your tech stack or AI tools.
        </p>
      </div>

      {/* About the instructor */}
      <Section>
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
              Meet Your Instructor
            </h2>
          </div>

          <InstructorCard hideHeading={true} />
        </div>
      </Section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final Call To Action */}
      <CTASection />
    </main>
  );
}
