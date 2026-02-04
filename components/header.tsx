"use client"

import Link from "next/link"
import { Settings, Grid3X3, User, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { authLogger } from "@/lib/auth-logger"
import { useRouter } from "next/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
    }
    fetchUser()
  }, [])

  // Scroll detection for sticky state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-card/95 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
      role="banner"
    >
      <Link
        href="/home"
        className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
        aria-label="MemexLLM - Go to home"
      >
        <Logo className="w-16 h-16 group-hover:animate-glow-pulse transition-all" />
        <span className="text-xl font-semibold text-foreground group-hover:text-synapse-400 transition-colors duration-200">MemexLLM</span>
      </Link>

      <nav className="flex items-center gap-3" aria-label="Main navigation">
        <ThemeSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-9 h-9 rounded-full bg-surface-3 hover:bg-surface-4 flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-synapse-500 border border-border hover:border-synapse-700/50"
              aria-label="User menu"
            >
              <User className="w-5 h-5 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 shadow-xl border-border bg-surface-2/95 backdrop-blur-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">My Account</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {userEmail || "Signed in"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer py-2"
              onClick={() => router.push("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer py-2"
              onClick={async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                const userId = user?.id;
                authLogger.logLogout(userId);
                try {
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;
                  authLogger.logLogoutSuccess(userId);
                  router.push("/auth/login");
                } catch (error) {
                  console.error("Logout failed:", error);
                  router.push("/auth/login");
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}
