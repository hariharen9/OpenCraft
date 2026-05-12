import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText, CheckCircle2, Calendar, PenSquare, ArrowRight,
  Star, Plus, Zap, Layers, Search, Quote, TrendingUp,
  Hash, Type, Flame, BookOpen, Target, ChevronRight, Feather,
  BarChart3,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useTasksStore } from "@/store/tasks-store";
import { useAuthStore } from "@/store/auth-store";
import { LocalStorageProvider } from "@/lib/storage/local";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, differenceInDays, isToday, isYesterday, subDays } from "date-fns";
import clsx from "clsx";

/* ── helpers ── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const QUOTES = [
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "Great things are not done by impulse, but by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Simplify, then add lightness.", author: "Colin Chapman" },
];

function formatRelative(ts: number) {
  if (isToday(ts)) return "Today";
  if (isYesterday(ts)) return "Yesterday";
  const d = differenceInDays(new Date(), ts);
  if (d < 7) return `${d}d ago`;
  return format(ts, "MMM d");
}

/* ── animated counter ── */
function AnimCount({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const dur = 800;
    const start = performance.now();
    const from = 0;
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display.toLocaleString()}{suffix}</>;
}

/* ── heatmap ── */
function ActivityHeatmap({ docs, accentColor }: { docs: { updatedAt: number }[], accentColor: string }) {
  const weeks = 12;
  const days = weeks * 7;
  const cells = useMemo(() => {
    const map = new Map<string, number>();
    docs.forEach((d) => {
      const key = format(d.updatedAt, "yyyy-MM-dd");
      map.set(key, (map.get(key) || 0) + 1);
    });
    const result: { date: Date; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const key = format(date, "yyyy-MM-dd");
      result.push({ date, count: map.get(key) || 0 });
    }
    return result;
  }, [docs, days]);

  const max = Math.max(1, ...cells.map((c) => c.count));
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: weeks }, (_, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {Array.from({ length: 7 }, (_, d) => {
            const cell = cells[w * 7 + d];
            if (!cell) return <div key={d} className="h-[10px] w-[10px] rounded-[2px]" />;
            const intensity = cell.count / max;
            return (
              <div
                key={d}
                className="h-[10px] w-[10px] rounded-[2px] transition-colors"
                style={{
                  background: intensity === 0
                    ? "rgba(255,255,255,0.04)"
                    : accentColor,
                  opacity: intensity === 0 ? 1 : 0.2 + intensity * 0.8
                }}
                title={`${format(cell.date, "MMM d")}: ${cell.count} edit${cell.count !== 1 ? "s" : ""}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── stat ring ── */
function StatRing({ value, max, color, size = 40 }: { value: number; max: number; color: string; size?: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export function HomeView() {
  const setActiveView = useEditorStore((s) => s.setActiveView);
  const accent = useEditorStore((s) => s.accentColor);
  const setCommandPaletteOpen = useEditorStore((s) => s.setCommandPaletteOpen);
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Editor";

  const { docs, activeWorkspaceId, createDoc, setActiveDoc, loaded: wsLoaded, load: loadWs } = useWorkspaceStore();
  const { tasks, loaded: tasksLoaded, loadTasks } = useTasksStore();
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  const [quickNote, setQuickNote] = useState("");

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => { loadWs(); loadTasks(); }, [loadWs, loadTasks]);

  useEffect(() => {
    if (!wsLoaded || docs.length === 0) return;
    (async () => {
      let w = 0, c = 0;
      for (const doc of docs) {
        const data = await LocalStorageProvider.load(doc.id);
        if (data?.markdown) {
          c += data.markdown.length;
          w += data.markdown.trim() ? data.markdown.trim().split(/\s+/).length : 0;
        }
      }
      setStats({ words: w, chars: c });
    })();
  }, [docs, wsLoaded]);

  const wsDocs = useMemo(() => docs.filter((d) => d.id.startsWith(`${activeWorkspaceId}:`)), [docs, activeWorkspaceId]);
  const recentDocs = useMemo(() => [...wsDocs].sort((a, b) => (b.viewedAt || b.updatedAt) - (a.viewedAt || a.updatedAt)), [wsDocs]);
  const starredDocs = useMemo(() => wsDocs.filter((d) => d.starred), [wsDocs]);
  const incompleteTasks = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
  const completedToday = useMemo(() => tasks.filter((t) => t.completed && t.dueDate === format(new Date(), "yyyy-MM-dd")).length, [tasks]);
  const todayTasks = useMemo(() => tasks.filter((t) => !t.completed && t.dueDate === format(new Date(), "yyyy-MM-dd")).slice(0, 4), [tasks]);

  const handleNewDoc = useCallback(() => {
    const docId = createDoc();
    setActiveDoc(docId);
    setActiveView("editor");
  }, [createDoc, setActiveDoc, setActiveView]);

  const handleOpenDoc = useCallback((id: string) => {
    setActiveDoc(id);
    setActiveView("editor");
  }, [setActiveDoc, setActiveView]);

  const handleQuickNote = useCallback(() => {
    if (!quickNote.trim()) return;
    const docId = createDoc();
    setActiveDoc(docId);
    const title = quickNote.split("\n")[0].slice(0, 60);
    useWorkspaceStore.getState().updateDocMeta(docId, { title });
    setActiveView("editor");
    setQuickNote("");
  }, [quickNote, createDoc, setActiveDoc, setActiveView]);

  const dateStr = format(new Date(), "EEEE, MMMM d");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 100 } },
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-[#161616] scrollbar-none selection:bg-white/20 text-[#eaeaea] font-sans antialiased">
      
      {/* ── Ambient Background (App's Core Language) ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          style={{ background: `radial-gradient(circle at 50% 0%, ${accent}15 0%, transparent 60%)` }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className={clsx("relative z-10 mx-auto w-full", isMobile ? "max-w-lg px-5 pt-8 pb-28" : "max-w-[1100px] px-8 pt-12 pb-20 lg:px-12")}>
        
        {/* Header */}
        <motion.header variants={itemVariants} className={clsx("mb-10", isMobile && "mb-8")}>
          <div className="mb-3 text-[13px] font-medium text-[#888]">
            {dateStr}
          </div>
          <h1 className={clsx("font-extrabold tracking-tight text-white", isMobile ? "text-[32px]" : "text-[44px]")} style={{ lineHeight: 1.1 }}>
            {greeting()}, <span className="text-[#888]">{displayName}.</span>
          </h1>
        </motion.header>

        {/* Quick Capture */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="group relative rounded-2xl border border-white/[0.08] bg-[#1f1f1f]/60 backdrop-blur-xl transition-all focus-within:border-white/20 focus-within:bg-[#1f1f1f]/80 shadow-lg">
            <div className="flex items-center gap-4 px-5 py-3.5">
              <Feather className="h-4.5 w-4.5 text-[#666] shrink-0" />
              <input
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickNote()}
                placeholder="Capture a thought..."
                className="flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#666]"
              />
              {quickNote.trim() ? (
                <button
                  onClick={handleQuickNote}
                  style={{ backgroundColor: accent }}
                  className="flex h-8 px-4 items-center justify-center rounded-xl text-black text-[13px] font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  Create
                </button>
              ) : !isMobile && (
                <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-[#666] border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <Search className="h-3 w-3" />
                  <kbd>⌘K</kbd>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Grid Layout */}
        <div className={clsx("grid gap-5", isMobile ? "grid-cols-1" : "grid-cols-12 auto-rows-min")}>
          
          {/* Recent Docs */}
          <motion.div variants={itemVariants} className={clsx("flex flex-col gap-5 rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 backdrop-blur-xl p-6", isMobile ? "" : "col-span-8 row-span-2")}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
                  <BookOpen className="h-4 w-4 text-[#888]" />
                </div>
                <h2 className="text-[15px] font-bold text-white">Recent Documents</h2>
              </div>
              <button onClick={handleNewDoc} className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[12px] font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-sm">
                <Plus className="h-3.5 w-3.5" /> New
              </button>
            </div>

            <div className="flex flex-col flex-1 mt-2">
              {recentDocs.length > 0 ? (
                <div className="grid gap-2">
                  {recentDocs.slice(0, 5).map((doc, i) => (
                    <div 
                      key={doc.id}
                      onClick={() => handleOpenDoc(doc.id)}
                      className="group flex justify-between items-center px-4 py-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all"
                    >
                       <div className="flex items-center gap-4 min-w-0">
                          <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors", i === 0 ? "bg-white/10" : "bg-white/[0.03] group-hover:bg-white/10")}>
                            {doc.starred ? <Star className="h-4.5 w-4.5 fill-current text-yellow-400" /> : <FileText className="h-4.5 w-4.5 text-[#777] group-hover:text-white" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-white truncate">
                              {doc.title || "Untitled Document"}
                            </div>
                            <div className="text-[12px] text-[#666] mt-0.5">{formatRelative(doc.updatedAt)}</div>
                          </div>
                       </div>
                       <ChevronRight className="h-4 w-4 text-[#444] group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-[#555]">
                  <PenSquare className="h-8 w-8 mb-3 opacity-50" />
                  <p className="text-[14px]">No documents found. Start writing.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Today's Focus */}
          <motion.div variants={itemVariants} onClick={() => setActiveView("tasks")} className={clsx("group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 backdrop-blur-xl p-6 cursor-pointer transition-all hover:border-emerald-500/30 hover:bg-[#1f1f1f]/60", isMobile ? "" : "col-span-4")}>
             <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Target className="h-4 w-4 text-emerald-400" />
                </div>
                <h2 className="text-[15px] font-bold text-white">Focus</h2>
              </div>
              <div className="relative flex items-center justify-center">
                <StatRing value={completedToday} max={Math.max(completedToday + incompleteTasks, 1)} color="rgb(52,211,153)" />
                <span className="absolute text-[12px] font-bold text-white">{incompleteTasks}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map(t => (
                  <div key={t.id} className="flex items-start gap-3 text-[13px] text-[#aaa]">
                     <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400/50 shrink-0" />
                     <span className="leading-snug">{t.title}</span>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-[#666]">All caught up for today.</p>
              )}
            </div>
          </motion.div>

          {/* Stats & Heatmap */}
          <motion.div variants={itemVariants} className={clsx("flex flex-col gap-5 rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 backdrop-blur-xl p-6", isMobile ? "" : "col-span-4")}>
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                  </div>
                  <h2 className="text-[15px] font-bold text-white">Overview</h2>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-[24px] font-bold text-white leading-none mb-1"><AnimCount value={wsDocs.length} /></div>
                  <div className="text-[11px] font-medium text-[#666] uppercase tracking-wider">Docs</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-[24px] font-bold text-white leading-none mb-1"><AnimCount value={stats.words} /></div>
                  <div className="text-[11px] font-medium text-[#666] uppercase tracking-wider">Words</div>
                </div>
             </div>

             {!isMobile && (
               <div className="mt-auto pt-2">
                 <div className="flex items-center justify-between mb-3 text-[11px] font-medium text-[#666] uppercase tracking-wider">
                   <span>Activity Grid</span>
                   <Flame className="h-3 w-3" />
                 </div>
                 <ActivityHeatmap docs={wsDocs} accentColor={accent} />
               </div>
             )}
          </motion.div>

          {/* Starred Docs & Quote */}
          <motion.div variants={itemVariants} className={clsx("flex flex-col gap-5", isMobile ? "" : "col-span-8 grid grid-cols-2")}>
            
            {/* Starred Docs */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#1f1f1f]/40 backdrop-blur-xl p-6 transition-all hover:border-yellow-500/20">
               <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-500/10">
                    <Star className="h-4 w-4 text-yellow-400" />
                  </div>
                  <h2 className="text-[15px] font-bold text-white">Starred</h2>
               </div>
               <div className="space-y-1">
                  {starredDocs.length > 0 ? (
                    starredDocs.slice(0, 4).map(d => (
                      <button key={d.id} onClick={() => handleOpenDoc(d.id)} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors">
                         <Star className="h-3.5 w-3.5 text-yellow-400 fill-current shrink-0" />
                         <span className="text-[13px] font-medium text-[#aaa] truncate">{d.title || "Untitled"}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-[13px] text-[#666] px-2">No starred documents.</div>
                  )}
               </div>
            </div>

            {/* Quote Block */}
            <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f]/60 to-[#161616]/40 backdrop-blur-xl p-6 overflow-hidden flex flex-col justify-center">
               <Quote className="absolute right-4 top-4 h-16 w-16 text-white/5" />
               <p className="relative z-10 text-[16px] font-medium italic text-[#eaeaea] leading-relaxed mb-4">
                 "{quote.text}"
               </p>
               <p className="relative z-10 text-[12px] font-bold text-[#555] uppercase tracking-wider">
                 {quote.author}
               </p>
            </div>
            
          </motion.div>

        </div>

        {/* Quick Links */}
        {!isMobile && (
          <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-3">
             <QLink icon={<Zap className="h-3.5 w-3.5" />} label="Tasks" onClick={() => setActiveView("tasks")} />
             <QLink icon={<Calendar className="h-3.5 w-3.5" />} label="Calendar" onClick={() => setActiveView("calendar")} />
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}

function QLink({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/5 bg-[#1f1f1f]/60 text-[12px] font-bold text-[#888] hover:text-white hover:border-white/20 transition-all active:scale-95 shadow-sm">
      {icon}
      {label}
    </button>
  );
}
