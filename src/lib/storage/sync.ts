/**
 * Cloud Sync Manager
 *
 * Handles bidirectional sync between local IndexedDB state and Firestore.
 *
 * Strategy:
 *  - When a user signs in, we pull their cloud state.
 *  - If the user has NO cloud data, we push the local state up (first device).
 *  - If the user HAS cloud data, we merge it with local (cloud wins for conflicts,
 *    but local-only docs are kept).
 *  - All subsequent local mutations are mirrored to Firestore in the background.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useWorkspaceStore, type Workspace, type DocMeta } from "@/store/workspace-store";
import { useTasksStore, type Task } from "@/store/tasks-store";
import { useSettingsStore } from "@/store/settings-store";

// ─── Firestore References ──────────────────────────────────────────────────
function userDoc(collection: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  return doc(db, "users", uid, "sync", collection);
}

// ─── Cloud Shape ────────────────────────────────────────────────────────────
interface CloudWorkspaceData {
  workspaces: Workspace[];
  docs: DocMeta[];
  activeWorkspaceId: string;
}

interface CloudTasksData {
  tasks: Task[];
}

interface CloudSettingsData {
  syncCalendarTasks: boolean;
}

// ─── Push (local → cloud) ──────────────────────────────────────────────────
export async function pushWorkspacesToCloud(): Promise<void> {
  const ref = userDoc("workspaces");
  if (!ref) return;
  const { workspaces, docs, activeWorkspaceId } = useWorkspaceStore.getState();
  try {
    await setDoc(ref, { workspaces, docs, activeWorkspaceId } as CloudWorkspaceData);
  } catch (e) {
    console.error("[Sync] push workspaces failed:", e);
  }
}

export async function pushTasksToCloud(): Promise<void> {
  const ref = userDoc("tasks");
  if (!ref) return;
  const { tasks } = useTasksStore.getState();
  try {
    await setDoc(ref, { tasks } as CloudTasksData);
  } catch (e) {
    console.error("[Sync] push tasks failed:", e);
  }
}

export async function pushSettingsToCloud(): Promise<void> {
  const ref = userDoc("settings");
  if (!ref) return;
  const { syncCalendarTasks } = useSettingsStore.getState();
  try {
    await setDoc(ref, { syncCalendarTasks } as CloudSettingsData);
  } catch (e) {
    console.error("[Sync] push settings failed:", e);
  }
}

// ─── Pull (cloud → local) ──────────────────────────────────────────────────
export async function pullFromCloud(): Promise<boolean> {
  const wsRef = userDoc("workspaces");
  if (!wsRef) return false;

  try {
    const snap = await getDoc(wsRef);
    if (!snap.exists()) return false; // No cloud data yet

    const cloudWs = snap.data() as CloudWorkspaceData;

    // Merge: cloud wins for shared IDs, keep local-only docs
    const localState = useWorkspaceStore.getState();
    const cloudDocIds = new Set(cloudWs.docs.map((d) => d.id));
    const localOnlyDocs = localState.docs.filter((d) => !cloudDocIds.has(d.id));
    const mergedDocs = [...cloudWs.docs, ...localOnlyDocs];

    const cloudWsIds = new Set(cloudWs.workspaces.map((w) => w.id));
    const localOnlyWs = localState.workspaces.filter((w) => !cloudWsIds.has(w.id));
    const mergedWs = [...cloudWs.workspaces, ...localOnlyWs];

    useWorkspaceStore.setState({
      workspaces: mergedWs,
      docs: mergedDocs,
      activeWorkspaceId: cloudWs.activeWorkspaceId,
    });
    useWorkspaceStore.getState().persist();

    // Tasks
    const tasksRef = userDoc("tasks");
    if (tasksRef) {
      const tasksSnap = await getDoc(tasksRef);
      if (tasksSnap.exists()) {
        const cloudTasks = tasksSnap.data() as CloudTasksData;
        useTasksStore.setState({ tasks: cloudTasks.tasks });
      }
    }

    // Settings
    const settingsRef = userDoc("settings");
    if (settingsRef) {
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const cloudSettings = settingsSnap.data() as CloudSettingsData;
        useSettingsStore.setState({ syncCalendarTasks: cloudSettings.syncCalendarTasks });
      }
    }

    return true;
  } catch (e) {
    console.error("[Sync] pull failed:", e);
    return false;
  }
}

// ─── Full Sync (called on sign-in) ─────────────────────────────────────────
export async function syncOnSignIn(): Promise<void> {
  const pulled = await pullFromCloud();
  if (!pulled) {
    // First time signing in — push local data to cloud
    await pushWorkspacesToCloud();
    await pushTasksToCloud();
    await pushSettingsToCloud();
  }
}

// ─── Debounced background push ──────────────────────────────────────────────
let wsPushTimer: ReturnType<typeof setTimeout> | null = null;
let tasksPushTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleWorkspaceSync() {
  if (!auth.currentUser) return;
  if (wsPushTimer) clearTimeout(wsPushTimer);
  wsPushTimer = setTimeout(() => pushWorkspacesToCloud(), 1500);
}

export function scheduleTasksSync() {
  if (!auth.currentUser) return;
  if (tasksPushTimer) clearTimeout(tasksPushTimer);
  tasksPushTimer = setTimeout(() => pushTasksToCloud(), 1500);
}
