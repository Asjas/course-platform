import { createFileRoute } from "@tanstack/react-router";
import CTASection from "~/components/cta-section";
import InstructorCard from "~/components/instructor-card";
import PricingSection from "~/components/pricing-section";
import Section from "~/components/ui/section";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="flex w-full flex-col">
      {/* Hero Section */}
      <div className="pt-20 text-center">
        <h1 className="mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
          Master Lasting <span className="text-green-400">Web Dev Skills</span>
        </h1>
        <p className="mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-slate-300 md:text-2xl">
          Interactive lessons in Fastify, Coolify, JavaScript, and TypeScript.
          Master the essential web development skills every developer needs,
          regardless of your tech stack or AI tools.
        </p>
      </div>

      {/* About the instructor */}
      <Section>
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
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
    </div>
  );
}
