import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { syncOnSignIn } from "@/lib/storage/sync";

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;

  /** Call once at app startup to subscribe to auth state */
  init: () => () => void;

  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  init: () => {
    const unsub = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
      if (user) {
        syncOnSignIn().catch((e) => console.error("Sync failed on sign in:", e));
      }
    });
    return unsub;
  },

  signInWithGoogle: async () => {
    set({ error: null, loading: true });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ error: null, loading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      const msg =
        e.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : e.code === "auth/user-not-found"
            ? "No account found with this email"
            : e.code === "auth/too-many-requests"
              ? "Too many attempts. Try again later."
              : e.message;
      set({ error: msg, loading: false });
    }
  },

  signUpWithEmail: async (email, password, name) => {
    set({ error: null, loading: true });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
    } catch (e: any) {
      const msg =
        e.code === "auth/email-already-in-use"
          ? "An account with this email already exists"
          : e.code === "auth/weak-password"
            ? "Password must be at least 6 characters"
            : e.message;
      set({ error: msg, loading: false });
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
