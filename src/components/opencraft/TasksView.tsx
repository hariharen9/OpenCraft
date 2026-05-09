import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useTasksStore, type Task } from "@/store/tasks-store";
import { format, isToday, isFuture, parseISO, isValid } from "date-fns";

type Filter = "all" | "today" | "upcoming" | "completed";

export function TasksView() {
  const setActiveView = useEditorStore((s) => s.setActiveView);
  const accent = useEditorStore((s) => s.accentColor);
  const { tasks, loaded, loadTasks, addTask, toggleTask, deleteTask } = useTasksStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = tasks.filter((t) => {
    if (filter === "today") {
      if (!t.dueDate) return false;
      const d = parseISO(t.dueDate);
      return isValid(d) && isToday(d);
    }
    if (filter === "upcoming") {
      if (t.completed) return false;
      if (!t.dueDate) return true;
      const d = parseISO(t.dueDate);
      return isValid(d) && isFuture(d);
    }
    if (filter === "completed") return t.completed;
    return true;
  });

  const handleAdd = () => {
    const val = input.trim();
    if (!val) return;
    addTask(val);
    setInput("");
    inputRef.current?.focus();
  };

  const incompleteCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex h-full flex-col bg-[#1f1f1f]">
      {/* Header */}
      <header className="flex h-[44px] shrink-0 items-center gap-3 px-6 lg:px-12">
        <button
          onClick={() => setActiveView("editor")}
          className="rounded-md p-1 text-[#9a9a9a] transition-colors hover:bg-[#2a2a2a] hover:text-[#e0e0e0] active:scale-90"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-[14px] font-semibold text-[#e0e0e0]">Tasks</h1>
      </header>

      <div className="mx-auto w-full max-w-3xl px-6 lg:px-8">
        {/* Add task */}
        <div className="pb-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#262626] px-3 py-2 ring-1 ring-[#333] transition-all focus-within:ring-[#555]">
            <button
              onClick={handleAdd}
              className="rounded p-0.5 text-[#888] transition-colors hover:text-[#e0e0e0] active:scale-90"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              placeholder="Add a task..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#e0e0e0] outline-none placeholder:text-[#555]"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 pb-3 text-[12px]">
          {(["all", "today", "upcoming", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "rounded-full px-2.5 py-1 transition-colors active:scale-95 " +
                (filter === f
                  ? "bg-[#333] text-[#e0e0e0] font-medium"
                  : "text-[#777] hover:text-[#bbb]")
              }
            >
              {f === "all" ? "All" : f === "today" ? "Today" : f === "upcoming" ? "Upcoming" : "Completed"}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          {!loaded ? (
            <div className="flex items-center justify-center pt-12">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#444] border-t-[#888]" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center pt-12 text-[13px] text-[#555]"
            >
              {filter === "all" && "No tasks yet. Add one above."}
              {filter === "today" && "Nothing due today."}
              {filter === "upcoming" && "No upcoming tasks."}
              {filter === "completed" && "No completed tasks."}
            </motion.div>
          ) : (
            <motion.div layout className="space-y-0.5">
              <AnimatePresence mode="popLayout">
                {filtered.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  accent={accent}
                />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Footer count */}
        {loaded && tasks.length > 0 && (
          <div className="flex shrink-0 items-center justify-between border-t border-[#2a2a2a] py-2 text-[11px] text-[#666]">
            <span>{incompleteCount} remaining</span>
            {completedCount > 0 && <span>{completedCount} completed</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  accent,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  accent: string;
}) {
  const dueLabel = task.dueDate
    ? (() => {
        const d = parseISO(task.dueDate);
        if (!isValid(d)) return null;
        if (isToday(d)) return "Today";
        return format(d, "MMM d");
      })()
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors hover:bg-[#262626]"
    >
      <button
        onClick={() => onToggle(task.id)}
        className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#555] transition-colors hover:border-[#888] active:scale-90"
      >
        <AnimatePresence>
          {task.completed && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              viewBox="0 0 16 16"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              style={{ color: accent }}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                d="M3 8 L7 12 L13 4"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      <span
        className={
          "min-w-0 flex-1 truncate text-[13px] transition-all " +
          (task.completed
            ? "text-[#555] line-through"
            : "text-[#d0d0d0]")
        }
      >
        {task.title}
      </span>

      {dueLabel && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#2a2a2a] px-2 py-0.5 text-[10px] text-[#888]">
          <CalendarIcon className="h-2.5 w-2.5" />
          {dueLabel}
        </span>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="rounded p-0.5 text-[#555] opacity-0 transition-all hover:text-[#ef4444] group-hover:opacity-100 active:scale-90"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
