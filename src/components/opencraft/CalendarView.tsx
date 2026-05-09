import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useTasksStore } from "@/store/tasks-store";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isValid,
} from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const setActiveView = useEditorStore((s) => s.setActiveView);
  const { tasks, loaded, loadTasks, addTask, toggleTask, deleteTask } = useTasksStore();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [input, setInput] = useState("");
  const [dir, setDir] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    setSelected(new Date());
  }, []);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const tasksByDate: Record<string, typeof tasks> = {};
  for (const t of tasks) {
    if (!t.dueDate) continue;
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
    tasksByDate[t.dueDate].push(t);
  }

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedTasks = selectedKey ? tasksByDate[selectedKey] ?? [] : [];

  const goPrev = () => { setDir(-1); setCursor((d) => subMonths(d, 1)); };
  const goNext = () => { setDir(1); setCursor((d) => addMonths(d, 1)); };

  const handleAdd = () => {
    const val = input.trim();
    if (!val || !selectedKey) return;
    addTask(val, selectedKey);
    setInput("");
    inputRef.current?.focus();
  };

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
        <h1 className="text-[14px] font-semibold text-[#e0e0e0]">Calendar</h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-4 lg:px-12">
        <div className="mx-auto w-full max-w-3xl">
        {/* Month navigation */}
        <div className="flex items-center justify-between py-3">
          <button
            onClick={goPrev}
            className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#e0e0e0] active:scale-90"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-[15px] font-semibold text-[#e0e0e0]">
            {format(cursor, "MMMM yyyy")}
          </h2>
          <button
            onClick={goNext}
            className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#e0e0e0] active:scale-90"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7">
          {DAYS.map((d) => (
            <div key={d} className="py-1 text-center text-[11px] font-medium text-[#666]">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={format(cursor, "yyyy-MM")}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grid grid-cols-7"
            >
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const hasTasks = !!tasksByDate[key]?.length;
                const isSel = selected ? isSameDay(day, selected) : false;
                const isCur = isToday(day);
                const sameMonth = isSameMonth(day, cursor);

                return (
                  <button
                    key={key}
                    onClick={() => setSelected(day)}
                    className={
                      "relative flex flex-col items-center justify-center py-2 text-[13px] transition-colors active:scale-95 lg:py-3 lg:text-[14px] " +
                      (sameMonth ? "text-[#d0d0d0]" : "text-[#444]") +
                      (isSel ? " rounded-lg bg-[#333]" : " hover:bg-[#2a2a2a] rounded-lg")
                    }
                  >
                    <span
                      className={
                        "flex h-7 w-7 items-center justify-center rounded-full text-[13px] " +
                        (isCur ? "bg-[#ff8a4c] font-semibold text-white" : "")
                      }
                    >
                      {format(day, "d")}
                    </span>
                    {hasTasks && (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-[#ff8a4c]" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selected day tasks */}
        {selected && (
          <div className="mt-5">
            <h3 className="mb-2 text-[12px] font-semibold text-[#e0e0e0]">
              {format(selected, "EEEE, MMMM d")}
              {isToday(selected) && (
                <span className="ml-2 rounded-full bg-[#ff8a4c]/20 px-2 py-0.5 text-[10px] text-[#ff8a4c]">
                  Today
                </span>
              )}
            </h3>

            {!loaded ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#444] border-t-[#888]" />
              </div>
            ) : selectedTasks.length === 0 ? (
              <p className="py-2 text-[12px] text-[#555]">No tasks for this day.</p>
            ) : (
              <div className="space-y-0.5">
                <AnimatePresence mode="popLayout">
                  {selectedTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                      className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-[#262626]"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border border-[#555] transition-colors hover:border-[#888] active:scale-90"
                      >
                        <AnimatePresence>
                          {task.completed && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              viewBox="0 0 16 16"
                              className="h-2.5 w-2.5 text-[#ff8a4c]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 8 L7 12 L13 4" />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </button>
                      <span
                        className={
                          "min-w-0 flex-1 truncate text-[13px] " +
                          (task.completed ? "text-[#555] line-through" : "text-[#d0d0d0]")
                        }
                      >
                        {task.title}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded p-0.5 text-[#555] opacity-0 transition-all hover:text-[#ef4444] group-hover:opacity-100 active:scale-90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Add task for selected day */}
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#262626] px-3 py-2 ring-1 ring-[#333] transition-all focus-within:ring-[#555]">
              <button
                onClick={handleAdd}
                className="rounded p-0.5 text-[#888] transition-colors hover:text-[#e0e0e0] active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                placeholder={`Add task for ${format(selected, "MMM d")}...`}
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#e0e0e0] outline-none placeholder:text-[#555]"
              />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
