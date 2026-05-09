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
  viewedAt?: number;
  folder: string; // references folder id, "root" if none
  tags: string[]; // array of string tags
  // Per-document styling
  pageBg: string;
  font: "default" | "serif" | "mono";
  fontSize: "Ss" | "00" | "Rr";
  widePage: boolean;
  coverImage: string | null;
  separator: "line" | "dots" | "squiggle";
}

export interface Folder {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  docOrder: string[];
  folders: Folder[];
  tags: Tag[];
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

  // Folder CRUD
  createFolder: (wsId: string, name: string) => void;
  deleteFolder: (wsId: string, folderId: string) => void;
  renameFolder: (wsId: string, folderId: string, newName: string) => void;

  // Tag CRUD
  createTag: (wsId: string, name: string) => string;
  deleteTag: (wsId: string, tagId: string) => void;
  renameTag: (wsId: string, tagId: string, newName: string) => void;

  // Document CRUD
  createDoc: (workspaceId?: string, folderId?: string) => string;
  deleteDoc: (id: string) => void;
  setActiveDoc: (id: string | null) => void;
  updateDocMeta: (id: string, updates: Partial<Omit<DocMeta, "id" | "createdAt">>) => void;
}

const DOCS_KEY = "opencraft:docs";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const DEFAULT_WS_ID = "default";

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [{ id: DEFAULT_WS_ID, name: "My Space", icon: "📋", createdAt: Date.now(), docOrder: [], folders: [], tags: [] }],
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
    
    // Ensure backwards compatibility by initializing missing fields
    const migratedWorkspaces = workspaces?.map(w => ({ ...w, folders: w.folders || [], tags: w.tags || [] }));
    const migratedDocs = docs?.map(d => ({ ...d, tags: d.tags || [], folder: d.folder || "root", viewedAt: d.viewedAt || d.updatedAt }));

    set({
      workspaces: migratedWorkspaces && migratedWorkspaces.length > 0
        ? migratedWorkspaces
        : [{ id: DEFAULT_WS_ID, name: "My Space", icon: "📋", createdAt: Date.now(), docOrder: [], folders: [], tags: [] }],
      docs: migratedDocs ?? [],
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
      folders: [],
      tags: [],
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

  createFolder: (wsId, name) => {
    set((s) => ({
      workspaces: s.workspaces.map((w) => 
        w.id === wsId ? { ...w, folders: [...w.folders, { id: genId(), name: name.trim() || "New Folder" }] } : w
      )
    }));
    get().persist();
  },

  deleteFolder: (wsId, folderId) => {
    set((s) => {
      // Move all docs in this folder to root
      const newDocs = s.docs.map(d => 
        d.id.startsWith(`${wsId}:`) && d.folder === folderId ? { ...d, folder: "root" } : d
      );
      
      return {
        docs: newDocs,
        workspaces: s.workspaces.map((w) => 
          w.id === wsId ? { ...w, folders: w.folders.filter(f => f.id !== folderId) } : w
        )
      };
    });
    get().persist();
  },

  renameFolder: (wsId, folderId, newName) => {
    set((s) => ({
      workspaces: s.workspaces.map((w) => 
        w.id === wsId ? {
          ...w, 
          folders: w.folders.map(f => f.id === folderId ? { ...f, name: newName.trim() || "Unnamed" } : f)
        } : w
      )
    }));
    get().persist();
  },

  createTag: (wsId, name) => {
    const newId = genId();
    set((s) => ({
      workspaces: s.workspaces.map((w) => 
        w.id === wsId ? { ...w, tags: [...w.tags, { id: newId, name: name.trim() || "New Tag" }] } : w
      )
    }));
    get().persist();
    return newId;
  },

  deleteTag: (wsId, tagId) => {
    set((s) => {
      // Remove tag from all docs in this workspace
      const newDocs = s.docs.map(d => 
        d.id.startsWith(`${wsId}:`) ? { ...d, tags: d.tags.filter(t => t !== tagId) } : d
      );
      
      return {
        docs: newDocs,
        workspaces: s.workspaces.map((w) => 
          w.id === wsId ? { ...w, tags: w.tags.filter(t => t.id !== tagId) } : w
        )
      };
    });
    get().persist();
  },

  renameTag: (wsId, tagId, newName) => {
    set((s) => ({
      workspaces: s.workspaces.map((w) => 
        w.id === wsId ? {
          ...w, 
          tags: w.tags.map(t => t.id === tagId ? { ...t, name: newName.trim() || "Unnamed" } : t)
        } : w
      )
    }));
    get().persist();
  },

  createDoc: (workspaceId, folderId) => {
    const wsId = workspaceId ?? get().activeWorkspaceId;
    const docId = `${wsId}:${genId()}`;
    const doc: DocMeta = {
      id: docId,
      title: "",
      starred: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewedAt: Date.now(),
      folder: folderId || "root",
      tags: [],
      pageBg: "#1f1f1f",
      font: "default",
      fontSize: "Ss",
      widePage: false,
      coverImage: null,
      separator: "line"
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
    set((s) => {
      // Update viewedAt when document is opened
      const docs = id ? s.docs.map(d => d.id === id ? { ...d, viewedAt: Date.now() } : d) : s.docs;
      return { activeDocId: id, docs };
    });
    get().persist();
  },

  updateDocMeta: (id, updates) => {
    set((s) => ({
      docs: s.docs.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
    get().persist();
  },
}));
