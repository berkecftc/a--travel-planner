import { TravelPlanForm } from "@/components/travel-plan-form";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Contact } from "@/components/contact";
import { FormMapBridge } from "@/components/form-map-bridge";

export default function Home() {
  return (
    <main>
      <Hero />
  <HowItWorks />
  <FormMapBridge />
  <Contact />
    </main>
  );
}
