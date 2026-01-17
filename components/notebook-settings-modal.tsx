"use client"

import { useState } from "react"
import { X, Save, RotateCcw, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export interface NotebookSettings {
  chunk_size: number
  chunk_overlap: number
  top_k_results: number
  enable_query_fusion: boolean
  fusion_num_queries: number
  use_hyde: boolean
  enable_reranking: boolean
  reranker_top_n: number
  default_alpha: number
  use_sentence_window: boolean
  sentence_window_size: number
  response_mode: "compact" | "tree_summarize" | "refine"
  streaming: boolean
  prompt_style: "citation" | "conversational" | "neutral"
}

export const defaultSettings: NotebookSettings = {
  chunk_size: 512,
  chunk_overlap: 50,
  top_k_results: 10,
  enable_query_fusion: true,
  fusion_num_queries: 3,
  use_hyde: true,
  enable_reranking: true,
  reranker_top_n: 5,
  default_alpha: 0.5,
  use_sentence_window: false,
  sentence_window_size: 3,
  response_mode: "compact",
  streaming: true,
  prompt_style: "conversational",
}

interface NotebookSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: NotebookSettings
  onSave: (settings: NotebookSettings) => void
}

export function NotebookSettingsModal({ open, onOpenChange, settings: initialSettings, onSave }: NotebookSettingsModalProps) {
  const [settings, setSettings] = useState<NotebookSettings>(initialSettings)
  const [activeTab, setActiveTab] = useState<"retrieval" | "generation">("retrieval")

  if (!open) return null

  const handleSave = () => {
    onSave(settings)
    onOpenChange(false)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
  }

  // Helper for slider input
  const Slider = ({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    suffix = "",
    description,
  }: {
    label: string
    value: number
    min: number
    max: number
    step?: number
    onChange: (val: number) => void
    suffix?: string
    description?: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          {label}
          {description && (
            <div className="group relative">
               <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg whitespace-nowrap hidden group-hover:block z-50 border border-border">
                 {description}
               </div>
            </div>
          )}
        </Label>
        <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  )

  // Helper for toggle
  const Toggle = ({
    label,
    checked,
    onChange,
    description,
  }: {
    label: string
    checked: boolean
    onChange: (val: boolean) => void
    description?: string
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div
        className={`w-11 h-6 bg-secondary rounded-full relative cursor-pointer transition-colors ${
          checked ? "bg-primary" : ""
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform shadow-sm ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-semibold">Notebook Settings</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset defaults
            </Button>
            <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 border-b border-border space-x-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab("retrieval")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "retrieval"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Retrieval (RAG)
          </button>
          <button
            onClick={() => setActiveTab("generation")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "generation"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Generation & Style
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto min-h-0 flex-1">
          {activeTab === "retrieval" && (
            <div className="grid gap-8">
              {/* Chunking Strategy */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Chunking Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-4 rounded-xl border border-border/50">
                  <Slider
                    label="Chunk Size"
                    value={settings.chunk_size}
                    min={128}
                    max={2048}
                    step={128}
                    onChange={(v) => setSettings({ ...settings, chunk_size: v })}
                    suffix=" tokens"
                    description="The size of text chunks to split documents into"
                  />
                  <Slider
                    label="Chunk Overlap"
                    value={settings.chunk_overlap}
                    min={0}
                    max={512}
                    step={16}
                    onChange={(v) => setSettings({ ...settings, chunk_overlap: v })}
                    suffix=" tokens"
                    description="Amount of overlap between consecutive chunks"
                  />
                </div>
              </div>

              {/* Retrieval Parameters */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Retrieval Parameters</h3>
                <div className="grid gap-6 bg-secondary/20 p-4 rounded-xl border border-border/50">
                  <Slider
                    label="Top K Results"
                    value={settings.top_k_results}
                    min={1}
                    max={50}
                    onChange={(v) => setSettings({ ...settings, top_k_results: v })}
                    description="Number of chunks to retrieve before reranking"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Toggle
                        label="Enable Reranking"
                        checked={settings.enable_reranking}
                        onChange={(v) => setSettings({ ...settings, enable_reranking: v })}
                        description="Re-order results by relevance"
                     />
                     {settings.enable_reranking && (
                        <Slider
                        label="Reranker Top N"
                        value={settings.reranker_top_n}
                        min={1}
                        max={20}
                        onChange={(v) => setSettings({ ...settings, reranker_top_n: v })}
                        description="Final number of chunks to use"
                        />
                     )}
                  </div>
                  
                  <Slider
                    label="Hybrid Search Alpha"
                    value={settings.default_alpha}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={(v) => setSettings({ ...settings, default_alpha: v })}
                    suffix=""
                    description="0 = Keyword only, 0.5 = Hybrid, 1.0 = Vector only"
                  />
                </div>
              </div>

               {/* Advanced */}
               <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Advanced</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-4 rounded-xl border border-border/50">
                    <Toggle
                        label="Use HyDE"
                        checked={settings.use_hyde}
                        onChange={(v) => setSettings({ ...settings, use_hyde: v })}
                        description="Hypothetical Document Embeddings"
                    />
                    <Toggle
                        label="Query Fusion"
                        checked={settings.enable_query_fusion}
                        onChange={(v) => setSettings({ ...settings, enable_query_fusion: v })}
                        description="Generate multiple search terms"
                    />
                    {settings.enable_query_fusion && (
                        <Slider
                            label="Fusion Variations"
                            value={settings.fusion_num_queries}
                            min={1}
                            max={5}
                            onChange={(v) => setSettings({ ...settings, fusion_num_queries: v })}
                        />
                    )}
                     <Toggle
                        label="Sentence Window"
                        checked={settings.use_sentence_window}
                        onChange={(v) => setSettings({ ...settings, use_sentence_window: v })}
                        description="Add surrounding context"
                    />
                </div>
              </div>
            </div>
          )}

          {activeTab === "generation" && (
            <div className="grid gap-8">
               {/* Style */}
               <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Style & Tone</h3>
                 <div className="bg-secondary/20 p-4 rounded-xl border border-border/50 space-y-6">
                    <div className="space-y-3">
                        <Label>Prompt Style</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {["conversational", "citation", "neutral"].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setSettings({...settings, prompt_style: style as any})}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                                        settings.prompt_style === style 
                                        ? "border-primary bg-primary/10 text-primary" 
                                        : "border-transparent bg-secondary hover:bg-secondary/80 text-muted-foreground"
                                    }`}
                                >
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Response Mode</Label>
                         <div className="grid grid-cols-3 gap-2">
                            {[
                                {val: "compact", label: "Compact"},
                                {val: "tree_summarize", label: "Tree Summarize"},
                                {val: "refine", label: "Refine"}
                            ].map((mode) => (
                                <button
                                    key={mode.val}
                                    onClick={() => setSettings({...settings, response_mode: mode.val as any})}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                                        settings.response_mode === mode.val
                                        ? "border-primary bg-primary/10 text-primary" 
                                        : "border-transparent bg-secondary hover:bg-secondary/80 text-muted-foreground"
                                    }`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
               </div>

               {/* Features */}
               <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Features</h3>
                 <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                    <Toggle
                        label="Stream Responses"
                        checked={settings.streaming}
                        onChange={(v) => setSettings({ ...settings, streaming: v })}
                        description="Show text as it is generated"
                    />
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border flex-shrink-0 bg-secondary/30">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2 rounded-full min-w-[100px]">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
