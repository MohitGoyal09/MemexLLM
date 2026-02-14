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
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <LandingNav user={user} />
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
