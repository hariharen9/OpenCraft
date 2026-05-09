import { useMemo, useState } from "react";
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
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";

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

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null;
  const createdAt = activeDoc?.createdAt ?? Date.now();
  const updatedAt = activeDoc?.updatedAt ?? Date.now();
  const starred = activeDoc?.starred ?? false;

  const [section, setSection] = useState<"info" | "actions">("info");
  const [reviewOpen, setReviewOpen] = useState(true);

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
                      onClick={() => alert("Local-only build — review action stubbed.")}
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

      <Section label="Location">
        <ActionRow icon={<Inbox className="h-3.5 w-3.5" />} label={activeDoc?.folder ?? "Unsorted"} />
      </Section>
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
