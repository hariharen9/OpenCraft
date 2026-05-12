import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CheckCircle2,
  Calendar,
  Plus,
  PenSquare,
  Menu,
  Search,
} from "lucide-react";
import { useEditorStore, type ActiveView } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";

interface MobileNavProps {
  onOpenSidebar: () => void;
}

export function MobileNav({ onOpenSidebar }: MobileNavProps) {
  const activeView = useEditorStore((s) => s.activeView);
  const setActiveView = useEditorStore((s) => s.setActiveView);
  const accent = useEditorStore((s) => s.accentColor);
  const setCommandPaletteOpen = useEditorStore((s) => s.setCommandPaletteOpen);
  const createDoc = useWorkspaceStore((s) => s.createDoc);
  const setActiveDoc = useWorkspaceStore((s) => s.setActiveDoc);

  const handleNewDoc = () => {
    const docId = createDoc();
    setActiveDoc(docId);
    setActiveView("editor");
  };

  const navItems: { view: ActiveView; icon: React.ReactNode; label: string }[] = [
    { view: "home", icon: <Home className="h-[18px] w-[18px]" />, label: "Home" },
    { view: "tasks", icon: <CheckCircle2 className="h-[18px] w-[18px]" />, label: "Tasks" },
    { view: "calendar", icon: <Calendar className="h-[18px] w-[18px]" />, label: "Calendar" },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 8px), 10px)" }}
    >
      <div className="mx-4 mb-1 flex w-full max-w-[420px] items-center justify-between">
        {/* Left pill — navigation */}
        <div className="flex items-center gap-0.5 rounded-full bg-[#1f1f1f]/90 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.08] backdrop-blur-2xl">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-90"
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${accent}20` }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span
                  className="relative z-10 transition-colors"
                  style={{ color: isActive ? accent : "#888" }}
                >
                  {item.icon}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right pill — actions */}
        <div className="flex items-center gap-1 rounded-full bg-[#1f1f1f]/90 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.08] backdrop-blur-2xl">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#888] transition-all active:scale-90 hover:text-white"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={handleNewDoc}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-all active:scale-90"
            style={{ backgroundColor: accent }}
            aria-label="New Document"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
