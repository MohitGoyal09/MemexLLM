"use client";

import {
  FileUp,
  Sparkles,
  Lightbulb,
  Upload,
  Wand2,
  Search,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeUp,
  fadeUpSpring,
  scaleIn,
  staggerContainer,
  defaultViewport,
} from "@/lib/motion";

/* ── Visual Mockup Components ──────────────────────────────────── */

function UploadVisual() {
  const files = [
    { name: "thesis-draft.pdf", size: "2.4 MB", progress: 100 },
    { name: "interview-notes.docx", size: "856 KB", progress: 100 },
    { name: "lecture-recording.mp3", size: "45 MB", progress: 72 },
  ];

  return (
    <div className="rounded-xl bg-surface-2 p-4 sm:p-5 space-y-2.5">
      {files.map((file, i) => (
        <div
          key={file.name}
          className="flex items-center gap-3 rounded-lg bg-surface-1 border border-border/50 p-3"
        >
          <div className="shrink-0 w-10 h-10 rounded-lg bg-synapse-500/10 flex items-center justify-center">
            <FileUp className="w-4 h-4 text-synapse-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {file.size}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-synapse-500 to-synapse-400 transition-all duration-1000"
                style={{ width: `${file.progress}%` }}
              />
            </div>
          </div>
          {file.progress === 100 && (
            <span className="shrink-0 text-xs font-medium text-emerald-500">
              Done
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function KnowledgeGraphVisual() {
  const nodes = [
    { label: "PDF", x: 18, y: 22 },
    { label: "Web", x: 82, y: 18 },
    { label: "Doc", x: 14, y: 78 },
    { label: "Audio", x: 84, y: 76 },
    { label: "Notes", x: 50, y: 92 },
  ];

  return (
    <div className="rounded-xl bg-surface-2 p-4 sm:p-5">
      <div className="relative h-56">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-cognition-500/10 blur-2xl" />

        {/* SVG connection lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {nodes.map((node) => (
            <line
              key={node.label}
              x1="50%"
              y1="50%"
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="oklch(0.7 0.12 175 / 0.2)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {/* Central AI node */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-cognition-400 to-cognition-600 flex items-center justify-center shadow-lg shadow-cognition-500/25">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {/* Orbiting document nodes */}
        {nodes.map((node) => (
          <div
            key={node.label}
            className="absolute w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface-1 border border-cognition-500/20 flex items-center justify-center shadow-sm"
            style={{ top: `${node.y}%`, left: `${node.x}%` }}
          >
            <span className="text-[10px] font-bold text-cognition-500 uppercase tracking-wider">
              {node.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="rounded-xl bg-surface-2 p-4 sm:p-5 space-y-3">
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-synapse-500 px-4 py-2.5 text-sm text-white shadow-md shadow-synapse-500/15">
          What are the main limitations?
        </div>
      </div>
      {/* AI response */}
      <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-surface-1 border border-border/50 px-4 py-3">
        <p className="text-sm text-foreground leading-relaxed">
          Based on your 3 papers, the key limitations are:
        </p>
        <ul className="mt-2 space-y-1.5 text-[13px] text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-synapse-500 font-medium shrink-0">1.</span>
            Small sample size (n=45)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-synapse-500 font-medium shrink-0">2.</span>
            Self-reported data may introduce bias
          </li>
        </ul>
        <div className="mt-2.5 pt-2 border-t border-border/40">
          <span className="text-xs font-medium text-synapse-500">
            Source: paper1.pdf, p.12-14
          </span>
        </div>
      </div>
    </div>
  );
}

function OutputVisual() {
  const outputs = [
    {
      label: "Summary",
      desc: "Key takeaways",
      accent: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    },
    {
      label: "Mind Map",
      desc: "Visual connections",
      accent: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    },
    {
      label: "Flashcards",
      desc: "Test your memory",
      accent: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    },
    {
      label: "Audio",
      desc: "Listen & learn",
      accent: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
  ];

  return (
    <div className="rounded-xl bg-surface-2 p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3">
        {outputs.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg border p-3.5 transition-transform hover:scale-[1.02] ${item.accent}`}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="text-[11px] mt-0.5 opacity-60">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step Data ─────────────────────────────────────────────────── */

const visuals = [
  <UploadVisual key="upload" />,
  <KnowledgeGraphVisual key="graph" />,
  <ChatVisual key="chat" />,
  <OutputVisual key="output" />,
];

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Drop Your Documents",
    description:
      "Drag PDFs, paste URLs, or connect your Google Drive. We support 50+ formats — from research papers to recordings.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Reads & Connects",
    description:
      "Our AI digests every document, understands context, and builds a knowledge graph of connections.",
  },
  {
    number: "03",
    icon: Search,
    title: "Ask Anything",
    description:
      "Chat naturally with your documents. Get instant, cited answers with exact page references.",
  },
  {
    number: "04",
    icon: BookOpen,
    title: "Learn & Remember",
    description:
      "Generate summaries, mind maps, flashcards, and audio overviews from your research.",
  },
];

/* ── Component ─────────────────────────────────────────────────── */

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 lg:py-32 bg-surface-1 overflow-hidden"
    >
      {/* Background grid pattern */}
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

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
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
            <Lightbulb className="w-3.5 h-3.5" />
            Simple Workflow
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4"
          >
            From Chaos to Clarity in 4 Steps
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            No complex setup. No learning curve. Just upload and start
            discovering.
          </motion.p>
        </motion.div>

        {/* Step flow indicator */}
        <motion.div
          className="flex items-center justify-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-synapse-500/10 border border-synapse-500/30 flex items-center justify-center">
                <span className="text-sm font-bold text-synapse-500">
                  {step.number}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-10 sm:w-16 lg:w-24 h-px bg-gradient-to-r from-synapse-500/40 to-synapse-500/10 mx-1" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Steps grid — 2 columns on desktop for breathing room */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="group rounded-2xl border border-border/50 p-6 lg:p-8 transition-colors hover:border-synapse-500/20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUpSpring}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl font-bold text-synapse-500/20 select-none">
                  {step.number}
                </span>
                <div className="w-10 h-10 rounded-xl bg-synapse-500 flex items-center justify-center shadow-md shadow-synapse-500/25">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Step content */}
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                {step.description}
              </p>

              {/* Visual mockup */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={scaleIn}
                transition={{ delay: index * 0.1 + 0.15 }}
              >
                {visuals[index]}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
