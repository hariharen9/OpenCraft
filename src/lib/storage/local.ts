import { get, set, del } from "idb-keyval";
import type { DocumentPayload, StorageProvider } from "./types";

const key = (id: string) => `opencraft:doc:${id}`;

export const LocalStorageProvider: StorageProvider = {
  async load(id) {
    const v = await get<DocumentPayload>(key(id));
    return v ?? null;
  },
  async save(id, payload) {
    await set(key(id), payload);
  },
  async remove(id) {
    await del(key(id));
  },
};
