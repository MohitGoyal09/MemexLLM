"use client"

import { Settings, Grid3X3, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <SynapseLogo />
        <span className="text-xl font-semibold">SynapseAI</span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="gap-2 rounded-full bg-transparent">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Grid3X3 className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </button>
      </div>
    </header>
  )
}
