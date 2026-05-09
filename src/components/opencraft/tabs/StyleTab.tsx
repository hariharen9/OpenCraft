import { Plus, Minus, Squircle, Waves } from "lucide-react";
import { useEditorStore, type SeparatorStyle } from "@/store/editor-store";

const PAGE_BGS = [
  "#1c1c1c",
  "#0e0e0e",
  "#1a1f2c",
  "#1f1a1a",
  "#161d1a",
  "#201a24",
];
const TEXT_COLORS = ["#e0e0e0", "#ffffff", "#9a9a9a", "#ff8a4c", "#4cc2ff", "#a78bfa"];

export function StyleTab() {
  const pageBg = useEditorStore((s) => s.pageBg);
  const setPageBg = useEditorStore((s) => s.setPageBg);
  const textColor = useEditorStore((s) => s.textColor);
  const setTextColor = useEditorStore((s) => s.setTextColor);
  const editor = useEditorStore((s) => s.editor);
  const widePage = useEditorStore((s) => s.widePage);
  const setWidePage = useEditorStore((s) => s.setWidePage);
  const coverImage = useEditorStore((s) => s.coverImage);
  const setCoverImage = useEditorStore((s) => s.setCoverImage);
  const separator = useEditorStore((s) => s.separator);
  const setSeparator = useEditorStore((s) => s.setSeparator);

  return (
    <div className="space-y-6">
      {/* Preview card */}
      <div className="flex flex-col items-center pt-2">
        <div
          className="relative flex h-[170px] w-[120px] items-start justify-end rounded-md p-2 shadow-md"
          style={{ backgroundColor: pageBg }}
        >
          <div className="flex flex-col gap-1 pt-1">
            <div className="h-1 w-12 rounded-full bg-[#444]" />
            <div className="h-1 w-10 rounded-full bg-[#444]" />
            <div className="h-1 w-14 rounded-full bg-[#444]" />
          </div>
          <span className="absolute right-2 top-1.5 text-[9px] text-[#888]">
            Original
          </span>
        </div>
        <button className="mt-3 flex items-center gap-1.5 rounded-md bg-[#262626] px-3 py-1.5 text-[12px] text-[#cfcfcf] hover:bg-[#2c2c2c] active:scale-95">
          <span className="grid h-3 w-3 grid-cols-2 gap-[1px]">
            <span className="rounded-full bg-current" />
            <span className="rounded-full bg-current" />
            <span className="rounded-full bg-current" />
            <span className="rounded-full bg-current" />
          </span>
          All Styles
        </button>
      </div>

      <Section label="Color">
        <Row label="Backdrop">
          <button className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2a2a2a] text-[#888] hover:bg-[#333] active:scale-90">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </Row>
        <Row label="Document Color">
          <SwatchPopover
            colors={PAGE_BGS}
            value={pageBg}
            onChange={setPageBg}
          />
        </Row>
        <Row label="Text Color">
          <SwatchPopover
            colors={TEXT_COLORS}
            value={textColor}
            onChange={(c) => {
              setTextColor(c);
              editor?.chain().focus().setColor(c).run();
            }}
          />
        </Row>
      </Section>

      <Section label="Cover">
        <Row label="Cover Image">
          {coverImage ? (
            <button
              onClick={() => setCoverImage(null)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2a2a2a] text-[#888] hover:bg-[#333] active:scale-90"
              aria-label="Remove cover"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                const url = window.prompt("Cover image URL");
                if (url) setCoverImage(url);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2a2a2a] text-[#888] hover:bg-[#333] active:scale-90"
              aria-label="Add cover"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </Row>
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
              onClick={() => setSeparator(s.id)}
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
        <FontShortcut />
      </Section>

      <Section label="Advanced">
        <Row label="Wide Page">
          <button
            role="switch"
            aria-checked={widePage}
            onClick={() => setWidePage(!widePage)}
            className={
              "relative h-5 w-9 rounded-full transition-colors " +
              (widePage ? "bg-[#0e3a72]" : "bg-[#3a3a3a]")
            }
          >
            <span
              className={
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform " +
                (widePage ? "translate-x-[18px]" : "translate-x-0.5")
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

function SwatchPopover({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="group relative">
      <button
        className="h-6 w-6 overflow-hidden rounded-md ring-1 ring-[#444]"
        style={{
          background: `linear-gradient(135deg, ${value} 50%, #fff 50%)`,
        }}
      />
      <div className="invisible absolute right-0 top-7 z-10 grid grid-cols-6 gap-1 rounded-md bg-[#262626] p-2 opacity-0 shadow-lg ring-1 ring-[#333] transition-opacity group-hover:visible group-hover:opacity-100">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="h-5 w-5 rounded-sm ring-1 ring-[#444]"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

function FontShortcut() {
  const font = useEditorStore((s) => s.font);
  const setFont = useEditorStore((s) => s.setFont);
  const fontSize = useEditorStore((s) => s.fontSize);
  const setFontSize = useEditorStore((s) => s.setFontSize);
  const cycle = () =>
    setFont(font === "default" ? "serif" : font === "serif" ? "mono" : "default");
  const label = font === "default" ? "Default" : font === "serif" ? "Serif" : "Mono";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cycle}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0e3a72] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0d4187] active:scale-95"
      >
        <span className="text-[14px] italic">Aa</span>
        {label}
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
