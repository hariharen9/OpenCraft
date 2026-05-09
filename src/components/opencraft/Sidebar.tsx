import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Inbox,
  Download,
  PenSquare,
  Settings,
  Plus,
  FileText,
  Star,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { useEditorStore, type ActiveView } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { SettingsDialog } from "./SettingsDialog";

import opencraftLogo from "@/Assets/opencraft-white-single.png";

const item =
  "group flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13px] text-[#c8c8c8] hover:bg-[#2f2f2f] cursor-pointer transition-colors active:scale-[0.99]";
const itemActive =
  "group flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13px] text-white bg-[#2a2a2a] cursor-default";

export function Sidebar() {
  const editor = useEditorStore((s) => s.editor);
  const activeView = useEditorStore((s) => s.activeView);
  const setActiveView = useEditorStore((s) => s.setActiveView);

  const { workspaces, activeWorkspaceId, docs, activeDocId, loaded, load,
    addWorkspace, setActiveWorkspace, deleteWorkspace,
    createDoc, deleteDoc, setActiveDoc, updateDocMeta } = useWorkspaceStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [showNewWs, setShowNewWs] = useState(false);

  useEffect(() => { load(); }, [load]);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);
  const wsDocs = docs.filter((d) => d.id.startsWith(`${activeWorkspaceId}:`));
  const starredDocs = wsDocs.filter((d) => d.starred);
  const unstarredDocs = wsDocs.filter((d) => !d.starred);

  const handleNewDoc = () => {
    const docId = createDoc();
    setActiveDoc(docId);
    setActiveView("editor");
  };

  const handleOpenDoc = (docId: string) => {
    setActiveDoc(docId);
    setActiveView("editor");
  };

  const handleExport = () => {
    if (!editor) return;
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
    // Small delay to let editor mount with new doc
    setTimeout(() => {
      editor.commands.setContent(text);
      updateDocMeta(docId, { title: file.name.replace(/\.md$/i, "") });
    }, 100);
    e.target.value = "";
  };

  const handleCreateWorkspace = () => {
    if (newWsName.trim()) {
      addWorkspace(newWsName.trim());
      setNewWsName("");
      setShowNewWs(false);
      setSpaceOpen(false);
    }
  };

  const navItem = (view: ActiveView, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveView(view)}
      className={activeView === view && (view !== "editor" || !activeDocId) ? itemActive : item + " w-full"}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-transparent text-[#c8c8c8]">
      {/* Top spacer (window controls area on macOS) */}
      <div className="h-[20px] shrink-0" />
      
      {/* Logo */}
      <div className="px-5 pb-3 pt-2">
        <img src={opencraftLogo} alt="OpenCraft Logo" className="h-9 w-auto object-contain opacity-90" />
      </div>

      {/* Workspace switcher */}
      <div className="relative px-3 pb-2">
        <button
          onClick={() => setSpaceOpen(!spaceOpen)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-semibold text-[#e8e8e8] hover:bg-[#2f2f2f] active:scale-[0.99]"
        >
          <span className="text-[16px]">{activeWs?.icon ?? "📋"}</span>
          <span className="flex-1 truncate text-left">{activeWs?.name ?? "My Space"}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#888] transition-transform" style={{ rotate: spaceOpen ? "180deg" : "0deg" }} />
        </button>

        <AnimatePresence>
          {spaceOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute left-3 right-3 z-20 mt-1 overflow-hidden rounded-lg bg-[#262626] py-1 shadow-xl ring-1 ring-[#333]"
            >
              {/* Existing workspaces */}
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => { setActiveWorkspace(ws.id); setSpaceOpen(false); }}
                  className={"flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors hover:bg-[#2f2f2f] active:scale-[0.99] " +
                    (ws.id === activeWorkspaceId ? "text-white bg-[#333]" : "text-[#c8c8c8]")}
                >
                  <span className="text-[14px]">{ws.icon}</span>
                  <span className="flex-1 truncate text-left">{ws.name}</span>
                  {ws.id !== "default" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteWorkspace(ws.id); }}
                      className="rounded p-0.5 text-[#555] hover:text-[#ef4444]"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </button>
              ))}

              <div className="mx-2 my-1 border-t border-[#333]" />

              {/* New workspace */}
              {showNewWs ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <input
                    autoFocus
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateWorkspace(); if (e.key === "Escape") { setShowNewWs(false); setNewWsName(""); } }}
                    placeholder="Workspace name..."
                    className="min-w-0 flex-1 bg-transparent text-[12px] text-[#e0e0e0] outline-none placeholder:text-[#555]"
                  />
                  <button onClick={handleCreateWorkspace} className="rounded px-2 py-0.5 text-[11px] text-[#e0e0e0] bg-[#444] hover:bg-[#555]">
                    Create
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewWs(true)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-[#c8c8c8] transition-colors hover:bg-[#2f2f2f] active:scale-[0.99]"
                >
                  <Plus className="h-4 w-4 text-[#9a9a9a]" />
                  New Workspace
                </button>
              )}

              <button
                onClick={() => { setSpaceOpen(false); setSettingsOpen(true); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-[#c8c8c8] transition-colors hover:bg-[#2f2f2f] active:scale-[0.99]"
              >
                <Settings className="h-4 w-4 text-[#9a9a9a]" />
                Settings
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary nav */}
      <nav className="px-2 space-y-0.5">
        {navItem("home", <Home className="h-4 w-4 text-[#9a9a9a]" />, "Home")}
        <button onClick={handleNewDoc} className={item + " w-full"}>
          <PenSquare className="h-4 w-4 text-[#9a9a9a]" />
          New Document
        </button>
        {navItem("tasks", <CheckCircle2 className="h-4 w-4 text-[#9a9a9a]" />, "Tasks")}
        {navItem("calendar", <Calendar className="h-4 w-4 text-[#9a9a9a]" />, "Calendar")}
      </nav>

      {/* Starred docs */}
      <div className="mt-5 px-3">
        <div className="px-1 pb-1.5 text-[12px] font-semibold text-[#e0e0e0]">Starred</div>
        {starredDocs.length === 0 ? (
          <div className="px-1 text-[12px] italic text-[#666]">
            Star Docs to keep them close
          </div>
        ) : (
          <div className="space-y-0.5">
            {starredDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleOpenDoc(doc.id)}
                className={doc.id === activeDocId && activeView === "editor" ? itemActive : item + " w-full"}
              >
                <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />
                <span className="flex-1 truncate text-left">{doc.title || "Untitled"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Documents list */}
      <div className="mt-5 px-3">
        <div className="flex items-center justify-between px-1 pb-1.5">
          <span className="text-[12px] font-semibold text-[#e0e0e0]">Documents</span>
          <span className="text-[11px] text-[#666]">{wsDocs.length}</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 space-y-0.5">
        {unstarredDocs.length === 0 && starredDocs.length === 0 ? (
          <div className="px-3 text-[12px] italic text-[#666]">
            No documents yet
          </div>
        ) : (
          unstarredDocs
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((doc) => (
            <div key={doc.id} className="group relative">
              <button
                onClick={() => handleOpenDoc(doc.id)}
                className={doc.id === activeDocId && activeView === "editor"
                  ? itemActive + " w-full"
                  : item + " w-full"}
              >
                <FileText className="h-4 w-4 text-[#9a9a9a]" />
                <span className="flex-1 truncate text-left">{doc.title || "Untitled"}</span>
              </button>
              {/* Hover actions */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); updateDocMeta(doc.id, { starred: !doc.starred }); }}
                  className="rounded p-0.5 text-[#555] hover:text-yellow-400"
                >
                  <Star className={"h-3 w-3 " + (doc.starred ? "fill-current text-yellow-400" : "")} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                  className="rounded p-0.5 text-[#555] hover:text-[#ef4444]"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center gap-1 px-3 pb-3 pt-2">
        <button
          aria-label="Import / Export"
          onClick={handleExport}
          onContextMenu={(e) => {
            e.preventDefault();
            fileRef.current?.click();
          }}
          title="Click: export · Right-click: import"
          className="rounded-md p-1.5 text-[#888] hover:bg-[#2f2f2f] hover:text-[#ddd] active:scale-95"
        >
          <Download className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".md,text/markdown"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </aside>
  );
}
