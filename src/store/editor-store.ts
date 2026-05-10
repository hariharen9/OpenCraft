import { create } from "zustand";
import type { Editor } from "@tiptap/react";

export type FontChoice = "default" | "serif" | "mono";
export type SeparatorStyle = "line" | "dots" | "squiggle";
export type ActiveView = "home" | "editor" | "tasks" | "calendar";

interface EditorStore {
  editor: Editor | null;
  setEditor: (e: Editor | null) => void;
  tick: number;
  bump: () => void;
  pageBg: string;
  setPageBg: (c: string) => void;
  textColor: string;
  setTextColor: (c: string) => void;
  font: FontChoice;
  setFont: (f: FontChoice) => void;
  fontSize: "Ss" | "00" | "Rr";
  setFontSize: (s: "Ss" | "00" | "Rr") => void;
  separator: SeparatorStyle;
  setSeparator: (s: SeparatorStyle) => void;
  widePage: boolean;
  setWidePage: (b: boolean) => void;
  coverImage: string | null;
  setCoverImage: (c: string | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  inspectorOpen: boolean;
  toggleInspector: () => void;
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  accentColor: string;
  setAccentColor: (c: string) => void;
  presenting: boolean;
  setPresenting: (v: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
  toggleCommandPalette: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  editor: null,
  setEditor: (e) => set({ editor: e }),
  tick: 0,
  bump: () => set((s) => ({ tick: s.tick + 1 })),
  pageBg: "#1f1f1f",
  setPageBg: (c) => set({ pageBg: c }),
  textColor: "#e0e0e0",
  setTextColor: (c) => set({ textColor: c }),
  font: "default",
  setFont: (f) => set({ font: f }),
  fontSize: "Ss",
  setFontSize: (s) => set({ fontSize: s }),
  separator: "line",
  setSeparator: (s) => set({ separator: s }),
  widePage: false,
  setWidePage: (b) => set({ widePage: b }),
  coverImage: null,
  setCoverImage: (c) => set({ coverImage: c }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  inspectorOpen: true,
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
  activeView: "home",
  setActiveView: (v) => set({ activeView: v }),
  accentColor: "#ff8a4c",
  setAccentColor: (c) => set({ accentColor: c }),
  presenting: false,
  setPresenting: (v) => set({ presenting: v }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
}));
