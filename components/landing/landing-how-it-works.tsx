"use client";

import {
  FileUp,
  Sparkles,
  Lightbulb,
  Upload,
  Wand2,
  Search,
  BookOpen,
  FileText,
  Brain,
  Copy,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/lib/motion";
import { BentoGrid } from "@/components/magicui/bento-grid";
import { cn } from "@/lib/utils";

/* ── Visual Mockup Components ──────────────────────────────────── */

function UploadVisual({ className }: { className?: string }) {
  const files = [
    { name: "thesis-draft.pdf", size: "2.4 MB", progress: 100 },
    { name: "interview-notes.docx", size: "856 KB", progress: 100 },
    { name: "lecture-recording.mp3", size: "45 MB", progress: 72 },
  ];

  return (
    <div className={cn("flex flex-col space-y-2.5 p-4 sm:p-5", className)}>
      {files.map((file, i) => (
        <div
          key={file.name}
          className="flex items-center gap-3 rounded-lg bg-surface-1/50 border border-border/50 p-2.5 backdrop-blur-sm"
        >
          <div className="shrink-0 w-8 h-8 rounded-lg bg-synapse-500/10 flex items-center justify-center">
            <FileUp className="w-4 h-4 text-synapse-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {file.name}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
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
            <span className="shrink-0 text-[10px] font-medium text-emerald-500">
              Done
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function KnowledgeGraphVisual({ className }: { className?: string }) {
  const nodes = [
    { label: "PDF", x: 20, y: 25, color: "bg-blue-500" },
    { label: "Web", x: 80, y: 20, color: "bg-purple-500" },
    { label: "Doc", x: 25, y: 75, color: "bg-amber-500" },
    { label: "Audio", x: 80, y: 80, color: "bg-emerald-500" },
  ];

  return (
    <div className={cn("relative h-full w-full flex items-center justify-center p-6", className)}>
      <div className="relative h-full w-full aspect-square max-w-[300px] max-h-[300px]">
        {/* Central Hub */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Pulsing rings */}
            <div className="absolute w-32 h-32 rounded-full bg-synapse-500/5 animate-ping [animation-duration:3s]" />
            <div className="absolute w-24 h-24 rounded-full bg-synapse-500/10" />
            
            {/* Core Node */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-synapse-500 to-synapse-600 flex items-center justify-center shadow-xl shadow-synapse-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
        </div>

        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map((node, i) => (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="text-synapse-500/20"
            />
          ))}
        </svg>

        {/* Satellite Nodes */}
        {nodes.map((node, i) => (
          <motion.div
            key={node.label}
            className="absolute rounded-xl bg-surface-1 border border-border shadow-sm px-3 py-2 flex items-center gap-2"
            style={{ left: `${node.x}%`, top: `${node.y}%`, x: "-50%", y: "-50%" }}
            animate={{ 
              y: ["-50%", "-60%", "-50%"] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 1 
            }}
          >
            <div className={`w-2 h-2 rounded-full ${node.color}`} />
            <span className="text-xs font-semibold text-foreground">{node.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChatVisual({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full justify-center space-y-4 p-8", className)}>
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-synapse-500 px-5 py-3 text-sm text-white shadow-lg shadow-synapse-500/20">
          What are the main limitations?
        </div>
      </div>
      {/* AI response */}
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-surface-1 border border-border/50 px-5 py-4 shadow-sm">
        <p className="text-sm text-foreground leading-relaxed">
          Based on <span className="text-synapse-500 font-medium">paper1.pdf</span>, the key limitations are:
        </p>
        <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-synapse-500/10 text-[10px] font-bold text-synapse-500">1</span>
            Small sample size (n=45) in the control group.
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-synapse-500/10 text-[10px] font-bold text-synapse-500">2</span>
            Self-reported data may introduce recall bias.
          </li>
        </ul>
      </div>
    </div>
  );
}

function OutputVisual({ className }: { className?: string }) {
  const outputs = [
    {
      label: "Summary",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    },
    {
      label: "Mind Map",
      icon: Brain,
      color: "bg-purple-500/10 text-purple-600 border-purple-200/50",
    },
    {
      label: "Flashcards",
      icon: Copy,
      color: "bg-amber-500/10 text-amber-600 border-amber-200/50",
    },
    {
      label: "Audio",
      icon: Headphones,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
    },
  ];

  return (
    <div className={cn("h-full w-full p-4 flex flex-col justify-center", className)}>
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {outputs.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all hover:scale-105",
              "bg-surface-1 border-border/50 hover:bg-surface-2 hover:border-border",
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", item.color)}>
              <item.icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step Data ─────────────────────────────────────────────────── */

const features = [
  {
    Icon: Upload,
    name: "01. Drop Your Documents",
    description: "Drag PDFs, paste URLs, or connect your Google Drive. 50+ formats supported.",
    href: "/",
    cta: "Start Uploading",
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: Wand2,
    name: "02. AI Reads & Connects",
    description: "Our AI digests every document, understands context, and builds a knowledge graph of connections.",
    href: "/",
    cta: "See Context",
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: Search,
    name: "03. Ask Anything",
    description: "Chat naturally with your documents. Get instant, cited answers with exact page references.",
    href: "/",
    cta: "Start Chatting",
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: BookOpen,
    name: "04. Learn & Remember",
    description: "Generate summaries, mind maps, and flashcards instantly.",
    href: "/",
    cta: "Start Learning",
    className: "col-span-3 lg:col-span-1",
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

        {/* Custom Bento Grid Layout */}
        <BentoGrid className="lg:grid-rows-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={cn(
                "group relative overflow-hidden rounded-3xl border bg-surface-1/50 backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-synapse-500/5",
                feature.className,
                // Layout switching based on size
                feature.className.includes("col-span-2") 
                  ? "flex flex-col lg:flex-row" // Wide cards: Stack on mobile, Side-by-side on desktop
                  : "flex flex-col"             // Narrow cards: Always stack
              )}
            >
              {/* Content Section */}
              <div className={cn(
                "flex flex-col justify-center p-6 lg:p-8 z-10",
                feature.className.includes("col-span-2") ? "lg:w-1/2" : "w-full"
              )}>
                <div className="w-12 h-12 rounded-xl bg-synapse-500/10 flex items-center justify-center mb-4 text-synapse-500">
                  <feature.Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Visual Section */}
              <div 
                className={cn(
                  "relative bg-surface-2/50",
                  feature.className.includes("col-span-2") 
                    ? "lg:w-1/2 border-t lg:border-t-0 lg:border-l border-border/50 min-h-[200px]" 
                    : "flex-1 border-t border-border/50 min-h-[150px]"
                )}
              >
                {/* Render the visual component directly, not as a background prop */}
                <div className="absolute inset-0 w-full h-full">
                  {idx === 0 && <UploadVisual className="h-full w-full p-6" />}
                  {idx === 1 && <KnowledgeGraphVisual className="h-full w-full" />}
                  {idx === 2 && <ChatVisual className="h-full w-full p-6" />}
                  {idx === 3 && <OutputVisual className="h-full w-full p-4 flex items-center" />}
                </div>
              </div>
            </div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
