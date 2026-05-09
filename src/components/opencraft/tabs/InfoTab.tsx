import { useMemo, useState, useEffect } from "react";
import {
  Calendar,
  User,
  ChevronDown,
  Play,
  FolderInput,
  Copy,
  Star,
  Archive,
  Trash2,
  Inbox,
  Circle,
  Tag,
  Folder as FolderIcon
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Select } from "@/components/ui/custom-select";
import { toast } from "sonner";

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

  const [section, setSection] = useState<"info" | "actions">("info");
  const [reviewOpen, setReviewOpen] = useState(true);
  const [tagInput, setTagInput] = useState("");

  const toggleStar = () => {
    if (activeDocId) updateDocMeta(activeDocId, { starred: !starred });
  };

  const stats = useMemo(() => {
    if (!editor) return { words: 0, chars: 0, blocks: 0, minutes: 0 };
    const text = editor.getText();
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const blocks = editor.state.doc.childCount;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return { words, chars, blocks, minutes };
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

      {section === "info" && (
        <>
          <div className="text-[15px] font-semibold text-[#e8e8e8]">Page Info</div>

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
              
              {/* Active Tags */}
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

              {/* Add Tag Input */}
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

              {/* Available Tags */}
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

          <div>
            <button
              onClick={() => setReviewOpen((v) => !v)}
              className="mb-2 flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#777]"
            >
              <span className="flex items-center gap-2">
                Document Review
                <span className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-1.5 py-px text-[9px] font-bold uppercase text-white">
                  New
                </span>
              </span>
              <ChevronDown
                className={"h-3.5 w-3.5 transition-transform " + (reviewOpen ? "" : "-rotate-90")}
              />
            </button>
            {reviewOpen && (
              <div className="space-y-1">
                {["Check Grammar and Spelling", "Get Feedback on Structure", "Check Tone of Voice", "Ensure Clarity"].map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => toast.info("Coming Soon", { description: "Local review actions are currently stubbed for this build." })}
                      className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-[13px] text-[#d0d0d0] hover:bg-[#262626] active:scale-[0.99]"
                    >
                      <span className="h-3.5 w-3.5 rounded-full border border-dashed border-[#666]" />
                      {t}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <Section label="Stats">
            <PropRow label="Words" value={stats.words} />
            <PropRow label="Characters" value={stats.chars} />
            <PropRow label="Blocks" value={stats.blocks} />
            <PropRow label="Reading time" value={`${stats.minutes} min`} />
          </Section>
        </>
      )}

      {section === "actions" && (
        <Section label="Actions">
          <ActionRow icon={<Play className="h-3.5 w-3.5" />} label="Present" />
          <ActionRow icon={<FolderInput className="h-3.5 w-3.5" />} label="Move to..." />
          <ActionRow icon={<Copy className="h-3.5 w-3.5" />} label="Duplicate" />
          <ActionRow
            icon={<Star className={"h-3.5 w-3.5 " + (starred ? "fill-current text-yellow-400" : "")} />}
            label={starred ? "Unstar Document" : "Star Document"}
            onClick={toggleStar}
          />
          <ActionRow icon={<Archive className="h-3.5 w-3.5" />} label="View Backups" />
          <ActionRow
            icon={<Trash2 className="h-3.5 w-3.5" />}
            label="Delete"
            destructive
            onClick={() => { if (activeDocId) deleteDoc(activeDocId); }}
          />
        </Section>
      )}
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
