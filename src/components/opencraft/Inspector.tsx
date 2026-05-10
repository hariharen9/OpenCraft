import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, Bell, HelpCircle, Info, Keyboard, Zap, Sparkles, Cloud, Search } from "lucide-react";
import { InsertTab } from "./tabs/InsertTab";
import { FormatTab } from "./tabs/FormatTab";
import { StyleTab } from "./tabs/StyleTab";
import { InfoTab } from "./tabs/InfoTab";
import { useAuthStore } from "@/store/auth-store";
import { useEditorStore } from "@/store/editor-store";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TABS = ["Insert", "Format", "Style", "Info"] as const;
type Tab = (typeof TABS)[number];

export function Inspector() {
  const [tab, setTab] = useState<Tab>("Insert");
  const { user } = useAuthStore();
  const [helpOpen, setHelpOpen] = useState(false);
  const setCommandPaletteOpen = useEditorStore((s) => s.setCommandPaletteOpen);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 300, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="flex h-full shrink-0 flex-col bg-transparent overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex h-[44px] shrink-0 items-center justify-end gap-1 px-3">
        <div className="flex flex-col items-end mr-2.5 select-none opacity-80">
          <span className="text-[11px] font-bold text-white leading-none mb-0.5 tabular-nums">
            {format(now, "h:mm:ss a")}
          </span>
          <span className="text-[9px] text-[#666] leading-none uppercase tracking-wider font-medium">
            {format(now, "EEE, MMM d")}
          </span>
        </div>
        <button
          aria-label="Profile"
          className="h-7 w-7 rounded-full bg-[#333] text-[11px] font-semibold text-white overflow-hidden flex items-center justify-center border border-[#444]"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
          ) : (
            <span>{(user?.displayName || user?.email || "O")[0].toUpperCase()}</span>
          )}
        </button>
        {/* Commented out for now
        <button className="flex items-center gap-1.5 rounded-full bg-[#2a2a2a] px-2.5 py-1 text-[12px] text-[#ddd] hover:bg-[#333] active:scale-95">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
        <IconBtn label="Notifications">
          <Bell className="h-4 w-4" />
        </IconBtn>
        */}
        <div className="group relative flex items-center">
          <IconBtn label="Search" onClick={() => setCommandPaletteOpen(true)}>
            <Search className="h-4 w-4" />
          </IconBtn>
          <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#333] px-2 py-1 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            Search <span className="ml-1 text-[#888]">⌘K</span>
          </div>
        </div>
        <IconBtn label="Help" onClick={() => setHelpOpen(true)}>
          <HelpCircle className="h-4 w-4" />
        </IconBtn>
      </div>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="border-[#333] bg-[#1a1a1a] text-[#e0e0e0] sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ff8a4c]" />
              Welcome to OpenCraft
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            <div className="text-[14px] leading-relaxed text-[#aaa]">
              OpenCraft is a focused, local-first markdown writing space designed for speed and
              clarity. Your documents stay on your device, with optional secure cloud sync via
              Firebase.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HelpItem
                icon={<Zap className="h-4 w-4 text-amber-400" />}
                title="Lightning Fast"
                desc="Instant loading and smooth animations."
              />
              <HelpItem
                icon={<Info className="h-4 w-4 text-blue-400" />}
                title="Markdown First"
                desc="Full support for GFM and custom blocks."
              />
              <HelpItem
                icon={<Keyboard className="h-4 w-4 text-emerald-400" />}
                title="Shortcuts"
                desc="Heavy focus on keyboard-driven workflows."
              />
              <HelpItem
                icon={(<Cloud className="h-4 w-4 text-[#ff8a4c]" />) as any}
                title="Cloud Sync"
                desc="Seamless sync across all your devices."
              />
            </div>

            <div className="rounded-lg bg-[#222] p-4 border border-[#333]">
              <h4 className="text-[13px] font-semibold text-white mb-2">Editor Blocks</h4>
              <p className="text-[12px] text-[#888]">
                Press <code className="bg-[#333] px-1 rounded text-[#ccc]">/</code> or use the{" "}
                <strong className="text-[#eee]">Insert</strong> tab to add complex blocks like{" "}
                <strong className="text-[#eee]">Kanban boards</strong>,{" "}
                <strong className="text-[#eee]">Gallery grids</strong>,{" "}
                <strong className="text-[#eee]">TeX formulas</strong>, and{" "}
                <strong className="text-[#eee]">Mermaid diagrams</strong>.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setHelpOpen(false)}
                className="rounded-md bg-white px-6 py-2 text-[13px] font-bold text-black hover:bg-[#eee] transition-colors"
              >
                Start Crafting
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <div className="relative mx-5 mt-4 mb-3 flex shrink-0 gap-1 rounded-lg bg-[#1a1a1a] p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative z-10 flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none"
            style={{ color: tab === t ? "#e8e8e8" : "#666" }}
          >
            {t === tab && (
              <motion.div
                layoutId="tab-pill"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 z-[-1] rounded-md bg-[#2a2a2a] shadow-sm"
              />
            )}
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="px-5 pb-10"
          >
            {tab === "Insert" && <InsertTab />}
            {tab === "Format" && <FormatTab />}
            {tab === "Style" && <StyleTab />}
            {tab === "Info" && <InfoTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.aside>
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

function HelpItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-[#222] p-3 border border-transparent hover:border-[#333] transition-colors">
      <div className="flex items-center gap-2 text-white text-[13px] font-semibold">
        {icon}
        {title}
      </div>
      <div className="text-[11px] text-[#777] leading-relaxed">{desc}</div>
    </div>
  );
}
