import { create } from "zustand";
import { get as idbGet, set as idbSet } from "idb-keyval";

const WS_KEY = "opencraft:workspaces";
const ACTIVE_WS_KEY = "opencraft:active-workspace";

export interface DocMeta {
  id: string;
  title: string;
  starred: boolean;
  createdAt: number;
  updatedAt: number;
  folder: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  docOrder: string[];
}

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  docs: DocMeta[];
  activeDocId: string | null;
  loaded: boolean;

  load: () => Promise<void>;
  persist: () => void;

  // Workspace CRUD
  addWorkspace: (name: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string) => void;

  // Document CRUD
  createDoc: (workspaceId?: string) => string;
  deleteDoc: (id: string) => void;
  setActiveDoc: (id: string | null) => void;
  updateDocMeta: (id: string, updates: Partial<Pick<DocMeta, "title" | "starred" | "updatedAt" | "folder">>) => void;
}

const DOCS_KEY = "opencraft:docs";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const DEFAULT_WS_ID = "default";

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [{ id: DEFAULT_WS_ID, name: "My Space", icon: "📋", createdAt: Date.now(), docOrder: [] }],
  activeWorkspaceId: DEFAULT_WS_ID,
  docs: [],
  activeDocId: null,
  loaded: false,

  load: async () => {
    const [workspaces, docs, activeWs] = await Promise.all([
      idbGet<Workspace[]>(WS_KEY),
      idbGet<DocMeta[]>(DOCS_KEY),
      idbGet<string>(ACTIVE_WS_KEY),
    ]);
    set({
      workspaces: workspaces && workspaces.length > 0
        ? workspaces
        : [{ id: DEFAULT_WS_ID, name: "My Space", icon: "📋", createdAt: Date.now(), docOrder: [] }],
      docs: docs ?? [],
      activeWorkspaceId: activeWs ?? DEFAULT_WS_ID,
      loaded: true,
    });
  },

  persist: () => {
    const { workspaces, docs, activeWorkspaceId } = get();
    idbSet(WS_KEY, workspaces);
    idbSet(DOCS_KEY, docs);
    idbSet(ACTIVE_WS_KEY, activeWorkspaceId);
  },

  addWorkspace: (name) => {
    const ws: Workspace = {
      id: genId(),
      name: name.trim() || "New Workspace",
      icon: "📁",
      createdAt: Date.now(),
      docOrder: [],
    };
    set((s) => ({ workspaces: [...s.workspaces, ws], activeWorkspaceId: ws.id }));
    get().persist();
  },

  renameWorkspace: (id, name) => {
    set((s) => ({
      workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, name } : w)),
    }));
    get().persist();
  },

  deleteWorkspace: (id) => {
    if (id === DEFAULT_WS_ID) return; // can't delete default
    set((s) => {
      const remaining = s.workspaces.filter((w) => w.id !== id);
      const docs = s.docs.filter((d) => {
        // docs stored with workspace prefix
        const wsPrefix = `${id}:`;
        return !d.id.startsWith(wsPrefix);
      });
      return {
        workspaces: remaining,
        docs,
        activeWorkspaceId: s.activeWorkspaceId === id ? DEFAULT_WS_ID : s.activeWorkspaceId,
        activeDocId: null,
      };
    });
    get().persist();
  },

  setActiveWorkspace: (id) => {
    set({ activeWorkspaceId: id, activeDocId: null });
    get().persist();
  },

  createDoc: (workspaceId) => {
    const wsId = workspaceId ?? get().activeWorkspaceId;
    const docId = `${wsId}:${genId()}`;
    const doc: DocMeta = {
      id: docId,
      title: "",
      starred: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      folder: "Unsorted",
    };
    set((s) => ({
      docs: [doc, ...s.docs],
      workspaces: s.workspaces.map((w) =>
        w.id === wsId ? { ...w, docOrder: [docId, ...w.docOrder] } : w,
      ),
      activeDocId: docId,
    }));
    get().persist();
    return docId;
  },

  deleteDoc: (id) => {
    set((s) => ({
      docs: s.docs.filter((d) => d.id !== id),
      workspaces: s.workspaces.map((w) => ({
        ...w,
        docOrder: w.docOrder.filter((did) => did !== id),
      })),
      activeDocId: s.activeDocId === id ? null : s.activeDocId,
    }));
    // Also remove the document content from idb
    import("idb-keyval").then(({ del }) => del(`opencraft:doc:${id}`));
    get().persist();
  },

  setActiveDoc: (id) => {
    set({ activeDocId: id });
  },

  updateDocMeta: (id, updates) => {
    set((s) => ({
      docs: s.docs.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
    get().persist();
  },
}));
