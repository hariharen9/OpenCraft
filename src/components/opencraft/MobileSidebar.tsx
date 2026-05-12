import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Star,
  Folder as FolderIcon,
  Plus,
  ChevronDown,
  Download,
  Upload,
  Settings,
  PenSquare,
  Trash2,
  Search,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore, type DocMeta } from "@/store/workspace-store";
import { SettingsDialog } from "./SettingsDialog";
import { toast } from "sonner";

import opencraftLogo from "@/Assets/opencraft-white-single.png";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const editor = useEditorStore((s) => s.editor);
  const setActiveView = useEditorStore((s) => s.setActiveView);
  const accent = useEditorStore((s) => s.accentColor);

  const {
    workspaces,
    activeWorkspaceId,
    docs,
    activeDocId,
    load,
    createDoc,
    deleteDoc,
    setActiveDoc,
    updateDocMeta,
  } = useWorkspaceStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);
  const wsDocs = docs.filter((d) => d.id.startsWith(`${activeWorkspaceId}:`));
  const starredDocs = wsDocs.filter((d) => d.starred);
  const recentDocs = [...wsDocs]
    .sort((a, b) => (b.viewedAt || b.updatedAt) - (a.viewedAt || a.updatedAt))
    .slice(0, 10);

  const filteredDocs = searchQuery
    ? wsDocs.filter((d) =>
        (d.title || "Untitled").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentDocs;

  const handleOpenDoc = (docId: string) => {
    setActiveDoc(docId);
    setActiveView("editor");
    onClose();
  };

  const handleNewDoc = () => {
    const docId = createDoc();
    setActiveDoc(docId);
    setActiveView("editor");
    onClose();
  };

  const handleExport = async () => {
    if (!activeDocId || !editor) {
      toast.warning("No Document Selected");
      return;
    }
    const activeDoc = docs.find((d) => d.id === activeDocId);
    const md = (editor.storage as any).markdown?.getMarkdown?.() ?? "";
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDoc?.title || "untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const text = await file.text();
    const docId = createDoc();
    setActiveDoc(docId);
    setActiveView("editor");
    setTimeout(() => {
      editor.commands.setContent(text);
      updateDocMeta(docId, { title: file.name.replace(/\.md$/i, "") });
    }, 100);
    e.target.value = "";
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[85vh] flex-col rounded-t-3xl bg-[#1a1a1a] shadow-[0_-8px_40px_rgba(0,0,0,0.5)]"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              {/* Drag handle */}
              <div className="flex items-center justify-center py-3">
                <div className="h-1 w-10 rounded-full bg-[#444]" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={opencraftLogo}
                    alt="OpenCraft"
                    className="h-7 w-auto opacity-90"
                  />
                  <div>
                    <h2 className="text-[15px] font-bold text-white">
                      {activeWs?.name ?? "My Space"}
                    </h2>
                    <p className="text-[11px] text-[#666]">
                      {wsDocs.length} document{wsDocs.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2a2a2a] text-[#888] active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="px-6 pb-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#242424] px-3 py-2.5 ring-1 ring-white/[0.06]">
                  <Search className="h-4 w-4 text-[#555]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-[#555]"
                  />
                </div>
              </div>

              {/* Quick actions row */}
              <div className="flex gap-2 px-6 pb-4">
                <button
                  onClick={handleNewDoc}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white active:scale-95"
                  style={{ backgroundColor: accent }}
                >
                  <PenSquare className="h-4 w-4" />
                  New Doc
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2a2a2a] px-4 py-2.5 text-[13px] text-[#aaa] active:scale-95"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Import
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2a2a2a] px-4 py-2.5 text-[13px] text-[#aaa] active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              </div>

              {/* Document list */}
              <div className="flex-1 overflow-y-auto px-4 pb-6">
                {/* Starred section */}
                {starredDocs.length > 0 && !searchQuery && (
                  <div className="mb-4">
                    <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#666]">
                      Starred
                    </div>
                    <div className="space-y-1">
                      {starredDocs.map((doc) => (
                        <MobileDocRow
                          key={doc.id}
                          doc={doc}
                          isActive={doc.id === activeDocId}
                          accent={accent}
                          onOpen={() => handleOpenDoc(doc.id)}
                          onStar={() => updateDocMeta(doc.id, { starred: false })}
                          onDelete={() => deleteDoc(doc.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent/Search results */}
                <div>
                  <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#666]">
                    {searchQuery ? "Results" : "Recent"}
                  </div>
                  {filteredDocs.length === 0 ? (
                    <div className="py-8 text-center text-[13px] text-[#555]">
                      {searchQuery ? "No documents found" : "No documents yet"}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredDocs.map((doc) => (
                        <MobileDocRow
                          key={doc.id}
                          doc={doc}
                          isActive={doc.id === activeDocId}
                          accent={accent}
                          onOpen={() => handleOpenDoc(doc.id)}
                          onStar={() => updateDocMeta(doc.id, { starred: !doc.starred })}
                          onDelete={() => deleteDoc(doc.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="border-t border-white/[0.06] px-6 py-3">
                <button
                  onClick={() => {
                    onClose();
                    setSettingsOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-[#888] active:bg-[#2a2a2a]"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".md,text/markdown"
                className="hidden"
                onChange={handleImport}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

function MobileDocRow({
  doc,
  isActive,
  accent,
  onOpen,
  onStar,
  onDelete,
}: {
  doc: DocMeta;
  isActive: boolean;
  accent: string;
  onOpen: () => void;
  onStar: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.button
      onClick={onOpen}
      className={
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all active:scale-[0.98] " +
        (isActive ? "bg-[#2a2a2a] ring-1 ring-white/[0.08]" : "")
      }
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: isActive ? `${accent}15` : "#242424",
        }}
      >
        {doc.starred ? (
          <Star className="h-4 w-4 fill-current text-yellow-400" />
        ) : (
          <FileText className="h-4 w-4 text-[#888]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={
            "truncate text-[14px] font-medium " +
            (isActive ? "text-white" : "text-[#d0d0d0]")
          }
        >
          {doc.title || "Untitled"}
        </div>
        <div className="text-[11px] text-[#555]">
          {new Date(doc.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar();
          }}
          className="rounded-lg p-1.5 text-[#555] active:scale-90"
        >
          <Star
            className={
              "h-3.5 w-3.5 " + (doc.starred ? "fill-current text-yellow-400" : "")
            }
          />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1.5 text-[#555] active:scale-90 active:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.button>
  );
}
