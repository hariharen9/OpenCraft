import {
  Type,
  FileText,
  CreditCard,
  Code2,
  Table as TableIcon,
  Paperclip,
  Image as ImageIcon,
  Sigma,
  GitBranch,
  PenLine,
  LayoutGrid,
  Columns3,
  GripVertical,
  Camera,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { toast } from "sonner";

type Item = {
  label: string;
  icon: React.ReactNode;
  tint?: string;
  action: () => void;
};

export function InsertTab() {
  const editor = useEditorStore((s) => s.editor);
  if (!editor) return null;

  const blocks: Item[] = [
    {
      label: "Text",
      icon: <Type className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "Page",
      icon: <FileText className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () =>
        editor.chain().focus().insertContent("<h2>New Page</h2><p></p>").run(),
    },
    {
      label: "Card",
      icon: <CreditCard className="h-3.5 w-3.5" />,
      tint: "bg-gradient-to-br from-indigo-500 to-purple-500 text-white",
      action: () =>
        editor
          .chain()
          .focus()
          .insertContent('<blockquote><p>Card placeholder</p></blockquote>')
          .run(),
    },
    {
      label: "File Attachment",
      icon: <Paperclip className="h-3.5 w-3.5" />,
      tint: "bg-rose-500/20 text-rose-300",
      action: () => toast.info("Coming Soon", { description: "File attachments are stored locally and will be fully enabled soon." }),
    },
    {
      label: "Image",
      icon: <ImageIcon className="h-3.5 w-3.5" />,
      tint: "bg-emerald-500/20 text-emerald-300",
      action: () => {
        const url = window.prompt("Image URL");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      },
    },
    {
      label: "Image from Unsplash",
      icon: <Camera className="h-3.5 w-3.5" />,
      tint: "bg-zinc-500/20 text-zinc-300",
      action: () => {
        const q = window.prompt("Unsplash search query", "mountains");
        if (q)
          editor
            .chain()
            .focus()
            .setImage({
              src: `https://source.unsplash.com/1200x600/?${encodeURIComponent(q)}`,
            })
            .run();
      },
    },
    {
      label: "Code Block",
      icon: <Code2 className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "TeX Formula",
      icon: <Sigma className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () => {
        const tex = window.prompt("TeX expression", "E = mc^2");
        if (tex)
          editor.chain().focus().insertContent(`<p><code>$${tex}$</code></p>`).run();
      },
    },
    {
      label: "Mermaid Diagram",
      icon: <GitBranch className="h-3.5 w-3.5" />,
      tint: "bg-amber-500/20 text-amber-300",
      action: () =>
        editor
          .chain()
          .focus()
          .insertContent("<pre><code>graph TD;\n  A-->B;\n  B-->C;</code></pre>")
          .run(),
    },
    {
      label: "Whiteboard",
      icon: <PenLine className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () =>
        editor
          .chain()
          .focus()
          .insertContent('<blockquote><p>🖼️ Whiteboard placeholder</p></blockquote>')
          .run(),
    },
  ];

  const collections: Item[] = [
    {
      label: "Table",
      icon: <TableIcon className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      label: "Gallery",
      icon: <LayoutGrid className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () =>
        editor
          .chain()
          .focus()
          .insertContent('<blockquote><p>Gallery placeholder</p></blockquote>')
          .run(),
    },
    {
      label: "Kanban",
      icon: <Columns3 className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () =>
        editor
          .chain()
          .focus()
          .insertContent(
            '<blockquote><p><strong>Kanban Board</strong> placeholder</p></blockquote>',
          )
          .run(),
    },
  ];

  const lines: { label: string; svg: React.ReactNode; insert: string }[] = [
    {
      label: "Dotted",
      svg: (
        <div className="flex items-center justify-center gap-[3px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="h-[3px] w-[3px] rounded-full bg-[#888]" />
          ))}
        </div>
      ),
      insert: "<p>· · · ·</p>",
    },
    {
      label: "Dashed",
      svg: (
        <div className="flex items-center justify-center gap-[3px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-[2px] w-[6px] bg-[#888]" />
          ))}
        </div>
      ),
      insert: "<hr>",
    },
    {
      label: "Thin",
      svg: <div className="h-[1px] w-full bg-[#888]" />,
      insert: "<hr>",
    },
    {
      label: "Thick",
      svg: <div className="h-[3px] w-full bg-[#cfcfcf]" />,
      insert: "<hr>",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {blocks.map((it) => (
          <Row key={it.label} item={it} />
        ))}
      </div>

      <div>
        <SectionLabel>Collections</SectionLabel>
        <div className="space-y-1">
          {collections.map((it) => (
            <Row key={it.label} item={it} />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Insert Line</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {lines.map((l) => (
            <button
              key={l.label}
              onClick={() => editor.chain().focus().insertContent(l.insert).run()}
              className="group flex items-center justify-between gap-2 rounded-md bg-[#262626] px-3 py-3 text-[#aaa] hover:bg-[#2c2c2c] active:scale-[0.98]"
            >
              <span className="flex-1">{l.svg}</span>
              <GripVertical className="h-3.5 w-3.5 text-[#555]" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Insert Page Break</SectionLabel>
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="group flex w-full items-center justify-between gap-2 rounded-md bg-[#262626] px-3 py-3 hover:bg-[#2c2c2c] active:scale-[0.99]"
            >
              <span className="h-[10px] flex-1 rounded-sm bg-[#333]" />
              <GripVertical className="h-3.5 w-3.5 text-[#555]" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Insert Table</SectionLabel>
        <p className="mb-2 text-[12px] text-[#888]">
          Insert a table with the highlighted number of rows and columns.
        </p>
        <TableGrid />
      </div>
    </div>
  );
}

function Row({ item }: { item: Item }) {
  return (
    <button
      onClick={item.action}
      className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] text-[#d0d0d0] hover:bg-[#2a2a2a] active:scale-[0.99]"
    >
      <span
        className={
          "flex h-5 w-5 items-center justify-center rounded-[5px] " +
          (item.tint ?? "bg-[#2a2a2a] text-[#cfcfcf]")
        }
      >
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      <GripVertical className="h-3.5 w-3.5 text-[#555] opacity-0 group-hover:opacity-100" />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[12px] font-semibold text-[#e0e0e0]">{children}</div>
  );
}

function TableGrid() {
  const editor = useEditorStore((s) => s.editor);
  const ROWS = 6;
  const COLS = 8;
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: ROWS * COLS }).map((_, i) => {
        const r = Math.floor(i / COLS) + 1;
        const c = (i % COLS) + 1;
        return (
          <button
            key={i}
            onClick={() =>
              editor?.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run()
            }
            className="aspect-square rounded-[3px] bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            title={`${r}×${c}`}
          />
        );
      })}
    </div>
  );
}
