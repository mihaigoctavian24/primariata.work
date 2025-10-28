import { Metadata } from "next";
import { SurveyLandingHeader } from "@/components/survey/SurveyLandingHeader";
import { AnimatedHero } from "@/components/survey/AnimatedHero";
import { AnimatedStats } from "@/components/survey/AnimatedStats";
import { AnimatedFeatures } from "@/components/survey/AnimatedFeatures";
import { AnimatedHowItWorks } from "@/components/survey/AnimatedHowItWorks";
import { AnimatedCTA } from "@/components/survey/AnimatedCTA";
import { AnimatedFooter } from "@/components/survey/AnimatedFooter";

export const metadata: Metadata = {
  title: "Chestionar Digitalizare | primariaTa",
  description:
    "Participă la chestionarul nostru despre digitalizarea serviciilor publice. Opinia ta contează în dezvoltarea platformei!",
};

export default function SurveyLandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <SurveyLandingHeader />
      <AnimatedHero />
      <AnimatedStats />
      <AnimatedFeatures />
      <AnimatedHowItWorks />
      <AnimatedCTA />
      <AnimatedFooter />
    </div>
  );
}
