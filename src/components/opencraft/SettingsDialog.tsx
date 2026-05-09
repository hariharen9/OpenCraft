import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Link2, Unlink2 } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useSettingsStore } from "@/store/settings-store";

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

  const syncCalendarTasks = useSettingsStore((s) => s.syncCalendarTasks);
  const setSyncCalendarTasks = useSettingsStore((s) => s.setSyncCalendarTasks);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    if (open) loadSettings();
  }, [open, loadSettings]);

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

          <div className="space-y-6">
            {/* Accent color */}
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

            {/* Calendar-Tasks sync */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#ccc]">Integrations</label>
              <button
                onClick={() => setSyncCalendarTasks(!syncCalendarTasks)}
                className="flex w-full items-center gap-3 rounded-lg bg-[#262626] px-4 py-3 ring-1 ring-[#333] transition-colors hover:bg-[#2c2c2c]"
              >
                <div className={"flex h-8 w-8 items-center justify-center rounded-lg " + (syncCalendarTasks ? "bg-[#ff8a4c]/15 text-[#ff8a4c]" : "bg-[#333] text-[#666]")}>
                  {syncCalendarTasks ? <Link2 className="h-4 w-4" /> : <Unlink2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[13px] font-medium text-[#e0e0e0]">
                    Calendar ↔ Tasks sync
                  </div>
                  <div className="text-[11px] text-[#777]">
                    {syncCalendarTasks
                      ? "Tasks with due dates appear on the calendar"
                      : "Calendar and tasks are independent"}
                  </div>
                </div>
                <div
                  className={"h-5 w-9 rounded-full p-0.5 transition-colors " + (syncCalendarTasks ? "bg-[#ff8a4c]" : "bg-[#444]")}
                >
                  <div
                    className={"h-4 w-4 rounded-full bg-white transition-transform " + (syncCalendarTasks ? "translate-x-4" : "translate-x-0")}
                  />
                </div>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
