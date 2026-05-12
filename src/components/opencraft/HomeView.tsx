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
  Search,
  Quote,
  TrendingUp,
  Hash,
  Type,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useTasksStore } from "@/store/tasks-store";
import { useAuthStore } from "@/store/auth-store";
import { LocalStorageProvider } from "@/lib/storage/local";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import clsx from "clsx";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const QUOTES = [
  "Creativity is intelligence having fun.",
  "Your mind is for having ideas, not holding them.",
  "Great things are not done by impulse, but by a series of small things brought together.",
  "The best way to predict the future is to create it.",
  "Simplify, then add lightness.",
];

export function HomeView() {
  const setActiveView = useEditorStore((s) => s.setActiveView);
  const accent = useEditorStore((s) => s.accentColor);
  const setCommandPaletteOpen = useEditorStore((s) => s.setCommandPaletteOpen);
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

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

  const [totalStats, setTotalStats] = useState({ words: 0, chars: 0 });

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => {
    loadWs();
    loadTasks();
  }, [loadWs, loadTasks]);

  useEffect(() => {
    const calcStats = async () => {
      let words = 0;
      let chars = 0;
      for (const doc of docs) {
        const data = await LocalStorageProvider.load(doc.id);
        if (data?.markdown) {
          chars += data.markdown.length;
          const w = data.markdown.trim() ? data.markdown.trim().split(/\s+/).length : 0;
          words += w;
        }
      }
      setTotalStats({ words, chars });
    };

    if (wsLoaded && docs.length > 0) {
      calcStats();
    }
  }, [docs, wsLoaded]);

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

  const starredDocs = useMemo(() => wsDocs.filter((d) => d.starred).slice(0, 3), [wsDocs]);
  const incompleteTasks = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
  
  const todayTaskList = useMemo(
    () =>
      tasks.filter((t) => {
        if (!t.dueDate || t.completed) return false;
        return t.dueDate === format(new Date(), "yyyy-MM-dd");
      }).slice(0, 3),
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
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-[#161616] selection:bg-[#333] scrollbar-none">
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
        className={clsx(
          "relative z-10 mx-auto w-full max-w-6xl",
          isMobile ? "px-5 py-8 pb-28" : "px-8 py-12 lg:px-12 lg:py-20"
        )}
      >
        {/* Header Section */}
        <header className={clsx("flex flex-col text-center", isMobile ? "mb-8 items-start text-left" : "mb-16 items-center")}>
          <motion.div variants={itemVariants} className="mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#888] backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              <span>Workspace Ready</span>
            </div>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className={clsx(
              "font-extrabold tracking-tight text-white",
              isMobile ? "text-[32px]" : "text-[48px] lg:text-[64px]"
            )}
            style={{ lineHeight: 1.1 }}
          >
            {greeting()}, <span className="text-[#888]">{displayName}.</span>
          </motion.h1>
          
          {/* Visual Search Bar */}
          <motion.button
            variants={itemVariants}
            onClick={() => setCommandPaletteOpen(true)}
            className={clsx(
              "flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-3.5 text-[#555] transition-all hover:bg-white/[0.06] hover:border-white/10 group",
              isMobile ? "mt-6 max-w-full" : "mt-10 max-w-md"
            )}
          >
            <Search className="h-5 w-5 group-hover:text-[#888]" />
            <span className="flex-1 text-left text-[15px]">Search documents...</span>
            {!isMobile && (
              <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded bg-white/5 px-2 font-mono text-[10px] text-[#444] ring-1 ring-white/10">
                ⌘ K
              </kbd>
            )}
          </motion.button>
        </header>

        {/* Bento Grid */}
        <div className={clsx("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 gap-6 md:grid-cols-12")}>
          {/* Main Quick Start / Recent Doc Card */}
          <motion.div
            variants={itemVariants}
            className={clsx(
              "group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 backdrop-blur-xl transition-all hover:border-white/20",
              isMobile ? "p-5" : "md:col-span-8 lg:row-span-2 p-8"
            )}
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
                  <div className="grid gap-3 sm:grid-cols-1">
                    {recentDocs.map((doc, idx) => (
                      <motion.button
                        key={doc.id}
                        whileHover={{ x: 6 }}
                        onClick={() => handleOpenDoc(doc.id)}
                        className={clsx(
                          "flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all",
                          idx === 0 ? "bg-white/5 ring-1 ring-white/10 shadow-lg" : "hover:bg-white/[0.03]"
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

          {/* Inspirational Quote Card */}
          <motion.div
            variants={itemVariants}
            className={clsx(
              "group relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f]/60 to-[#161616]/40 backdrop-blur-xl transition-all hover:border-white/10",
              isMobile ? "p-5" : "md:col-span-4 p-8"
            )}
          >
            <Quote className="absolute right-6 top-6 h-12 w-12 text-white/5" />
            <div className="relative h-full flex flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <p className="text-[18px] font-medium italic leading-relaxed text-[#eee]">
                  "{quote}"
                </p>
              </div>
              <p className="mt-8 text-[11px] font-bold uppercase tracking-widest text-[#555]">
                Daily Inspiration
              </p>
            </div>
          </motion.div>

          {/* Today's Tasks Preview Card */}
          <motion.div
            variants={itemVariants}
            onClick={() => setActiveView("tasks")}
            className={clsx(
              "group rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 backdrop-blur-xl transition-all hover:border-emerald-500/30 cursor-pointer",
              isMobile ? "p-5" : "md:col-span-4 p-6"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-[24px] font-black text-white">{incompleteTasks}</div>
            </div>
            <h3 className="text-[16px] font-bold text-white mb-4">Today's Focus</h3>
            
            <div className="space-y-3">
              {todayTaskList.length > 0 ? (
                todayTaskList.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 text-[13px] text-[#888]">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
                    <span className="truncate">{t.title}</span>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-[#555]">No tasks for today.</div>
              )}
            </div>
          </motion.div>

          {/* Starred Shortcut Card */}
          {starredDocs.length > 0 && (
            <motion.div
              variants={itemVariants}
              className={clsx(
                "group rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 backdrop-blur-xl transition-all hover:border-yellow-500/30",
                isMobile ? "p-5" : "md:col-span-4 p-6"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20">
                  <Star className="h-5 w-5" />
                </div>
                <div className="text-[24px] font-black text-white">{starredDocs.length}</div>
              </div>
              <h3 className="text-[16px] font-bold text-white mb-3">Starred</h3>
              <div className="space-y-2">
                {starredDocs.map(d => (
                  <button key={d.id} onClick={() => handleOpenDoc(d.id)} className="block w-full truncate text-left text-[13px] text-[#888] hover:text-white transition-colors">
                    {d.title || "Untitled"}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className={clsx(
              "group rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 backdrop-blur-xl transition-all hover:border-blue-500/30",
              isMobile ? "p-5" : "md:col-span-4 p-6"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div className="text-[24px] font-black text-white">{wsDocs.length}</div>
            </div>
            <h3 className="text-[16px] font-bold text-white mb-4">Brain Index</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-[#666]">
                  <Hash className="h-3.5 w-3.5" /> Words
                </span>
                <span className="font-bold text-[#aaa]">{totalStats.words.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-[#666]">
                  <Type className="h-3.5 w-3.5" /> Characters
                </span>
                <span className="font-bold text-[#aaa]">{totalStats.chars.toLocaleString()}</span>
              </div>
            </div>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-[#444]">Total Knowledge Base</p>
          </motion.div>
        </div>

        {/* Action Pills */}
        {!isMobile && (
          <motion.div variants={itemVariants} className="mt-16 flex flex-wrap justify-center gap-3">
            <ActionPill icon={<Zap className="h-3.5 w-3.5" />} label="Tasks" onClick={() => setActiveView("tasks")} />
            <ActionPill icon={<Calendar className="h-3.5 w-3.5" />} label="Calendar" onClick={() => setActiveView("calendar")} />
            <ActionPill icon={<Star className="h-3.5 w-3.5" />} label="Starred" onClick={() => {}} />
            <ActionPill icon={<Layers className="h-3.5 w-3.5" />} label="Storage" onClick={() => {}} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function ActionPill({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-2 rounded-full border border-white/5 bg-[#1f1f1f]/60 px-6 py-3 text-[13px] font-bold text-[#cfcfcf] backdrop-blur-xl transition-all hover:border-white/20 hover:text-white active:scale-95"
    >
      <div className="absolute inset-0 rounded-full bg-white/[0.02] opacity-0 transition-opacity group-hover:opacity-100" />
      {icon}
      {label}
    </button>
  );
}
