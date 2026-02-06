"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, Shield, Zap, Users } from "lucide-react";

const benefitsList = [
  { icon: Clock, text: "Setup in 2 minutes" },
  { icon: Shield, text: "No credit card required" },
  { icon: Zap, text: "Instant AI analysis" },
  { icon: Users, text: "Team collaboration included" },
];

export function LandingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById("final-cta");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="final-cta"
      className="relative py-24 lg:py-32 bg-surface-0 overflow-hidden"
    >
      {/* Background gradient - enhanced */}
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, oklch(0.65 0.17 68 / 0.12), transparent)
          `,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-synapse-500/30 animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Avatar stack with animation */}
        <div className={`flex justify-center mb-8 ${isVisible ? 'animate-bounce-in' : 'opacity-0'}`}>
          <div className="flex -space-x-3">
            {[
              { initials: "SK", color: "bg-blue-500" },
              { initials: "MT", color: "bg-emerald-500" },
              { initials: "ER", color: "bg-amber-500" },
              { initials: "DL", color: "bg-rose-500" },
              { initials: "MS", color: "bg-purple-500" },
              { initials: "JW", color: "bg-teal-500" },
            ].map((user, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full ${user.color} border-3 border-surface-0 shadow-lg flex items-center justify-center text-white text-sm font-bold spring-transition hover:scale-110 hover:z-10`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {user.initials}
              </div>
            ))}
          </div>
        </div>

        {/* Headline - action-oriented */}
        <h2 
          className={`text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 ${isVisible ? 'animate-slide-up-bounce' : 'opacity-0'}`}
          style={{ animationDelay: "100ms" }}
        >
          Your Next Breakthrough Is{" "}
          <span className="text-synapse-500">One Upload Away</span>
        </h2>

        {/* Subheadline - create urgency with FOMO */}
        <p 
          className={`text-lg text-muted-foreground max-w-2xl mx-auto mb-6 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: "200ms" }}
        >
          Join <span className="font-semibold text-foreground">10,000+ researchers</span> who read smarter, 
          not harder. While others drown in documents, you&apos;ll be discovering insights.
        </p>

        {/* Benefits row */}
        <div 
          className={`flex flex-wrap justify-center gap-4 mb-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: "300ms" }}
        >
          {benefitsList.map((benefit, i) => (
            <div
              key={benefit.text}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <benefit.icon className="w-4 h-4 text-synapse-500" />
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button - prominent with animation */}
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 ${isVisible ? 'animate-slide-up-bounce' : 'opacity-0'}`}
          style={{ animationDelay: "400ms" }}
        >
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="h-16 px-12 text-lg font-semibold rounded-full shadow-xl shadow-synapse-500/30 hover:shadow-2xl hover:shadow-synapse-500/40 transition-all duration-300 gap-3 spring-transition hover:scale-105 animate-pulse-scale"
              style={{ animationDuration: "3s" }}
            >
              <Sparkles className="w-5 h-5" />
              Start My Free Research
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Risk reversal - trust builder */}
        <div 
          className={`space-y-2 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: "500ms" }}
        >
          <p className="text-sm text-muted-foreground">
            ✓ Free forever for personal use • ✓ No credit card required • ✓ Cancel anytime
          </p>
          <p className="text-xs text-muted-foreground/70">
            Or self-host for complete data privacy with our open source version
          </p>
        </div>

        {/* Social proof nudge */}
        <div 
          className={`mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-border text-sm ${isVisible ? 'animate-bounce-in' : 'opacity-0'}`}
          style={{ animationDelay: "600ms" }}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">127 researchers</span> signed up today
          </span>
        </div>
      </div>
    </section>
  );
}
