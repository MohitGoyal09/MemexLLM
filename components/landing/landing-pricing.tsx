"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight, Github, Server, Cloud, Zap, Users, Shield } from "lucide-react";

const tiers = [
  {
    name: "Self-Hosted",
    description: "Full control, zero cost. Perfect for privacy-conscious researchers.",
    price: "Free",
    priceDetail: "forever",
    icon: Server,
    features: [
      { text: "Unlimited documents", highlight: true },
      { text: "All AI features included", highlight: false },
      { text: "Complete data ownership", highlight: true },
      { text: "Community support", highlight: false },
      { text: "Docker & Kubernetes ready", highlight: false },
      { text: "MIT License", highlight: false },
    ],
    cta: "Star on GitHub",
    ctaVariant: "outline" as const,
    href: "https://github.com",
    popular: false,
    badge: null,
  },
  {
    name: "Cloud Pro",
    description: "Managed hosting with zero setup. Start researching in 2 minutes.",
    price: "$20",
    priceDetail: "/month",
    icon: Cloud,
    features: [
      { text: "Everything in Self-Hosted", highlight: false },
      { text: "Managed infrastructure", highlight: false },
      { text: "Priority AI processing", highlight: true },
      { text: "Team collaboration (5 seats)", highlight: true },
      { text: "Priority email support", highlight: false },
      { text: "99.9% uptime SLA", highlight: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    href: "/auth/sign-up",
    popular: true,
    badge: "Most Popular",
  },
];

const comparisonFeatures = [
  { label: "Multi-source RAG", elsewhere: "$5,000/yr", us: "Included" },
  { label: "AI summaries & flashcards", elsewhere: "$3,000/yr", us: "Included" },
  { label: "Semantic search", elsewhere: "$2,000/yr", us: "Included" },
  { label: "Self-hosting option", elsewhere: "Rare", us: "Free" },
];

export function LandingPricing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const section = document.getElementById("pricing");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      className="relative py-24 lg:py-32 bg-surface-1 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.65 0.17 68 / 0.1), transparent)
          `,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4 ${isVisible ? 'animate-bounce-in' : 'opacity-0'}`}>
            <Sparkles className="w-3.5 h-3.5" />
            Simple Pricing
          </div>
          <h2 className={`text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 ${isVisible ? 'animate-slide-up-bounce' : 'opacity-0'}`}>
            Research Tools Without the Research Budget
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: "100ms" }}>
            Get enterprise-grade research tools at student-friendly prices. 
            Or self-host for free—we believe knowledge should be accessible.
          </p>
        </div>

        {/* Value comparison - what others charge */}
        <div className={`mb-12 p-6 rounded-2xl bg-surface-2 border border-border max-w-3xl mx-auto ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: "200ms" }}>
          <p className="text-sm text-muted-foreground text-center mb-4">
            What you&apos;d pay elsewhere for these features:
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {comparisonFeatures.map((feature, i) => (
              <div 
                key={feature.label} 
                className={`text-center p-3 rounded-lg bg-surface-1 ${isVisible ? 'animate-pop-in' : 'opacity-0'}`}
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <p className="text-lg font-semibold text-muted-foreground line-through decoration-red-500/50">
                  {feature.elsewhere}
                </p>
                <p className="text-xs text-muted-foreground mb-1">{feature.label}</p>
                <p className="text-xs font-medium text-synapse-500">{feature.us}</p>
              </div>
            ))}
          </div>
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Total value: <span className="line-through">$10,000+/year</span>
            </p>
            <p className="text-xl font-bold text-synapse-500">
              Yours for $0 – $240/year
            </p>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative p-8 rounded-2xl border transition-all duration-500 hover-lift ${
                tier.popular
                  ? "bg-surface-0 border-synapse-500/50 shadow-xl shadow-synapse-500/10"
                  : "bg-surface-0 border-border hover:border-synapse-500/30"
              } ${isVisible ? 'animate-slide-up-bounce' : 'opacity-0'}`}
              style={{ animationDelay: `${400 + index * 150}ms` }}
            >
              {/* Popular badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 animate-bounce-in" style={{ animationDelay: "600ms" }}>
                  <span className="px-4 py-1 rounded-full bg-synapse-500 text-white text-xs font-semibold shadow-lg">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center spring-transition ${
                    tier.popular
                      ? "bg-synapse-500 text-white shadow-lg shadow-synapse-500/30"
                      : "bg-surface-2 border border-border text-muted-foreground"
                  }`}
                >
                  <tier.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {tier.name}
                  </h3>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-foreground">
                  {tier.price}
                </span>
                <span className="text-muted-foreground ml-1">
                  {tier.priceDetail}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li 
                    key={feature.text} 
                    className={`flex items-start gap-3 ${isVisible ? 'animate-stagger-fade-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${500 + index * 150 + i * 50}ms` }}
                  >
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-synapse-500' : 'text-muted-foreground'}`} />
                    <span className={feature.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {tier.name === "Self-Hosted" ? (
                <a href={tier.href} target="_blank" rel="noopener noreferrer">
                  <Button variant={tier.ctaVariant} className="w-full gap-2 h-12 spring-transition hover:scale-[1.02]">
                    <Github className="w-4 h-4" />
                    {tier.cta}
                  </Button>
                </a>
              ) : (
                <Link href={tier.href}>
                  <Button variant={tier.ctaVariant} className="w-full gap-2 h-12 spring-transition hover:scale-[1.02] shadow-lg shadow-synapse-500/20">
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className={`mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: "700ms" }}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-synapse-500" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-synapse-500" />
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-synapse-500" />
            <span>10,000+ Happy Researchers</span>
          </div>
        </div>

        {/* FAQ teaser */}
        <div className={`text-center mt-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: "800ms" }}>
          <p className="text-muted-foreground">
            Questions?{" "}
            <a
              href="#faq"
              className="text-synapse-500 font-medium hover:underline"
            >
              Check our FAQ
            </a>{" "}
            or{" "}
            <a
              href="mailto:support@memexllm.com"
              className="text-synapse-500 font-medium hover:underline"
            >
              contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
