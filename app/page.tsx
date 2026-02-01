"use client";

import {
  LandingNav,
  LandingHero,
  LandingFeatures,
  LandingHowItWorks,
  LandingTestimonials,
  LandingPricing,
  LandingCTA,
  LandingFooter,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingPricing />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
