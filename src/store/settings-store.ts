import { create } from "zustand";
import { get as idbGet, set as idbSet } from "idb-keyval";

const SETTINGS_KEY = "opencraft:settings";

interface AppSettings {
  syncCalendarTasks: boolean;
}

interface SettingsStore extends AppSettings {
  loaded: boolean;
  loadSettings: () => Promise<void>;
  setSyncCalendarTasks: (v: boolean) => void;
}

function persist(settings: AppSettings) {
  idbSet(SETTINGS_KEY, settings);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  syncCalendarTasks: true,
  loaded: false,

  loadSettings: async () => {
    const stored = await idbGet<AppSettings>(SETTINGS_KEY);
    if (stored) {
      set({ ...stored, loaded: true });
    } else {
      set({ loaded: true });
    }
  },

  setSyncCalendarTasks: (v) => {
    set({ syncCalendarTasks: v });
    const { syncCalendarTasks: _, loaded: __, loadSettings: ___, setSyncCalendarTasks: ____, ...rest } = get();
    persist({ syncCalendarTasks: v, ...rest });
  },
}));
