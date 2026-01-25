"use client"

import Link from "next/link"
import { Settings, Grid3X3, User, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"
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

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
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

  return (
    <header className="flex items-center justify-between px-6 py-4 ">
      <div className="flex items-center gap-3">
        <SynapseLogo />
        <span className="text-xl font-semibold">SynapseAI</span>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-200 focus:outline-none border border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 shadow-xl border-border">
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
      </div>
    </header>
  )
}
