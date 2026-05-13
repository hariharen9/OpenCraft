import { get, set, del } from "idb-keyval";
import type { DocumentPayload, StorageProvider } from "./types";
import { useWorkspaceStore } from "@/store/workspace-store";

const key = (id: string) => `opencraft:doc:${id}`;

function getSafeFilename(id: string): string {
  const docMeta = useWorkspaceStore.getState().docs.find(d => d.id === id);
  const title = docMeta?.title?.trim() || id.replace(/:/g, '_');
  return `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${id.split(':')[1] || id}`;
}

export const LocalStorageProvider: StorageProvider = {
  async load(id) {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const mapping = await window.electronAPI.readFile(`_map_${id.replace(/:/g, '_')}.json`);
        if (mapping) {
          const jsonRaw = await window.electronAPI.readFile(`${mapping}.json`);
          if (jsonRaw) return JSON.parse(jsonRaw);
        }
      } catch {
        // Fall back to IDB
      }
    }
    const v = await get<DocumentPayload>(key(id));
    return v ?? null;
  },
  async save(id, payload) {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const filename = getSafeFilename(id);
      await window.electronAPI.writeFile(`${filename}.md`, payload.markdown || "");
      await window.electronAPI.writeFile(`${filename}.json`, JSON.stringify(payload));
      await window.electronAPI.writeFile(`_map_${id.replace(/:/g, '_')}.json`, filename);
    }
    await set(key(id), payload);
  },
  async remove(id) {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const mapping = await window.electronAPI.readFile(`_map_${id.replace(/:/g, '_')}.json`);
        if (mapping) {
          await window.electronAPI.deleteFile(`${mapping}.md`);
          await window.electronAPI.deleteFile(`${mapping}.json`);
          await window.electronAPI.deleteFile(`_map_${id.replace(/:/g, '_')}.json`);
        }
      } catch {}
    }
    await del(key(id));
  },
};
