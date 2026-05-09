import { useEffect, useRef } from "react";
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
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { LocalStorageProvider } from "@/lib/storage/local";
import { EditorToolbar } from "./EditorToolbar";
import { EditorBubbleMenu } from "./EditorBubbleMenu";

const DOC_ID = "default";

export function EditorPane() {
  const setEditor = useEditorStore((s) => s.setEditor);
  const bump = useEditorStore((s) => s.bump);
  const pageBg = useEditorStore((s) => s.pageBg);
  const font = useEditorStore((s) => s.font);
  const fontSize = useEditorStore((s) => s.fontSize);
  const title = useEditorStore((s) => s.title);
  const setTitle = useEditorStore((s) => s.setTitle);
  const widePage = useEditorStore((s) => s.widePage);
  const coverImage = useEditorStore((s) => s.coverImage);
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const inspectorOpen = useEditorStore((s) => s.inspectorOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const toggleInspector = useEditorStore((s) => s.toggleInspector);
  const touchUpdated = useEditorStore((s) => s.touchUpdated);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    },
    onSelectionUpdate: () => bump(),
    onTransaction: () => bump(),
    onUpdate: ({ editor }) => {
      bump();
      touchUpdated();
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const md = (editor.storage as any).markdown?.getMarkdown?.() ?? "";
        LocalStorageProvider.save(DOC_ID, {
          json: editor.getJSON(),
          markdown: md,
          updatedAt: Date.now(),
        });
      }, 500);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setEditor(editor);
    return () => setEditor(null);
  }, [editor, setEditor]);

  useEffect(() => {
    if (!editor) return;
    let cancelled = false;
    LocalStorageProvider.load(DOC_ID).then((doc) => {
      if (cancelled || !doc) return;
      try {
        editor.commands.setContent(doc.json as never);
      } catch {
        editor.commands.setContent(doc.markdown);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [editor]);

  const fontClass =
    font === "serif" ? "font-serif" : font === "mono" ? "font-mono" : "font-sans";
  const sizeClass =
    fontSize === "00" ? "text-[15px]" : fontSize === "Rr" ? "text-[17px]" : "text-[16px]";

  return (
    <main
      className="relative flex h-full min-w-0 flex-1 flex-col"
      style={{ backgroundColor: pageBg }}
    >
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
      <div className="min-h-0 flex-1 overflow-y-auto pt-[44px]">
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

          <EditorContent editor={editor} />

          {/* Add block button */}
          <button
            onClick={() => editor?.chain().focus().insertContent("<p></p>").run()}
            className="mt-4 flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-[#666] opacity-0 transition-opacity hover:bg-[#2a2a2a] hover:text-[#bbb] focus:opacity-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add a block
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
