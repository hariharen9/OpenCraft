import { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  CheckSquare,
  List,
  ListOrdered,
  Outdent,
  Indent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileText,
  Square,
  Code2,
  ChevronDown,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";

const TEXT_STYLES = [
  { label: "Title", level: 1 as const, cls: "text-[15px] font-bold" },
  { label: "Subtitle", level: 2 as const, cls: "text-[13px] font-semibold" },
  { label: "Heading", level: 3 as const, cls: "text-[13px] font-semibold" },
  { label: "Strong", mark: "bold" as const, cls: "text-[13px] font-bold" },
  { label: "Body", para: true, cls: "text-[13px]" },
  { label: "Caption", caption: true, cls: "text-[11px] text-[#999]" },
];

const COLORS = [
  "#9a9a9a", "#5b5b5b", "#cfcfcf", "#7a78ff", "#3b82f6", "#22d3ee",
  "#22c55e", "#a855f7", "#ef4444", "#f59e0b", "#a16207",
];

export function FormatTab() {
  const editor = useEditorStore((s) => s.editor);
  useEditorStore((s) => s.tick);
  const setTextColor = useEditorStore((s) => s.setTextColor);
  const accentColor = useEditorStore((s) => s.accentColor);

  if (!editor) return null;

  const inlineBtns = [
    { label: "Bold", icon: <Bold className="h-3.5 w-3.5" />, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: <Italic className="h-3.5 w-3.5" />, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Strike", icon: <Strikethrough className="h-3.5 w-3.5" />, active: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Code", icon: <Code className="h-3.5 w-3.5" />, active: editor.isActive("code"), run: () => editor.chain().focus().toggleCode().run() },
  ];

  const listBtns = [
    { label: "Tasks", icon: <CheckSquare className="h-3.5 w-3.5" />, active: editor.isActive("taskList"), run: () => editor.chain().focus().toggleTaskList().run() },
    { label: "Bullet", icon: <List className="h-3.5 w-3.5" />, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Ordered", icon: <ListOrdered className="h-3.5 w-3.5" />, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
  ];

  const indentBtns = [
    { label: "Outdent", icon: <Outdent className="h-3.5 w-3.5" />, run: () => editor.chain().focus().liftListItem("listItem").run() },
    { label: "Indent", icon: <Indent className="h-3.5 w-3.5" />, run: () => editor.chain().focus().sinkListItem("listItem").run() },
  ];

  const alignBtns = [
    { label: "Left", icon: <AlignLeft className="h-3.5 w-3.5" />, active: editor.isActive({ textAlign: "left" }), run: () => editor.chain().focus().setTextAlign("left").run() },
    { label: "Center", icon: <AlignCenter className="h-3.5 w-3.5" />, active: editor.isActive({ textAlign: "center" }), run: () => editor.chain().focus().setTextAlign("center").run() },
    { label: "Right", icon: <AlignRight className="h-3.5 w-3.5" />, active: editor.isActive({ textAlign: "right" }), run: () => editor.chain().focus().setTextAlign("right").run() },
    { label: "Justify", icon: <AlignJustify className="h-3.5 w-3.5" />, active: editor.isActive({ textAlign: "justify" }), run: () => editor.chain().focus().setTextAlign("justify").run() },
  ];

  const applyTextStyle = (s: (typeof TEXT_STYLES)[number]) => {
    if ("level" in s && s.level)
      editor.chain().focus().toggleHeading({ level: s.level }).run();
    else if ("mark" in s && s.mark === "bold") editor.chain().focus().toggleBold().run();
    else editor.chain().focus().setParagraph().run();
  };
  const isStyleActive = (s: (typeof TEXT_STYLES)[number]) => {
    if ("level" in s && s.level) return editor.isActive("heading", { level: s.level });
    if ("mark" in s && s.mark === "bold") return editor.isActive("bold");
    if ("caption" in s) return false;
    return editor.isActive("paragraph") && !editor.isActive("heading");
  };

  return (
    <div className="space-y-6">
      <Section label="Text">
        <div className="grid grid-cols-3 gap-2">
          {TEXT_STYLES.map((s) => (
            <button
              key={s.label}
              onClick={() => applyTextStyle(s)}
              className={
                "rounded-md px-3 py-2.5 text-center transition-colors active:scale-95 " +
                (isStyleActive(s)
                  ? "bg-[#2f2f2f] text-white"
                  : "bg-[#262626] text-[#bcbcbc] hover:bg-[#2c2c2c]") +
                " " +
                s.cls
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Groups">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const { schema } = editor.state;
              const p = schema.nodes.paragraph.create();
              const sub = schema.nodes.subpage.createAndFill({}, p);
              if (sub) editor.commands.insertContentAt(editor.state.selection.from, sub);
            }}
            className="flex items-center justify-center gap-2 rounded-md bg-[#262626] px-3 py-3 text-[13px] text-[#cfcfcf] hover:bg-[#2c2c2c] active:scale-95"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-[3px] bg-[#3a3a3a]">
              <FileText className="h-3 w-3" />
            </span>
            Page
          </button>
          <button
            onClick={() => {
              const { schema } = editor.state;
              const card = schema.nodes.card.createAndFill({}, schema.nodes.paragraph.create());
              if (card) editor.commands.insertContentAt(editor.state.selection.from, card);
            }}
            className="flex items-center justify-center gap-2 rounded-md bg-[#262626] px-3 py-3 text-[13px] text-[#cfcfcf] hover:bg-[#2c2c2c] active:scale-95"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-[3px] bg-[#3a3a3a]">
              <Square className="h-3 w-3" />
            </span>
            Card
          </button>
        </div>
      </Section>

      <ButtonRow buttons={inlineBtns} cols={4} />
      <ButtonRow buttons={listBtns} cols={3} />
      <div className="grid grid-cols-6 gap-1.5">
        {[...indentBtns, ...alignBtns].map((b: any) => (
          <ToolButton key={b.label} {...b} />
        ))}
      </div>

      <Section label="Decorations">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="flex items-center justify-center gap-2 rounded-md bg-[#262626] px-3 py-2 text-[13px] text-[#cfcfcf] hover:bg-[#2c2c2c] active:scale-95"
          >
            <span className="h-4 w-[3px] rounded-sm" style={{ backgroundColor: accentColor }} />
            Focus
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={"flex items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors active:scale-95 " + (editor.isActive("codeBlock") ? "bg-[#3a3a3a] text-white" : "bg-[#262626] text-[#cfcfcf] hover:bg-[#2c2c2c]")}
          >
            <Code2 className="h-3.5 w-3.5" />
            Code
          </button>
        </div>
        {editor.isActive("codeBlock") && <LanguageDropdown editor={editor} />}
      </Section>

      <Section label="Color">
        <ColorContent editor={editor} setTextColor={setTextColor} />
      </Section>

      <Section label="Font">
        <FontPicker />
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[12px] font-semibold text-[#e0e0e0]">{label}</div>
      {children}
    </div>
  );
}

function ButtonRow({ buttons, cols = 4 }: { buttons: ToolBtn[]; cols?: number }) {
  const gridClass = cols === 3 ? "grid-cols-3" : "grid-cols-4";
  return (
    <div className={`grid ${gridClass} gap-1.5`}>
      {buttons.map((b) => (
        <ToolButton key={b.label} icon={b.icon} label={b.label} active={b.active} run={b.run} />
      ))}
    </div>
  );
}

type ToolBtn = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  run: () => void;
};

function ToolButton({
  icon,
  label,
  active,
  run,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  run: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={run}
      className={
        "flex h-9 items-center justify-center rounded-md transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#444] " +
        (active
          ? "bg-[#3a3a3a] text-white"
          : "bg-[#262626] text-[#bcbcbc] hover:bg-[#2c2c2c]")
      }
    >
      {icon}
    </button>
  );
}

function ColorContent({ editor, setTextColor }: { editor: any; setTextColor: (c: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-6 gap-2">
      {COLORS.map((c) => (
        <button
          key={c}
          onClick={() => {
            setTextColor(c);
            editor.chain().focus().setColor(c).run();
          }}
          aria-label={`Color ${c}`}
          className="h-7 w-7 rounded-full ring-1 ring-[#333] transition-transform active:scale-90 hover:scale-110"
          style={{ backgroundColor: c }}
        />
      ))}
      <button
        onClick={() => inputRef.current?.click()}
        aria-label="Custom color"
        className="relative h-7 w-7 rounded-full ring-1 ring-[#333] transition-transform active:scale-90 hover:scale-110"
        style={{
          background: "conic-gradient(red, orange, yellow, green, cyan, blue, magenta, red)",
        }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">+</span>
      </button>
      <input ref={inputRef} type="color" className="sr-only" onChange={(e) => { setTextColor(e.target.value); editor.chain().focus().setColor(e.target.value).run(); }} />
    </div>
  );
}

const FONTS = [
  { id: "default" as const, label: "Default", fam: "ui-sans-serif, system-ui, sans-serif", cls: "font-sans" },
  { id: "serif" as const, label: "Serif", fam: "'Cormorant Garamond', serif", cls: "font-serif" },
  { id: "mono" as const, label: "Mono", fam: "ui-monospace, SF Mono, monospace", cls: "font-mono" },
];

const SIZE_LABELS: Record<string, string> = { Ss: "M", "00": "S", Rr: "L" };

function FontPicker() {
  const font = useEditorStore((s) => s.font);
  const setFont = useEditorStore((s) => s.setFont);
  const fontSize = useEditorStore((s) => s.fontSize);
  const setFontSize = useEditorStore((s) => s.setFontSize);
  const editor = useEditorStore((s) => s.editor);
  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const updateDocMeta = useWorkspaceStore((s) => s.updateDocMeta);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {FONTS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFont(f.id);
              if (activeDocId) updateDocMeta(activeDocId, { font: f.id } as any);
              editor?.chain().focus().setFontFamily(f.fam).run();
            }}
            className={
              "rounded-md px-2 py-2 text-center transition-colors active:scale-95 " +
              (font === f.id
                ? "bg-[#0e3a72] text-white"
                : "bg-[#262626] text-[#bcbcbc] hover:bg-[#2c2c2c]") +
              " " + f.cls
            }
          >
            <div className="text-[16px]">Aa</div>
            <div className="mt-0.5 text-[10px] font-normal">{f.label}</div>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-6 text-[11px] text-[#777]">Size</span>
        <div className="flex flex-1 gap-1">
          {(["Ss", "00", "Rr"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFontSize(s);
                if (activeDocId) updateDocMeta(activeDocId, { fontSize: s } as any);
              }}
              className={
                "flex-1 rounded-md py-1 text-[11px] font-medium transition-colors active:scale-90 " +
                (fontSize === s
                  ? "bg-[#3a3a3a] text-white"
                  : "bg-[#262626] text-[#999] hover:bg-[#2c2c2c]")
              }
            >
              {SIZE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const LANGUAGES = [
  { id: "plaintext", label: "Plain Text", badge: "Tx", color: "#888" },
  { id: "javascript", label: "JavaScript", badge: "JS", color: "#f7df1e" },
  { id: "typescript", label: "TypeScript", badge: "TS", color: "#3178c6" },
  { id: "python", label: "Python", badge: "Py", color: "#3776ab" },
  { id: "html", label: "HTML", badge: "HT", color: "#e34f26" },
  { id: "css", label: "CSS", badge: "CS", color: "#1572b6" },
  { id: "json", label: "JSON", badge: "JS", color: "#5a5a5a" },
  { id: "bash", label: "Bash", badge: "Ba", color: "#4eaa25" },
  { id: "sql", label: "SQL", badge: "SQ", color: "#e38c00" },
  { id: "markdown", label: "Markdown", badge: "MD", color: "#083fa1" },
  { id: "rust", label: "Rust", badge: "Rs", color: "#dea584" },
  { id: "go", label: "Go", badge: "Go", color: "#00add8" },
];

function LanguageDropdown({ editor }: { editor: any }) {
  const [open, setOpen] = useState(false);
  const current = editor.getAttributes("codeBlock").language || "plaintext";
  const cur = LANGUAGES.find((l) => l.id === current) ?? LANGUAGES[0];

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md bg-[#262626] px-3 py-2 text-[12px] text-[#bcbcbc] transition-colors hover:bg-[#2c2c2c] active:scale-[0.99]"
      >
        <span className="flex items-center gap-2">
          <span
            className="flex h-4 w-5 items-center justify-center rounded-[3px] text-[9px] font-bold"
            style={{ backgroundColor: cur.color + "33", color: cur.color }}
          >
            {cur.badge}
          </span>
          {cur.label}
        </span>
        <ChevronDown className={"h-3 w-3 transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-[#333] bg-[#1c1c1c] py-1 shadow-lg">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  editor.chain().focus().updateAttributes("codeBlock", { language: lang.id }).run();
                  setOpen(false);
                }}
                className={
                  "flex w-full items-center gap-2 px-3 py-1.5 text-[12px] transition-colors hover:bg-[#2a2a2a] " +
                  (current === lang.id ? "text-white" : "text-[#bcbcbc]")
                }
              >
                <span
                  className="flex h-4 w-5 items-center justify-center rounded-[3px] text-[9px] font-bold"
                  style={{ backgroundColor: lang.color + "33", color: lang.color }}
                >
                  {lang.badge}
                </span>
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
