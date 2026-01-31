"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { LuminaLogo } from "@/components/lumina-logo"
import { NeuralNetwork } from "@/components/neural-network"
import {
  BookOpen, Sparkles, Brain, Zap, FileText, Search,
  Quote, ArrowRight, CheckCircle2, Clock, Target, Rocket,
  Github, Twitter, MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      {/* Neural Network Background */}
      <NeuralNetwork className="opacity-40" />

      {/* Cursor-reactive glow */}
      <div
        className="fixed pointer-events-none z-10 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, oklch(0.7 0.17 68 / 0.4) 0%, transparent 70%)',
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          transition: 'left 0.1s ease-out, top 0.1s ease-out',
        }}
      />

      {/* Diagonal gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(165deg, oklch(0.7 0.17 68 / 0.15) 0%, transparent 40%),
            linear-gradient(345deg, oklch(0.55 0.11 185 / 0.1) 0%, transparent 40%)
          `,
        }}
      />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(oklch(0.7 0.17 68) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative z-20">
        {/* ==================== HERO SECTION ==================== */}
        <section className="min-h-screen flex flex-col lg:flex-row">
          {/* Left Side - Hero Content (60%) */}
          <div className="flex-[1.2] flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 lg:py-0">
            <div className="max-w-2xl animate-fade-up">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-primary/30 text-sm text-primary mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>For researchers who refuse to drown in documents</span>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <LuminaLogo className="w-14 h-14 animate-glow-pulse" />
                <span className="text-3xl font-display font-bold">Lumina</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-display font-black leading-[0.95] mb-6">
                Transform Information Overload Into{' '}
                <span
                  className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent"
                  style={{
                    backgroundSize: '200% auto',
                    animation: 'shimmer 3s linear infinite',
                  }}
                >
                  Crystallized Understanding
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-neutral-400 leading-relaxed mb-8 max-w-lg">
                AI-powered research assistant that reads, connects, and synthesizes
                faster than thought.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold px-8 h-14 text-lg rounded-full shadow-[0_0_30px_oklch(0.7_0.17_68_/_0.4)] hover:shadow-[0_0_40px_oklch(0.7_0.17_68_/_0.6)] transition-all"
                >
                  Start Connecting Ideas
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-2 border-neutral-700 hover:border-primary/50 h-14 px-8 text-lg rounded-full backdrop-blur-sm"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-black" />
                    ))}
                  </div>
                  <span>10,000+ researchers</span>
                </div>
                <span className="text-neutral-700">•</span>
                <span>500,000+ documents analyzed</span>
                <span className="text-neutral-700">•</span>
                <span className="text-primary">Open source</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form (40%) */}
          <div className="flex-1 hidden lg:flex items-center justify-center px-8 lg:px-16">
            <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-3xl blur-2xl" />

                {/* Card */}
                <div className="relative bg-neutral-950/80 backdrop-blur-xl rounded-2xl p-8 border border-neutral-800 shadow-2xl">
                  <LoginForm />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Login */}
          <div className="lg:hidden px-6 pb-8">
            <div className="bg-neutral-950/80 backdrop-blur-xl rounded-2xl p-6 border border-neutral-800">
              <LoginForm />
            </div>
          </div>
        </section>

        {/* ==================== PROBLEM-AGITATE SECTION ==================== */}
        <section className="py-24 px-8 lg:px-16 border-t border-neutral-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-center mb-4">
              Sound familiar?
            </h2>
            <p className="text-neutral-500 text-center mb-16 max-w-2xl mx-auto">
              We built Lumina for researchers tired of fighting their tools
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  title: "Buried in PDFs",
                  description: "Drowning in tabs, losing the thread between dozens of sources"
                },
                {
                  icon: Search,
                  title: "Copy-paste chaos",
                  description: "Jumping between 12 apps just to remember what you read"
                },
                {
                  icon: Brain,
                  title: "Lost connections",
                  description: "That breakthrough insight? Scattered across 47 documents you'll never reconnect"
                }
              ].map((problem, i) => (
                <div
                  key={i}
                  className={`p-8 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-primary/30 transition-all ${i === 1 ? 'md:translate-y-10' : ''}`}
                >
                  <problem.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
                  <p className="text-neutral-500">{problem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== VALUE STACK SECTION ==================== */}
        <section className="py-24 px-8 lg:px-16 bg-gradient-to-b from-black to-neutral-950">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-center mb-4">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-neutral-500 text-center mb-16 max-w-2xl mx-auto">
              Built for serious research, priced for everyone
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { title: "Multi-source RAG", value: "$5,000/yr", desc: "Upload PDFs, websites, YouTube - synthesize them all" },
                { title: "Auto-generation", value: "$3,000/yr", desc: "Podcasts, quizzes, mindmaps created automatically" },
                { title: "Enterprise search", value: "$2,000/yr", desc: "Citation tracking and semantic search" },
                { title: "Self-hosted", value: "$1,000/yr", desc: "Your data, your servers, your rules" },
              ].map((tier, i) => (
                <div key={i} className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <p className="text-primary font-bold mb-2">{tier.value} value</p>
                  <h3 className="text-lg font-bold mb-2">{tier.title}</h3>
                  <p className="text-sm text-neutral-500">{tier.desc}</p>
                </div>
              ))}
            </div>

            {/* Pricing Card */}
            <div className="relative max-w-lg mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl blur opacity-30" />
              <div className="relative p-8 rounded-2xl bg-black border border-primary/30 text-center">
                <p className="text-neutral-500 line-through mb-2">$11,000/year total value</p>
                <p className="text-4xl font-display font-black text-primary mb-2">$0</p>
                <p className="text-neutral-400 mb-6">Open Source Forever • or $20/mo hosted</p>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold h-12 rounded-full">
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SOCIAL PROOF SECTION ==================== */}
        <section className="py-24 px-8 lg:px-16 border-t border-neutral-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-center mb-16">
              Researchers, students, and curious minds love Lumina
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Cut literature review time from 40 hours to 8 hours. This tool is a game-changer for my PhD.",
                  author: "Sarah K.",
                  role: "PhD Candidate, Stanford"
                },
                {
                  quote: "Finally found connections between 200 papers I'd saved over 3 years. Insights I never would have made manually.",
                  author: "Marcus T.",
                  role: "Independent Researcher"
                },
                {
                  quote: "Synthesized 50 interviews into a coherent narrative in minutes. My editor thought I'd spent weeks on it.",
                  author: "Elena R.",
                  role: "Investigative Journalist"
                }
              ].map((testimonial, i) => (
                <div key={i} className="p-8 rounded-2xl bg-neutral-950/50 border border-neutral-800">
                  <Quote className="w-8 h-8 text-primary/40 mb-4" />
                  <p className="text-lg mb-6 text-neutral-300">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold">{testimonial.author}</p>
                    <p className="text-sm text-neutral-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== TRANSFORMATION TIMELINE ==================== */}
        <section className="py-24 px-8 lg:px-16 bg-gradient-to-b from-neutral-950 to-black">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-center mb-16">
              Your research transformation
            </h2>

            <div className="space-y-8">
              {[
                { icon: Zap, time: "60 seconds", title: "Quick win", desc: "Upload 3 PDFs → Get summary instantly" },
                { icon: Clock, time: "Week 1", title: "Compound", desc: "20 sources connected, patterns emerging" },
                { icon: Target, time: "Month 1", title: "Advantage", desc: "Your research hub becomes your second brain" },
                { icon: Rocket, time: "Month 3", title: "10x", desc: "Insights you'd never find manually, velocity multiplied" },
              ].map((stage, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-primary/30 flex items-center justify-center">
                    <stage.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary font-bold mb-1">{stage.time}</p>
                    <h3 className="text-xl font-bold mb-1">{stage.title}</h3>
                    <p className="text-neutral-500">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SECONDARY CTA ==================== */}
        <section className="py-24 px-8 lg:px-16 border-t border-neutral-900">
          <div className="max-w-2xl mx-auto text-center">
            {/* Avatar stack */}
            <div className="flex justify-center mb-8">
              <div className="flex -space-x-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-3 border-black" />
                ))}
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Ready to stop fighting information overload?
            </h2>
            <p className="text-neutral-500 mb-8">
              Join 10,000+ researchers who've transformed their workflow
            </p>
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold px-10 h-14 text-lg rounded-full shadow-[0_0_30px_oklch(0.7_0.17_68_/_0.4)]"
            >
              Yes, Transform My Research Workflow
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* ==================== FOOTER ==================== */}
        <footer className="py-16 px-8 lg:px-16 border-t border-neutral-900 bg-black">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
              {/* Logo & Tagline */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <LuminaLogo className="w-10 h-10" />
                  <span className="text-2xl font-display font-bold">Lumina</span>
                </div>
                <p className="text-neutral-500 max-w-xs">
                  Transform information chaos into crystallized understanding.
                </p>
              </div>

              {/* Nav Links */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-bold mb-4">Product</h4>
                  <ul className="space-y-2 text-neutral-500">
                    <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Company</h4>
                  <ul className="space-y-2 text-neutral-500">
                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Legal</h4>
                  <ul className="space-y-2 text-neutral-500">
                    <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-neutral-900">
              <p className="text-sm text-neutral-600">
                © 2024 Lumina. Open source under MIT license.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-neutral-500 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-500 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-500 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
