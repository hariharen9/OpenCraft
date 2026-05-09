import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, Bell, HelpCircle } from "lucide-react";
import { InsertTab } from "./tabs/InsertTab";
import { FormatTab } from "./tabs/FormatTab";
import { StyleTab } from "./tabs/StyleTab";
import { InfoTab } from "./tabs/InfoTab";

const TABS = ["Insert", "Format", "Style", "Info"] as const;
type Tab = (typeof TABS)[number];

export function Inspector() {
  const [tab, setTab] = useState<Tab>("Insert");


  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col bg-transparent">
      {/* Top bar */}
      <div className="flex h-[44px] shrink-0 items-center justify-end gap-1 px-3">
        <button
          aria-label="Profile"
          className="h-7 w-7 rounded-full bg-gradient-to-br from-[#ff8a4c] to-[#ff5470] text-[11px] font-semibold text-white"
        >
          O
        </button>
        <button className="flex items-center gap-1.5 rounded-full bg-[#2a2a2a] px-2.5 py-1 text-[12px] text-[#ddd] hover:bg-[#333] active:scale-95">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
        <IconBtn label="Notifications">
          <Bell className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Help">
          <HelpCircle className="h-4 w-4" />
        </IconBtn>
      </div>

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
    </aside>
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
