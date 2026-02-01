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
} from "lucide-react";

const features = [
  {
    icon: FileUp,
    title: "Multi-Source Upload",
    description:
      "PDFs, websites, YouTube videos, audio files - upload any source and watch AI synthesize them all.",
    gradient: "from-synapse-500/20 to-synapse-600/10",
  },
  {
    icon: MessageSquare,
    title: "Conversational AI",
    description:
      "Ask questions naturally and get cited answers from your documents. Like ChatGPT, but grounded in your sources.",
    gradient: "from-cognition-500/20 to-cognition-600/10",
  },
  {
    icon: Brain,
    title: "Deep Understanding",
    description:
      "Our AI doesn't just search keywords - it understands context, themes, and connections across your entire library.",
    gradient: "from-synapse-500/20 to-cognition-500/10",
  },
  {
    icon: AudioWaveform,
    title: "Audio Generation",
    description:
      "Transform your research into engaging podcast-style audio summaries. Perfect for learning on the go.",
    gradient: "from-insight-500/20 to-insight-600/10",
  },
  {
    icon: Workflow,
    title: "Mind Maps",
    description:
      "Visualize connections between concepts. See how ideas relate and discover patterns you'd never find manually.",
    gradient: "from-cognition-500/20 to-synapse-500/10",
  },
  {
    icon: GalleryVerticalEnd,
    title: "Flashcards & Quizzes",
    description:
      "Automatically generate study materials from your sources. Reinforce learning with spaced repetition.",
    gradient: "from-success-500/20 to-success-600/10",
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
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Features
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            Everything You Need for Research
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools designed for researchers, students, and curious minds
            who want to understand more, faster.
          </p>
        </div>

        {/* Capabilities row */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {capabilities.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-border text-sm font-medium text-muted-foreground"
            >
              <Icon className="w-4 h-4 text-synapse-500" />
              {label}
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 lg:p-8 rounded-2xl bg-surface-1 border border-border hover:border-synapse-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient hover effect */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-synapse-500/30 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-synapse-500" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            And many more features.{" "}
            <a
              href="#pricing"
              className="text-synapse-500 font-medium hover:underline"
            >
              Start exploring for free
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
