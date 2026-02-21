import { Badge } from "@/components/ui/badge"

export default function ComponentsDocPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Frontend</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Components</h1>
        <p className="text-xl text-muted-foreground">
          Overview of the React components used throughout the application.
        </p>
      </div>

      {/* UI Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">UI Component Library</h2>
        <p className="text-muted-foreground">
          Built on shadcn/ui - a collection of reusable components built with Radix UI and Tailwind CSS.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold">Button</h3>
            <p className="text-sm text-muted-foreground">Various button variants and sizes</p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold">Card</h3>
            <p className="text-sm text-muted-foreground">Content containers</p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold">Input</h3>
            <p className="text-sm text-muted-foreground">Form inputs</p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold">Badge</h3>
            <p className="text-sm text-muted-foreground">Status badges</p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold">Dropdown Menu</h3>
            <p className="text-sm text-muted-foreground">Menus and context menus</p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold">Progress</h3>
            <p className="text-sm text-muted-foreground">Progress indicators</p>
          </div>
        </div>
      </section>

      {/* Custom Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Custom Components</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Chat Components</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>ChatPanel - Main chat interface</li>
              <li>CitationPreview - Shows source citations</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Notebook Components</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>NotebookCard - Notebook preview card</li>
              <li>NotebookHeader - Notebook header</li>
              <li>NotebookListItem - List item for notebooks</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Studio Panel Components</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>StudioPanel - Main studio container</li>
              <li>PodcastView - Podcast player</li>
              <li>QuizView - Quiz interface</li>
              <li>FlashcardView - Flashcard viewer</li>
              <li>MindMapView - Mind map display</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Source Management</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>SourcesPanel - Document list</li>
              <li>AddSourcesModal - Add new sources</li>
              <li>NotesPanel - User notes</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Authentication</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>LoginForm - User login</li>
              <li>SignUpForm - User registration</li>
              <li>AuthButton - Auth state button</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Component Patterns */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Component Patterns</h2>
        <p className="text-muted-foreground">
          Components follow consistent patterns:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
          <li>TypeScript for type safety</li>
          <li>Tailwind CSS for styling</li>
          <li>Props interface for component API</li>
          <li>cn() utility for class merging</li>
        </ul>
      </section>

      <div className="flex gap-4 pt-4">
        <a href="/docs/hooks" className="text-primary hover:underline">
          Next: Hooks
        </a>
      </div>
    </div>
  )
}
