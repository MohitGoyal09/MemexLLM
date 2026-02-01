# Components Documentation

Complete reference for all React components in the MemexLLM frontend.

## Overview

Components are organized into three categories:
- **UI Components**: shadcn/ui primitives
- **Feature Components**: Domain-specific components
- **Landing Components**: Marketing page sections

## UI Components (shadcn/ui)

Located in `components/ui/`. These are reusable, low-level components.

### Button

**File:** `components/ui/button.tsx`

```typescript
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">
  Click me
</Button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `default`, `sm`, `lg`, `icon`

### Card

**File:** `components/ui/card.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Dialog

**File:** `components/ui/dialog.tsx`

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Dropdown Menu

**File:** `components/ui/dropdown-menu.tsx`

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Input

**File:** `components/ui/input.tsx`

```typescript
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Enter text" />
```

### Switch

**File:** `components/ui/switch.tsx`

```typescript
import { Switch } from "@/components/ui/switch";

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### Theme Provider

**File:** `components/ui/theme-provider.tsx`

Handles dark/light mode switching.

```typescript
import { ThemeProvider } from "@/components/ui/theme-provider";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

---

## Feature Components

### ChatPanel

**File:** `components/chat-panel.tsx`

Main chat interface for notebook conversations.

**Props:**

```typescript
interface ChatPanelProps {
  messages: Message[];
  sourceCount: number;
  notebookId: string | null;
  onSendMessage: (content: string) => void;
  onOpenSettings?: () => void;
  onDeleteHistory?: () => void;
  onViewSource?: (documentId: string, pageNumber?: number | null) => void;
  lastChatTurn?: LastChatTurn | null;
  onNoteSaved?: () => void;
}
```

**Features:**
- Message display with Markdown rendering
- Citation highlighting and preview
- Streaming response display
- Suggested questions
- Feedback (thumbs up/down)
- Copy message

### SourcesPanel

**File:** `components/sources-panel.tsx`

Displays uploaded documents for a notebook.

**Features:**
- Document list with status
- Upload button
- Delete document
- Document preview

### NotesPanel

**File:** `components/notes-panel.tsx`

Rich text notes management.

**Features:**
- Create/edit/delete notes
- Auto-save
- Rich text editor (TipTap)
- Note list sidebar

### StudioPanel

**File:** `components/studio-panel.tsx`

AI content generation interface.

**Features:**
- Generate podcasts, quizzes, flashcards, mindmaps
- View generated content
- Audio player for podcasts
- Quiz interaction
- Flashcard study mode

### NotebookCard

**File:** `components/notebook-card.tsx`

Card display for notebook list.

**Props:**

```typescript
interface NotebookCardProps {
  notebook: {
    id: string;
    title: string;
    category: string;
    date: string;
    sources: number;
    isPublic: boolean;
  };
  variant?: "featured" | "recent";
  onUpdate?: (id: string, newTitle: string) => void;
}
```

**Features:**
- Emoji cover generation
- Inline title editing
- Delete option
- Source count display

### NotebookHeader

**File:** `components/notebook-header.tsx`

Header for notebook workspace.

**Features:**
- Notebook title
- Settings button
- Share button
- Back navigation

### AddSourcesModal

**File:** `components/add-sources-modal.tsx`

Modal for adding documents from various sources.

**Features:**
- File upload (drag & drop)
- URL input
- YouTube link
- Processing status

### CitationPreview

**File:** `components/citation-preview.tsx`

Displays citation details on hover/click.

**Props:**

```typescript
interface CitationPreviewProps {
  citation: Citation;
  onViewSource?: (documentId: string, pageNumber?: number | null) => void;
}
```

### CreateNotebookModal

**File:** `components/create-notebook-modal.tsx`

Modal for creating new notebooks.

**Features:**
- Title input
- Template selection
- Quick create

### FlashcardView

**File:** `components/flashcard-view.tsx`

Interactive flashcard study interface.

**Features:**
- Card flip animation
- Progress tracking
- Navigation controls
- Shuffle mode

### MindMapView

**File:** `components/mind-map-view.tsx`

Interactive mind map visualization.

**Features:**
- ReactFlow-based graph
- Zoom and pan
- Node selection
- Export image

### QuizView

**File:** `components/quiz-view.tsx`

Interactive quiz interface.

**Features:**
- Multiple choice questions
- Answer selection
- Score tracking
- Review mode

### AudioPlayerView

**File:** `components/audio-player-view.tsx`

Audio player for generated podcasts.

**Features:**
- Play/pause
- Progress bar
- Speed control
- Download

### ResizablePanel

**File:** `components/resizable-panel.tsx`

Draggable panel resizer for notebook layout.

**Features:**
- Horizontal resize
- Min/max width constraints
- Persistent sizing

### NeuralLoader

**File:** `components/neural-loader.tsx`

Animated loading indicator.

### ThemeSwitcher

**File:** `components/theme-switcher.tsx`

Dark/light mode toggle button.

---

## Landing Components

Located in `components/landing/`.

### LandingNav

**File:** `components/landing/landing-nav.tsx`

Navigation bar for landing page.

### LandingHero

**File:** `components/landing/landing-hero.tsx`

Hero section with CTA.

### LandingFeatures

**File:** `components/landing/landing-features.tsx`

Feature grid section.

### LandingHowItWorks

**File:** `components/landing/landing-how-it-works.tsx`

Step-by-step explanation.

### LandingTestimonials

**File:** `components/landing/landing-testimonials.tsx`

User testimonials carousel.

### LandingPricing

**File:** `components/landing/landing-pricing.tsx`

Pricing plans section.

### LandingCTA

**File:** `components/landing/landing-cta.tsx`

Call-to-action section.

### LandingFooter

**