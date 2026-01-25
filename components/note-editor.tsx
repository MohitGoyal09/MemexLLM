"use client";
// fix-bubble-menu-import

import { useCallback, useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Check,
  X,
  Save,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Types
interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => Promise<void>;
  onAutoSave?: (title: string, content: string) => void;
  autoSaveDelay?: number;
  isSaving?: boolean;
  lastSaved?: Date | null;
  className?: string;
  placeholder?: string;
  showTitle?: boolean;
  readOnly?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

// Toolbar Button Component
function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        "hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive && "bg-secondary text-primary"
      )}
    >
      {children}
    </button>
  );
}

// Toolbar Divider
function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1" />;
}

// Link Input Modal
function LinkInput({
  initialUrl,
  onSubmit,
  onCancel,
}: {
  initialUrl?: string;
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState(initialUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // Add https if no protocol specified
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      onSubmit(finalUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1 p-1">
      <Input
        ref={inputRef}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL..."
        className="h-7 text-xs w-48"
      />
      <button
        type="submit"
        className="p-1 hover:bg-green-500/20 rounded text-green-500"
        title="Apply link"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 hover:bg-red-500/20 rounded text-red-500"
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}

export function NoteEditor({
  initialTitle = "",
  initialContent = "",
  onSave,
  onAutoSave,
  autoSaveDelay = 1500,
  isSaving = false,
  lastSaved,
  className,
  placeholder = "Start writing your note...",
  showTitle = true,
  readOnly = false,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef({ title: initialTitle, content: initialContent });

  // Initialize TipTap editor
  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer hover:text-primary/80",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: "bg-yellow-200 dark:bg-yellow-800/50 rounded px-0.5",
        },
      }),
      CharacterCount,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "focus:outline-none min-h-[200px] px-4 py-3",
          "prose-headings:font-semibold prose-headings:text-foreground",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-ul:list-disc prose-ol:list-decimal",
          "prose-li:text-foreground prose-li:my-0.5",
          "prose-blockquote:border-l-2 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-a:text-primary prose-a:underline"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      setHasUnsavedChanges(true);
      scheduleAutoSave(title, editor.getHTML());
    },
  });

  // Update content when initialContent changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
      lastSavedContentRef.current = { title: initialTitle, content: initialContent };
      setHasUnsavedChanges(false);
    }
  }, [initialContent, editor, initialTitle]);

  // Update title when initialTitle changes
  useEffect(() => {
    setTitle(initialTitle);
    lastSavedContentRef.current.title = initialTitle;
  }, [initialTitle]);

  // Schedule auto-save with debouncing
  const scheduleAutoSave = useCallback(
    (currentTitle: string, currentContent: string) => {
      if (!onAutoSave) return;

      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Schedule new auto-save
      autoSaveTimerRef.current = setTimeout(() => {
        // Only auto-save if content actually changed
        if (
          currentTitle !== lastSavedContentRef.current.title ||
          currentContent !== lastSavedContentRef.current.content
        ) {
          onAutoSave(currentTitle, currentContent);
          lastSavedContentRef.current = { title: currentTitle, content: currentContent };
        }
      }, autoSaveDelay);
    },
    [onAutoSave, autoSaveDelay]
  );

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
    if (editor) {
      scheduleAutoSave(newTitle, editor.getHTML());
    }
  };

  // Manual save
  const handleManualSave = async () => {
    if (!editor) return;

    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    await onSave(title, editor.getHTML());
    lastSavedContentRef.current = { title, content: editor.getHTML() };
    setHasUnsavedChanges(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Link handling
  const setLink = useCallback(
    (url: string) => {
      if (!editor) return;

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }
      setShowLinkInput(false);
    },
    [editor]
  );

  const handleLinkClick = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    setShowLinkInput(true);
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Character and word count
  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Title Input */}
      {showTitle && (
        <div className="px-4 pt-4 pb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="w-full text-lg font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      )}

      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-0.5 px-4 py-2 border-b border-border flex-wrap">
          {/* Undo/Redo */}
          <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block Elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        {showLinkInput ? (
          <LinkInput
            initialUrl={editor.getAttributes("link").href}
            onSubmit={setLink}
            onCancel={() => setShowLinkInput(false)}
          />
        ) : (
          <ToolbarButton
            onClick={handleLinkClick}
            isActive={editor.isActive("link")}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Bubble Menu for quick formatting */}
      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 p-1 bg-popover border border-border rounded-lg shadow-lg"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={handleLinkClick}
            isActive={editor.isActive("link")}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
        </BubbleMenu>
      )}

      {/* Footer with stats and save */}
      {!readOnly && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
            {hasUnsavedChanges && !isSaving && (
              <span className="text-yellow-500">Unsaved changes</span>
            )}
            {isSaving && (
              <span className="flex items-center gap-1 text-primary">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {lastSaved && !isSaving && !hasUnsavedChanges && (
              <span className="text-green-500">
                Saved {formatRelativeTime(lastSaved)}
              </span>
            )}
          </div>
          <Button
            onClick={handleManualSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  return date.toLocaleDateString();
}

export default NoteEditor;
