"use client"

import Link from "next/link"
import { Settings, Grid3X3, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"
import { LogoutButton } from "@/components/logout-button"

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <SynapseLogo />
        <span className="text-xl font-semibold">SynapseAI</span>
      </div>

      <div className="flex items-center gap-3">
        <LogoutButton variant="ghost" size="sm" />
        <button className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </button>
      </div>
    </header>
  )
}
