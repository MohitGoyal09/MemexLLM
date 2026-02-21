import { Badge } from "@/components/ui/badge"
import { Code } from "lucide-react"

export default function HooksPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Reference</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Custom React Hooks</h1>
        <p className="text-xl text-muted-foreground">
          A comprehensive guide to the custom React hooks used in NotebookLLM for managing state and side effects.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">
          NotebookLLM provides several custom React hooks that encapsulate complex state management and API interactions.
          These hooks follow React best practices and integrate seamlessly with the application's data fetching patterns.
        </p>
      </section>

      {/* useNotes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          useNotes
        </h2>
        <p className="text-muted-foreground">
          Manages notes within a notebook, providing CRUD operations and auto-save functionality with debouncing.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Usage</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`const { 
  notes, 
  loading, 
  error, 
  currentNote, 
  isSaving,
  createNote, 
  updateNote, 
  deleteNote,
  selectNote,
  scheduleAutoSave,
  cancelAutoSave 
} = useNotes({ notebookId, autoSaveDelay?: number })`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Parameters</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Property</th>
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>notebookId</code></td>
                  <td className="py-2 pr-4"><code>string</code></td>
                  <td className="py-2">The ID of the notebook to load notes from</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>autoSaveDelay</code></td>
                  <td className="py-2 pr-4"><code>number</code></td>
                  <td className="py-2">Delay in ms before auto-saving (default: 1000)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Returns</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Property</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>notes</code></td>
                  <td className="py-2">Array of notes in the notebook</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>currentNote</code></td>
                  <td className="py-2">Currently selected note or null</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>loading</code></td>
                  <td className="py-2">Boolean indicating if notes are being loaded</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>error</code></td>
                  <td className="py-2">Error message if operation failed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>isSaving</code></td>
                  <td className="py-2">Boolean indicating if auto-save is in progress</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>lastSaved</code></td>
                  <td className="py-2">Date of last successful save</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Example</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { useNotes } from "@/hooks/use-notes"

function NotesEditor({ notebookId }: { notebookId: string }) {
  const { 
    notes, 
    currentNote, 
    loading, 
    createNote, 
    updateNote, 
    selectNote 
  } = useNotes({ notebookId })

  const handleSave = async (content: string) => {
    if (currentNote) {
      await updateNote(currentNote.id, { content })
    }
  }

  const handleAutoSave = (content: string) => {
    if (currentNote) {
      scheduleAutoSave(currentNote.id, { content })
    }
  }

  if (loading) return <div>Loading notes...</div>

  return (
    <div>
      {notes.map(note => (
        <NoteCard 
          key={note.id} 
          note={note} 
          onClick={() => selectNote(note.id)} 
        />
      ))}
      <button onClick={() => createNote({ title: "New Note" })}>
        Add Note
      </button>
    </div>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* useStudio */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          useStudio
        </h2>
        <p className="text-muted-foreground">
          Manages content generation in the Studio panel, including podcasts, quizzes, flashcards, and mind maps.
          Handles async content generation with polling for task status updates.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Usage</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`const { 
  items, 
  loading, 
  error, 
  generatingTool,
  generateContent, 
  deleteContent,
  refresh 
} = useStudio({ notebookId, pollInterval?: number })`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Supported Content Types</h3>
          <div className="p-4 rounded-lg border">
            <ul className="space-y-2 text-sm">
              <li><code>Audio</code> / <code>Audio Overview</code> - Generate audio</li>
              <li> podcast-style<code>Quiz</code> - Generate quiz questions</li>
              <li><code>Flashcards</code> - Generate flashcard decks</li>
              <li><code>Mind Map</code> - Generate visual mind maps</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">StudioItem Type</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`interface StudioItem {
  id: string
  title: string
  sourceCount: number
  timeAgo: string
  type: "quiz" | "audio" | "flashcards" | "mindmap" | "report" | "note"
  status: "pending" | "processing" | "completed" | "failed"
  isNew: boolean
  hasInteractive?: boolean
  content?: Record<string, unknown>
  audioUrl?: string | null
}`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Example</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { useStudio } from "@/hooks/use-studio"

function StudioPanel({ notebookId }: { notebookId: string }) {
  const { items, generatingTool, generateContent, deleteContent } = 
    useStudio({ notebookId })

  const handleGenerate = async (tool: string) => {
    await generateContent(tool)
  }

  return (
    <div>
      <div className="generation-buttons">
        <button 
          onClick={() => handleGenerate("Audio")}
          disabled={generatingTool !== null}
        >
          Generate Podcast
        </button>
        <button 
          onClick={() => handleGenerate("Quiz")}
          disabled={generatingTool !== null}
        >
          Generate Quiz
        </button>
      </div>
      
      <div className="content-list">
        {items.map(item => (
          <ContentCard 
            key={item.id} 
            item={item}
            onDelete={() => deleteContent(item.id)}
          />
        ))}
      </div>
    </div>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* useGoogleDrive */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          useGoogleDrive
        </h2>
        <p className="text-muted-foreground">
          Provides a collection of hooks for integrating with Google Drive, including file browsing,
          searching, importing, and connection management.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">useGoogleDriveStatus</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Manages Google Drive connection status and authentication state.
            </p>
            <div className="p-4 rounded-lg bg-muted font-mono text-sm">
              <pre className="overflow-x-auto">{`const { status, isLoading, error, refreshStatus } = useGoogleDriveStatus()`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">useGoogleDriveFiles</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Lists files and folders with pagination, navigation, and breadcrumbs support.
            </p>
            <div className="p-4 rounded-lg bg-muted font-mono text-sm">
              <pre className="overflow-x-auto">{`const { 
  files, 
  isLoading, 
  error, 
  currentFolder,
  breadcrumbs,
  nextPageToken,
  loadFiles,
  navigateToFolder,
  navigateToRoot,
  navigateUp,
  loadMore
} = useGoogleDriveFiles()`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">useGoogleDriveSearch</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Provides file search functionality with pagination support.
            </p>
            <div className="p-4 rounded-lg bg-muted font-mono text-sm">
              <pre className="overflow-x-auto">{`const { 
  results, 
  isSearching, 
  searchQuery,
  search,
  searchMore,
  clearSearch
} = useGoogleDriveSearch()`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">useGoogleDriveImport</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Handles file import from Google Drive to notebooks with progress tracking.
            </p>
            <div className="p-4 rounded-lg bg-muted font-mono text-sm">
              <pre className="overflow-x-auto">{`const { 
  importProgress,
  isImporting,
  importFile,
  importMultipleFiles,
  clearImportProgress
} = useGoogleDriveImport(notebookId, onImportComplete?)`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">useGoogleDriveDisconnect</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Provides disconnect functionality for Google Drive integration.
            </p>
            <div className="p-4 rounded-lg bg-muted font-mono text-sm">
              <pre className="overflow-x-auto">{`const { disconnect, isDisconnecting } = useGoogleDriveDisconnect()`}</pre>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Example</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { 
  useGoogleDriveStatus, 
  useGoogleDriveFiles,
  useGoogleDriveImport 
} from "@/hooks/use-google-drive"

function GoogleDriveBrowser({ notebookId }: { notebookId: string }) {
  const { status, refreshStatus } = useGoogleDriveStatus()
  const { files, navigateToFolder, loadFiles } = useGoogleDriveFiles()
  const { importFile, importProgress } = useGoogleDriveImport(notebookId)

  useEffect(() => {
    if (status?.connected) {
      loadFiles()
    }
  }, [status?.connected])

  if (!status?.connected) {
    return <ConnectButton onConnect={refreshStatus} />
  }

  return (
    <div>
      <FileList 
        files={files} 
        onFolderClick={navigateToFolder}
      />
      <ImportProgress progress={importProgress} />
    </div>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* useSuggestedQuestions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          useSuggestedQuestions
        </h2>
        <p className="text-muted-foreground">
          Fetches AI-generated suggested questions based on document content or conversation context.
          Supports both document-based and conversation-based question suggestions.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Usage</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`const { 
  questions,
  conversationQuestions,
  isLoading,
  isLoadingConversation,
  error,
  documentCount,
  refresh,
  refreshFromConversation
} = useSuggestedQuestions(notebookId)`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Two Modes</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Document-Based</h4>
              <p className="text-sm text-muted-foreground">
                Initial questions generated from notebook content on mount. Uses the notebook's 
                documents to create relevant study questions.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Conversation-Based (Option B)</h4>
              <p className="text-sm text-muted-foreground">
                Dynamic questions generated after each chat response based on the conversation context.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Example</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { useSuggestedQuestions } from "@/hooks/use-suggested-questions"

function QuestionSuggestions({ notebookId }: { notebookId: string }) {
  const { 
    questions, 
    conversationQuestions,
    isLoading, 
    refresh 
  } = useSuggestedQuestions(notebookId)

  // Use document-based or conversation-based questions
  const displayQuestions = conversationQuestions.length > 0 
    ? conversationQuestions 
    : questions.map(q => q.text)

  return (
    <div>
      <h3>Suggested Questions</h3>
      {isLoading ? (
        <Spinner />
      ) : (
        <ul>
          {displayQuestions.map((question, index) => (
            <li key={index}>
              <button onClick={() => askQuestion(question)}>
                {question}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={refresh}>Refresh Suggestions</button>
    </div>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* useScrollReveal */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          useScrollReveal
        </h2>
        <p className="text-muted-foreground">
          A hook for implementing scroll-based reveal animations using Framer Motion.
          Triggers animations when elements enter the viewport.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Usage</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`const { 
  ref, 
  isVisible, 
  animationProps 
} = useScrollReveal(options?)`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Options</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Property</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>threshold</code></td>
                  <td className="py-2">Percentage of element visible before triggering (0-1)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>once</code></td>
                  <td className="py-2">Whether to trigger only once (default: true)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>margin</code></td>
                  <td className="py-2">Margin from viewport edges</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Error Handling</h3>
            <p className="text-sm text-muted-foreground">
              Always handle loading and error states in your components. The hooks provide 
              <code>loading</code> and <code>error</code> properties for this purpose.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Memoization</h3>
            <p className="text-sm text-muted-foreground">
              The hooks use <code>useCallback</code> and <code>useMemo</code> internally 
              to prevent unnecessary re-renders. Avoid wrapping hook functions in your own 
              memoization unless necessary.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Cleanup</h3>
            <p className="text-sm text-muted-foreground">
              Hooks like <code>useNotes</code> handle cleanup automatically (e.g., clearing 
              auto-save timers). The cleanup runs on component unmount.
            </p>
          </div>
        </div>
      </section>

      {/* Related */}
      <div className="flex gap-4 pt-4">
        <a href="/docs/api-client" className="text-primary hover:underline">
          Next: API Client →
        </a>
      </div>
    </div>
  )
}
