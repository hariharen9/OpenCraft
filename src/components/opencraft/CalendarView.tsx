import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  CalendarDays,
  ListTodo,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useTasksStore, type Task } from "@/store/tasks-store";
import { useSettingsStore } from "@/store/settings-store";
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
  getDay,
  isPast,
  addWeeks,
  subWeeks,
  startOfDay,
} from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type ViewMode = "month" | "week";

export function CalendarView() {
  const accent = useEditorStore((s) => s.accentColor);
  const { tasks, loaded, loadTasks, addTask, toggleTask, deleteTask } = useTasksStore();
  const { syncCalendarTasks, loadSettings } = useSettingsStore();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [input, setInput] = useState("");
  const [dir, setDir] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [showMiniStats, setShowMiniStats] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTasks();
    loadSettings();
  }, [loadTasks, loadSettings]);

  // Build task lookup
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    }
    return map;
  }, [tasks]);

  // Calendar grid days
  const calDays = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(cursor);
      const monthEnd = endOfMonth(cursor);
      return eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });
    } else {
      const weekStart = startOfWeek(cursor);
      const weekEnd = endOfWeek(cursor);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [cursor, viewMode]);

  const selectedKey = format(selected, "yyyy-MM-dd");
  const selectedTasks = tasksByDate[selectedKey] ?? [];
  const selectedCompleted = selectedTasks.filter((t) => t.completed).length;

  // Navigation
  const goPrev = () => {
    setDir(-1);
    setCursor((d) => (viewMode === "month" ? subMonths(d, 1) : subWeeks(d, 1)));
  };
  const goNext = () => {
    setDir(1);
    setCursor((d) => (viewMode === "month" ? addMonths(d, 1) : addWeeks(d, 1)));
  };
  const goToday = () => {
    setDir(0);
    setCursor(new Date());
    setSelected(new Date());
  };

  const handleAdd = () => {
    const val = input.trim();
    if (!val) return;
    addTask(val, selectedKey);
    setInput("");
    inputRef.current?.focus();
  };

  // Mini stats for the month
  const monthStats = useMemo(() => {
    const monthStr = format(cursor, "yyyy-MM");
    let total = 0,
      completed = 0,
      overdue = 0;
    for (const t of tasks) {
      if (!t.dueDate || !t.dueDate.startsWith(monthStr)) continue;
      total++;
      if (t.completed) completed++;
      else {
        const d = parseISO(t.dueDate);
        if (isValid(d) && isPast(d) && !isToday(d)) overdue++;
      }
    }
    return { total, completed, overdue, pending: total - completed };
  }, [tasks, cursor]);

  // Heat intensity for a day
  const getHeatLevel = (dayKey: string): number => {
    const count = tasksByDate[dayKey]?.length ?? 0;
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    return 3;
  };

  const navLabel =
    viewMode === "month"
      ? format(cursor, "MMMM yyyy")
      : `${format(startOfWeek(cursor), "MMM d")} – ${format(endOfWeek(cursor), "MMM d, yyyy")}`;

  return (
    <div className="flex h-full w-full flex-col bg-[#1f1f1f]">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-8 pt-6 pb-2">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#e8e8e8]">Calendar</h1>
          <p className="mt-0.5 text-[12px] text-[#666]">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg bg-[#262626] p-0.5 ring-1 ring-[#333]">
            {(["month", "week"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={
                  "rounded-md px-3 py-1 text-[11px] font-medium transition-all " +
                  (viewMode === m
                    ? "bg-[#333] text-[#e0e0e0] shadow-sm"
                    : "text-[#666] hover:text-[#aaa]")
                }
              >
                {m === "month" ? "Month" : "Week"}
              </button>
            ))}
          </div>
          <button
            onClick={goToday}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#ccc]"
          >
            Today
          </button>
        </div>
      </header>

      {/* Content split: calendar + agenda */}
      <div className="flex min-h-0 flex-1 gap-0">
        {/* Calendar grid side */}
        <div className="flex min-w-0 flex-1 flex-col px-8 pb-4">
          {/* Month nav */}
          <div className="flex items-center justify-between py-3">
            <button
              onClick={goPrev}
              className="rounded-lg p-1.5 text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#e0e0e0] active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-[16px] font-semibold text-[#e0e0e0]">{navLabel}</h2>
            <button
              onClick={goNext}
              className="rounded-lg p-1.5 text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#e0e0e0] active:scale-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[#555]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={navLabel}
                custom={dir}
                initial={{ opacity: 0, x: dir * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -50 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={"grid grid-cols-7 " + (viewMode === "week" ? "h-full" : "auto-rows-fr")}
                style={viewMode === "month" ? { minHeight: "100%" } : undefined}
              >
                {calDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayTasks = tasksByDate[key] ?? [];
                  const isSel = isSameDay(day, selected);
                  const isCur = isToday(day);
                  const sameMonth = viewMode === "week" || isSameMonth(day, cursor);
                  const heat = getHeatLevel(key);

                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(day)}
                      className={
                        "relative flex flex-col items-start border-b border-r border-[#2a2a2a] p-2 text-left transition-all " +
                        (sameMonth ? "" : "opacity-30 ") +
                        (isSel ? "bg-[#262626]" : "hover:bg-[#242424]")
                      }
                      style={
                        isSel
                          ? { outline: `1px solid ${accent}40`, outlineOffset: "-1px" }
                          : undefined
                      }
                    >
                      {/* Day number */}
                      <span
                        className={
                          "flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium transition-all " +
                          (isCur
                            ? "text-white font-bold"
                            : sameMonth
                              ? "text-[#c0c0c0]"
                              : "text-[#555]")
                        }
                        style={isCur ? { backgroundColor: accent } : undefined}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Task dots / mini preview */}
                      {dayTasks.length > 0 && (
                        <div className="mt-1 flex w-full flex-col gap-0.5">
                          {dayTasks.slice(0, viewMode === "week" ? 5 : 2).map((t) => (
                            <div
                              key={t.id}
                              className={
                                "truncate rounded px-1 py-0.5 text-[9px] leading-tight " +
                                (t.completed ? "text-[#555] line-through" : "text-[#ccc]")
                              }
                              style={{ backgroundColor: t.completed ? "#2a2a2a" : accent + "15" }}
                            >
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > (viewMode === "week" ? 5 : 2) && (
                            <span className="text-[9px] text-[#666]">
                              +{dayTasks.length - (viewMode === "week" ? 5 : 2)} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Heat indicator */}
                      {heat > 0 && (
                        <div
                          className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: accent, opacity: heat * 0.33 }}
                        />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Agenda sidebar */}
        <div className="flex w-[320px] shrink-0 flex-col border-l border-[#2a2a2a] bg-[#1a1a1a]">
          {/* Selected date header */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-[#e0e0e0]">
                {format(selected, "EEEE")}
              </h3>
              {isToday(selected) && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: accent + "20", color: accent }}
                >
                  Today
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#888]">{format(selected, "MMMM d, yyyy")}</p>
            {selectedTasks.length > 0 && (
              <p className="mt-1 text-[11px] text-[#555]">
                {selectedCompleted}/{selectedTasks.length} completed
              </p>
            )}
          </div>

          {/* Tasks for selected day */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {!loaded ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#444] border-t-[#888]" />
              </div>
            ) : selectedTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#262626] to-[#1a1a1a] shadow-md ring-1 ring-[#333]">
                    <CalendarDays className="h-7 w-7 text-[#444]" />
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full"
                    style={{ backgroundColor: accent + "40" }}
                  />
                </div>
                <p className="text-[14px] font-medium text-[#666]">No agenda</p>
                <p className="mt-1 text-[12px] text-[#444]">Add a task below</p>
              </motion.div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {selectedTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-[#262626]"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-90"
                        style={{
                          borderColor: task.completed ? accent : "#555",
                          backgroundColor: task.completed ? accent : "transparent",
                        }}
                      >
                        {task.completed && (
                          <svg
                            viewBox="0 0 16 16"
                            className="h-2.5 w-2.5"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 8 L7 12 L13 4" />
                          </svg>
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <span
                          className={
                            "block truncate text-[12px] " +
                            (task.completed ? "text-[#555] line-through" : "text-[#d0d0d0]")
                          }
                        >
                          {task.title}
                        </span>
                        {task.priority !== "none" && (
                          <span
                            className="text-[10px]"
                            style={{
                              color:
                                task.priority === "urgent"
                                  ? "#ef4444"
                                  : task.priority === "high"
                                    ? "#f97316"
                                    : task.priority === "medium"
                                      ? "#eab308"
                                      : "#22c55e",
                            }}
                          >
                            {task.priority}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded p-0.5 text-[#444] opacity-0 transition-all hover:text-[#ef4444] group-hover:opacity-100 active:scale-90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Quick add for selected day */}
          <div className="border-t border-[#2a2a2a] p-4">
            <div className="flex items-center gap-2 rounded-lg bg-[#222] px-3 py-2 ring-1 ring-[#333] transition-all focus-within:ring-[#555]">
              <button
                onClick={handleAdd}
                className="rounded p-0.5 text-[#666] transition-colors hover:text-[#e0e0e0] active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
                placeholder={`Add for ${format(selected, "MMM d")}...`}
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#e0e0e0] outline-none placeholder:text-[#444]"
              />
            </div>
          </div>

          {/* Month mini stats */}
          {showMiniStats && monthStats.total > 0 && (
            <div className="border-t border-[#2a2a2a] px-5 py-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                {format(cursor, "MMMM")} Overview
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[#222] p-2 text-center">
                  <div className="text-[14px] font-bold text-[#e0e0e0]">{monthStats.total}</div>
                  <div className="text-[9px] text-[#666]">Total</div>
                </div>
                <div className="rounded-lg bg-[#222] p-2 text-center">
                  <div className="text-[14px] font-bold" style={{ color: accent }}>
                    {monthStats.completed}
                  </div>
                  <div className="text-[9px] text-[#666]">Done</div>
                </div>
                <div className="rounded-lg bg-[#222] p-2 text-center">
                  <div className="text-[14px] font-bold text-[#ef4444]">{monthStats.overdue}</div>
                  <div className="text-[9px] text-[#666]">Late</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
