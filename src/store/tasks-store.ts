import { create } from "zustand";
import { get as idbGet, set as idbSet } from "idb-keyval";

const TASKS_KEY = "opencraft:tasks";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: number;
}

interface TasksStore {
  tasks: Task[];
  loaded: boolean;
  loadTasks: () => Promise<void>;
  addTask: (title: string, dueDate?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Pick<Task, "title" | "dueDate">>) => void;
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
    if (stored) set({ tasks: stored, loaded: true });
    else set({ loaded: true });
  },

  addTask: (title, dueDate) => {
    const task: Task = {
      id: genId(),
      title: title.trim(),
      completed: false,
      dueDate: dueDate ?? null,
      createdAt: Date.now(),
    };
    set((s) => {
      const tasks = [task, ...s.tasks];
      scheduleSave(tasks);
      return { tasks };
    });
  },

  toggleTask: (id) => {
    set((s) => {
      const tasks = s.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      );
      scheduleSave(tasks);
      return { tasks };
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
}));
