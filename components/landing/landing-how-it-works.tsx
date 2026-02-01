"use client";

import { FileUp, Sparkles, MessageSquare, Lightbulb, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileUp,
    title: "Upload Your Sources",
    description:
      "Drop PDFs, paste URLs, or upload audio files. We support 50+ file formats and can process entire research libraries.",
    visual: (
      <div className="relative h-40 bg-surface-2 rounded-xl overflow-hidden">
        <div className="absolute inset-4 flex flex-col gap-2">
          {["research-paper.pdf", "interview-notes.docx", "lecture.mp3"].map((file, i) => (
            <div
              key={file}
              className="flex items-center gap-3 p-2 bg-surface-1 rounded-lg border border-border animate-fade-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-synapse-500/10 flex items-center justify-center">
                <FileUp className="w-4 h-4 text-synapse-500" />
              </div>
              <span className="text-sm text-muted-foreground">{file}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Processes & Connects",
    description:
      "Our AI reads, understands context, and builds a knowledge graph connecting ideas across all your sources automatically.",
    visual: (
      <div className="relative h-40 bg-surface-2 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="relative">
          {/* Central node */}
          <div className="w-16 h-16 rounded-full bg-synapse-500 flex items-center justify-center shadow-lg shadow-synapse-500/30 animate-synapse-pulse">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          {/* Orbiting nodes */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute w-6 h-6 rounded-full bg-surface-1 border border-synapse-500/30 shadow-sm"
              style={{
                top: `${50 + 45 * Math.sin((i * Math.PI) / 3)}%`,
                left: `${50 + 45 * Math.cos((i * Math.PI) / 3)}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: "scale(2.5)" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${50 + 45 * Math.cos((i * Math.PI) / 3)}%`}
                y2={`${50 + 45 * Math.sin((i * Math.PI) / 3)}%`}
                stroke="oklch(0.65 0.17 68 / 0.3)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            ))}
          </svg>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Ask Questions Naturally",
    description:
      "Chat with your documents like talking to an expert. Get cited answers with references to exact sources and page numbers.",
    visual: (
      <div className="relative h-40 bg-surface-2 rounded-xl overflow-hidden">
        <div className="absolute inset-4 flex flex-col justify-end gap-2">
          <div className="self-end max-w-[80%] p-3 bg-synapse-500 text-white text-sm rounded-2xl rounded-br-sm animate-fade-up">
            What are the key findings?
          </div>
          <div className="self-start max-w-[85%] p-3 bg-surface-1 border border-border text-sm rounded-2xl rounded-bl-sm animate-fade-up" style={{ animationDelay: "200ms" }}>
            <p className="text-foreground mb-1">Based on your 3 papers, the main findings are...</p>
            <p className="text-xs text-synapse-500">[Source: paper1.pdf, p.12]</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    icon: Lightbulb,
    title: "Discover Insights",
    description:
      "Generate summaries, mind maps, flashcards, and audio overviews. Transform raw research into actionable knowledge.",
    visual: (
      <div className="relative h-40 bg-surface-2 rounded-xl overflow-hidden">
        <div className="absolute inset-4 grid grid-cols-2 gap-2">
          {[
            { label: "Summary", icon: "S" },
            { label: "Mind Map", icon: "M" },
            { label: "Quiz", icon: "Q" },
            { label: "Audio", icon: "A" },
          ].map((item, i) => (
            <div
              key={item.label}
              className="flex items-center gap-2 p-2 bg-surface-1 rounded-lg border border-border hover:border-synapse-500/30 transition-colors animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-synapse-500/10 flex items-center justify-center text-synapse-500 font-semibold text-sm">
                {item.icon}
              </div>
              <span className="text-sm text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 lg:py-32 bg-surface-1 overflow-hidden"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            From Documents to Understanding
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform how you process information
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-[60%] w-[80%] h-px">
                  <div className="w-full h-full bg-gradient-to-r from-border to-transparent" />
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-border" />
                </div>
              )}

              <div className="flex flex-col">
                {/* Number badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold text-synapse-500/20">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-synapse-500 flex items-center justify-center shadow-lg shadow-synapse-500/20">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Visual */}
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
