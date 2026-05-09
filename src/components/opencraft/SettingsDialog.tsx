import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";

const PRESETS = [
  "#ff8a4c",
  "#4cc2ff",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#fbbf24",
  "#ef4444",
  "#22c55e",
];

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const storeAccent = useEditorStore((s) => s.accentColor);
  const setAccentColor = useEditorStore((s) => s.setAccentColor);
  const [custom, setCustom] = useState(storeAccent);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#1f1f1f] p-6 shadow-2xl ring-1 ring-[#333]">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-[15px] font-semibold text-[#e8e8e8]">Settings</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#e0e0e0]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#ccc]">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setAccentColor(c); setCustom(c); }}
                    className="h-8 w-8 rounded-full transition-all active:scale-90"
                    style={{
                      backgroundColor: c,
                      outline: storeAccent === c ? "2px solid #fff" : "2px solid transparent",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={custom}
                  onChange={(e) => { setCustom(e.target.value); setAccentColor(e.target.value); }}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onBlur={() => setAccentColor(custom)}
                  onKeyDown={(e) => { if (e.key === "Enter") setAccentColor(custom); }}
                  placeholder="#hex"
                  className="flex-1 rounded-md bg-[#262626] px-2.5 py-1.5 text-[13px] text-[#e0e0e0] outline-none ring-1 ring-[#333] transition-all focus:ring-[#555] placeholder:text-[#555]"
                />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
