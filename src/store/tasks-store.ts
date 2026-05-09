import { create } from "zustand";
import { get as idbGet, set as idbSet } from "idb-keyval";

const TASKS_KEY = "opencraft:tasks";

export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: number;
  completedAt: number | null;
  priority: Priority;
  tags: string[];
  notes: string;
  subtasks: Subtask[];
  recurrence: "none" | "daily" | "weekly" | "monthly" | null;
  category: string;
}

interface TasksStore {
  tasks: Task[];
  loaded: boolean;
  loadTasks: () => Promise<void>;
  addTask: (title: string, dueDate?: string, priority?: Priority, category?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  clearCompleted: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(tasks: Task[]) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    idbSet(TASKS_KEY, tasks);
  }, 200);
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export const useTasksStore = create<TasksStore>((set) => ({
  tasks: [],
  loaded: false,

  loadTasks: async () => {
    const stored = await idbGet<Task[]>(TASKS_KEY);
    if (stored) {
      // Migrate old tasks that may lack new fields
      const migrated = stored.map((t) => ({
        ...t,
        completedAt: t.completedAt ?? null,
        priority: t.priority ?? "none",
        tags: t.tags ?? [],
        notes: t.notes ?? "",
        subtasks: t.subtasks ?? [],
        recurrence: t.recurrence ?? null,
        category: t.category ?? "Inbox",
      }));
      set({ tasks: migrated, loaded: true });
    } else {
      set({ loaded: true });
    }
  },

  addTask: (title, dueDate, priority, category) => {
    const task: Task = {
      id: genId(),
      title: title.trim(),
      completed: false,
      dueDate: dueDate ?? null,
      createdAt: Date.now(),
      completedAt: null,
      priority: priority ?? "none",
      tags: [],
      notes: "",
      subtasks: [],
      recurrence: null,
      category: category ?? "Inbox",
    };
    set((s) => {
      const tasks = [task, ...s.tasks];
      scheduleSave(tasks);
      return { tasks };
    });
  },

  toggleTask: (id) => {
    set((s) => {
      let newTasks = s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : null,
            }
          : t,
      );

      // Recurrence: when completing a recurring task, create the next one
      const toggled = newTasks.find((t) => t.id === id);
      if (
        toggled &&
        toggled.completed &&
        toggled.recurrence &&
        toggled.recurrence !== "none" &&
        toggled.dueDate
      ) {
        const due = new Date(toggled.dueDate);
        if (!isNaN(due.getTime())) {
          let next: Date;
          if (toggled.recurrence === "daily") {
            next = new Date(due);
            next.setDate(next.getDate() + 1);
          } else if (toggled.recurrence === "weekly") {
            next = new Date(due);
            next.setDate(next.getDate() + 7);
          } else {
            next = new Date(due);
            next.setMonth(next.getMonth() + 1);
          }
          const nextDue = next.toISOString().split("T")[0];
          const recurring: Task = {
            id: genId(),
            title: toggled.title,
            completed: false,
            dueDate: nextDue,
            createdAt: Date.now(),
            completedAt: null,
            priority: toggled.priority,
            tags: [...toggled.tags],
            notes: toggled.notes,
            subtasks: toggled.subtasks.map((st) => ({
              ...st,
              id: genId(),
              completed: false,
            })),
            recurrence: toggled.recurrence,
            category: toggled.category,
          };
          newTasks = [recurring, ...newTasks];
        }
      }

      scheduleSave(newTasks);
      return { tasks: newTasks };
    });
  },

  deleteTask: (id) => {
    set((s) => {
      const tasks = s.tasks.filter((t) => t.id !== id);
      scheduleSave(tasks);
      return { tasks };
    });
  },

  editTask: (id, updates) => {
    set((s) => {
      const tasks = s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      scheduleSave(tasks);
      return { tasks };
    });
  },

  reorderTasks: (fromIndex, toIndex) => {
    set((s) => {
      const tasks = [...s.tasks];
      const [moved] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, moved);
      scheduleSave(tasks);
      return { tasks };
    });
  },

  addSubtask: (taskId, title) => {
    set((s) => {
      const tasks = s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                { id: genId(), title: title.trim(), completed: false },
              ],
            }
          : t,
      );
      scheduleSave(tasks);
      return { tasks };
    });
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((s) => {
      const tasks = s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st,
              ),
            }
          : t,
      );
      scheduleSave(tasks);
      return { tasks };
    });
  },

  deleteSubtask: (taskId, subtaskId) => {
    set((s) => {
      const tasks = s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
          : t,
      );
      scheduleSave(tasks);
      return { tasks };
    });
  },

  clearCompleted: () => {
    set((s) => {
      const tasks = s.tasks.filter((t) => !t.completed);
      scheduleSave(tasks);
      return { tasks };
    });
  },
}));
