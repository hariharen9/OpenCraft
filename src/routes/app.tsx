import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/opencraft/Sidebar";
import { HomeView } from "@/components/opencraft/HomeView";
import { EditorPane } from "@/components/opencraft/EditorPane";
import { TasksView } from "@/components/opencraft/TasksView";
import { CalendarView } from "@/components/opencraft/CalendarView";
import { Inspector } from "@/components/opencraft/Inspector";
import { useEditorStore } from "@/store/editor-store";

export const Route = createFileRoute("/app")({
  component: OpenCraft,
  head: () => ({
    meta: [
      { title: "OpenCraft — A focused writing space" },
      {
        name: "description",
        content: "OpenCraft is an open-source, local-first markdown writing app inspired by Craft.",
      },
    ],
  }),
});

const viewVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12, ease: "easeIn" } },
} as const;

function OpenCraft() {
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const inspectorOpen = useEditorStore((s) => s.inspectorOpen);
  const activeView = useEditorStore((s) => s.activeView);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#161616] text-[#e0e0e0] antialiased">
      <AnimatePresence>
        {sidebarOpen && <Sidebar />}
      </AnimatePresence>
      <div className="flex min-w-0 flex-1 py-2 pr-2">
        <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-xl bg-[#1f1f1f] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-20px_rgba(0,0,0,0.6),0_8px_16px_-12px_rgba(0,0,0,0.5)] ring-1 ring-black/40">
          <div className="relative flex min-w-0 flex-1">
            {/* Editor - always mounted so TipTap state is preserved */}
            <div className={"flex min-w-0 flex-1 " + (activeView !== "editor" ? "hidden" : "")}>
              <EditorPane />
            </div>
            <AnimatePresence mode="wait">
              {activeView === "home" && (
                <motion.div
                  key="home"
                  variants={viewVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 flex h-full w-full"
                >
                  <HomeView />
                </motion.div>
              )}
              {activeView === "tasks" && (
                <motion.div
                  key="tasks"
                  variants={viewVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 flex h-full w-full"
                >
                  <TasksView />
                </motion.div>
              )}
              {activeView === "calendar" && (
                <motion.div
                  key="calendar"
                  variants={viewVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 flex h-full w-full"
                >
                  <CalendarView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {inspectorOpen &&
          activeView !== "tasks" &&
          activeView !== "calendar" &&
          activeView !== "home" && <Inspector />}
      </AnimatePresence>
    </div>
  );
}
