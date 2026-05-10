import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  Calendar,
  PenSquare,
  ArrowRight,
  Clock,
  Star,
  Plus,
  Zap,
  Layout,
  Layers,
  Sparkles,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useTasksStore } from "@/store/tasks-store";
import { useAuthStore } from "@/store/auth-store";
import { format } from "date-fns";
import clsx from "clsx";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export function HomeView() {
  const setActiveView = useEditorStore((s) => s.setActiveView);
  const accent = useEditorStore((s) => s.accentColor);
  const { user } = useAuthStore();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Editor";

  const {
    docs,
    activeWorkspaceId,
    createDoc,
    setActiveDoc,
    loaded: wsLoaded,
    load: loadWs,
  } = useWorkspaceStore();
  const { tasks, loaded: tasksLoaded, loadTasks } = useTasksStore();

  useEffect(() => {
    loadWs();
    loadTasks();
  }, [loadWs, loadTasks]);

  const wsDocs = useMemo(
    () => docs.filter((d) => d.id.startsWith(`${activeWorkspaceId}:`)),
    [docs, activeWorkspaceId],
  );

  const recentDocs = useMemo(
    () =>
      [...wsDocs]
        .sort((a, b) => (b.viewedAt || b.updatedAt) - (a.viewedAt || a.updatedAt))
        .slice(0, 5),
    [wsDocs],
  );

  const starredDocs = useMemo(() => wsDocs.filter((d) => d.starred), [wsDocs]);
  const incompleteTasks = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
  const todayTasks = useMemo(
    () =>
      tasks.filter((t) => {
        if (!t.dueDate || t.completed) return false;
        return t.dueDate === format(new Date(), "yyyy-MM-dd");
      }).length,
    [tasks],
  );

  const handleNewDoc = () => {
    const docId = createDoc();
    setActiveDoc(docId);
    setActiveView("editor");
  };

  const handleOpenDoc = (docId: string) => {
    setActiveDoc(docId);
    setActiveView("editor");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 15, stiffness: 100 } },
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-[#161616] selection:bg-[#333]">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accent}08 0%, transparent 70%)`,
          }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-6xl px-8 py-12 lg:px-12 lg:py-20"
      >
        {/* Header Section */}
        <header className="mb-16 flex flex-col items-center text-center">
          <motion.div variants={itemVariants} className="mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#888] backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              <span>Workspace Ready</span>
            </div>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-[48px] font-extrabold tracking-tight text-white lg:text-[64px]"
            style={{ lineHeight: 1.1 }}
          >
            {greeting()}, <span className="text-[#888]">{displayName}.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-4 text-[16px] text-[#888]">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </motion.p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:grid-rows-2">
          {/* Main Quick Start / Recent Doc Card */}
          <motion.div
            variants={itemVariants}
            className="group relative md:col-span-8 lg:row-span-2 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 p-8 backdrop-blur-xl transition-all hover:border-white/20"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-white/10" />
            
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white ring-1 ring-white/10">
                    <PenSquare className="h-5 w-5" />
                  </div>
                  <h2 className="text-[20px] font-bold text-white">Continue Crafting</h2>
                </div>
                <button
                  onClick={handleNewDoc}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-bold text-black transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  New Doc
                </button>
              </div>

              <div className="mt-8 flex-1">
                {recentDocs.length > 0 ? (
                  <div className="space-y-3">
                    {recentDocs.map((doc, idx) => (
                      <motion.button
                        key={doc.id}
                        whileHover={{ x: 6 }}
                        onClick={() => handleOpenDoc(doc.id)}
                        className={clsx(
                          "flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all",
                          idx === 0 ? "bg-white/5 ring-1 ring-white/10" : "hover:bg-white/[0.03]"
                        )}
                      >
                        <div className={clsx(
                          "flex h-11 w-11 items-center justify-center rounded-xl",
                          idx === 0 ? "bg-[#2a2a2a]" : "bg-[#1f1f1f]"
                        )}>
                          {doc.starred ? (
                            <Star className="h-5 w-5 fill-current text-yellow-400" />
                          ) : (
                            <FileText className="h-5 w-5 text-[#888]" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-[15px] font-semibold text-white">
                            {doc.title || "Untitled Document"}
                          </div>
                          <div className="text-[12px] text-[#666]">
                            Updated {format(doc.updatedAt, "MMM d, h:mm a")}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#444] group-hover:text-white" />
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center gap-4 text-[#555]">
                    <Layout className="h-12 w-12 opacity-20" />
                    <p className="text-[14px]">Your workspace is empty. Let's create something!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Grid Cluster */}
          <motion.div
            variants={itemVariants}
            onClick={() => setActiveView("tasks")}
            className="group md:col-span-4 rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 p-6 backdrop-blur-xl transition-all hover:border-emerald-500/30 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-[28px] font-black text-white">{incompleteTasks}</div>
            </div>
            <h3 className="text-[15px] font-bold text-white">Open Tasks</h3>
            <p className="mt-1 text-[12px] text-[#888]">Keep the momentum going.</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            onClick={() => setActiveView("calendar")}
            className="group md:col-span-4 rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 p-6 backdrop-blur-xl transition-all hover:border-amber-500/30 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-[28px] font-black text-white">{todayTasks}</div>
            </div>
            <h3 className="text-[15px] font-bold text-white">Due Today</h3>
            <p className="mt-1 text-[12px] text-[#888]">Stay ahead of schedule.</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="group md:col-span-4 rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 p-6 backdrop-blur-xl transition-all hover:border-blue-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div className="text-[28px] font-black text-white">{wsDocs.length}</div>
            </div>
            <h3 className="text-[15px] font-bold text-white">Total Docs</h3>
            <p className="mt-1 text-[12px] text-[#888]">Your digital brain growing.</p>
          </motion.div>
        </div>

        {/* Action Pills */}
        <motion.div variants={itemVariants} className="mt-12 flex flex-wrap justify-center gap-3">
          <ActionPill icon={<Zap className="h-3.5 w-3.5" />} label="Tasks" onClick={() => setActiveView("tasks")} accent={accent} />
          <ActionPill icon={<Calendar className="h-3.5 w-3.5" />} label="Calendar" onClick={() => setActiveView("calendar")} accent={accent} />
          <ActionPill icon={<Star className="h-3.5 w-3.5" />} label="Starred" onClick={() => {}} accent={accent} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function ActionPill({ icon, label, onClick, accent }: { icon: React.ReactNode; label: string; onClick: () => void; accent: string }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-2 rounded-full border border-white/5 bg-[#1f1f1f]/60 px-5 py-2.5 text-[13px] font-semibold text-[#cfcfcf] backdrop-blur-xl transition-all hover:border-white/20 hover:text-white active:scale-95"
    >
      <div className="absolute inset-0 rounded-full bg-white/[0.02] opacity-0 transition-opacity group-hover:opacity-100" />
      {icon}
      {label}
    </button>
  );
}
