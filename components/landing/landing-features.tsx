"use client";

import {
  FileUp,
  MessageSquare,
  Brain,
  AudioWaveform,
  Workflow,
  GalleryVerticalEnd,
  Sparkles,
  Search,
  Link2,
  Zap,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeUp,
  popIn,
  staggerContainer,
  staggerContainerFast,
  cardItem,
  hoverLift,
  defaultViewport,
} from "@/lib/motion";

const features = [
  {
    icon: FileUp,
    title: "Drop Any Source",
    description:
      "PDFs, articles, YouTube videos, audio lectures—upload anything. We handle 50+ formats so you never have to convert again.",
    gradient: "from-synapse-500/20 to-synapse-600/10",
    stat: "50+",
    statLabel: "formats",
  },
  {
    icon: MessageSquare,
    title: "Chat With Your Papers",
    description:
      "Ask questions like you're talking to an expert. Get cited answers with exact page numbers—no more ctrl+F hunting.",
    gradient: "from-cognition-500/20 to-cognition-600/10",
    stat: "< 3s",
    statLabel: "response",
  },
  {
    icon: Brain,
    title: "See Hidden Connections",
    description:
      "Our AI doesn't just search keywords—it understands context and reveals patterns across your entire research library.",
    gradient: "from-synapse-500/20 to-cognition-500/10",
    stat: "10x",
    statLabel: "faster insights",
  },
  {
    icon: AudioWaveform,
    title: "Learn On-The-Go",
    description:
      "Turn dense papers into podcast-style summaries. Perfect for commutes, gym sessions, or when your eyes need a break.",
    gradient: "from-insight-500/20 to-insight-600/10",
    stat: "🎧",
    statLabel: "audio mode",
  },
  {
    icon: Workflow,
    title: "Map Your Knowledge",
    description:
      "Visualize how concepts connect across sources. Discover relationships you'd never find reading linearly.",
    gradient: "from-cognition-500/20 to-synapse-500/10",
    stat: "∞",
    statLabel: "connections",
  },
  {
    icon: GalleryVerticalEnd,
    title: "Ace Your Exams",
    description:
      "Auto-generate flashcards and quizzes from your readings. Spaced repetition built-in for long-term retention.",
    gradient: "from-success-500/20 to-success-600/10",
    stat: "2x",
    statLabel: "retention",
  },
];

const capabilities = [
  { icon: Search, label: "Semantic Search" },
  { icon: Link2, label: "Citation Tracking" },
  { icon: Sparkles, label: "AI Summaries" },
  { icon: Zap, label: "Instant Insights" },
];

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 bg-surface-0 overflow-hidden"
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 50% 50% at 0% 0%, oklch(0.65 0.17 68 / 0.08), transparent),
            radial-gradient(ellipse 50% 50% at 100% 100%, oklch(0.55 0.11 185 / 0.06), transparent)
          `,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16 lg:mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse-scale" />
            Powerful Features
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4"
          >
            Your Research Superpowers
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Tools designed by researchers, for researchers. Because your time is too valuable
            for manual document hunting.
          </motion.p>
        </motion.div>

        {/* Capabilities row - floating pills with bounce */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-16"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {capabilities.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              variants={popIn}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-border text-sm font-medium text-muted-foreground hover:border-synapse-500/30 hover:text-foreground transition-all duration-300 cursor-default"
              whileHover={hoverLift}
            >
              <Icon className="w-4 h-4 text-synapse-500" />
              {label}
            </motion.div>
          ))}
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardItem}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group relative p-6 lg:p-8 rounded-2xl bg-surface-1 border border-border hover:border-synapse-500/30 transition-colors duration-300 cursor-pointer"
            >
              {/* Gradient hover effect */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative">
                {/* Icon with bounce on hover */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center group-hover:scale-110 group-hover:border-synapse-500/30 group-hover:bg-synapse-500/10 transition-all duration-300 spring-transition">
                    <feature.icon className="w-6 h-6 text-synapse-500 group-hover:animate-wiggle" />
                  </div>
                  {/* Stat badge */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-synapse-500">{feature.stat}</p>
                    <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-synapse-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Learn more link - appears on hover */}
                <div className="flex items-center gap-1 text-sm text-synapse-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
        >
          <p className="text-muted-foreground">
            And many more features to accelerate your research.{" "}
            <a
              href="#pricing"
              className="text-synapse-500 font-medium hover:underline inline-flex items-center gap-1 group"
            >
              Start exploring free
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
