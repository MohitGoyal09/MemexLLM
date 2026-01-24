/**
 * Notes API - Local Storage Implementation
 *
 * This module provides CRUD operations for notes stored in localStorage.
 * Notes are scoped to notebooks and support rich text content (HTML).
 *
 * Future: Can be upgraded to use a backend API by replacing the storage functions.
 */

// === Types ===

export interface Note {
  id: string;
  notebookId: string;
  title: string;
  content: string; // HTML content from rich text editor
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  notebookId: string;
  title?: string;
  content?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

// === Storage Keys ===

const NOTES_STORAGE_KEY = "synapse_notes";

// === Helper Functions ===

function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getAllNotes(): Note[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    console.error("Failed to parse notes from localStorage");
    return [];
  }
}

function saveAllNotes(notes: Note[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to save notes to localStorage:", error);
    throw new Error("Failed to save notes");
  }
}

// === API Functions ===

export const notesApi = {
  /**
   * List all notes for a specific notebook
   */
  list: async (notebookId: string): Promise<Note[]> => {
    // Simulate async behavior for consistency with real API
    await new Promise(resolve => setTimeout(resolve, 10));

    const allNotes = getAllNotes();
    return allNotes
      .filter(note => note.notebookId === notebookId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  /**
   * Get a specific note by ID
   */
  get: async (noteId: string): Promise<Note | null> => {
    await new Promise(resolve => setTimeout(resolve, 10));

    const allNotes = getAllNotes();
    return allNotes.find(note => note.id === noteId) || null;
  },

  /**
   * Create a new note
   */
  create: async (data: CreateNoteRequest): Promise<Note> => {
    await new Promise(resolve => setTimeout(resolve, 10));

    const now = new Date().toISOString();
    const newNote: Note = {
      id: generateId(),
      notebookId: data.notebookId,
      title: data.title || "Untitled Note",
      content: data.content || "",
      createdAt: now,
      updatedAt: now,
    };

    const allNotes = getAllNotes();
    allNotes.push(newNote);
    saveAllNotes(allNotes);

    return newNote;
  },

  /**
   * Update an existing note
   */
  update: async (noteId: string, data: UpdateNoteRequest): Promise<Note> => {
    await new Promise(resolve => setTimeout(resolve, 10));

    const allNotes = getAllNotes();
    const noteIndex = allNotes.findIndex(note => note.id === noteId);

    if (noteIndex === -1) {
      throw new Error("Note not found");
    }

    const updatedNote: Note = {
      ...allNotes[noteIndex],
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      updatedAt: new Date().toISOString(),
    };

    allNotes[noteIndex] = updatedNote;
    saveAllNotes(allNotes);

    return updatedNote;
  },

  /**
   * Delete a note
   */
  delete: async (noteId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 10));

    const allNotes = getAllNotes();
    const filteredNotes = allNotes.filter(note => note.id !== noteId);

    if (filteredNotes.length === allNotes.length) {
      throw new Error("Note not found");
    }

    saveAllNotes(filteredNotes);
  },

  /**
   * Delete all notes for a notebook (useful when deleting a notebook)
   */
  deleteByNotebook: async (notebookId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 10));

    const allNotes = getAllNotes();
    const filteredNotes = allNotes.filter(note => note.notebookId !== notebookId);
    saveAllNotes(filteredNotes);
  },
};
