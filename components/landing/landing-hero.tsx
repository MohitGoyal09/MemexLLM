"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  ArrowRight,
  Sparkles,
  Play,
  FileText,
  Brain,
  Zap,
  BookOpen,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  fadeUp,
  fadeUpSpring,
  scaleIn,
  popIn,
  staggerContainer,
  staggerContainerSlow,
  cardItem,
  defaultViewport,
} from "@/lib/motion";

const floatingIcons = [
  { Icon: FileText, delay: 0, position: "top-[15%] left-[8%]", rotate: "-6deg" },
  { Icon: Brain, delay: 0.5, position: "top-[25%] right-[12%]", rotate: "6deg" },
  { Icon: Zap, delay: 1, position: "bottom-[30%] left-[5%]", rotate: "-3deg" },
  { Icon: BookOpen, delay: 1.5, position: "bottom-[20%] right-[8%]", rotate: "3deg" },
];

const socialProofUsers = [
  { initials: "SK", color: "bg-blue-500", name: "Sarah K." },
  { initials: "MT", color: "bg-emerald-500", name: "Marcus T." },
  { initials: "ER", color: "bg-amber-500", name: "Elena R." },
  { initials: "DL", color: "bg-rose-500", name: "David L." },
];

// Typewriter effect for dynamic text
const researchPhrases = [
  "literature reviews",
  "thesis research",
  "paper analysis",
  "study sessions",
  "grant proposals",
];

export function LandingHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Parallax for hero visual
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);

  // Typewriter effect
  useEffect(() => {
    const currentPhrase = researchPhrases[currentPhraseIndex];
    const speed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % researchPhrases.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPhraseIndex]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20 lg:pt-24">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-0 via-surface-0 to-surface-1" />

      {/* Radial gradient accent - enhanced */}
      <div
        className="absolute inset-0 opacity-50 animate-gradient-shift"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.65 0.17 68 / 0.18), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, oklch(0.55 0.11 185 / 0.10), transparent),
            radial-gradient(ellipse 60% 40% at 0% 50%, oklch(0.65 0.17 68 / 0.10), transparent)
          `,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Cursor-reactive glow */}
      <div
        className="fixed pointer-events-none z-10 w-[600px] h-[600px] rounded-full opacity-25 hidden lg:block"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.17 68 / 0.25) 0%, transparent 70%)",
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          transition: "left 0.2s ease-out, top 0.2s ease-out",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating icons with framer-motion animations */}
      {floatingIcons.map(({ Icon, delay, position, rotate }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} hidden lg:flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-1 border border-border shadow-lg hover-lift`}
          style={{
            rotate,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.5, delay: delay + 0.3 },
            scale: { duration: 0.5, delay: delay + 0.3, type: "spring", stiffness: 300, damping: 20 },
            y: { repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: delay + 0.8 },
          }}
        >
          <Icon className="w-6 h-6 text-synapse-500" />
        </motion.div>
      ))}

      {/* Content */}
      <motion.div
        className="relative z-20 max-w-5xl mx-auto px-6 lg:px-8 text-center"
        variants={staggerContainerSlow}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {/* Badge - bouncy entrance */}
        <motion.div
          variants={popIn}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-border text-sm text-muted-foreground mb-8"
        >
          <Sparkles className="w-4 h-4 text-synapse-500 animate-pulse-scale" />
          <span>AI-powered research assistant</span>
          <span className="px-2 py-0.5 rounded-full bg-synapse-500/10 text-synapse-600 text-xs font-medium">
            Open Source
          </span>
        </motion.div>

        {/* Headline - PAS Framework: Problem addressed in subheadline */}
        <motion.h1
          variants={fadeUpSpring}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-foreground mb-6"
        >
          Stop Drowning in PDFs.{" "}
          <br className="hidden sm:block" />
          <span className="relative inline-block">
            <span className="relative z-10 text-synapse-500">
              Start Understanding.
            </span>
            <span
              className="absolute -bottom-2 left-0 right-0 h-3 bg-synapse-500/20 rounded-full -z-0"
              style={{ transform: "skewX(-6deg)" }}
            />
          </span>
        </motion.h1>

        {/* Subheadline - Agitate the problem, then solve */}
        <motion.div
          variants={fadeUp}
          className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          <p className="mb-2">
            Researchers waste <span className="text-foreground font-semibold">40+ hours</span> manually reading papers.
          </p>
          <p>
            MemexLLM reads, connects, and synthesizes your documents—so you can focus on{" "}
            <span className="text-synapse-500 font-medium">
              {displayText}
              <span className="animate-cursor-blink text-synapse-500">|</span>
            </span>
          </p>
        </motion.div>

        {/* Quick benefits - visual checklist */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {[
            "Upload any document",
            "Ask questions naturally",
            "Get cited answers",
          ].map((benefit, i) => (
            <div
              key={benefit}
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="w-4 h-4 text-synapse-500" />
              <span>{benefit}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons - benefit-focused */}
        <motion.div
          variants={fadeUpSpring}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="h-14 px-10 text-base font-semibold rounded-full shadow-lg shadow-synapse-500/25 hover:shadow-xl hover:shadow-synapse-500/35 transition-all duration-300 gap-2"
              >
                Start My Free Research
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-medium rounded-full gap-2 hover-lift"
            >
              <Play className="w-4 h-4" />
              See 2-Min Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust signals - enhanced with real context */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {socialProofUsers.map((user, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${user.color} border-2 border-surface-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm spring-transition hover:scale-110 hover:z-10 cursor-pointer`}
                  title={user.name}
                >
                  {user.initials}
                </div>
              ))}
            </div>
            <span><span className="font-semibold text-foreground">10,000+</span> researchers</span>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <span>Used at <span className="font-medium text-foreground">150+ universities</span></span>
          <span className="hidden sm:inline text-border">•</span>
          <span className="text-synapse-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            100% Open Source
          </span>
        </motion.div>

        {/* Hero Visual - Enhanced mockup with parallax */}
        <motion.div
          variants={scaleIn}
          style={{ y: heroY }}
          className="relative mt-16 lg:mt-20"
        >
          <div className="relative mx-auto max-w-4xl">
            {/* Glow behind - enhanced */}
            <div className="absolute -inset-8 bg-gradient-to-r from-synapse-500/25 via-transparent to-cognition-500/25 rounded-3xl blur-3xl opacity-60 animate-gradient-shift" />

            {/* App preview mockup */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-surface-1 shadow-2xl hover-lift-lg">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60 hover:bg-yellow-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60 hover:bg-green-500 transition-colors" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-surface-3 text-xs text-muted-foreground">
                    app.memexllm.com
                  </div>
                </div>
              </div>

              {/* App content mockup */}
              <div className="aspect-[16/9] bg-surface-0 p-6 lg:p-8">
                <div className="grid grid-cols-12 gap-4 h-full">
                  {/* Sidebar */}
                  <div className="col-span-3 rounded-xl bg-surface-1 border border-border p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Logo className="w-8 h-8" />
                      <div className="h-3 w-20 bg-surface-3 rounded animate-shimmer" />
                    </div>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-8 rounded-lg transition-all duration-300 ${i === 0 ? 'bg-synapse-500/10 border border-synapse-500/30' : 'bg-surface-2 hover:bg-surface-3'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="col-span-6 rounded-xl bg-surface-1 border border-border p-4">
                    <div className="h-4 w-48 bg-surface-3 rounded mb-4 animate-shimmer" />
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-surface-2 rounded" />
                      <div className="h-3 w-5/6 bg-surface-2 rounded" />
                      <div className="h-3 w-4/6 bg-surface-2 rounded" />
                    </div>
                    <div className="mt-6 p-3 rounded-lg bg-synapse-500/5 border border-synapse-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-synapse-500 animate-pulse-scale" />
                        <div className="h-3 w-24 bg-synapse-500/30 rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 w-full bg-synapse-500/20 rounded" />
                        <div className="h-2.5 w-4/5 bg-synapse-500/20 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Right panel */}
                  <div className="col-span-3 rounded-xl bg-surface-1 border border-border p-4">
                    <div className="h-3 w-20 bg-surface-3 rounded mb-4" />
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                            <div className="w-4 h-4 rounded bg-synapse-500/30" />
                          </div>
                          <div className="flex-1">
                            <div className="h-2.5 w-full bg-surface-2 rounded mb-1" />
                            <div className="h-2 w-2/3 bg-surface-3 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex justify-center animate-scroll-hint"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}
