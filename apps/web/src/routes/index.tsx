import { createFileRoute } from "@tanstack/react-router";
import CTASection from "~/components/cta-section";
import PricingSection from "~/components/pricing-section";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="flex w-full flex-col">
      <PricingSection />
      <CTASection />
    </div>
  );
}
