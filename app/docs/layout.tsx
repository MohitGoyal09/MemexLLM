import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { Logo } from "@/components/logo"
import { Search } from "lucide-react"
import Link from "next/link"

const GITHUB_URL = "https://github.com/MohitGoyal09/MemexLLM"
const BACKEND_URL = "https://github.com/MohitGoyal09/MemexLLM-backend.git"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Logo and Docs indicator */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8">
                  <Logo className="w-full h-full" />
                </div>
                <span className="font-semibold text-foreground hidden sm:inline-block">MemexLLM</span>
              </Link>
              <div className="h-5 w-px bg-border hidden sm:block" />
              <span className="text-sm font-medium text-muted-foreground">Documentation</span>
            </div>
            
            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full h-9 pl-9 pr-10 rounded-lg border bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground hidden sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>

            {/* Right Links */}
            <div className="flex items-center gap-4">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <Link
                href="/"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Go to App →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto flex">
        <DocsSidebar />
        <main className="flex-1 min-w-0 py-8 px-4 md:px-8 lg:px-10">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
