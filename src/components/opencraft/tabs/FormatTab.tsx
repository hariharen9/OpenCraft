import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  CheckSquare,
  Play,
  List,
  ListOrdered,
  Outdent,
  Indent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";

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

  if (!editor) return null;

  const inlineBtns = [
    { label: "Bold", icon: <Bold className="h-3.5 w-3.5" />, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: <Italic className="h-3.5 w-3.5" />, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Strike", icon: <Strikethrough className="h-3.5 w-3.5" />, active: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Code", icon: <Code className="h-3.5 w-3.5" />, active: editor.isActive("code"), run: () => editor.chain().focus().toggleCode().run() },
  ];

  const listBtns = [
    { label: "Tasks", icon: <CheckSquare className="h-3.5 w-3.5" />, active: editor.isActive("taskList"), run: () => editor.chain().focus().toggleTaskList().run() },
    { label: "Toggle", icon: <Play className="h-3.5 w-3.5" />, active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
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
            onClick={() =>
              editor.chain().focus().insertContent("<h2>New Page</h2><p></p>").run()
            }
            className="flex items-center justify-center gap-2 rounded-md bg-[#262626] px-3 py-3 text-[13px] text-[#cfcfcf] hover:bg-[#2c2c2c] active:scale-95"
          >
            <span className="flex h-4 w-5 items-center justify-center rounded-[3px] bg-[#3a3a3a] text-[8px]">
              📄
            </span>
            Page
          </button>
          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent("<blockquote><p>Card</p></blockquote>")
                .run()
            }
            className="flex items-center justify-center gap-2 rounded-md bg-[#262626] px-3 py-3 text-[13px] text-[#cfcfcf] hover:bg-[#2c2c2c] active:scale-95"
          >
            <span className="flex h-4 w-5 items-center justify-center rounded-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 text-[8px]">
              🃏
            </span>
            Card
          </button>
        </div>
      </Section>

      <ButtonRow buttons={inlineBtns} />
      <ButtonRow buttons={listBtns} />
      <div className="grid grid-cols-6 gap-1.5">
        {[...indentBtns, ...alignBtns].map((b: any) => (
          <ToolButton key={b.label} {...b} />
        ))}
      </div>

      <Section label="Decorations">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: "#ff8a4c33" }).run()}
            className="flex items-center justify-center gap-2 rounded-md bg-[#262626] px-3 py-2 text-[13px] text-[#cfcfcf] hover:bg-[#2c2c2c] active:scale-95"
          >
            <span className="h-3 w-[2px] bg-[#ff8a4c]" />
            Focus
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="rounded-md bg-[#262626] px-3 py-2 text-[13px] text-[#cfcfcf] hover:bg-[#2c2c2c] active:scale-95"
          >
            Block
          </button>
        </div>
      </Section>

      <Section label="Color">
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
            onClick={() => editor.chain().focus().unsetColor().run()}
            aria-label="More colors"
            className="h-7 w-7 rounded-full ring-1 ring-[#333] transition-transform active:scale-90"
            style={{
              background:
                "conic-gradient(red, orange, yellow, green, cyan, blue, magenta, red)",
            }}
          />
        </div>
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

function ButtonRow({ buttons }: { buttons: any[] }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {buttons.map((b) => (
        <ToolButton key={b.label} {...b} />
      ))}
    </div>
  );
}

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

function FontPicker() {
  const font = useEditorStore((s) => s.font);
  const setFont = useEditorStore((s) => s.setFont);
  const fontSize = useEditorStore((s) => s.fontSize);
  const setFontSize = useEditorStore((s) => s.setFontSize);
  const editor = useEditorStore((s) => s.editor);

  const fontLabel = font === "default" ? "Default" : font === "serif" ? "Serif" : "Mono";

  const cycleFont = () => {
    const next = font === "default" ? "serif" : font === "serif" ? "mono" : "default";
    setFont(next);
    const family =
      next === "serif"
        ? "Georgia, serif"
        : next === "mono"
          ? "ui-monospace, SF Mono, monospace"
          : "ui-sans-serif, system-ui, sans-serif";
    editor?.chain().focus().setFontFamily(family).run();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cycleFont}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0e3a72] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0d4187] active:scale-95"
      >
        <span className="text-[14px] italic">Aa</span>
        {fontLabel}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {(["Ss", "00", "Rr"] as const).map((s) => (
        <button
          key={s}
          onClick={() => setFontSize(s)}
          className={
            "h-8 w-8 rounded-md text-[12px] font-medium transition-colors active:scale-90 " +
            (fontSize === s
              ? "bg-[#3a3a3a] text-white"
              : "bg-[#262626] text-[#999] hover:bg-[#2c2c2c]")
          }
        >
          {s}
        </button>
      ))}
    </div>
  );
}
