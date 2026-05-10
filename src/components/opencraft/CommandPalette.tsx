import React, { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Plus,
  Home,
  CheckCircle2,
  Calendar,
  Settings,
  ArrowRight,
  Hash,
  Star,
  Clock,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { LocalStorageProvider } from "@/lib/storage/local";
import { format } from "date-fns";

export function CommandPalette() {
  const open = useEditorStore((s) => s.commandPaletteOpen);
  const setOpen = useEditorStore((s) => s.setCommandPaletteOpen);
  const toggleOpen = useEditorStore((s) => s.toggleCommandPalette);
  const accent = useEditorStore((s) => s.accentColor);
  const setActiveView = useEditorStore((s) => s.setActiveView);

  const { docs, activeWorkspaceId, setActiveDoc, createDoc } = useWorkspaceStore();
  const [search, setSearch] = useState("");
  const [contents, setContents] = useState<Record<string, string>>({});

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOpen();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleOpen]);

  // Pre-load contents for universal search when palette is opened
  useEffect(() => {
    if (!open) return;

    const loadAll = async () => {
      const newContents: Record<string, string> = {};
      await Promise.all(
        docs.map(async (doc) => {
          const data = await LocalStorageProvider.load(doc.id);
          if (data?.markdown) {
            newContents[doc.id] = data.markdown.toLowerCase();
          }
        })
      );
      setContents(newContents);
    };

    loadAll();
  }, [open, docs]);

  const filteredDocs = useMemo(() => {
    if (!search) return docs.slice(0, 10);
    const s = search.toLowerCase();
    return docs.filter((doc) => {
      const titleMatch = doc.title.toLowerCase().includes(s);
      const contentMatch = contents[doc.id]?.includes(s);
      return titleMatch || contentMatch;
    });
  }, [search, docs, contents]);

  const handleSelectDoc = (id: string) => {
    setActiveDoc(id);
    setActiveView("editor");
    setOpen(false);
  };

  const handleNewDoc = () => {
    const id = createDoc();
    setActiveDoc(id);
    setActiveView("editor");
    setOpen(false);
  };

  const handleViewChange = (view: any) => {
    setActiveView(view);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[580px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1a1a] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
          >
            <Command label="Global Search" className="flex flex-col">
              <div className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-4">
                <Search className="h-5 w-5 text-[#666]" />
                <Command.Input
                  autoFocus
                  placeholder="Search pages, content, and actions..."
                  value={search}
                  onValueChange={setSearch}
                  className="flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-[#444]"
                />
                <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-[#666] ring-1 ring-white/10">
                  <span className="text-[12px]">ESC</span>
                </div>
              </div>

              <Command.List className="max-h-[450px] overflow-y-auto p-2 scrollbar-none">
                <Command.Empty className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 rounded-full bg-white/5 p-3">
                    <Search className="h-6 w-6 text-[#444]" />
                  </div>
                  <p className="text-[14px] text-[#888]">No results found for "{search}"</p>
                  <p className="mt-1 text-[12px] text-[#444]">Try a different search term.</p>
                </Command.Empty>

                {search && (
                  <Command.Group heading="Search Results" className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                    {filteredDocs.map((doc) => (
                      <Command.Item
                        key={doc.id}
                        onSelect={() => handleSelectDoc(doc.id)}
                        className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all aria-selected:bg-white/[0.05] aria-selected:ring-1 aria-selected:ring-white/10"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#262626] text-[#888] group-aria-selected:text-white">
                          {doc.starred ? (
                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-[14px] font-medium text-[#e0e0e0] group-aria-selected:text-white">
                            {doc.title || "Untitled Page"}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#666]">
                            <Clock className="h-3 w-3" />
                            {format(doc.updatedAt, "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="opacity-0 group-aria-selected:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4 text-[#444]" />
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {!search && (
                  <>
                    <Command.Group heading="Quick Actions" className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                      <ActionItem icon={<Plus className="h-4 w-4" />} label="New Document" shortcut="N" onSelect={handleNewDoc} />
                      <ActionItem icon={<Settings className="h-4 w-4" />} label="Open Settings" shortcut="," onSelect={() => {}} />
                    </Command.Group>

                    <Command.Group heading="Navigation" className="px-2 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                      <ActionItem icon={<Home className="h-4 w-4" />} label="Go to Home" onSelect={() => handleViewChange("home")} />
                      <ActionItem icon={<CheckCircle2 className="h-4 w-4" />} label="View Tasks" onSelect={() => handleViewChange("tasks")} />
                      <ActionItem icon={<Calendar className="h-4 w-4" />} label="View Calendar" onSelect={() => handleViewChange("calendar")} />
                    </Command.Group>

                    <Command.Group heading="Recent Documents" className="px-2 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                      {docs.slice(0, 5).map((doc) => (
                        <Command.Item
                          key={doc.id}
                          onSelect={() => handleSelectDoc(doc.id)}
                          className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all aria-selected:bg-white/[0.05] aria-selected:ring-1 aria-selected:ring-white/10"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#262626] text-[#888] group-aria-selected:text-white">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 overflow-hidden truncate text-[14px] font-medium text-[#e0e0e0] group-aria-selected:text-white">
                            {doc.title || "Untitled Page"}
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                )}
              </Command.List>

              <div className="flex items-center justify-between border-t border-white/[0.05] bg-white/[0.02] px-4 py-3 text-[11px] text-[#555]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded bg-white/5 px-1.5 py-0.5 ring-1 ring-white/10 text-[#888]">↵</kbd>
                    Open
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded bg-white/5 px-1.5 py-0.5 ring-1 ring-white/10 text-[#888]">↑↓</kbd>
                    Navigate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  <span className="font-mono uppercase">OpenCraft Search</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ActionItem({ icon, label, shortcut, onSelect }: any) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all aria-selected:bg-white/[0.05] aria-selected:ring-1 aria-selected:ring-white/10"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#262626] text-[#888] group-aria-selected:text-white">
        {icon}
      </div>
      <div className="flex-1 text-[14px] font-medium text-[#e0e0e0] group-aria-selected:text-white">{label}</div>
      {shortcut && (
        <kbd className="text-[10px] text-[#444] group-aria-selected:text-[#888]">{shortcut}</kbd>
      )}
    </Command.Item>
  );
}
