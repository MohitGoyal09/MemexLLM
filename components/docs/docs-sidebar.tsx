"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Database,
  Server,
  Code2,
  Settings,
  Shield,
  Layout,
  Box,
  Workflow,
  FileText,
  Zap,
  Layers,
  Lock,
  Rocket,
} from "lucide-react"

const GITHUB_URL = "https://github.com/MohitGoyal09/MemexLLM"
const BACKEND_URL = "https://github.com/MohitGoyal09/MemexLLM-backend.git"

const sidebarNav = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Introduction",
        href: "/docs",
        icon: BookOpen,
      },
      {
        title: "Quick Start",
        href: "/docs/quick-start",
        icon: Zap,
      },
    ],
  },
  {
    title: "Architecture",
    items: [
      {
        title: "System Overview",
        href: "/docs/architecture",
        icon: Layers,
      },
      {
        title: "Backend Services",
        href: "/docs/backend-services",
        icon: Server,
      },
      {
        title: "Database Schema",
        href: "/docs/database",
        icon: Database,
      },
      {
        title: "API Layer",
        href: "/docs/api-layer",
        icon: FileText,
      },
    ],
  },
  {
    title: "Frontend",
    items: [
      {
        title: "Frontend Architecture",
        href: "/docs/frontend-architecture",
        icon: Code2,
      },
      {
        title: "Components",
        href: "/docs/components",
        icon: Box,
      },
      {
        title: "Hooks",
        href: "/docs/hooks",
        icon: Workflow,
      },
      {
        title: "API Client",
        href: "/docs/api-client",
        icon: FileText,
      },
      {
        title: "Types & Interfaces",
        href: "/docs/types",
        icon: FileText,
      },
    ],
  },
  {
    title: "Configuration & Security",
    items: [
      {
        title: "Environment Variables",
        href: "/docs/configuration",
        icon: Settings,
      },
      {
        title: "Authentication",
        href: "/docs/authentication",
        icon: Lock,
      },
      {
        title: "Deployment",
        href: "/docs/deployment",
        icon: Rocket,
      },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-72 shrink-0 hidden lg:block border-r bg-sidebar/50">
    
      {/* Navigation */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-4 pr-4">
        <nav className="space-y-5">
          {sidebarNav.map((section) => (
            <div key={section.title}>
              <h4 className="mb-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", isActive && "text-primary")} />
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="mt-8 pt-4 border-t">
          <a
            href={BACKEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Backend Code
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>

        </div>
      </div>
    </div>
  )
}
