"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { Github, Twitter, MessageCircle, Mail, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fadeUp,
  popIn,
  staggerContainer,
  staggerContainerFast,
} from "@/lib/motion";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Documentation", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "mailto:hello@memexllm.com" },
  ],
  resources: [
    { label: "Help Center", href: "/help" },
    { label: "Community", href: "/community" },
    { label: "API Reference", href: "/api" },
    { label: "Status", href: "/status" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/tos" },
    { label: "Security", href: "/security" },
    { label: "GDPR", href: "/gdpr" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com/MohitGoyal09/MemexLLM", label: "GitHub", followers: "2.3k" },
  { icon: Twitter, href: "https://x.com/bytemohit", label: "Twitter", followers: "1.5k" },
  { icon: Mail, href: "mailto:hello@memexllm.com", label: "Email", followers: null },
];

const footerColumnVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const footerColumnsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export function LandingFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-surface-1 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Newsletter section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="py-12 border-b border-border"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Stay Updated on Research AI
            </h3>
            <p className="text-muted-foreground mb-6">
              Get weekly tips on research productivity, AI updates, and exclusive features.
            </p>
            {isSubscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-success-500/10 text-success-600 animate-bounce-in">
                <span>✓</span>
                <span>You&apos;re subscribed! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-4 rounded-full bg-surface-2 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-synapse-500/50 focus:border-synapse-500 transition-all w-full sm:w-80"
                  required
                />
                <Button type="submit" className="h-12 px-6 rounded-full gap-2 spring-transition hover:scale-105">
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Main footer content */}
        <motion.div
          variants={footerColumnsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8"
        >
          {/* Brand column */}
          <motion.div variants={footerColumnVariant} className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <Logo className="w-10 h-10 spring-transition group-hover:scale-110" />
              <span className="text-lg font-semibold text-foreground">
                MemexLLM
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Transform information chaos into crystallized understanding.
              Open source AI-powered research assistant built for curious minds.
            </p>

            {/* Social links with follower counts */}
            <motion.div
              variants={staggerContainerFast}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              className="flex items-center gap-3"
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  variants={popIn}
                  whileHover={{ y: -2, scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-synapse-500/30 hover:bg-synapse-500/5 transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                  {social.followers && (
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-medium bg-surface-3 border border-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      {social.followers}
                    </span>
                  )}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Product links */}
          <motion.div variants={footerColumnVariant}>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company links */}
          <motion.div variants={footerColumnVariant}>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources links */}
          <motion.div variants={footerColumnVariant}>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal links */}
          <motion.div variants={footerColumnVariant}>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          className="py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MemexLLM. Open source under MIT license.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse-scale" />
            <span>for researchers everywhere</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
