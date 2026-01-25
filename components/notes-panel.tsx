"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  FileText,
  MoreVertical,
  Search,
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NoteEditor } from "@/components/note-editor";
import { useNotes } from "@/hooks/use-notes";
import { cn } from "@/lib/utils";
import { notesApi, type Note } from "@/lib/api/notes";
import { toast } from "sonner";
import { ArrowUpToLine } from "lucide-react";

interface NotesPanelProps {
  notebookId: string;
  onBack: () => void;
}

// Delete Confirmation Dialog
function DeleteConfirmDialog({
  noteTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  noteTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold">Delete Note</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete &ldquo;{noteTitle}&rdquo;? This note will be permanently removed.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Note List Item Component
function NoteListItem({
  note,
  isSelected,
  onClick,
  onDelete,
}: {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  // Extract plain text preview from HTML content
  const getContentPreview = (html: string): string => {
    if (!html) return "No content";
    // Strip HTML tags for preview
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text.slice(0, 80) + (text.length > 80 ? "..." : "") || "No content";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
        "hover:bg-secondary/80 border border-transparent",
        isSelected && "bg-secondary border-primary/20"
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <StickyNote className="w-4 h-4 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{note.title || "Untitled"}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {getContentPreview(note.content)}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(note.updatedAt)}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-amber-500/50" />
      </div>
      <h3 className="font-medium text-sm mb-1">No notes yet</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
        Create your first note to capture ideas and insights from your notebook
      </p>
      <Button onClick={onCreateNote} size="sm" className="gap-2">
        <Plus className="w-4 h-4" />
        Create Note
      </Button>
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">Loading notes...</p>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500/50" />
      </div>
      <h3 className="font-medium text-sm mb-1 text-red-500">Error loading notes</h3>
      <p className="text-xs text-muted-foreground mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline" size="sm">
        Try Again
      </Button>
    </div>
  );
}

export function NotesPanel({ notebookId, onBack }: NotesPanelProps) {
  const [view, setView] = useState<"list" | "editor">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

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
    refresh,
    scheduleAutoSave,
    cancelAutoSave,
  } = useNotes({ notebookId, autoSaveDelay: 1500 });

  // Filter notes by search query
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  // Handle creating a new note
  const handleCreateNote = useCallback(async () => {
    try {
      await createNote({ title: "Untitled Note" });
      setView("editor");
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  }, [createNote]);

  // Handle selecting a note
  const handleSelectNote = useCallback(
    (noteId: string) => {
      selectNote(noteId);
      setView("editor");
    },
    [selectNote]
  );

  // Handle saving a note
  const handleSaveNote = useCallback(
    async (title: string, content: string) => {
      if (!currentNote) return;
      await updateNote(currentNote.id, { title, content });
    },
    [currentNote, updateNote]
  );

  // Handle auto-save
  const handleAutoSave = useCallback(
    (title: string, content: string) => {
      if (!currentNote) return;
      scheduleAutoSave(currentNote.id, { title, content });
    },
    [currentNote, scheduleAutoSave]
  );

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!noteToDelete) return;

    setIsDeleting(true);
    try {
      await deleteNote(noteToDelete.id);
      setNoteToDelete(null);

      // If we were editing this note, go back to list
      if (currentNote?.id === noteToDelete.id) {
        setView("list");
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    } finally {
      setIsDeleting(false);
    }
  }, [noteToDelete, deleteNote, currentNote]);

  // Handle back from editor
  const handleBackFromEditor = useCallback(() => {
    cancelAutoSave();
    selectNote(null);
    setView("list");
  }, [cancelAutoSave, selectNote]);

  // Handle converting note to source
  const handleConvertToSource = useCallback(async () => {
    if (!currentNote) return;

    // Get plain text content from HTML for validation
    const plainTextContent = currentNote.content.replace(/<[^>]*>/g, '').trim();

    if (!plainTextContent) {
      toast.error("Cannot convert empty note");
      return;
    }

    setIsConverting(true);
    try {
      const response = await notesApi.convertToSource(
        currentNote.id,
        currentNote.title || "Untitled Note",
        currentNote.content,
        notebookId
      );

      if (response.success) {
        // Delete the note from local storage since it's now a source
        await deleteNote(currentNote.id);
        setView("list");
        toast.success("Note converted to source! It will appear in Sources once indexed.");
      } else {
        toast.error(response.message || "Failed to convert note to source");
      }
    } catch (error) {
      console.error("Failed to convert note to source:", error);
      toast.error("Failed to convert note to source");
    } finally {
      setIsConverting(false);
    }
  }, [currentNote, notebookId, deleteNote]);

  // Render editor view
  if (view === "editor" && currentNote) {
    return (
      <div className="flex flex-col h-full">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackFromEditor}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="font-semibold">Note</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleConvertToSource}
              disabled={isConverting}
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
            >
              {isConverting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUpToLine className="w-3.5 h-3.5" />
              )}
              Convert to Source
            </Button>
            <button
              onClick={() => setNoteToDelete(currentNote)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 overflow-hidden">
          <NoteEditor
            key={currentNote.id}
            initialTitle={currentNote.title}
            initialContent={currentNote.content}
            onSave={handleSaveNote}
            onAutoSave={handleAutoSave}
            autoSaveDelay={1500}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        </div>

        {/* Delete Confirmation Dialog */}
        {noteToDelete && (
          <DeleteConfirmDialog
            noteTitle={noteToDelete.title || "Untitled"}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setNoteToDelete(null)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    );
  }

  // Render list view
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="font-semibold">Notes</span>
          {notes.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </div>
        <Button onClick={handleCreateNote} size="sm" variant="ghost" className="h-8 w-8 p-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      {notes.length > 0 && (
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : notes.length === 0 ? (
          <EmptyState onCreateNote={handleCreateNote} />
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No notes matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : (
          <div className="px-4 py-2 space-y-1">
            {filteredNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={currentNote?.id === note.id}
                onClick={() => handleSelectNote(note.id)}
                onDelete={() => setNoteToDelete(note)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with create button */}
      {notes.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleCreateNote}
            variant="outline"
            className="w-full justify-center gap-2 rounded-full bg-background hover:bg-secondary"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {noteToDelete && (
        <DeleteConfirmDialog
          noteTitle={noteToDelete.title || "Untitled"}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setNoteToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

export default NotesPanel;
