"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { notesApi, type Note, type CreateNoteRequest, type UpdateNoteRequest } from "@/lib/api/notes";

interface UseNotesOptions {
  notebookId: string;
  autoSaveDelay?: number; // Delay in ms before auto-saving (default: 1000)
}

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  currentNote: Note | null;
  isSaving: boolean;
  lastSaved: Date | null;

  // Actions
  createNote: (data?: Partial<CreateNoteRequest>) => Promise<Note>;
  updateNote: (noteId: string, data: UpdateNoteRequest) => Promise<Note>;
  deleteNote: (noteId: string) => Promise<void>;
  selectNote: (noteId: string | null) => void;
  refresh: () => Promise<void>;

  // Auto-save functionality
  scheduleAutoSave: (noteId: string, data: UpdateNoteRequest) => void;
  cancelAutoSave: () => void;
}

export function useNotes({ notebookId, autoSaveDelay = 1000 }: UseNotesOptions): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<{ noteId: string; data: UpdateNoteRequest } | null>(null);

  // Fetch notes on mount and when notebookId changes
  const fetchNotes = useCallback(async () => {
    if (!notebookId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await notesApi.list(notebookId);
      setNotes(fetchedNotes);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [notebookId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Clear current note when switching notebooks
  useEffect(() => {
    setCurrentNote(null);
  }, [notebookId]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Create a new note
  const createNote = useCallback(
    async (data?: Partial<CreateNoteRequest>): Promise<Note> => {
      try {
        setError(null);
        const newNote = await notesApi.create({
          notebookId,
          title: data?.title,
          content: data?.content,
        });

        setNotes(prev => [newNote, ...prev]);
        setCurrentNote(newNote);
        return newNote;
      } catch (err) {
        console.error("Failed to create note:", err);
        setError("Failed to create note");
        throw err;
      }
    },
    [notebookId]
  );

  // Update a note
  const updateNote = useCallback(
    async (noteId: string, data: UpdateNoteRequest): Promise<Note> => {
      try {
        setIsSaving(true);
        setError(null);
        const updatedNote = await notesApi.update(noteId, data);

        setNotes(prev =>
          prev.map(note => (note.id === noteId ? updatedNote : note))
        );

        if (currentNote?.id === noteId) {
          setCurrentNote(updatedNote);
        }

        setLastSaved(new Date());
        return updatedNote;
      } catch (err) {
        console.error("Failed to update note:", err);
        setError("Failed to save note");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [currentNote]
  );

  // Delete a note
  const deleteNote = useCallback(
    async (noteId: string): Promise<void> => {
      try {
        setError(null);
        await notesApi.delete(noteId);

        setNotes(prev => prev.filter(note => note.id !== noteId));

        if (currentNote?.id === noteId) {
          setCurrentNote(null);
        }
      } catch (err) {
        console.error("Failed to delete note:", err);
        setError("Failed to delete note");
        throw err;
      }
    },
    [currentNote]
  );

  // Select a note
  const selectNote = useCallback(
    (noteId: string | null) => {
      if (noteId === null) {
        setCurrentNote(null);
        return;
      }

      const note = notes.find(n => n.id === noteId);
      setCurrentNote(note || null);
    },
    [notes]
  );

  // Schedule auto-save with debouncing
  const scheduleAutoSave = useCallback(
    (noteId: string, data: UpdateNoteRequest) => {
      // Store pending save data
      pendingSaveRef.current = { noteId, data };

      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Schedule new save
      autoSaveTimerRef.current = setTimeout(async () => {
        const pending = pendingSaveRef.current;
        if (pending) {
          try {
            await updateNote(pending.noteId, pending.data);
            pendingSaveRef.current = null;
          } catch {
            // Error already logged in updateNote
          }
        }
      }, autoSaveDelay);
    },
    [autoSaveDelay, updateNote]
  );

  // Cancel pending auto-save
  const cancelAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    pendingSaveRef.current = null;
  }, []);

  // Refresh notes list
  const refresh = useCallback(async () => {
    await fetchNotes();
  }, [fetchNotes]);

  return {
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
  };
}
