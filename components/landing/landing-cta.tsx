"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, Shield, Zap, Users } from "lucide-react";
import {
  fadeUp,
  fadeUpSpring,
  popIn,
  staggerContainer,
  staggerContainerFast,
} from "@/lib/motion";

const benefitsList = [
  { icon: Clock, text: "Setup in 2 minutes" },
  { icon: Shield, text: "No credit card required" },
  { icon: Zap, text: "Instant AI analysis" },
  { icon: Users, text: "Team collaboration included" },
];

const avatars = [
  { initials: "SK", color: "bg-blue-500" },
  { initials: "MT", color: "bg-emerald-500" },
  { initials: "ER", color: "bg-amber-500" },
  { initials: "DL", color: "bg-rose-500" },
  { initials: "MS", color: "bg-purple-500" },
  { initials: "JW", color: "bg-teal-500" },
];

export function LandingCTA() {
  return (
    <section
      id="final-cta"
      className="relative py-24 lg:py-32 bg-surface-0 overflow-hidden"
    >
      {/* Background gradient - enhanced */}
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, oklch(0.65 0.17 68 / 0.12), transparent)
          `,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-synapse-500/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Avatar stack with staggered entrance */}
        <motion.div
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex justify-center mb-8"
        >
          <div className="flex -space-x-3">
            {avatars.map((user, i) => (
              <motion.div
                key={i}
                variants={popIn}
                className={`w-12 h-12 rounded-full ${user.color} border-3 border-surface-0 shadow-lg flex items-center justify-center text-white text-sm font-bold spring-transition hover:scale-110 hover:z-10`}
              >
                {user.initials}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Headline - action-oriented */}
        <motion.h2
          variants={fadeUpSpring}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4"
        >
          Your Next Breakthrough Is{" "}
          <span className="text-synapse-500">One Upload Away</span>
        </motion.h2>

        {/* Subheadline - create urgency with FOMO */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6"
        >
          Join <span className="font-semibold text-foreground">10,000+ researchers</span> who read smarter,
          not harder. While others drown in documents, you&apos;ll be discovering insights.
        </motion.p>

        {/* Benefits row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {benefitsList.map((benefit) => (
            <motion.div
              key={benefit.text}
              variants={fadeUp}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <benefit.icon className="w-4 h-4 text-synapse-500" />
              <span>{benefit.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button - prominent with pulsing glow */}
        <motion.div
          variants={fadeUpSpring}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <div className="relative">
            {/* Pulsing glow behind the button */}
            <motion.div
              className="absolute inset-0 rounded-full bg-synapse-500/20 blur-xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="relative h-16 px-12 text-lg font-semibold rounded-full shadow-xl shadow-synapse-500/30 hover:shadow-2xl hover:shadow-synapse-500/40 transition-all duration-300 gap-3 spring-transition hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                Start My Free Research
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Risk reversal - trust builder */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            ✓ Free forever for personal use • ✓ No credit card required • ✓ Cancel anytime
          </p>
          <p className="text-xs text-muted-foreground/70">
            Or self-host for complete data privacy with our open source version
          </p>
        </motion.div>

        {/* Social proof nudge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
          className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-border text-sm"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">127 researchers</span> signed up today
          </span>
        </motion.div>
      </div>
    </section>
  );
}
