import { get, set, del } from "idb-keyval";

export interface DocVersion {
  id: string;
  json: unknown;
  markdown: string;
  savedAt: number;
}

const MAX_VERSIONS = 10;
const THROTTLE_MS = 30000;

function historyKey(docId: string) {
  return `opencraft:doc:${docId}:history`;
}

export async function getHistory(docId: string): Promise<DocVersion[]> {
  return (await get<DocVersion[]>(historyKey(docId))) ?? [];
}

export async function addHistorySnapshot(
  docId: string,
  json: unknown,
  markdown: string,
): Promise<void> {
  const history = await getHistory(docId);
  const lastEntry = history[history.length - 1];
  if (lastEntry && Date.now() - lastEntry.savedAt < THROTTLE_MS) return;
  const version: DocVersion = {
    id: Date.now().toString(36),
    json,
    markdown,
    savedAt: Date.now(),
  };
  await set(historyKey(docId), [...history, version].slice(-MAX_VERSIONS));
}

export async function clearHistory(docId: string): Promise<void> {
  await del(historyKey(docId));
}
