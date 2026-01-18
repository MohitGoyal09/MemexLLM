import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google"

import "./globals.css"

// Primary sans-serif font for body text and UI
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// Display serif font for headlines and emphasis
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

// Monospace font for code and technical content
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SynapseAI - Your AI Research Assistant",
  description: "Transform your documents into intelligent insights with SynapseAI",
  keywords: ["AI", "research", "documents", "insights", "analysis", "knowledge"],
  authors: [{ name: "SynapseAI" }],
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
      className={`dark ${jakarta.variable} ${dmSerif.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
