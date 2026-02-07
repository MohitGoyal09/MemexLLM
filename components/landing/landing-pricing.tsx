"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight, Github, Server, Cloud, Zap, Users, Shield } from "lucide-react";
import {
  fadeUp,
  fadeUpSpring,
  popIn,
  staggerContainer,
  staggerContainerSlow,
  cardItem,
} from "@/lib/motion";
import ShimmerButton from "@/components/magicui/shimmer-button";

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

const featureItemVariant = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const featureStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.3,
    },
  },
};

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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simple Pricing
          </motion.div>
          <motion.h2
            variants={fadeUpSpring}
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4"
          >
            Research Tools Without the Research Budget
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Get enterprise-grade research tools at student-friendly prices.
            Or self-host for free—we believe knowledge should be accessible.
          </motion.p>
        </motion.div>

        {/* Value comparison - what others charge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12 p-6 rounded-2xl bg-surface-2 border border-border max-w-3xl mx-auto"
        >
          <p className="text-sm text-muted-foreground text-center mb-4">
            What you&apos;d pay elsewhere for these features:
          </p>
          <motion.div
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
          >
            {comparisonFeatures.map((feature) => (
              <motion.div
                key={feature.label}
                variants={popIn}
                className="text-center p-3 rounded-lg bg-surface-1"
              >
                <p className="text-lg font-semibold text-muted-foreground line-through decoration-red-500/50">
                  {feature.elsewhere}
                </p>
                <p className="text-xs text-muted-foreground mb-1">{feature.label}</p>
                <p className="text-xs font-medium text-synapse-500">{feature.us}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Total value: <span className="line-through">$10,000+/year</span>
            </p>
            <p className="text-xl font-bold text-synapse-500">
              Yours for $0 – $240/year
            </p>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardItem}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 25 } }}
              className={`relative p-8 rounded-2xl border transition-colors duration-300 ${
                tier.popular
                  ? "bg-surface-0 border-synapse-500/50 shadow-xl shadow-synapse-500/10"
                  : "bg-surface-0 border-border hover:border-synapse-500/30"
              }`}
            >
              {/* Popular badge */}
              {tier.badge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: -10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.4 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  <span className="px-4 py-1 rounded-full bg-synapse-500 text-white text-xs font-semibold shadow-lg">
                    {tier.badge}
                  </span>
                </motion.div>
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
              <motion.ul
                variants={featureStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="space-y-3 mb-8"
              >
                {tier.features.map((feature) => (
                  <motion.li
                    key={feature.text}
                    variants={featureItemVariant}
                    className="flex items-start gap-3"
                  >
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-synapse-500' : 'text-muted-foreground'}`} />
                    <span className={feature.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* CTA */}
              {tier.name === "Self-Hosted" ? (
                <a href={tier.href} target="_blank" rel="noopener noreferrer">
                  <Button variant={tier.ctaVariant} className="w-full gap-2 h-12 spring-transition hover:scale-[1.02]">
                    <Github className="w-4 h-4" />
                    {tier.cta}
                  </Button>
                </a>
              ) : (
                <Link href={tier.href} className="w-full">
                  <ShimmerButton
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-synapse-500/20 hover:shadow-xl hover:shadow-synapse-500/30 transition-all duration-300 gap-2"
                    background="oklch(0.65 0.17 68)"
                    shimmerColor="#ffffff"
                    shimmerDuration="2s"
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </ShimmerButton>
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Trust signals */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
        >
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
        </motion.div>

        {/* FAQ teaser */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="text-center mt-8"
        >
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
        </motion.div>
      </div>
    </section>
  );
}
