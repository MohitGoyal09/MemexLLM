"use client"

import { LoginForm } from "@/components/login-form"
import { SynapseLogo } from "@/components/synapse-logo"
import { BookOpen, Sparkles, Brain, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Gradient Mesh Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, oklch(0.65 0.17 68 / 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, oklch(0.55 0.11 185 / 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 50% 90%, oklch(0.62 0.16 25 / 0.08) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Subtle dot texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(oklch(0.5 0 0) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
          <div className="max-w-xl animate-fade-up">
            {/* Logo Badge */}
            <div className="flex items-center gap-3 mb-8">
              <SynapseLogo className="w-12 h-12 animate-synapse-glow" />
              <span className="text-2xl font-display font-semibold">SynapseAI</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-tight mb-6">
              Transform your documents into{' '}
              <span className="text-gradient-synapse">intelligent insights</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
              Your AI research assistant that reads, understands, and synthesizes 
              information so you can focus on asking better questions.
            </p>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap gap-3 mb-12">
              <FeatureBadge icon={BookOpen} label="Multi-source Analysis" />
              <FeatureBadge icon={Sparkles} label="AI Summaries" />
              <FeatureBadge icon={Brain} label="Mind Maps" />
              <FeatureBadge icon={Zap} label="Instant Insights" />
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: "200ms" }}>
            {/* Glassmorphism Card */}
            <div className="glass rounded-2xl p-8 border border-border/50 shadow-2xl">
              <LoginForm />
            </div>
            
            {/* Trust indicators */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Trusted by researchers and students worldwide</p>
            </div>
          </div>
        </div>
        
        {/* Mobile Login - Below Hero */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="w-full max-w-sm mx-auto">
            <div className="glass rounded-2xl p-6 border border-border/50">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureBadge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-default">
      <Icon className="w-4 h-4 text-primary" />
      <span>{label}</span>
    </div>
  )
}
