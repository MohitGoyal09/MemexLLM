"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="relative py-24 lg:py-32 bg-surface-0 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, oklch(0.65 0.17 68 / 0.08), transparent)
          `,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Avatar stack */}
        <div className="flex justify-center mb-8">
          <div className="flex -space-x-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-synapse-400 to-synapse-600 border-3 border-surface-0 shadow-lg"
              />
            ))}
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
          Ready to Transform Your Research?
        </h2>

        {/* Subheadline */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Join 10,000+ researchers who've discovered a better way to process,
          understand, and synthesize information.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-full shadow-lg shadow-synapse-500/20 hover:shadow-xl hover:shadow-synapse-500/30 transition-all duration-300 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Trust text */}
        <p className="text-sm text-muted-foreground">
          No credit card required. Free forever for self-hosted.
        </p>
      </div>
    </section>
  );
}
