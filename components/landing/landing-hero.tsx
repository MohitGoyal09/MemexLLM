"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LuminaLogo } from "@/components/lumina-logo";
import {
  ArrowRight,
  Sparkles,
  Play,
  FileText,
  Brain,
  Zap,
  BookOpen,
} from "lucide-react";

const floatingIcons = [
  { Icon: FileText, delay: "0s", position: "top-[15%] left-[8%]" },
  { Icon: Brain, delay: "0.5s", position: "top-[25%] right-[12%]" },
  { Icon: Zap, delay: "1s", position: "bottom-[30%] left-[5%]" },
  { Icon: BookOpen, delay: "1.5s", position: "bottom-[20%] right-[8%]" },
];

export function LandingHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 lg:pt-24">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-0 via-surface-0 to-surface-1" />

      {/* Radial gradient accent */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.65 0.17 68 / 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, oklch(0.55 0.11 185 / 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 0% 50%, oklch(0.65 0.17 68 / 0.08), transparent)
          `,
        }}
      />

      {/* Cursor-reactive glow */}
      <div
        className="fixed pointer-events-none z-10 w-[500px] h-[500px] rounded-full opacity-30 hidden lg:block"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.17 68 / 0.2) 0%, transparent 70%)",
          left: mousePos.x - 250,
          top: mousePos.y - 250,
          transition: "left 0.15s ease-out, top 0.15s ease-out",
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

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, delay, position }, index) => (
        <div
          key={index}
          className={`absolute ${position} hidden lg:flex items-center justify-center w-12 h-12 rounded-xl bg-surface-1 border border-border shadow-lg animate-float`}
          style={{ animationDelay: delay }}
        >
          <Icon className="w-5 h-5 text-synapse-500" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-border text-sm text-muted-foreground mb-8 animate-fade-up">
          <Sparkles className="w-4 h-4 text-synapse-500" />
          <span>AI-powered research assistant</span>
          <span className="px-2 py-0.5 rounded-full bg-synapse-500/10 text-synapse-600 text-xs font-medium">
            Open Source
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-foreground mb-6 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          Transform Your Documents Into{" "}
          <span className="relative">
            <span className="relative z-10 text-synapse-500">
              Intelligent Insights
            </span>
            <span
              className="absolute -bottom-2 left-0 right-0 h-3 bg-synapse-500/20 rounded-full -z-0"
              style={{ transform: "skewX(-6deg)" }}
            />
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          Upload PDFs, articles, and research papers. Let AI read, understand, and
          synthesize information so you can focus on asking better questions.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold rounded-full shadow-lg shadow-synapse-500/20 hover:shadow-xl hover:shadow-synapse-500/30 transition-all duration-300 gap-2"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base font-medium rounded-full gap-2"
          >
            <Play className="w-4 h-4" />
            Watch Demo
          </Button>
        </div>

        {/* Trust signals */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-synapse-400 to-synapse-600 border-2 border-surface-0"
                />
              ))}
            </div>
            <span className="font-medium text-foreground">10,000+</span> researchers
          </div>
          <span className="hidden sm:inline text-border">|</span>
          <span>500,000+ documents analyzed</span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="text-synapse-500 font-medium">100% Open Source</span>
        </div>

        {/* Hero Visual */}
        <div
          className="relative mt-16 lg:mt-20 animate-fade-up"
          style={{ animationDelay: "500ms" }}
        >
          <div className="relative mx-auto max-w-4xl">
            {/* Glow behind */}
            <div className="absolute -inset-4 bg-gradient-to-r from-synapse-500/20 via-transparent to-cognition-500/20 rounded-3xl blur-3xl opacity-50" />

            {/* App preview mockup */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-surface-1 shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
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
                      <LuminaLogo className="w-6 h-6" />
                      <div className="h-3 w-20 bg-surface-3 rounded" />
                    </div>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-8 rounded-lg ${i === 0 ? 'bg-synapse-500/10 border border-synapse-500/30' : 'bg-surface-2'}`} />
                      ))}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="col-span-6 rounded-xl bg-surface-1 border border-border p-4">
                    <div className="h-4 w-48 bg-surface-3 rounded mb-4" />
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-surface-2 rounded" />
                      <div className="h-3 w-5/6 bg-surface-2 rounded" />
                      <div className="h-3 w-4/6 bg-surface-2 rounded" />
                    </div>
                    <div className="mt-6 p-3 rounded-lg bg-synapse-500/5 border border-synapse-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-synapse-500" />
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
        </div>
      </div>
    </section>
  );
}
