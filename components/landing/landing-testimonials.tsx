"use client";

import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Cut my literature review time from 40 hours to 8 hours. This tool genuinely changed how I approach my research.",
    author: "Sarah K.",
    role: "PhD Candidate, Stanford",
    avatar: "SK",
  },
  {
    quote:
      "Finally found connections between 200 papers I'd collected over 3 years. Insights I never would have made manually.",
    author: "Marcus T.",
    role: "Independent Researcher",
    avatar: "MT",
  },
  {
    quote:
      "Synthesized 50 interview transcripts into a coherent narrative in minutes. My editor thought I'd spent weeks on it.",
    author: "Elena R.",
    role: "Investigative Journalist",
    avatar: "ER",
  },
  {
    quote:
      "The audio summaries are a game-changer. I listen to my research notes during my commute and retain so much more.",
    author: "David L.",
    role: "Medical Student, Johns Hopkins",
    avatar: "DL",
  },
  {
    quote:
      "As a professor with hundreds of papers to stay current on, this is the most valuable tool I've discovered in years.",
    author: "Prof. Maria S.",
    role: "Economics, MIT",
    avatar: "MS",
  },
  {
    quote:
      "Open source and self-hostable means I can use it for sensitive legal research. Finally, AI I can actually trust.",
    author: "James W.",
    role: "Corporate Attorney",
    avatar: "JW",
  },
];

export function LandingTestimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-24 lg:py-32 bg-surface-0 overflow-hidden"
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, oklch(0.65 0.17 68 / 0.06), transparent)
          `,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            Loved by Researchers Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of researchers, students, and professionals who've
            transformed their workflow
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="group relative p-6 lg:p-8 rounded-2xl bg-surface-1 border border-border hover:border-synapse-500/20 transition-all duration-300 hover:shadow-lg"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-synapse-500/20 mb-4" />

              {/* Quote text */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-synapse-400 to-synapse-600 flex items-center justify-center text-white text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: "10,000+", label: "Active Researchers" },
            { value: "500K+", label: "Documents Processed" },
            { value: "4.9/5", label: "Average Rating" },
            { value: "150+", label: "Universities" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-xl bg-surface-1 border border-border"
            >
              <p className="text-3xl lg:text-4xl font-bold text-synapse-500 mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
