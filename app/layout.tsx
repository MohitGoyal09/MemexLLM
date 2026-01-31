import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { GoogleAnalytics } from '@next/third-parties/google'
import { PHProvider } from "@/lib/analytics/PostHogProvider"
import { PostHogPageView } from "@/lib/analytics/PostHogPageView"
import { Suspense } from "react"

import "./globals.css"
import { ThemeProvider } from "@/components/ui/theme-provider"

// Primary sans-serif font for body text and UI
// Font fallback chain ensures text visibility during load
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Ensure text is visible during font load
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
})

// Display serif font for headlines and emphasis
// Georgia provides a good fallback for the display font
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap", // Ensure text is visible during font load
  fallback: ["Georgia", "Times New Roman", "serif"],
})

// Monospace font for code and technical content
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap", // Ensure text is visible during font load
  fallback: ["Consolas", "Monaco", "Courier New", "monospace"],
})

export const metadata: Metadata = {
  title: {
    default: "SynapseAI - Your AI Research Assistant",
    template: "%s | SynapseAI",
  },
  description: "Transform your documents into intelligent insights with SynapseAI. AI-powered research assistant that reads, understands, and synthesizes information for better questions and deeper understanding.",
  keywords: ["AI", "research", "documents", "insights", "analysis", "knowledge", "AI assistant", "document analysis", "research tool", "knowledge synthesis"],
  authors: [{ name: "SynapseAI" }],
  creator: "SynapseAI",
  publisher: "SynapseAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SynapseAI",
    title: "SynapseAI - Your AI Research Assistant",
    description: "Transform your documents into intelligent insights with SynapseAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SynapseAI - Your AI Research Assistant",
    description: "Transform your documents into intelligent insights with SynapseAI",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://synapseai.app"),
}

export const viewport: Viewport = {
  themeColor: "#1a1512", // Warm dark from brand palette
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${dmSerif.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Preload critical fonts to prevent layout shift */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU79SA.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/dmserifdisplay/v15/-nFnOHM81r4j6k0gjAW3mujVU2B2G_5x0ujy.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {/* Skip link for keyboard navigation - accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PHProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <main id="main-content">
              {children}
            </main>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />
          </PHProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
