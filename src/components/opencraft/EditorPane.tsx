import { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { FontFamily } from "@tiptap/extension-font-family";
import { Markdown } from "tiptap-markdown";
import {
  PanelLeft,
  PanelRight,
  MessageSquare,
  Sparkles,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { LocalStorageProvider } from "@/lib/storage/local";
import { addHistorySnapshot } from "@/lib/storage/history";
import { toast } from "sonner";
import { EditorToolbar } from "./EditorToolbar";
import { EditorBubbleMenu } from "./EditorBubbleMenu";

export function EditorPane() {
  const setEditor = useEditorStore((s) => s.setEditor);
  const bump = useEditorStore((s) => s.bump);
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const inspectorOpen = useEditorStore((s) => s.inspectorOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const toggleInspector = useEditorStore((s) => s.toggleInspector);
  const presenting = useEditorStore((s) => s.presenting);
  const setPresenting = useEditorStore((s) => s.setPresenting);
  const storeFont = useEditorStore((s) => s.font);
  const storeFontSize = useEditorStore((s) => s.fontSize);

  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const docs = useWorkspaceStore((s) => s.docs);
  const updateDocMeta = useWorkspaceStore((s) => s.updateDocMeta);

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null;
  const title = activeDoc?.title ?? "";

  const setFont = useEditorStore((s) => s.setFont);
  const setFontSize = useEditorStore((s) => s.setFontSize);

  // Sync editor store from doc meta on doc switch
  useEffect(() => {
    if (activeDoc) {
      setFont(activeDoc.font ?? "default");
      setFontSize(activeDoc.fontSize ?? "Ss");
    }
  }, [activeDocId]);

  // Per-document styling (fall back to editor store, then defaults)
  const pageBg = activeDoc?.pageBg ?? "#1f1f1f";
  const font = storeFont;
  const fontSize = storeFontSize;
  const widePage = activeDoc?.widePage ?? false;
  const separator = activeDoc?.separator ?? "line";
  const coverImage = activeDoc?.coverImage ?? null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtns, setShowScrollBtns] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    setShowScrollBtns(true);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => setShowScrollBtns(false), 1500);
  }, []);

  const scrollTo = (dir: "top" | "bottom") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: dir === "top" ? 0 : el.scrollHeight, behavior: "smooth" });
  };

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedDocRef = useRef<string | null>(null);

  const setTitle = useCallback(
    (t: string) => {
      if (activeDocId) updateDocMeta(activeDocId, { title: t, updatedAt: Date.now() });
    },
    [activeDocId, updateDocMeta],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "oc-link" } }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: ({ node, pos }) => {
          if (pos === 0 && node.type.name === "paragraph")
            return "Start writing, or press '/' for commands...";
          return "";
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({ html: false, breaks: true, transformPastedText: true }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "opencraft-prose focus:outline-none min-h-[60vh]",
      },
      handleKeyDown: (_, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "s") {
          event.preventDefault();
          toast.success("Changes saved", { style: { background: "#16a34a", color: "#fff", border: "1px solid #15803d" } });
          return true;
        }
        return false;
      },
    },
    onSelectionUpdate: () => bump(),
    onTransaction: () => bump(),
    onUpdate: ({ editor: ed }) => {
      bump();
      const docId = useWorkspaceStore.getState().activeDocId;
      if (!docId) return;
      useWorkspaceStore.getState().updateDocMeta(docId, { updatedAt: Date.now() });
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const json = ed.getJSON();
        const md = (ed.storage as any).markdown?.getMarkdown?.() ?? "";
        LocalStorageProvider.save(docId, { json, markdown: md, updatedAt: Date.now() });
        addHistorySnapshot(docId, json, md);
      }, 500);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setEditor(editor);
    return () => setEditor(null);
  }, [editor, setEditor]);

  // Load document content when activeDocId changes
  useEffect(() => {
    if (!editor || !activeDocId) return;
    if (loadedDocRef.current === activeDocId) return;
    loadedDocRef.current = activeDocId;

    // Save current doc before switching
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    let cancelled = false;
    LocalStorageProvider.load(activeDocId).then((doc) => {
      if (cancelled) return;
      if (doc) {
        try {
          editor.commands.setContent(doc.json as never);
        } catch {
          editor.commands.setContent(doc.markdown);
        }
      } else {
        editor.commands.clearContent(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [editor, activeDocId]);

  // Sync presenting state when user exits fullscreen via Escape
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        setPresenting(false);
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [setPresenting]);

  const stopPresenting = () => {
    setPresenting(false);
    document.exitFullscreen();
  };

  const fontClass =
    font === "serif" ? "font-serif" : font === "mono" ? "font-mono" : "font-sans";
  const sizeClass =
    fontSize === "00" ? "text-[15px]" : fontSize === "Rr" ? "text-[17px]" : "text-[16px]";

  // No active document — show placeholder
  if (!activeDocId) {
    return (
      <main className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-center" style={pageBgStyle(pageBg)}>
        <header className="absolute inset-x-0 top-0 z-10 flex h-[44px] shrink-0 items-center justify-between px-3">
          <div className="flex items-center gap-1">
            <IconBtn label="Toggle sidebar" onClick={toggleSidebar} active={sidebarOpen}>
              <PanelLeft className="h-4 w-4" />
            </IconBtn>
          </div>
          <div />
          <div className="flex items-center gap-1.5">
            <IconBtn label="Toggle inspector" onClick={toggleInspector} active={inspectorOpen}>
              <PanelRight className="h-4 w-4" />
            </IconBtn>
          </div>
        </header>
        <div className="text-center">
          <p className="text-[14px] text-[#666]">No document selected</p>
          <p className="mt-1 text-[12px] text-[#444]">Create or select a document from the sidebar</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative flex h-full min-w-0 flex-1 flex-col"
      style={pageBgStyle(pageBg)}
    >
      {/* Stop presenting button */}
      {presenting && (
        <div className="fixed right-4 top-4 z-[9999]">
          <button
            onClick={stopPresenting}
            className="group flex items-center gap-2 rounded-full bg-red-600/80 px-3 py-2 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-red-600"
          >
            <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-[12px] transition-all duration-200 group-hover:max-w-[120px]">
              Stop Presenting
            </span>
          </button>
        </div>
      )}

      {/* Top header */}
      <header className="absolute inset-x-0 top-0 z-10 flex h-[44px] shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <IconBtn label="Apps">
            <span className="grid h-4 w-4 grid-cols-2 gap-[2px]">
              <span className="rounded-[1px] bg-current" />
              <span className="rounded-[1px] bg-current" />
              <span className="rounded-[1px] bg-current" />
              <span className="rounded-[1px] bg-current" />
            </span>
          </IconBtn>
          <IconBtn label="Toggle sidebar" onClick={toggleSidebar} active={sidebarOpen}>
            <PanelLeft className="h-4 w-4" />
          </IconBtn>
        </div>

        <div className="truncate text-[13px] text-[#9a9a9a]">
          {title || "Untitled Page"}
        </div>

        <div className="flex items-center gap-1.5">
          <IconBtn
            label="Toggle inspector"
            onClick={toggleInspector}
            active={inspectorOpen}
          >
            <PanelRight className="h-4 w-4" />
          </IconBtn>
        </div>
      </header>

      {/* Scrollable canvas */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto pt-[44px]"
        >
          {coverImage && (
            <div
              className="h-[180px] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
          )}
          <div
            className={
              "mx-auto px-12 py-12 " +
              (widePage ? "max-w-[1100px]" : "max-w-[760px]") +
              " " +
              fontClass +
              " " +
              sizeClass
            }
          >
            <div className="group relative mb-8">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page Title"
                className="w-full bg-transparent pb-3 text-[40px] font-bold leading-tight tracking-[-0.02em] text-[#e0e0e0] outline-none placeholder:text-[#4a4a4a] focus:ring-0"
              />
              <div className="border-b border-[#2a2a2a]" />
              <div className="absolute right-0 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <IconBtn label="Add cover">
                  <Sparkles className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn label="Comment">
                  <MessageSquare className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            </div>

            <div className={`sep-${separator}`}>
              <EditorContent editor={editor} />
            </div>

            {/* Add block button */}
            <button
              onClick={() => editor?.chain().focus().insertContent("<p></p>").run()}
              className="mt-4 flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-[#666] opacity-0 transition-opacity hover:bg-[#2a2a2a] hover:text-[#bbb] focus:opacity-100"
            >
              <Plus className="h-3.5 w-3.5" /> Add a block
            </button>
          </div>
        </div>

        {/* Scroll to top/bottom buttons */}
        <div
          className={
            "pointer-events-none absolute right-0 top-1/2 flex -translate-y-1/2 flex-col gap-1 pr-1 transition-opacity duration-300 " +
            (showScrollBtns ? "opacity-100" : "opacity-0")
          }
        >
          <button
            onClick={() => scrollTo("top")}
            className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded bg-[#3a3a3a] text-[#bbb] shadow transition-colors hover:bg-[#4a4a4a] hover:text-white"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => scrollTo("bottom")}
            className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded bg-[#3a3a3a] text-[#bbb] shadow transition-colors hover:bg-[#4a4a4a] hover:text-white"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {editor && (
        <>
          <EditorBubbleMenu editor={editor} />
          <EditorToolbar editor={editor} />
        </>
      )}
    </main>
  );
}

function pageBgStyle(bg: string): React.CSSProperties {
  if (bg.startsWith("url(")) {
    return {
      backgroundImage: bg,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  return { background: bg };
}

function IconBtn({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={
        "rounded-md p-1.5 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#444] " +
        (active
          ? "text-[#e8e8e8] hover:bg-[#2a2a2a]"
          : "text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-[#e0e0e0]")
      }
    >
      {children}
    </button>
  );
}
