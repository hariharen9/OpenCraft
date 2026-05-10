import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Download,
  PenSquare,
  Settings,
  Plus,
  FileText,
  Star,
  Trash2,
  Folder as FolderIcon,
  Tag,
  Upload,
  Pencil,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEditorStore, type ActiveView } from "@/store/editor-store";
import { useWorkspaceStore, type DocMeta, type Folder } from "@/store/workspace-store";
import { SettingsDialog } from "./SettingsDialog";

import opencraftLogo from "@/Assets/opencraft-white-single.png";
import { toast } from "sonner";

const item =
  "group flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13px] text-[#c8c8c8] hover:bg-[#2f2f2f] cursor-pointer transition-colors active:scale-[0.99] w-full";
const itemActive =
  "group flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13px] text-white bg-[#2a2a2a] cursor-default w-full";

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

export function Sidebar() {
  const editor = useEditorStore((s) => s.editor);
  const activeView = useEditorStore((s) => s.activeView);
  const setActiveView = useEditorStore((s) => s.setActiveView);

  const store = useWorkspaceStore();
  const {
    workspaces,
    activeWorkspaceId,
    docs,
    activeDocId,
    load,
    addWorkspace,
    setActiveWorkspace,
    deleteWorkspace,
    renameWorkspace,
    renameFolder,
    renameTag,
    createDoc,
    deleteDoc,
    setActiveDoc,
    updateDocMeta,
    createFolder,
    deleteFolder,
    createTag,
    deleteTag,
  } = store;

  const fileRef = useRef<HTMLInputElement>(null);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [showNewWs, setShowNewWs] = useState(false);

  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const [newTagName, setNewTagName] = useState("");
  const [showNewTag, setShowNewTag] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    pos: { x: number; y: number };
    items: ContextMenuItem[];
  } | null>(null);

  const [renamingItem, setRenamingItem] = useState<{
    type: "workspace" | "folder" | "tag";
    id: string;
    name: string;
  } | null>(null);

  const [draggedDoc, setDraggedDoc] = useState<DocMeta | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);
  const wsDocs = docs.filter((d) => d.id.startsWith(`${activeWorkspaceId}:`));
  const starredDocs = wsDocs.filter((d) => d.starred);
  const unstarredDocs = wsDocs.filter((d) => !d.starred);

  const folders = activeWs?.folders ?? [];
  const tags = activeWs?.tags ?? [];
  const rootDocs = unstarredDocs.filter((d) => !d.folder || d.folder === "root");

  const displayedDocs = activeTagFilter
    ? unstarredDocs.filter((d) => d.tags.includes(activeTagFilter))
    : rootDocs;

  const toggleFolder = (id: string) => setExpandedFolders((p) => ({ ...p, [id]: !p[id] }));

  const closeContextMenu = () => setContextMenu(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ pos: { x: e.clientX, y: e.clientY }, items });
  }, []);

  const startRename = (type: "workspace" | "folder" | "tag", id: string, name: string) => {
    setRenamingItem({ type, id, name });
    closeContextMenu();
  };

  const saveRename = () => {
    if (!renamingItem) return;
    const { type, id, name } = renamingItem;
    const trimmed = name.trim();
    if (trimmed) {
      if (type === "workspace") renameWorkspace(id, trimmed);
      else if (type === "folder") renameFolder(activeWorkspaceId, id, trimmed);
      else if (type === "tag") renameTag(activeWorkspaceId, id, trimmed);
    }
    setRenamingItem(null);
  };

  const cancelRename = () => setRenamingItem(null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(activeWorkspaceId, newFolderName);
      setNewFolderName("");
      setShowNewFolder(false);
    }
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTag(activeWorkspaceId, newTagName);
      setNewTagName("");
      setShowNewTag(false);
    }
  };

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
    if (!activeDocId) {
      toast.warning("No Document Selected", {
        description: "Open a document first to export its content as Markdown.",
      });
      return;
    }
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;
      setDraggedDoc(null);
      if (!over || !active) return;
      const docId = active.id as string;
      const targetId = over.id as string;
      if (targetId === "__root__") {
        updateDocMeta(docId, { folder: "root" });
      } else if (folders.some((f) => f.id === targetId)) {
        updateDocMeta(docId, { folder: targetId });
      }
    },
    [folders, updateDocMeta],
  );

  const navItem = (view: ActiveView, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveView(view)}
      className={activeView === view && (view !== "editor" || !activeDocId) ? itemActive : item}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-transparent text-[#c8c8c8]">
      <div className="h-[20px] shrink-0" />

      <div className="px-5 pb-3 pt-2">
        <img
          src={opencraftLogo}
          alt="OpenCraft Logo"
          className="h-9 w-auto object-contain opacity-90"
        />
      </div>

      {/* Workspace switcher */}
      <div className="relative px-3 pb-2">
        <button
          onClick={() => setSpaceOpen(!spaceOpen)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-semibold text-[#e8e8e8] hover:bg-[#2f2f2f] active:scale-[0.99]"
        >
          <span className="text-[16px]">{activeWs?.icon ?? "📋"}</span>
          <span className="flex-1 truncate text-left">{activeWs?.name ?? "My Space"}</span>
          <ChevronDown
            className="h-3.5 w-3.5 text-[#888] transition-transform"
            style={{ rotate: spaceOpen ? "180deg" : "0deg" }}
          />
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
              {workspaces.map((ws) => {
                const isRenaming = renamingItem?.type === "workspace" && renamingItem.id === ws.id;
                return (
                  <div key={ws.id}>
                    {isRenaming ? (
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-[14px]">{ws.icon}</span>
                        <input
                          autoFocus
                          value={renamingItem.name}
                          onChange={(e) =>
                            setRenamingItem({ ...renamingItem, name: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          onBlur={saveRename}
                          className="min-w-0 flex-1 bg-transparent text-[13px] text-[#e0e0e0] outline-none"
                        />
                      </div>
                    ) : (
                      <div
                        onContextMenu={(e) => {
                          if (ws.id === "default") return;
                          handleContextMenu(e, [
                            {
                              label: "Rename",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              onClick: () => startRename("workspace", ws.id, ws.name),
                            },
                            {
                              label: "Delete",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              onClick: () => {
                                deleteWorkspace(ws.id);
                                closeContextMenu();
                              },
                              destructive: true,
                            },
                          ]);
                        }}
                      >
                        <button
                          onClick={() => {
                            setActiveWorkspace(ws.id);
                            setSpaceOpen(false);
                          }}
                          className={
                            "flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors hover:bg-[#2f2f2f] active:scale-[0.99] " +
                            (ws.id === activeWorkspaceId
                              ? "text-white bg-[#333]"
                              : "text-[#c8c8c8]")
                          }
                        >
                          <span className="text-[14px]">{ws.icon}</span>
                          <span className="flex-1 truncate text-left">{ws.name}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mx-2 my-1 border-t border-[#333]" />

              {showNewWs ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <input
                    autoFocus
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateWorkspace();
                      if (e.key === "Escape") {
                        setShowNewWs(false);
                        setNewWsName("");
                      }
                    }}
                    placeholder="Workspace name..."
                    className="min-w-0 flex-1 bg-transparent text-[12px] text-[#e0e0e0] outline-none placeholder:text-[#555]"
                  />
                  <button
                    onClick={handleCreateWorkspace}
                    className="rounded px-2 py-0.5 text-[11px] text-[#e0e0e0] bg-[#444] hover:bg-[#555]"
                  >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary nav */}
      <nav className="px-2 space-y-0.5">
        {navItem("home", <Home className="h-4 w-4 text-[#9a9a9a]" />, "Home")}
        <button onClick={handleNewDoc} className={item}>
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
          <div className="px-1 text-[12px] italic text-[#666]">Star Docs to keep them close</div>
        ) : (
          <div className="space-y-0.5">
            {starredDocs.map((doc) => (
              <div key={doc.id} className="group relative">
                <button
                  onClick={() => handleOpenDoc(doc.id)}
                  className={
                    doc.id === activeDocId && activeView === "editor"
                      ? itemActive + " pr-12"
                      : item + " pr-12"
                  }
                >
                  <Star className="h-3.5 w-3.5 fill-current text-yellow-400 shrink-0" />
                  <span className="flex-1 truncate text-left">{doc.title || "Untitled"}</span>
                </button>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDocMeta(doc.id, { starred: false });
                    }}
                    className="rounded p-0.5 text-[#555] hover:text-[#aaa]"
                    title="Unstar"
                  >
                    <Star className="h-3 w-3 fill-current text-[#555]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDoc(doc.id);
                    }}
                    className="rounded p-0.5 text-[#555] hover:text-[#ef4444]"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DnD Context */}
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={(e) => {
          const doc = wsDocs.find((d) => d.id === e.active.id);
          setDraggedDoc(doc ?? null);
        }}
      >
        {/* Folders */}
        <div className="mt-5 px-3">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="text-[12px] font-semibold text-[#e0e0e0]">Folders</span>
            <button
              onClick={() => setShowNewFolder(!showNewFolder)}
              className="rounded p-0.5 text-[#888] hover:bg-[#333] hover:text-[#ccc]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <AnimatePresence>
            {showNewFolder && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-1 pt-1 pb-2"
              >
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") setShowNewFolder(false);
                  }}
                  onBlur={() => {
                    if (!newFolderName.trim()) setShowNewFolder(false);
                  }}
                  placeholder="Folder name..."
                  className="w-full rounded bg-[#2a2a2a] px-2 py-1 text-[12px] text-white outline-none ring-1 ring-[#444] focus:ring-[#666]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            {folders.length === 0 ? (
              <div className="px-3 text-[12px] italic text-[#666]">
                Create Folders to organize docs
              </div>
            ) : (
              folders.map((folder) => {
                const folderDocs = unstarredDocs.filter((d) => d.folder === folder.id);
                return (
                  <DroppableFolderRow
                    key={folder.id}
                    folder={folder}
                    folderDocCount={folderDocs.length}
                    isRenaming={renamingItem?.type === "folder" && renamingItem.id === folder.id}
                    renamingName={renamingItem?.type === "folder" ? renamingItem.name : ""}
                    onRenamingNameChange={(name) =>
                      setRenamingItem(renamingItem ? { ...renamingItem, name } : null)
                    }
                    isExpanded={!!expandedFolders[folder.id]}
                    onToggle={() => toggleFolder(folder.id)}
                    onContextMenu={(e) =>
                      handleContextMenu(e, [
                        {
                          label: "Rename",
                          icon: <Pencil className="h-3.5 w-3.5" />,
                          onClick: () => startRename("folder", folder.id, folder.name),
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 className="h-3.5 w-3.5" />,
                          onClick: () => {
                            deleteFolder(activeWorkspaceId, folder.id);
                            closeContextMenu();
                          },
                          destructive: true,
                        },
                      ])
                    }
                    onDeleteFolder={() => deleteFolder(activeWorkspaceId, folder.id)}
                    onSaveRename={saveRename}
                    onCancelRename={cancelRename}
                  >
                    <AnimatePresence>
                      {expandedFolders[folder.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-4 pr-1 mt-0.5 space-y-0.5"
                        >
                          {folderDocs.length === 0 ? (
                            <div className="px-3 py-1 text-[11px] italic text-[#666]">
                              Empty folder
                            </div>
                          ) : (
                            folderDocs
                              .sort((a, b) => b.updatedAt - a.updatedAt)
                              .map((doc) => (
                                <DraggableDocItem
                                  key={doc.id}
                                  doc={doc}
                                  compact
                                  isActive={doc.id === activeDocId && activeView === "editor"}
                                  onOpen={handleOpenDoc}
                                  onStar={(e) => {
                                    e.stopPropagation();
                                    updateDocMeta(doc.id, { starred: !doc.starred });
                                  }}
                                  onDelete={(e) => {
                                    e.stopPropagation();
                                    deleteDoc(doc.id);
                                  }}
                                />
                              ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </DroppableFolderRow>
                );
              })
            )}
          </div>
        </div>

        {/* All Documents */}
        <RootDroppableZone>
          <div className="mt-5 px-3">
            <div className="flex items-center justify-between px-1 pb-1.5">
              <span className="text-[12px] font-semibold text-[#e0e0e0]">All Documents</span>
              <span className="text-[11px] text-[#666]">{displayedDocs.length}</span>
            </div>

            {(tags.length > 0 || showNewTag) && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none px-1">
                <button
                  onClick={() => setActiveTagFilter(null)}
                  className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${!activeTagFilter ? "bg-white text-black" : "bg-[#2a2a2a] text-[#888] hover:bg-[#333]"}`}
                >
                  All
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onContextMenu={(e) =>
                      handleContextMenu(e, [
                        {
                          label: "Rename",
                          icon: <Pencil className="h-3.5 w-3.5" />,
                          onClick: () => startRename("tag", tag.id, tag.name),
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 className="h-3.5 w-3.5" />,
                          onClick: () => {
                            deleteTag(activeWorkspaceId, tag.id);
                            if (activeTagFilter === tag.id) setActiveTagFilter(null);
                            closeContextMenu();
                          },
                          destructive: true,
                        },
                      ])
                    }
                    onClick={() => setActiveTagFilter(tag.id)}
                    className={`flex items-center gap-1 whitespace-nowrap rounded-full pl-2 pr-1 py-0.5 text-[10px] font-medium transition-colors ${activeTagFilter === tag.id ? "bg-[#4cc2ff] text-black" : "bg-[#2a2a2a] text-[#888] hover:bg-[#333]"}`}
                  >
                    #
                    {renamingItem?.type === "tag" && renamingItem.id === tag.id ? (
                      <input
                        autoFocus
                        value={renamingItem.name}
                        onChange={(e) => setRenamingItem({ ...renamingItem, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename();
                          if (e.key === "Escape") cancelRename();
                        }}
                        onBlur={saveRename}
                        onClick={(e) => e.stopPropagation()}
                        className="w-16 bg-transparent text-[10px] text-white outline-none"
                      />
                    ) : (
                      tag.name
                    )}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTag(activeWorkspaceId, tag.id);
                        if (activeTagFilter === tag.id) setActiveTagFilter(null);
                      }}
                      className={`rounded-full p-0.5 ${activeTagFilter === tag.id ? "hover:bg-black/20 text-black/60 hover:text-black" : "hover:bg-[#444] text-[#888] hover:text-[#ccc]"}`}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setShowNewTag(true)}
                  className="flex items-center justify-center rounded-full bg-[#2a2a2a] w-5 h-5 text-[#888] hover:bg-[#333] shrink-0"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}

            <AnimatePresence>
              {showNewTag && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden px-1 pt-1 pb-2"
                >
                  <input
                    autoFocus
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTag();
                      if (e.key === "Escape") setShowNewTag(false);
                    }}
                    onBlur={() => setShowNewTag(false)}
                    placeholder="New tag..."
                    className="w-full rounded bg-[#2a2a2a] px-2 py-1 text-[12px] text-white outline-none ring-1 ring-[#444] focus:ring-[#666]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
            {displayedDocs.length === 0 ? (
              <div className="px-3 text-[12px] italic text-[#666]">
                {activeTagFilter ? "No docs with this tag" : "No unsorted documents"}
              </div>
            ) : (
              displayedDocs
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((doc) => (
                  <DraggableDocItem
                    key={doc.id}
                    doc={doc}
                    isActive={doc.id === activeDocId && activeView === "editor"}
                    onOpen={handleOpenDoc}
                    onStar={(e) => {
                      e.stopPropagation();
                      updateDocMeta(doc.id, { starred: !doc.starred });
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      deleteDoc(doc.id);
                    }}
                  />
                ))
            )}
          </div>
        </RootDroppableZone>

        <DragOverlay>
          {draggedDoc ? (
            <div className="flex items-center gap-2.5 rounded-md bg-[#2a2a2a]/90 px-2.5 py-[5px] text-[13px] text-[#c8c8c8] shadow-xl ring-1 ring-[#444] backdrop-blur-xl">
              <FileText className="h-4 w-4 text-[#9a9a9a] shrink-0" />
              <span className="truncate">{draggedDoc.title || "Untitled"}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Bottom toolbar */}
      <div className="flex items-center gap-1 px-3 pb-3 pt-2">
        <button
          onClick={handleExport}
          title="Export as Markdown"
          className="rounded-md p-1.5 text-[#888] hover:bg-[#2f2f2f] hover:text-[#ddd] active:scale-95"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          title="Import Markdown"
          className="rounded-md p-1.5 text-[#888] hover:bg-[#2f2f2f] hover:text-[#ddd] active:scale-95"
        >
          <Upload className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-md p-1.5 text-[#888] hover:bg-[#2f2f2f] hover:text-[#ddd] active:scale-95"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
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

      {contextMenu && (
        <SidebarItemMenu
          pos={contextMenu.pos}
          items={contextMenu.items}
          onClose={closeContextMenu}
        />
      )}
    </aside>
  );
}

/* ─── Context Menu ─── */

function SidebarItemMenu({
  pos,
  items,
  onClose,
}: {
  pos: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = () => onClose();
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[9999] w-40 rounded-xl bg-[#2a2a2a]/90 backdrop-blur-xl p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-[#444]"
      style={{ top: pos.y, left: pos.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={item.onClick}
          className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[12px] transition-colors ${
            item.destructive
              ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
              : "text-[#ccc] hover:bg-[#3b82f6] hover:text-white"
          }`}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </motion.div>,
    document.body,
  );
}

/* ─── Draggable Doc Item ─── */

function DraggableDocItem({
  doc,
  isActive,
  onOpen,
  onStar,
  onDelete,
  compact,
}: {
  doc: DocMeta;
  isActive: boolean;
  onOpen: (id: string) => void;
  onStar: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  compact?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: doc.id });

  return (
    <div
      ref={setNodeRef}
      className={`group relative ${isDragging ? "opacity-30" : ""}`}
      {...attributes}
      {...listeners}
    >
      <button
        onClick={() => onOpen(doc.id)}
        className={(isActive ? itemActive : item) + (compact ? " !py-1 !pl-2" : "")}
      >
        <FileText className="h-4 w-4 text-[#9a9a9a] shrink-0" />
        <span className="flex-1 truncate text-left">{doc.title || "Untitled"}</span>
      </button>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onStar}
          className="rounded p-0.5 text-[#555] hover:text-yellow-400"
          title={doc.starred ? "Unstar" : "Star"}
        >
          <Star className={"h-3 w-3 " + (doc.starred ? "fill-current text-yellow-400" : "")} />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-0.5 text-[#555] hover:text-[#ef4444]"
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Droppable Folder Row ─── */

function DroppableFolderRow({
  folder,
  folderDocCount,
  isRenaming,
  renamingName,
  onRenamingNameChange,
  isExpanded,
  onToggle,
  onContextMenu,
  onDeleteFolder,
  onSaveRename,
  onCancelRename,
  children,
}: {
  folder: Folder;
  folderDocCount: number;
  isRenaming: boolean;
  renamingName: string;
  onRenamingNameChange: (name: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDeleteFolder: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: folder.id });

  return (
    <div ref={setNodeRef}>
      <div
        className={`group relative rounded-md transition-colors ${isOver ? "bg-[#2a3a2a] ring-1 ring-[#4a8a4a]" : ""}`}
        onContextMenu={onContextMenu}
      >
        {isRenaming ? (
          <div className="flex items-center gap-2 px-1.5 py-1">
            <ChevronDown className="h-3.5 w-3.5 text-[#666]" />
            <FolderIcon className="h-3.5 w-3.5 text-[#aaa]" />
            <input
              autoFocus
              value={renamingName}
              onChange={(e) => onRenamingNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveRename();
                if (e.key === "Escape") onCancelRename();
              }}
              onBlur={onSaveRename}
              className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#e0e0e0] outline-none"
            />
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-[12px] font-medium text-[#aaa] hover:bg-[#2f2f2f] transition-colors"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
            />
            <FolderIcon className="h-3.5 w-3.5" />
            <span className="flex-1 truncate text-left">{folder.name}</span>
            <span className="text-[10px] text-[#666]">{folderDocCount}</span>
          </button>
        )}
        {!isRenaming && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder();
              }}
              className="rounded p-0.5 text-[#555] hover:text-[#ef4444]"
              title="Delete Folder"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Root Droppable Zone ─── */

function RootDroppableZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "__root__" });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-0 flex-1 flex-col transition-colors ${isOver ? "bg-[#2a3a2a]/30" : ""}`}
    >
      {children}
    </div>
  );
}
