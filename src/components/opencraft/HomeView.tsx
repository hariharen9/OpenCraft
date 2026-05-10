import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  Calendar,
  PenSquare,
  ArrowRight,
  Clock,
  Star,
  Plus,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useTasksStore } from "@/store/tasks-store";
import { format } from "date-fns";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export function HomeView() {
  const setActiveView = useEditorStore((s) => s.setActiveView);

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
        .slice(0, 8),
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

  const stats = [
    {
      label: "Documents",
      value: wsDocs.length,
      icon: <FileText className="h-4 w-4" />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      onClick: handleNewDoc,
    },
    {
      label: "Tasks",
      value: tasksLoaded ? incompleteTasks : "—",
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      onClick: () => setActiveView("tasks"),
    },
    {
      label: "Due today",
      value: tasksLoaded ? todayTasks : "—",
      icon: <Clock className="h-4 w-4" />,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      onClick: () => setActiveView("tasks"),
    },
    {
      label: "Starred",
      value: starredDocs.length,
      icon: <Star className="h-4 w-4" />,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      onClick: handleNewDoc,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[#1f1f1f]">
      <div className="mx-auto w-full max-w-5xl px-12 py-16">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12 text-center"
        >
          <h1 className="text-[32px] font-bold tracking-[-0.02em] text-[#e8e8e8]">{greeting()}</h1>
          <p className="mt-1 text-[14px] text-[#888]">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.button
              key={s.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={s.onClick}
              className="flex items-center gap-3 rounded-xl bg-[#262626] p-4 text-left ring-1 ring-[#333] transition-colors hover:bg-[#2c2c2c]"
            >
              <div
                className={
                  "flex h-9 w-9 items-center justify-center rounded-lg " + s.bg + " " + s.color
                }
              >
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[18px] font-semibold text-[#e8e8e8]">{s.value}</div>
                <div className="text-[12px] text-[#888]">{s.label}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-12 flex flex-col items-center"
        >
          <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#777]">
            Quick Actions
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <ActionBtn
              icon={<PenSquare className="h-3.5 w-3.5" />}
              label="New Document"
              onClick={handleNewDoc}
            />
            <ActionBtn
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label="Tasks"
              onClick={() => setActiveView("tasks")}
            />
            <ActionBtn
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Calendar"
              onClick={() => setActiveView("calendar")}
            />
          </div>
        </motion.div>

        {/* Recent documents */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#777]">
              Recent Documents
            </h2>
            <button
              onClick={handleNewDoc}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#ccc]"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleNewDoc}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#262626] p-8 text-left ring-1 ring-[#333] transition-colors hover:bg-[#2c2c2c]"
            >
              <Plus className="h-5 w-5 text-[#666]" />
              <span className="text-[14px] text-[#888]">Create your first document</span>
            </motion.button>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {recentDocs.map((doc) => (
                <motion.button
                  key={doc.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOpenDoc(doc.id)}
                  className="flex w-full items-center gap-4 rounded-xl bg-[#262626] p-4 text-left ring-1 ring-[#333] transition-colors hover:bg-[#2c2c2c]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#333] text-[#9a9a9a]">
                    {doc.starred ? (
                      <Star className="h-5 w-5 fill-current text-yellow-400" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium text-[#e0e0e0]">
                      {doc.title || "Untitled Page"}
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-[11px] text-[#666]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          Opened {doc.viewedAt ? format(doc.viewedAt, "MMM d, h:mm a") : "Never"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PenSquare className="h-3 w-3 shrink-0" />
                        <span>Updated {format(doc.updatedAt, "MMM d, h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-50">
                        <Plus className="h-3 w-3 shrink-0" />
                        <span>Created {format(doc.createdAt, "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#555]" />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-[#262626] px-3.5 py-2 text-[13px] text-[#cfcfcf] ring-1 ring-[#333] transition-colors hover:bg-[#2c2c2c] active:scale-95"
    >
      {icon}
      {label}
    </button>
  );
}
