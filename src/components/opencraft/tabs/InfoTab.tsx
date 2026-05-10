import { useMemo, useState, useRef } from "react";
import {
  Calendar,
  User,
  ChevronDown,
  FolderInput,
  Copy,
  Star,
  Clock,
  Trash2,
  Inbox,
  Tag,
  Folder as FolderIcon,
  Circle,
  Pencil,
  Maximize2,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { toast } from "sonner";
import { LocalStorageProvider } from "@/lib/storage/local";
import { getHistory } from "@/lib/storage/history";
import type { DocVersion } from "@/lib/storage/history";
import { Select } from "@/components/ui/custom-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "Just Now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return new Date(ts).toLocaleDateString();
}

export function InfoTab() {
  const editor = useEditorStore((s) => s.editor);
  const tick = useEditorStore((s) => s.tick);

  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const docs = useWorkspaceStore((s) => s.docs);
  const updateDocMeta = useWorkspaceStore((s) => s.updateDocMeta);
  const deleteDoc = useWorkspaceStore((s) => s.deleteDoc);
  const createTag = useWorkspaceStore((s) => s.createTag);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId);
  const folders = activeWs?.folders ?? [];
  const wsTags = activeWs?.tags ?? [];

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null;
  const createdAt = activeDoc?.createdAt ?? Date.now();
  const updatedAt = activeDoc?.updatedAt ?? Date.now();
  const starred = activeDoc?.starred ?? false;
  const folder = activeDoc?.folder ?? "root";
  const tags = activeDoc?.tags ?? [];
  const docTitle = activeDoc?.title ?? "";

  const [section, setSection] = useState<"info" | "actions">("info");
  const [tagInput, setTagInput] = useState("");

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Dialogs
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyVersions, setHistoryVersions] = useState<DocVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const currentFolder = folders.find(f => f.id === folder);

  const startEditTitle = () => {
    setTitleDraft(docTitle);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 10);
  };

  const saveTitle = () => {
    const trimmed = titleDraft.trim();
    if (activeDocId && trimmed) {
      updateDocMeta(activeDocId, { title: trimmed, updatedAt: Date.now() });
    }
    setEditingTitle(false);
  };

  const toggleStar = () => {
    if (activeDocId) {
      updateDocMeta(activeDocId, { starred: !starred, updatedAt: Date.now() });
    }
  };

  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const inspectorOpen = useEditorStore((s) => s.inspectorOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const toggleInspector = useEditorStore((s) => s.toggleInspector);
  const setPresenting = useEditorStore((s) => s.setPresenting);

  const present = () => {
    if (!editor) {
      toast.error("No editor available");
      return;
    }
    if (!document.fullscreenElement) {
      if (sidebarOpen) toggleSidebar();
      if (inspectorOpen) toggleInspector();
      setPresenting(true);
      document.documentElement.requestFullscreen().catch(() => {
        toast.error("Fullscreen not supported");
      });
      toast.success("Presentation mode activated");
    } else {
      setPresenting(false);
      document.exitFullscreen();
    }
  };

  const handleDuplicate = async () => {
    if (!activeDocId || !activeWorkspaceId || !activeDoc) {
      toast.error("No document selected");
      return;
    }

    const content = await LocalStorageProvider.load(activeDocId);
    const newId = useWorkspaceStore.getState().createDoc(activeWorkspaceId, activeDoc.folder);
    await LocalStorageProvider.save(newId, content ?? { json: {}, markdown: "", updatedAt: Date.now() });
    updateDocMeta(newId, {
      title: activeDoc.title ? `${activeDoc.title} (copy)` : "",
      starred: false,
      tags: [...activeDoc.tags],
      font: activeDoc.font,
      fontSize: activeDoc.fontSize,
      pageBg: activeDoc.pageBg,
      widePage: activeDoc.widePage,
      coverImage: activeDoc.coverImage,
      separator: activeDoc.separator,
    });

    toast.success("Document duplicated");
  };

  const openHistory = async () => {
    if (!activeDocId) return;
    setHistoryLoading(true);
    setHistoryDialogOpen(true);
    const versions = await getHistory(activeDocId);
    setHistoryVersions(versions);
    setHistoryLoading(false);
  };

  const restoreVersion = async (version: DocVersion) => {
    if (!activeDocId || !editor) return;
    try {
      editor.commands.setContent(version.json as never);
      const md = (editor.storage as any).markdown?.getMarkdown?.() ?? "";
      await LocalStorageProvider.save(activeDocId, { json: version.json, markdown: md, updatedAt: Date.now() });
      toast.success(`Restored version from ${timeAgo(version.savedAt)}`);
      setHistoryDialogOpen(false);
    } catch {
      toast.error("Failed to restore version");
    }
  };

  const moveTo = (folderId: string) => {
    if (activeDocId) {
      updateDocMeta(activeDocId, { folder: folderId, updatedAt: Date.now() });
      toast.success(`Moved to ${folderId === "root" ? "No Folder" : (folders.find(f => f.id === folderId)?.name ?? "folder")}`);
      setMoveDialogOpen(false);
    }
  };

  const stats = useMemo(() => {
    if (!editor) return { words: 0, chars: 0, blocks: 0, minutes: 0, paras: 0 };
    const text = editor.getText();
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const blocks = editor.state.doc.childCount;
    const minutes = Math.max(1, Math.ceil(words / 220));
    const paras = editor.state.doc.content.size;
    return { words, chars, blocks, minutes, paras };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, tick]);

  return (
    <div className="space-y-5">
      {/* Pill toggle */}
      <div className="flex rounded-full bg-[#262626] p-0.5 text-[12px]">
        <button
          onClick={() => setSection("info")}
          className={
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition-colors " +
            (section === "info" ? "bg-[#1a1a1a] text-white" : "text-[#888]")
          }
        >
          <Circle className="h-2.5 w-2.5 fill-current" />
          Page Info
        </button>
        <button
          onClick={() => setSection("actions")}
          className={
            "flex-1 rounded-full px-3 py-1.5 transition-colors " +
            (section === "actions" ? "bg-[#1a1a1a] text-white" : "text-[#888]")
          }
        >
          Actions
        </button>
      </div>

      {/* ─── Page Info ─── */}
      {section === "info" && (
        <>
          {/* Editable title */}
          <div>
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") { setEditingTitle(false); }
                }}
                className="w-full rounded-md bg-[#1f1f1f] px-2 py-1 text-[15px] font-semibold text-[#e8e8e8] ring-1 ring-[#444] transition-colors focus:bg-[#2a2a2a] focus:outline-none focus:ring-[#666]"
              />
            ) : (
              <button
                onClick={startEditTitle}
                className="group flex w-full items-center justify-between rounded-md px-1 text-left text-[15px] font-semibold text-[#e8e8e8] hover:bg-[#262626]"
              >
                <span className="truncate">{docTitle || "Untitled"}</span>
                <Pencil className="h-3 w-3 shrink-0 text-[#555] opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Path breadcrumb */}
          {activeWs && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#666]">
              <span>{activeWs.icon} {activeWs.name}</span>
              <ChevronDown className="h-2.5 w-2.5 -rotate-90" />
              <span>{currentFolder?.name ?? "No Folder"}</span>
              <ChevronDown className="h-2.5 w-2.5 -rotate-90" />
              <span className="max-w-[100px] truncate text-[#999]">{docTitle || "Untitled"}</span>
            </div>
          )}

          <Section label="Properties">
            <PropRow icon={<Calendar className="h-3.5 w-3.5" />} label="Created" value={timeAgo(createdAt)} />
            <PropRow icon={<Calendar className="h-3.5 w-3.5" />} label="Updated" value={timeAgo(updatedAt)} />
            <PropRow icon={<User className="h-3.5 w-3.5" />} label="Author" value="OpenCraft User" />
          </Section>

          <Section label="Organization">
            <div className="flex items-center justify-between py-1.5">
              <span className="flex items-center gap-2 text-[12px] text-[#888]">
                <FolderIcon className="h-3.5 w-3.5" /> Folder
              </span>
              <div className="w-[120px]">
                <Select
                  value={folder}
                  onChange={(val) => { if (activeDocId) updateDocMeta(activeDocId, { folder: val }); }}
                  options={[
                    { value: "root", label: "No Folder" },
                    ...folders.map(f => ({ value: f.id, label: f.name }))
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 py-1.5">
              <span className="flex items-center gap-2 text-[12px] text-[#888]">
                <Tag className="h-3.5 w-3.5" /> Tags
              </span>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {tags.map(tagId => {
                    const tag = wsTags.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span key={tag.id} className="flex items-center gap-1 rounded bg-[#333] pl-1.5 pr-1 py-0.5 text-[10px] text-[#ddd]">
                        {tag.name}
                        <button
                          onClick={() => {
                            if (activeDocId) updateDocMeta(activeDocId, { tags: tags.filter(t => t !== tag.id) });
                          }}
                          className="rounded hover:bg-[#555] text-[#aaa] hover:text-white p-0.5"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="relative mt-0.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      const lowerInput = tagInput.trim().toLowerCase();
                      const existingTag = wsTags.find(t => t.name.toLowerCase() === lowerInput);
                      let tagIdToAdd = existingTag?.id;
                      if (!existingTag) {
                        tagIdToAdd = createTag(activeWorkspaceId, tagInput.trim());
                      }
                      if (tagIdToAdd && activeDocId && !tags.includes(tagIdToAdd)) {
                        updateDocMeta(activeDocId, { tags: [...tags, tagIdToAdd] });
                      }
                      setTagInput("");
                    }
                  }}
                  placeholder="Type a tag & press Enter..."
                  className="w-full rounded bg-[#1f1f1f] px-2 py-1.5 text-[11px] text-[#ccc] ring-1 ring-[#333] transition-colors focus:bg-[#2a2a2a] focus:outline-none focus:ring-[#555]"
                />
              </div>

              {wsTags.filter(t => !tags.includes(t.id)).length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {wsTags.filter(t => !tags.includes(t.id)).map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (activeDocId) updateDocMeta(activeDocId, { tags: [...tags, t.id] });
                      }}
                      className="rounded bg-[#2a2a2a] px-1.5 py-0.5 text-[9px] text-[#888] hover:bg-[#333] hover:text-[#ccc]"
                    >
                      +{t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Section>

          <Section label="Stats">
            <PropRow label="Words" value={stats.words} />
            <PropRow label="Characters" value={stats.chars} />
            <PropRow label="Blocks" value={stats.blocks} />
            <PropRow label="Reading time" value={`${stats.minutes} min`} />
          </Section>
        </>
      )}

      {/* ─── Actions ─── */}
      {section === "actions" && (
        <Section label="Actions">
          <ActionRow icon={<Maximize2 className="h-3.5 w-3.5" />} label="Present" onClick={present} />
          <ActionRow icon={<FolderInput className="h-3.5 w-3.5" />} label="Move to..." onClick={() => setMoveDialogOpen(true)} />
          <ActionRow icon={<Copy className="h-3.5 w-3.5" />} label="Duplicate" onClick={handleDuplicate} />
          <ActionRow
            icon={<Star className={"h-3.5 w-3.5 " + (starred ? "fill-current text-yellow-400" : "")} />}
            label={starred ? "Unstar Document" : "Star Document"}
            onClick={toggleStar}
          />
          <ActionRow icon={<Clock className="h-3.5 w-3.5" />} label="History" onClick={openHistory} />
          <ActionRow
            icon={<Trash2 className="h-3.5 w-3.5" />}
            label="Delete"
            destructive
            onClick={() => { if (activeDocId) deleteDoc(activeDocId); }}
          />
        </Section>
      )}

      {/* ─── Move Dialog ─── */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="border-[#333] bg-[#1a1a1a] text-white sm:max-w-[260px]">
          <DialogHeader>
            <DialogTitle className="text-[14px] text-[#e0e0e0]">Move document to...</DialogTitle>
          </DialogHeader>
          <div className="space-y-0.5 pt-2">
            <button
              onClick={() => moveTo("root")}
              className={"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-[#262626] " + (folder === "root" ? "bg-[#262626] text-white" : "text-[#aaa]")}
            >
              <Inbox className="h-3.5 w-3.5" />
              No Folder
            </button>
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => moveTo(f.id)}
                className={"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-[#262626] " + (folder === f.id ? "bg-[#262626] text-white" : "text-[#aaa]")}
              >
                <FolderIcon className="h-3.5 w-3.5" />
                {f.name}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── History Dialog ─── */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="border-[#333] bg-[#1a1a1a] text-white sm:max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="text-[14px] text-[#e0e0e0]">Document History</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8 text-[13px] text-[#666]">Loading...</div>
            ) : historyVersions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg bg-[#222] px-4 py-6 text-center">
                <Clock className="h-8 w-8 text-[#555]" />
                <p className="text-[13px] text-[#888]">No history yet</p>
                <p className="text-[11px] text-[#555]">Versions are saved automatically as you edit (up to 10).</p>
              </div>
            ) : (
              <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
                {[...historyVersions].reverse().map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between rounded-md bg-[#222] px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-[#ccc]">Version {historyVersions.length - i}</span>
                      <span className="text-[10px] text-[#666]">{timeAgo(v.savedAt)}</span>
                    </div>
                    <button
                      onClick={() => restoreVersion(v)}
                      className="rounded-md bg-[#333] px-2.5 py-1 text-[11px] text-[#bbb] transition-colors hover:bg-[#444] hover:text-white active:scale-95"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-[#2a2a2a] pt-2 text-[10px] text-[#555]">
              Last 10 saves are kept. New versions are created automatically.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#777]">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function PropRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-md px-1 py-1.5 text-[13px]">
      <span className="flex items-center gap-2 text-[#888]">
        {icon}
        {label}:
      </span>
      <span className="font-medium text-[#e0e0e0]">{value}</span>
    </div>
  );
}

function ActionRow({
  icon,
  label,
  destructive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  destructive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-[13px] hover:bg-[#262626] active:scale-[0.99] " +
        (destructive ? "text-red-400" : "text-[#d0d0d0]")
      }
    >
      <span className={destructive ? "text-red-400" : "text-[#9a9a9a]"}>{icon}</span>
      {label}
    </button>
  );
}
