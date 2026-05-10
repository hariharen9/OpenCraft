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
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { toast } from "sonner";

type Item = {
  label: string;
  icon: React.ReactNode;
  tint?: string;
  action: () => void;
};

export function InsertTab() {
  const editor = useEditorStore((s) => s.editor);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      action: () => {
        const { schema } = editor.state;
        const p = schema.nodes.paragraph.create();
        const sub = schema.nodes.subpage?.createAndFill({}, p);
        if (sub) editor.commands.insertContentAt(editor.state.selection.from, sub);
      },
    },
    {
      label: "Card",
      icon: <CreditCard className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () => {
        const { schema } = editor.state;
        const p = schema.nodes.paragraph.create();
        const card = schema.nodes.card?.createAndFill({}, p);
        if (card) editor.commands.insertContentAt(editor.state.selection.from, card);
      },
    },
    {
      label: "File Attachment",
      icon: <Paperclip className="h-3.5 w-3.5" />,
      tint: "bg-rose-500/20 text-rose-300",
      action: () => fileInputRef.current?.click(),
    },
    {
      label: "Image",
      icon: <ImageIcon className="h-3.5 w-3.5" />,
      tint: "bg-emerald-500/20 text-emerald-300",
      action: () => {
        setImageUrl("");
        setImageDialogOpen(true);
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
      action: () => editor.chain().focus().insertContent({ type: "mathBlock" }).run(),
    },
    {
      label: "Mermaid Diagram",
      icon: <GitBranch className="h-3.5 w-3.5" />,
      tint: "bg-amber-500/20 text-amber-300",
      action: () => editor.chain().focus().insertContent({ type: "mermaidBlock" }).run(),
    },
    {
      label: "Whiteboard",
      icon: <PenLine className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () => editor.chain().focus().insertContent({ type: "whiteboardBlock" }).run(),
    },
  ];

  const collections: Item[] = [
    {
      label: "Table",
      icon: <TableIcon className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      label: "Gallery",
      icon: <LayoutGrid className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () => editor.chain().focus().insertContent({ type: "galleryBlock" }).run(),
    },
    {
      label: "Kanban",
      icon: <Columns3 className="h-3.5 w-3.5" />,
      tint: "bg-[#2a2a2a] text-[#cfcfcf]",
      action: () => editor.chain().focus().insertContent({ type: "kanbanBlock" }).run(),
    },
  ];

  const lines: { label: string; svg: React.ReactNode; action: () => void }[] = [
    {
      label: "Dotted",
      svg: (
        <div className="flex items-center justify-center gap-[3px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="h-[3px] w-[3px] rounded-full bg-[#888]" />
          ))}
        </div>
      ),
      action: () => editor.chain().focus().setCustomDivider({ variant: "dotted" }).run(),
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
      action: () => editor.chain().focus().setCustomDivider({ variant: "dashed" }).run(),
    },
    {
      label: "Thin",
      svg: <div className="h-[1px] w-full bg-[#888]" />,
      action: () => editor.chain().focus().setCustomDivider({ variant: "thin" }).run(),
    },
    {
      label: "Thick",
      svg: <div className="h-[3px] w-full bg-[#cfcfcf]" />,
      action: () => editor.chain().focus().setCustomDivider({ variant: "thick" }).run(),
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
              onClick={l.action}
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
        <button
          onClick={() => editor.chain().focus().insertContent({ type: "pageBreakBlock" }).run()}
          className="group flex w-full items-center justify-between gap-2 rounded-md bg-[#262626] px-3 py-3 hover:bg-[#2c2c2c] active:scale-[0.99]"
        >
          <span className="flex-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#777]">
            Page Break
          </span>
          <GripVertical className="h-3.5 w-3.5 text-[#555]" />
        </button>
      </div>

      <div>
        <SectionLabel>Insert Table</SectionLabel>
        <p className="mb-2 text-[12px] text-[#888]">
          Insert a table with the highlighted number of rows and columns.
        </p>
        <TableGrid />
      </div>

      {/* ─── Image URL Dialog ─── */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent
          className="border-[#333] bg-[#1a1a1a] text-white sm:max-w-[380px]"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            setTimeout(() => {
              const input = document.getElementById("img-url-input");
              input?.focus();
              (input as HTMLInputElement)?.select();
            }, 50);
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[14px] text-[#e0e0e0]">Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              id="img-url-input"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-md border border-[#444] bg-[#252525] px-3 py-2 text-[13px] text-white outline-none placeholder:text-[#666] focus:border-[#666]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && imageUrl) {
                  editor.chain().focus().setImage({ src: imageUrl }).run();
                  setImageDialogOpen(false);
                  setImageUrl("");
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <button className="rounded-md bg-[#2a2a2a] px-4 py-1.5 text-[13px] text-[#aaa] hover:bg-[#333]">
                  Cancel
                </button>
              </DialogClose>
              <button
                disabled={!imageUrl}
                onClick={() => {
                  editor.chain().focus().setImage({ src: imageUrl }).run();
                  setImageDialogOpen(false);
                  setImageUrl("");
                }}
                className="rounded-md bg-[#3a3a3a] px-4 py-1.5 text-[13px] text-white hover:bg-[#4a4a4a] disabled:opacity-40"
              >
                Insert
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Hidden file input for attachments ─── */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !editor) return;
          const fd = await file.arrayBuffer();
          const base64 = btoa(new Uint8Array(fd).reduce((s, b) => s + String.fromCharCode(b), ""));
          const dataUrl = `data:${file.type};base64,${base64}`;
          const { schema } = editor.state;
          const link = schema.text(`📎 ${file.name}`, [
            schema.marks.link.create({ href: dataUrl }),
          ]);
          const p = schema.nodes.paragraph.create({}, link);
          editor.commands.insertContentAt(editor.state.selection.from, p);
          toast.success("Attached", { description: file.name });
          e.target.value = "";
        }}
      />
    </div>
  );
}

function Row({ item }: { item: Item }) {
  return (
    <button
      onClick={item.action}
      className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] text-[#d0d0d0] hover:bg-[#2a2a2a] active:scale-[0.99]"
    >
      <span className="flex items-center justify-center text-[#888] group-hover:text-[#cfcfcf] transition-colors">
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      <GripVertical className="h-3.5 w-3.5 text-[#555] opacity-0 group-hover:opacity-100" />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[12px] font-semibold text-[#e0e0e0]">{children}</div>;
}

function TableGrid() {
  const editor = useEditorStore((s) => s.editor);
  const ROWS = 6;
  const COLS = 8;
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const r = Math.floor(i / COLS) + 1;
          const c = (i % COLS) + 1;
          const active = hover && r <= hover.r && c <= hover.c;
          return (
            <button
              key={i}
              onClick={() =>
                editor?.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run()
              }
              onMouseEnter={() => setHover({ r, c })}
              onMouseLeave={() => setHover(null)}
              className={`aspect-square rounded-[3px] ${active ? "bg-[#5a7aff]" : "bg-[#2a2a2a]"}`}
              title={`${r}×${c}`}
            />
          );
        })}
      </div>
      {hover && (
        <p className="mt-1.5 text-center text-[11px] text-[#888]">
          {hover.r}×{hover.c}
        </p>
      )}
    </div>
  );
}
