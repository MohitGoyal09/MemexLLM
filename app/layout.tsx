import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SynapseAI - Your AI Research Assistant",
  description: "Transform your documents into intelligent insights with SynapseAI",
}

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        {children}
       
      </body>
    </html>
  )
}
