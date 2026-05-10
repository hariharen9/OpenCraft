import { useState, useRef } from "react";
import { Plus, Minus, Squircle, Waves, Trash2, Palette } from "lucide-react";
import { useEditorStore, type SeparatorStyle } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";

const BACKDROP_SOLIDS = [
  "#1c1c1c", "#0e0e0e", "#1a1f2c", "#1f1a1a",
  "#161d1a", "#201a24", "#2d1b1b", "#1b2d2d",
  "#2a2a2a", "#3a3a3a",
];

const BACKDROP_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(180deg, #0f0c29, #302b63, #24243e)",
  "linear-gradient(180deg, #1a1a2e, #16213e, #0f3460)",
];

const TEXT_COLORS = ["#e0e0e0", "#ffffff", "#9a9a9a", "#ff8a4c", "#4cc2ff", "#a78bfa", "#22c55e", "#ef4444"];

function isGradient(v: string) { return v.startsWith("linear-gradient") || v.startsWith("radial-gradient"); }

export function StyleTab() {
  const editor = useEditorStore((s) => s.editor);
  const textColor = useEditorStore((s) => s.textColor);
  const setTextColor = useEditorStore((s) => s.setTextColor);

  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const docs = useWorkspaceStore((s) => s.docs);
  const updateDocMeta = useWorkspaceStore((s) => s.updateDocMeta);

  const doc = docs.find((d) => d.id === activeDocId) ?? null;

  const pageBg = doc?.pageBg ?? "#1f1f1f";
  const widePage = doc?.widePage ?? false;
  const separator = (doc?.separator ?? "line") as SeparatorStyle;
  const font = doc?.font ?? "default";
  const fontSize = doc?.fontSize ?? "Ss";

  const setDocStyle = (updates: Record<string, unknown>) => {
    if (activeDocId) updateDocMeta(activeDocId, updates as any);
  };

  const [tab, setTab] = useState<"solid" | "gradient">("solid");

  return (
    <div className="space-y-6">
      {/* Preview card */}
      <div className="flex flex-col items-center pt-2">
        <div
          className="relative flex h-[170px] w-[120px] items-start justify-end overflow-hidden rounded-md p-2 shadow-md"
          style={{ background: pageBg }}
        >
          <div className="flex flex-col gap-1 pt-1">
            <div className="h-1 w-12 rounded-full bg-[#444]" />
            <div className="h-1 w-10 rounded-full bg-[#444]" />
            <div className="h-1 w-14 rounded-full bg-[#444]" />
          </div>
          <span className="absolute right-2 top-1.5 text-[9px] text-[#888]">Style</span>
        </div>
      </div>

      {/* Background */}
      <Section label="Background">
        <div className="space-y-2 pt-1">
          {/* Tab toggle */}
          <div className="flex gap-1 rounded-md bg-[#262626] p-0.5 text-[11px]">
            <button
              onClick={() => setTab("solid")}
              className={"flex-1 rounded px-2 py-1 transition-colors " + (tab === "solid" ? "bg-[#1a1a1a] text-white" : "text-[#888]")}
            >
              Solid
            </button>
            <button
              onClick={() => setTab("gradient")}
              className={"flex-1 rounded px-2 py-1 transition-colors " + (tab === "gradient" ? "bg-[#1a1a1a] text-white" : "text-[#888]")}
            >
              Gradient
            </button>
          </div>

          {/* Solid colors */}
          {tab === "solid" && (
            <div className="grid grid-cols-5 gap-2">
              {BACKDROP_SOLIDS.map((c) => (
                <button
                  key={c}
                  onClick={() => setDocStyle({ pageBg: c })}
                  className={"h-8 w-full rounded-md ring-1 transition-all active:scale-90 " + (pageBg === c ? "ring-2 ring-white scale-110" : "ring-[#555]")}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <ColorPickerButton
                value={pageBg}
                onChange={(c) => setDocStyle({ pageBg: c })}
              />
            </div>
          )}

          {/* Gradients */}
          {tab === "gradient" && (
            <div className="grid grid-cols-2 gap-2">
              {BACKDROP_GRADIENTS.map((g) => (
                <button
                  key={g}
                  onClick={() => setDocStyle({ pageBg: g })}
                  className={"h-10 w-full rounded-md ring-1 transition-all active:scale-95 " + (pageBg === g ? "ring-2 ring-white" : "ring-[#555]")}
                  style={{ background: g }}
                  title={g}
                />
              ))}
            </div>
          )}

          {isGradient(pageBg) && (
            <button
              onClick={() => setDocStyle({ pageBg: "#1c1c1c" })}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#262626] py-1.5 text-[11px] text-[#888] hover:bg-[#2c2c2c] active:scale-95"
            >
              <Trash2 className="h-3 w-3" /> Reset to solid
            </button>
          )}
        </div>
      </Section>

      <Section label="Text Color">
        <div className="grid grid-cols-4 gap-2 pt-1">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setTextColor(c);
                if (editor) {
                  const sel = editor.state.selection;
                  editor
                    .chain()
                    .selectAll()
                    .setColor(c)
                    .setTextSelection(sel.from)
                    .run();
                }
              }}
              className={"h-7 w-full rounded-md ring-1 transition-all active:scale-90 " + (textColor === c ? "ring-2 ring-white scale-110" : "ring-[#555]")}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </Section>

      <Section label="Separator Style">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "line", icon: <Minus className="h-4 w-4" />, label: "Line" },
              { id: "dots", icon: <Squircle className="h-3.5 w-3.5" />, label: "Dots" },
              { id: "squiggle", icon: <Waves className="h-3.5 w-3.5" />, label: "Wave" },
            ] as { id: SeparatorStyle; icon: React.ReactNode; label: string }[]
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setDocStyle({ separator: s.id })}
              className={
                "flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] transition-colors active:scale-95 " +
                (separator === s.id
                  ? "bg-[#0e3a72] text-white"
                  : "bg-[#262626] text-[#bcbcbc] hover:bg-[#2c2c2c]")
              }
            >
              {s.icon}
              {separator === s.id && s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Font">
        <FontShortcut
          font={font}
          fontSize={fontSize}
          onFontChange={(f) => setDocStyle({ font: f })}
          onSizeChange={(s) => setDocStyle({ fontSize: s })}
        />
      </Section>

      <Section label="Advanced">
        <Row label="Wide Page">
          <button
            role="switch"
            aria-checked={widePage}
            onClick={() => setDocStyle({ widePage: !widePage })}
            className={
              "relative h-5 w-9 shrink-0 rounded-full transition-colors " +
              (widePage ? "bg-[#0e3a72]" : "bg-[#3a3a3a]")
            }
          >
            <span
              className={
                "absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-all " +
                (widePage ? "translate-x-4" : "translate-x-0")
              }
            />
          </button>
        </Row>
      </Section>

    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#777]">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md px-1 py-1.5 text-[13px] text-[#d0d0d0]">
      <span>{label}</span>
      {children}
    </div>
  );
}

function ColorPickerButton({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="flex h-8 items-center justify-center rounded-md bg-[#262626] ring-1 ring-[#555] transition-all hover:bg-[#2c2c2c] active:scale-90"
        title="Custom color"
      >
        <Palette className="h-3.5 w-3.5 text-[#888]" />
      </button>
      <input
        ref={inputRef}
        type="color"
        value={value.startsWith("#") ? value : "#1c1c1c"}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </>
  );
}

const SIZE_LABELS: Record<string, string> = { Ss: "M", "00": "S", Rr: "L" };

const FONTS = [
  { id: "default" as const, label: "Default", fam: "ui-sans-serif, system-ui, sans-serif", cls: "font-sans" },
  { id: "serif" as const, label: "Serif", fam: "'Cormorant Garamond', serif", cls: "font-serif" },
  { id: "mono" as const, label: "Mono", fam: "ui-monospace, SF Mono, monospace", cls: "font-mono" },
];

function FontShortcut({
  font,
  fontSize,
  onFontChange,
  onSizeChange,
}: {
  font: string;
  fontSize: string;
  onFontChange: (f: "default" | "serif" | "mono") => void;
  onSizeChange: (s: "Ss" | "00" | "Rr") => void;
}) {
  const editor = useEditorStore((s) => s.editor);
  const setFont = useEditorStore((s) => s.setFont);
  const setFontSize = useEditorStore((s) => s.setFontSize);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {FONTS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              onFontChange(f.id);
              setFont(f.id);
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
                onSizeChange(s);
                setFontSize(s);
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
