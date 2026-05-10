import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  Trash2,
  Flag,
  Circle,
  CheckCircle2,
  Clock,
  Tag,
  StickyNote,
  Sparkles,
  ListFilter,
  MoreHorizontal,
  ArrowUpDown,
  GripVertical,
  Inbox,
  Repeat,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore } from "@/store/editor-store";
import { useTasksStore, type Task, type Priority } from "@/store/tasks-store";
import { useSettingsStore } from "@/store/settings-store";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  parseISO,
  isValid,
  isThisWeek,
} from "date-fns";
import { Select } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/custom-date-picker";

type Filter = "all" | "today" | "upcoming" | "completed" | "overdue";
type SortMode = "manual" | "priority" | "dueDate" | "created";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  urgent: { label: "Urgent", color: "#ef4444", icon: "🔴" },
  high: { label: "High", color: "#f97316", icon: "🟠" },
  medium: { label: "Medium", color: "#eab308", icon: "🟡" },
  low: { label: "Low", color: "#22c55e", icon: "🟢" },
  none: { label: "None", color: "#555", icon: "" },
};

const CATEGORIES = ["Inbox", "Work", "Personal", "Ideas", "Errands"];

export function TasksView() {
  const accent = useEditorStore((s) => s.accentColor);
  const {
    tasks,
    loaded,
    loadTasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    clearCompleted,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    reorderTasks,
  } = useTasksStore();
  const { syncCalendarTasks, loadSettings } = useSettingsStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortMode>("manual");
  const [input, setInput] = useState("");
  const [dueInput, setDueInput] = useState("");
  const [priorityInput, setPriorityInput] = useState<Priority>("none");
  const [categoryInput, setCategoryInput] = useState("Inbox");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTasks();
    loadSettings();
  }, [loadTasks, loadSettings]);
  useEffect(() => {
    if (showAddForm) inputRef.current?.focus();
  }, [showAddForm]);

  const filtered = useMemo(() => {
    let result = tasks.filter((t) => {
      if (filter === "today") {
        if (!t.dueDate) return false;
        const d = parseISO(t.dueDate);
        return isValid(d) && isToday(d) && !t.completed;
      }
      if (filter === "upcoming") {
        if (t.completed) return false;
        if (!t.dueDate) return false;
        const d = parseISO(t.dueDate);
        return isValid(d) && isFuture(d);
      }
      if (filter === "overdue") {
        if (t.completed) return false;
        if (!t.dueDate) return false;
        const d = parseISO(t.dueDate);
        return isValid(d) && isPast(d) && !isToday(d);
      }
      if (filter === "completed") return t.completed;
      return true;
    });

    if (sort === "priority") {
      const order: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
      result = [...result].sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sort === "dueDate") {
      result = [...result].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (sort === "created") {
      result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [tasks, filter, sort]);

  const handleAdd = () => {
    const val = input.trim();
    if (!val) return;
    addTask(val, dueInput || undefined, priorityInput, categoryInput);
    setInput("");
    setDueInput("");
    setPriorityInput("none");
    inputRef.current?.focus();
  };

  const incompleteCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const todayCount = tasks.filter(
    (t) =>
      t.dueDate && isValid(parseISO(t.dueDate)) && isToday(parseISO(t.dueDate)) && !t.completed,
  ).length;
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const d = parseISO(t.dueDate);
    return isValid(d) && isPast(d) && !isToday(d);
  }).length;

  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: tasks.length },
    { key: "today", label: "Today", count: todayCount },
    { key: "upcoming", label: "Upcoming" },
    { key: "overdue", label: "Overdue", count: overdueCount },
    { key: "completed", label: "Done", count: completedCount },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-[#1f1f1f]">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-8 pt-6 pb-2">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#e8e8e8]">Tasks</h1>
          <p className="mt-0.5 text-[12px] text-[#666]">
            {incompleteCount} remaining · {completedCount} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#ccc]"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </button>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg bg-[#262626] py-1 shadow-xl ring-1 ring-[#333]"
              >
                {(["manual", "priority", "dueDate", "created"] as SortMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSort(m);
                      setShowSortMenu(false);
                    }}
                    className={
                      "flex w-full items-center px-3 py-1.5 text-[12px] transition-colors hover:bg-[#333] " +
                      (sort === m ? "text-[#e0e0e0]" : "text-[#888]")
                    }
                  >
                    {m === "manual"
                      ? "Manual"
                      : m === "priority"
                        ? "Priority"
                        : m === "dueDate"
                          ? "Due Date"
                          : "Created"}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#ef4444]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear done
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white transition-all active:scale-95"
            style={{ backgroundColor: accent }}
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </button>
        </div>
      </header>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="mx-8 mt-2 mb-1">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: accent }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] font-medium tabular-nums" style={{ color: accent }}>
              {progressPct}%
            </span>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 px-8 py-3">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all active:scale-95 " +
              (filter === f.key
                ? "bg-[#333] text-[#e0e0e0] shadow-sm"
                : "text-[#666] hover:bg-[#262626] hover:text-[#aaa]")
            }
          >
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <span
                className={
                  "rounded-full px-1.5 py-0.5 text-[10px] " +
                  (filter === f.key ? "bg-[#444] text-[#ccc]" : "bg-[#2a2a2a] text-[#777]")
                }
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add task form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-8"
          >
            <div className="mb-4 rounded-xl bg-[#262626] p-4 ring-1 ring-[#333]">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") setShowAddForm(false);
                }}
                placeholder="What needs to be done?"
                className="w-full bg-transparent text-[14px] text-[#e0e0e0] outline-none placeholder:text-[#555]"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="w-[120px]">
                  <DatePicker
                    value={dueInput || null}
                    onChange={(val) => setDueInput(val || "")}
                    placeholder="Due Date"
                  />
                </div>
                <div className="w-[100px]">
                  <Select
                    value={priorityInput}
                    onChange={(val) => setPriorityInput(val as Priority)}
                    options={(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => ({
                      value: p,
                      label: PRIORITY_CONFIG[p].label,
                      icon: <span className="mr-1">{PRIORITY_CONFIG[p].icon}</span>,
                    }))}
                  />
                </div>
                <div className="w-[100px]">
                  <Select
                    value={categoryInput}
                    onChange={setCategoryInput}
                    options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                  />
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => setShowAddForm(false)}
                  className="rounded-md px-3 py-1 text-[12px] text-[#888] hover:bg-[#333]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="rounded-md px-3 py-1 text-[12px] font-medium text-white active:scale-95"
                  style={{ backgroundColor: accent }}
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-6">
        {!loaded ? (
          <div className="flex items-center justify-center pt-20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#444] border-t-[#888]" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center pt-16"
          >
            <div className="relative mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#262626] to-[#1a1a1a] shadow-lg ring-1 ring-[#333]">
                {filter === "all" && <Inbox className="h-9 w-9 text-[#444]" />}
                {filter === "today" && <Clock className="h-9 w-9 text-[#444]" />}
                {filter === "upcoming" && <CalendarIcon className="h-9 w-9 text-[#444]" />}
                {filter === "overdue" && <Sparkles className="h-9 w-9 text-emerald-800" />}
                {filter === "completed" && <CheckCircle2 className="h-9 w-9 text-[#444]" />}
              </div>
              <div
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full"
                style={{ backgroundColor: accent + "30" }}
              />
            </div>
            <p className="text-[15px] font-semibold text-[#666]">
              {filter === "all" && "No tasks yet"}
              {filter === "today" && "Nothing due today"}
              {filter === "upcoming" && "No upcoming tasks"}
              {filter === "overdue" && "Nothing overdue — nice!"}
              {filter === "completed" && "No completed tasks"}
            </p>
            <p className="mt-1.5 text-[13px] text-[#444]">
              {filter === "all"
                ? "Hit the button above to create your first task"
                : "Try switching to a different filter"}
            </p>
            {filter === "all" && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-5 flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white transition-all active:scale-95"
                style={{ backgroundColor: accent }}
              >
                <Plus className="h-4 w-4" />
                Create a task
              </button>
            )}
          </motion.div>
        ) : (
          <DndTaskList
            tasks={filtered}
            sort={sort}
            accent={accent}
            expandedTask={expandedTask}
            setExpandedTask={setExpandedTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            editTask={editTask}
            addSubtask={addSubtask}
            toggleSubtask={toggleSubtask}
            deleteSubtask={deleteSubtask}
            reorderTasks={reorderTasks}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Task Row ─── */
function TaskRow({
  task,
  accent,
  expanded,
  onToggleExpand,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: {
  task: Task;
  accent: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}) {
  const [subInput, setSubInput] = useState("");
  const subRef = useRef<HTMLInputElement>(null);
  const pConfig = PRIORITY_CONFIG[task.priority];

  const dueLabel = task.dueDate
    ? (() => {
        const d = parseISO(task.dueDate);
        if (!isValid(d)) return null;
        if (isToday(d)) return "Today";
        if (isTomorrow(d)) return "Tomorrow";
        if (isPast(d) && !task.completed) return format(d, "MMM d") + " ⚠";
        return format(d, "MMM d");
      })()
    : null;

  const isOverdue =
    task.dueDate &&
    !task.completed &&
    (() => {
      const d = parseISO(task.dueDate!);
      return isValid(d) && isPast(d) && !isToday(d);
    })();

  const subtaskProgress =
    task.subtasks.length > 0
      ? Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100)
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={
        "rounded-xl transition-colors " +
        (expanded ? "bg-[#262626] ring-1 ring-[#333]" : "hover:bg-[#242424]")
      }
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-90"
          style={{
            borderColor: task.completed
              ? accent
              : pConfig.color !== "#555"
                ? pConfig.color
                : "#555",
            backgroundColor: task.completed ? accent : "transparent",
          }}
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
                stroke="white"
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

        {/* Content */}
        <button onClick={onToggleExpand} className="min-w-0 flex-1 text-left">
          <span
            className={
              "block truncate text-[13px] transition-all " +
              (task.completed ? "text-[#555] line-through" : "text-[#d8d8d8]")
            }
          >
            {task.title}
          </span>
          {(task.subtasks.length > 0 || task.notes) && (
            <span className="mt-0.5 flex items-center gap-2 text-[11px] text-[#555]">
              {task.subtasks.length > 0 && (
                <span>
                  {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                </span>
              )}
              {task.notes && <StickyNote className="h-3 w-3" />}
            </span>
          )}
        </button>

        {/* Meta badges */}
        <div className="flex shrink-0 items-center gap-1.5">
          {task.priority !== "none" && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: pConfig.color + "18", color: pConfig.color }}
            >
              {pConfig.label}
            </span>
          )}
          {task.category !== "Inbox" && (
            <span className="rounded-md bg-[#2a2a2a] px-1.5 py-0.5 text-[10px] text-[#777]">
              {task.category}
            </span>
          )}
          {dueLabel && (
            <span
              className={
                "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] " +
                (isOverdue ? "bg-[#ef444418] text-[#ef4444]" : "bg-[#2a2a2a] text-[#888]")
              }
            >
              <CalendarIcon className="h-2.5 w-2.5" />
              {dueLabel}
            </span>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="rounded p-1 text-[#444] opacity-0 transition-all hover:text-[#ef4444] group-hover:opacity-100 [div:hover>&]:opacity-100 active:scale-90"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-[#333] px-4 py-3">
              {/* Subtask progress */}
              {task.subtasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-[#333]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: accent }}
                      animate={{ width: `${subtaskProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] text-[#666]">{subtaskProgress}%</span>
                </div>
              )}

              {/* Subtasks */}
              {task.subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 pl-2">
                  <button
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-[#555] transition-colors hover:border-[#888]"
                    style={
                      st.completed ? { backgroundColor: accent, borderColor: accent } : undefined
                    }
                  >
                    {st.completed && (
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
                  <span
                    className={
                      "flex-1 text-[12px] " +
                      (st.completed ? "text-[#555] line-through" : "text-[#bbb]")
                    }
                  >
                    {st.title}
                  </span>
                  <button
                    onClick={() => onDeleteSubtask(task.id, st.id)}
                    className="text-[#444] hover:text-[#ef4444]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Add subtask */}
              <div className="flex items-center gap-2 pl-2">
                <Plus className="h-3.5 w-3.5 text-[#555]" />
                <input
                  ref={subRef}
                  value={subInput}
                  onChange={(e) => setSubInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && subInput.trim()) {
                      onAddSubtask(task.id, subInput);
                      setSubInput("");
                    }
                  }}
                  placeholder="Add subtask..."
                  className="flex-1 bg-transparent text-[12px] text-[#ccc] outline-none placeholder:text-[#444]"
                />
              </div>

              {/* Notes */}
              <textarea
                value={task.notes}
                onChange={(e) => onEdit(task.id, { notes: e.target.value })}
                placeholder="Add notes..."
                rows={2}
                className="w-full resize-none rounded-lg bg-[#1f1f1f] px-3 py-2 text-[12px] text-[#bbb] outline-none ring-1 ring-[#333] placeholder:text-[#444] focus:ring-[#555]"
              />

              {/* Quick edit row */}
              <div className="flex flex-wrap gap-2">
                <div className="w-[100px]">
                  <Select
                    value={task.priority}
                    onChange={(val) => onEdit(task.id, { priority: val as Priority })}
                    options={(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => ({
                      value: p,
                      label: PRIORITY_CONFIG[p].label,
                      icon: <span className="mr-1">{PRIORITY_CONFIG[p].icon}</span>,
                    }))}
                  />
                </div>
                <div className="w-[100px]">
                  <Select
                    value={task.category}
                    onChange={(val) => onEdit(task.id, { category: val })}
                    options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                  />
                </div>
                <div className="w-[120px]">
                  <DatePicker
                    value={task.dueDate ?? null}
                    onChange={(val) => onEdit(task.id, { dueDate: val })}
                    placeholder="Due Date"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Drag and Drop Wrappers ─── */
function DndTaskList({
  tasks,
  sort,
  accent,
  expandedTask,
  setExpandedTask,
  toggleTask,
  deleteTask,
  editTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  reorderTasks,
}: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = tasks.findIndex((t: Task) => t.id === active.id);
        const newIndex = tasks.findIndex((t: Task) => t.id === over.id);
        reorderTasks(oldIndex, newIndex);
      }
    },
    [tasks, reorderTasks],
  );

  // If we are not in manual sort mode, we shouldn't allow drag-and-drop reordering
  if (sort !== "manual") {
    return (
      <motion.div layout className="space-y-1">
        <AnimatePresence mode="popLayout">
          {tasks.map((task: Task) => (
            <TaskRow
              key={task.id}
              task={task}
              accent={accent}
              expanded={expandedTask === task.id}
              onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t: Task) => t.id)} strategy={verticalListSortingStrategy}>
        <motion.div layout className="space-y-1">
          <AnimatePresence mode="popLayout">
            {tasks.map((task: Task) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                accent={accent}
                expanded={expandedTask === task.id}
                onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={editTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </SortableContext>
    </DndContext>
  );
}

function SortableTaskRow(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.task.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="absolute left-[-20px] top-4 opacity-0 transition-opacity hover:opacity-100 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-[#555]" />
      </div>
      <TaskRow {...props} />
    </div>
  );
}
