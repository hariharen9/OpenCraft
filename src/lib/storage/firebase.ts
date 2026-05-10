import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { DocumentPayload, StorageProvider } from "./types";

function docRef(id: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  // Firestore doesn't allow slashes or colons in doc IDs — encode them
  const safeId = encodeURIComponent(id);
  return doc(db, "users", uid, "documents", safeId);
}

export const FirebaseStorageProvider: StorageProvider = {
  async load(id: string): Promise<DocumentPayload | null> {
    if (!auth.currentUser) return null;
    try {
      const snap = await getDoc(docRef(id));
      if (!snap.exists()) return null;
      return snap.data() as DocumentPayload;
    } catch (e) {
      console.error("[Firebase] load failed:", e);
      return null;
    }
  },

  async save(id: string, payload: DocumentPayload): Promise<void> {
    if (!auth.currentUser) return;
    try {
      await setDoc(docRef(id), {
        json: payload.json,
        markdown: payload.markdown,
        updatedAt: payload.updatedAt,
      });
    } catch (e) {
      console.error("[Firebase] save failed:", e);
    }
  },

  async remove(id: string): Promise<void> {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(docRef(id));
    } catch (e) {
      console.error("[Firebase] remove failed:", e);
    }
  },
};
