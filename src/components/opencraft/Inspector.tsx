import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      {/* spacer for top toolbar */}
      <div className="h-[44px] shrink-0" />

      {/* Tabs */}
      <div className="flex shrink-0 items-center gap-5 px-5 pb-3 text-[13px]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "transition-colors active:scale-95 focus:outline-none " +
              (tab === t
                ? "font-semibold text-[#e8e8e8]"
                : "text-[#666] hover:text-[#aaa]")
            }
          >
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
