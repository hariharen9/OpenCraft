import type { DocumentPayload, StorageProvider } from "./types";

// PHASE 2: Implement Firebase
export const FirebaseStorageProvider: StorageProvider = {
  async load(_id: string): Promise<DocumentPayload | null> {
    // PHASE 2: Implement Firebase
    return null;
  },
  async save(_id: string, _payload: DocumentPayload): Promise<void> {
    // PHASE 2: Implement Firebase
  },
  async remove(_id: string): Promise<void> {
    // PHASE 2: Implement Firebase
  },
};
