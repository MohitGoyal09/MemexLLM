# Hooks Documentation

Complete reference for all custom React hooks in the MemexLLM frontend.

## Overview

Custom hooks encapsulate reusable stateful logic. They follow the React hooks naming convention (`use[Name]`) and can compose built-in hooks.

## useNotes

**File:** `hooks/use-notes.ts`

Manages notebook notes with auto-save functionality.

### Usage

```typescript
import { useNotes } from "@/hooks/use-notes";

function NotesPanel({ notebookId }: { notebookId: string }) {
  const {
    notes,
    loading,
    error,
    currentNote,
    isSaving,
    lastSaved,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    scheduleAutoSave,
    cancelAutoSave,
  } = useNotes({ notebookId, autoSaveDelay: 1000 });

  // Render notes UI
}
```

### Options

```typescript
interface UseNotesOptions {
  notebookId: string;
  autoSaveDelay?: number; // Default: 1000ms
}
```

### Return Value

```typescript
interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  currentNote: Note | null;
  isSaving: boolean;
  lastSaved: Date | null;
  createNote: (data?: Partial<CreateNoteRequest>) => Promise<Note>;
  updateNote: (noteId: string, data: UpdateNoteRequest) => Promise<Note>;
  deleteNote: (noteId: string) => Promise<void>;
  selectNote: (noteId: string | null) => void;
  scheduleAutoSave: (noteId: string, data: UpdateNoteRequest) => void;
  cancelAutoSave: () => void;
}
```

### Features

- **CRUD Operations**: Create, read, update, delete notes
- **Auto-save**: Debounced auto-save with configurable delay
- **Optimistic Updates**: UI updates immediately before API confirmation
- **Error Handling**: Graceful error states with retry
- **Loading States**: Separate loading states for fetch and save

### Auto-save Behavior

```typescript
// Auto-save is triggered after delay when content changes
scheduleAutoSave(noteId, { title: "New Title", content: "New content" });

// Cancel pending auto-save (e.g., when navigating away)
cancelAutoSave();
```

---

## useStudio

**File:** `hooks/use-studio.ts`

Manages AI content generation state and operations.

### Usage

```typescript
import { useStudio } from "@/hooks/use-studio";

function StudioPanel({ notebookId }: { notebookId: string }) {
  const {
    content,
    loading,
    generating,
    error,
    generateContent,
    deleteContent,
    refreshContent,
  } = useStudio({ notebookId });

  // Render studio UI
}
```

### Options

```typescript
interface UseStudioOptions {
  notebookId: string;
}
```

### Return Value

```typescript
interface UseStudioReturn {
  content: GeneratedContent[];
  loading: boolean;
  generating: boolean;
  error: string | null;
  generateContent: (type: ContentType, documentIds?: string[]) => Promise<void>;
  deleteContent: (contentId: string) => Promise<void>;
  refreshContent: () => Promise<void>;
}
```

### Features

- **Content Generation**: Trigger podcast, quiz, flashcard, mindmap generation
- **Progress Tracking**: Monitor generation status
- **Document Filtering**: Generate from specific documents or all
- **Polling**: Auto-refresh while content is processing

### Generation Flow

```typescript
// Generate from all documents
await generateContent("podcast");

// Generate from specific documents
await generateContent("quiz", ["doc-id-1", "doc-id-2"]);

// Content status updates automatically via polling
```

---

## useSuggestedQuestions

**File:** `hooks/use-suggested-questions.ts`

Manages AI-generated suggested questions for chat.

### Usage

```typescript
import { useSuggestedQuestions } from "@/hooks/use-suggested-questions";

function ChatPanel({ notebookId }: { notebookId: string }) {
  const {
    suggestions,
    loading,
    error,
    refreshSuggestions,
  } = useSuggestedQuestions({ notebookId });

  // Render suggestions
}
```

### Options

```typescript
interface UseSuggestedQuestionsOptions {
  notebookId: string;
  enabled?: boolean; // Default: true
}
```

### Return Value

```typescript
interface UseSuggestedQuestionsReturn {
  suggestions: SuggestedQuestion[];
  loading: boolean;
  error: string | null;
  refreshSuggestions: () => Promise<void>;
}
```

### Features

- **Contextual Questions**: Based on document content
- **Caching**: Results cached for 5 minutes
- **Manual Refresh**: User can request new suggestions
- **Graceful Degradation**: Empty array on error

---

## useScrollReveal

**File:** `hooks/use-scroll-reveal.tsx`

Animates elements when they scroll into view.

### Usage

```typescript
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

function FeatureSection() {
  const ref = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
    delay: 100,
  });

  return (
    <div ref={ref} className="opacity-0 translate-y-4 transition-all duration-500">
      Content
    </div>
  );
}
```

### Options

```typescript
interface UseScrollRevealOptions {
  threshold?: number; // Intersection threshold (0-1)
  delay?: number;     // Delay before reveal (ms)
  once?: boolean;     // Only trigger once (default: true)
}
```

### Return Value

```typescript
RefObject<T> // Ref to attach to element
```

### Features

- **Intersection Observer**: Efficient scroll detection
- **Configurable**: Threshold, delay, and repeat options
- **CSS Integration**: Works with Tailwind transition classes

---

## useIsMobile

**File:** `components/chat-panel.tsx` (inline)

Detects if the user is on a mobile device.

### Usage

```typescript
function Component() {
  const isMobile = useIsMobile();

  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      Content
    </div>
  );
}
```

### Implementation

```typescript
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches ||
        ("ontouchstart" in window && navigator.maxTouchPoints > 0);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
```

---

## Hook Patterns

### Async Data Fetching Pattern

```typescript
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
```

### Auto-save Pattern

```typescript
export function useAutoSave<T>(
  saveFn: (data: T) => Promise<void>,
  delay: number = 1000
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<T | null>(null);

  const scheduleSave = useCallback((data: T) => {
    pendingRef.current = data;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      if (pendingRef.current) {
        await saveFn(pendingRef.current);
        pendingRef.current = null;
      }
    }, delay);
  }, [saveFn, delay]);

  const cancelSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
  }, []);

  useEffect(() => {
    return () => cancelSave();
  }, [cancelSave]);

  return { scheduleSave, cancelSave };
}
```

### Polling Pattern

```typescript
export function usePolling(
  pollFn: () => Promise<boolean>,
  interval: number = 5000,
  enabled: boolean = true
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      const shouldContinue = await pollFn();
      if (!shouldContinue && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    intervalRef.current = setInterval(poll, interval);
    poll(); // Initial poll

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pollFn, interval, enabled]);
}
```

---

## Best Practices

1. **Single Responsibility**: Each hook should do one thing well
2. **Cleanup**: Always clean up effects (timers, listeners)
3. **Stable References**: Use `useCallback` for functions passed to effects
4. **Error Boundaries**: Handle errors gracefully
5. **Loading States**: Provide clear loading indicators
6. **Type Safety**: Use TypeScript generics for reusable hooks
7. **Documentation**: Document options and return values

## Creating New Hooks

Template for new hooks:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";

interface Use[Name]Options {
  // Options here
}

interface Use[Name]Return {
  // Return values here
}

export function use[Name](options: Use[Name]Options): Use[Name]Return {
  // Implementation
}
```
