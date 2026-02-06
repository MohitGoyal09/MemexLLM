"use client";

import { useEffect, useState } from "react";
import { FileUp, Sparkles, MessageSquare, Lightbulb, ArrowRight, Upload, Wand2, Search, BookOpen } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Drop Your Documents",
    description:
      "Drag PDFs, paste URLs, or connect your Google Drive. We support 50+ formats—from dense research papers to lecture recordings.",
    visual: (
      <div className="relative h-44 bg-surface-2 rounded-xl overflow-hidden group">
        <div className="absolute inset-4 flex flex-col gap-2">
          {[
            { name: "thesis-draft.pdf", size: "2.4 MB", progress: 100 },
            { name: "interview-notes.docx", size: "856 KB", progress: 100 },
            { name: "lecture-recording.mp3", size: "45 MB", progress: 75 },
          ].map((file, i) => (
            <div
              key={file.name}
              className="flex items-center gap-3 p-2.5 bg-surface-1 rounded-lg border border-border animate-stagger-fade-up hover:border-synapse-500/30 transition-colors"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-9 h-9 rounded-lg bg-synapse-500/10 flex items-center justify-center">
                <FileUp className="w-4 h-4 text-synapse-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{file.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-synapse-500 rounded-full transition-all duration-1000"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{file.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Reads & Connects",
    description:
      "Our AI digests every document, understands context, and builds a knowledge graph—revealing connections you'd never find manually.",
    visual: (
      <div className="relative h-44 bg-surface-2 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="relative">
          {/* Central node with pulse */}
          <div className="w-16 h-16 rounded-full bg-synapse-500 flex items-center justify-center shadow-lg shadow-synapse-500/30 animate-pulse-scale">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          {/* Orbiting nodes with staggered animation */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute w-7 h-7 rounded-full bg-surface-1 border border-synapse-500/30 shadow-sm flex items-center justify-center animate-pop-in"
              style={{
                top: `${50 + 50 * Math.sin((i * Math.PI) / 3)}%`,
                left: `${50 + 50 * Math.cos((i * Math.PI) / 3)}%`,
                transform: "translate(-50%, -50%)",
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-synapse-500/50" />
            </div>
          ))}
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: "scale(2.5)" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${50 + 50 * Math.cos((i * Math.PI) / 3)}%`}
                y2={`${50 + 50 * Math.sin((i * Math.PI) / 3)}%`}
                stroke="oklch(0.65 0.17 68 / 0.3)"
                strokeWidth="1"
                strokeDasharray="3 3"
                className="animate-fade-in"
                style={{ animationDelay: `${i * 100 + 300}ms` }}
              />
            ))}
          </svg>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: Search,
    title: "Ask Anything",
    description:
      "Chat naturally with your documents. Get instant, cited answers with exact page references—like having a research assistant on demand.",
    visual: (
      <div className="relative h-44 bg-surface-2 rounded-xl overflow-hidden">
        <div className="absolute inset-4 flex flex-col justify-end gap-2">
          <div className="self-end max-w-[80%] p-3 bg-synapse-500 text-white text-sm rounded-2xl rounded-br-sm animate-slide-up-bounce shadow-lg">
            What are the main methodological limitations?
          </div>
          <div 
            className="self-start max-w-[90%] p-3 bg-surface-1 border border-border text-sm rounded-2xl rounded-bl-sm animate-slide-up-bounce shadow-sm" 
            style={{ animationDelay: "200ms" }}
          >
            <p className="text-foreground mb-2">Based on your 3 papers, the main limitations are:</p>
            <ul className="text-muted-foreground text-xs space-y-1 mb-2">
              <li>• Small sample size (n=45)</li>
              <li>• Self-reported data may introduce bias</li>
            </ul>
            <p className="text-xs text-synapse-500 font-medium">[Source: paper1.pdf, p.12-14]</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    icon: BookOpen,
    title: "Learn & Remember",
    description:
      "Generate summaries, mind maps, flashcards, and audio overviews. Turn raw research into knowledge that sticks.",
    visual: (
      <div className="relative h-44 bg-surface-2 rounded-xl overflow-hidden">
        <div className="absolute inset-4 grid grid-cols-2 gap-2">
          {[
            { label: "Summary", icon: "📝", color: "bg-blue-500/10 border-blue-500/20" },
            { label: "Mind Map", icon: "🧠", color: "bg-purple-500/10 border-purple-500/20" },
            { label: "Flashcards", icon: "🎴", color: "bg-amber-500/10 border-amber-500/20" },
            { label: "Audio", icon: "🎧", color: "bg-emerald-500/10 border-emerald-500/20" },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 p-3 rounded-lg border ${item.color} hover:scale-105 transition-transform cursor-pointer animate-pop-in`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">Auto-generated</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function LandingHowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-step") || "0");
            setVisibleSteps((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll("[data-step]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4 animate-bounce-in">
            <Lightbulb className="w-3.5 h-3.5" />
            Simple Workflow
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            From Chaos to Clarity in 4 Steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No complex setup. No learning curve. Just upload and start discovering.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.number} 
              data-step={index}
              className={`relative ${visibleSteps.has(index) ? 'animate-slide-up-bounce' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-[60%] w-[80%] h-px">
                  <div className={`w-full h-full bg-gradient-to-r from-synapse-500/50 to-transparent ${visibleSteps.has(index) ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: `${index * 150 + 300}ms` }} />
                  <ArrowRight className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-synapse-500/50 ${visibleSteps.has(index) ? 'animate-pop-in' : 'opacity-0'}`} style={{ animationDelay: `${index * 150 + 500}ms` }} />
                </div>
              )}

              <div className="flex flex-col">
                {/* Number badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold text-synapse-500/20">
                    {step.number}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-synapse-500 flex items-center justify-center shadow-lg shadow-synapse-500/30 spring-transition hover:scale-110">
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
