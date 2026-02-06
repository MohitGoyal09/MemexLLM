"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, Star, GraduationCap, BookOpen, Briefcase, Microscope, FileText, Mic } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerContainerSlow,
  cardItem,
} from "@/lib/motion";

const testimonials = [
  {
    quote:
      "I used to spend entire weekends just reading papers for my literature review. Now I upload everything and get a synthesized overview in minutes. My advisor thinks I've become superhuman.",
    author: "Sarah K.",
    role: "PhD Candidate, Neuroscience",
    institution: "Stanford University",
    avatar: "SK",
    color: "bg-blue-500",
    icon: GraduationCap,
    highlight: "Saved 40+ hours on lit review",
  },
  {
    quote:
      "As a medical student, I have hundreds of lecture slides and papers to review before exams. The AI-generated flashcards and concept maps are a game-changer. Wish I'd found this sooner.",
    author: "Marcus T.",
    role: "Medical Student, 3rd Year",
    institution: "Johns Hopkins",
    avatar: "MT",
    color: "bg-emerald-500",
    icon: Microscope,
    highlight: "Exam scores up 15%",
  },
  {
    quote:
      "I was drowning in 200+ interview transcripts. MemexLLM helped me find patterns and themes I never would have discovered manually. My thesis defense went flawlessly.",
    author: "Elena R.",
    role: "Master's Candidate, Sociology",
    institution: "UC Berkeley",
    avatar: "ER",
    color: "bg-amber-500",
    icon: FileText,
    highlight: "Analyzed 200+ transcripts",
  },
  {
    quote:
      "The podcast-style summaries are perfect for my commute. I listen to condensed versions of papers and arrive at the lab ready to discuss. It's like having a personal research assistant.",
    author: "David L.",
    role: "Postdoctoral Researcher",
    institution: "MIT",
    avatar: "DL",
    color: "bg-rose-500",
    icon: Mic,
    highlight: "2hrs of research during commute",
  },
  {
    quote:
      "Keeping up with the literature in my field feels impossible. This tool surfaces the most relevant papers and shows me exactly how they connect to my work. Essential for any serious researcher.",
    author: "Prof. Maria S.",
    role: "Professor of Economics",
    institution: "MIT",
    avatar: "MS",
    color: "bg-purple-500",
    icon: BookOpen,
    highlight: "Stays current with 100+ papers/mo",
  },
  {
    quote:
      "Finally, an AI tool I can actually trust with confidential research. Self-hosting means complete data privacy. Our entire lab has switched over.",
    author: "Dr. James W.",
    role: "Research Director",
    institution: "Biotech Startup",
    avatar: "JW",
    color: "bg-teal-500",
    icon: Briefcase,
    highlight: "Full data privacy",
  },
];

const stats = [
  { value: "10,000+", label: "Active Researchers", suffix: "" },
  { value: "500K", label: "Documents Analyzed", suffix: "+" },
  { value: "4.9", label: "Average Rating", suffix: "/5" },
  { value: "150", label: "Universities", suffix: "+" },
];

export function LandingTestimonials() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });
  const [animatedStats, setAnimatedStats] = useState<{ [key: number]: string }>({});

  // Animate stat numbers
  useEffect(() => {
    if (!statsInView) return;

    stats.forEach((stat, index) => {
      const numericValue = parseFloat(stat.value.replace(/[^0-9.]/g, ""));
      const isDecimal = stat.value.includes(".");
      let current = 0;
      const duration = 2000;
      const increment = numericValue / (duration / 16);

      const animate = () => {
        current += increment;
        if (current >= numericValue) {
          setAnimatedStats((prev) => ({
            ...prev,
            [index]: isDecimal ? numericValue.toFixed(1) : Math.floor(numericValue).toLocaleString()
          }));
        } else {
          setAnimatedStats((prev) => ({
            ...prev,
            [index]: isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString()
          }));
          requestAnimationFrame(animate);
        }
      };

      setTimeout(() => animate(), index * 100);
    });
  }, [statsInView]);

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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-synapse-500/10 text-synapse-600 text-sm font-medium mb-4"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4"
          >
            Trusted by Researchers at Top Universities
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Join thousands of PhD students, professors, and research teams
            who've transformed how they work with documents.
          </motion.p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              variants={cardItem}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group relative p-6 lg:p-8 rounded-2xl bg-surface-1 border border-border hover:border-synapse-500/20 transition-colors duration-300"
            >
              {/* Highlight badge */}
              <div className="absolute -top-3 left-6">
                <span className="px-3 py-1 text-xs font-medium bg-synapse-500/10 text-synapse-600 rounded-full border border-synapse-500/20">
                  {testimonial.highlight}
                </span>
              </div>

              {/* Quote icon */}
              <Quote className="w-8 h-8 text-synapse-500/20 mb-4 mt-2" />

              {/* Quote text */}
              <p className="text-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white text-sm font-bold shadow-lg spring-transition group-hover:scale-110`}>
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <testimonial.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-synapse-500 font-medium">
                    {testimonial.institution}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row - with animated counters */}
        <motion.div
          ref={statsRef}
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardItem}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="relative text-center p-6 rounded-xl bg-surface-1 border border-border overflow-hidden group"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-synapse-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <p className="relative text-3xl lg:text-4xl font-bold text-synapse-500 mb-1">
                {statsInView ? (animatedStats[index] || "0") : "0"}
                <span className="text-2xl">{stat.suffix}</span>
              </p>
              <p className="relative text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
