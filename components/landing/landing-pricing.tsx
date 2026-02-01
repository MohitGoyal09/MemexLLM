"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight, Github, Server, Cloud } from "lucide-react";

const tiers = [
  {
    name: "Self-Hosted",
    description: "Deploy on your own infrastructure. Full control, zero cost.",
    price: "Free",
    priceDetail: "forever",
    icon: Server,
    features: [
      "Unlimited documents",
      "All AI features",
      "Full data ownership",
      "Community support",
      "Docker & Kubernetes ready",
      "MIT License",
    ],
    cta: "View on GitHub",
    ctaVariant: "outline" as const,
    href: "https://github.com",
    popular: false,
  },
  {
    name: "Cloud Pro",
    description: "Managed hosting with premium features and priority support.",
    price: "$20",
    priceDetail: "/month",
    icon: Cloud,
    features: [
      "Everything in Self-Hosted",
      "Managed infrastructure",
      "Priority AI processing",
      "Team collaboration",
      "Priority email support",
      "99.9% uptime SLA",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    href: "/auth/sign-up",
    popular: true,
  },
];

const valueProps = [
  { label: "Multi-source RAG", value: "$5,000/yr" },
  { label: "Auto-generation tools", value: "$3,000/yr" },
  { label: "Enterprise search", value: "$2,000/yr" },
  { label: "Self-hosting", value: "$1,000/yr" },
];

export function LandingPricing() {
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Simple Pricing
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            Open Source. Affordable. Powerful.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get enterprise-grade research tools without the enterprise price tag.
            Self-host for free or let us handle the infrastructure.
          </p>
        </div>

        {/* Value comparison */}
        <div className="mb-12 p-6 rounded-2xl bg-surface-2 border border-border max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground text-center mb-4">
            What you'd pay elsewhere for these features:
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {valueProps.map((prop) => (
              <div key={prop.label} className="text-center">
                <p className="text-lg font-semibold text-muted-foreground line-through decoration-red-500/50">
                  {prop.value}
                </p>
                <p className="text-xs text-muted-foreground">{prop.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Total value: <span className="line-through">$11,000/year</span>
            </p>
            <p className="text-xl font-bold text-synapse-500">
              Yours for $0 - $240/year
            </p>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                tier.popular
                  ? "bg-surface-0 border-synapse-500/50 shadow-xl shadow-synapse-500/10"
                  : "bg-surface-0 border-border hover:border-border-emphasis"
              }`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-synapse-500 text-white text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tier.popular
                      ? "bg-synapse-500 text-white"
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
                <span className="text-4xl font-bold text-foreground">
                  {tier.price}
                </span>
                <span className="text-muted-foreground ml-1">
                  {tier.priceDetail}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-synapse-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {tier.name === "Self-Hosted" ? (
                <a href={tier.href} target="_blank" rel="noopener noreferrer">
                  <Button variant={tier.ctaVariant} className="w-full gap-2">
                    <Github className="w-4 h-4" />
                    {tier.cta}
                  </Button>
                </a>
              ) : (
                <Link href={tier.href}>
                  <Button variant={tier.ctaVariant} className="w-full gap-2">
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="text-center mt-12">
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
