import { useRef } from "react";
import {
  FileText,
  CheckCircle2,
  Calendar,
  ClipboardList,
  ChevronDown,
  Hand,
  Inbox,
  Monitor,
  Download,
  PenSquare,
  ListTodo,
} from "lucide-react";
import { useEditorStore, type ActiveView } from "@/store/editor-store";

const item =
  "group flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13px] text-[#c8c8c8] hover:bg-[#2f2f2f] cursor-pointer transition-colors active:scale-[0.99]";
const itemActive =
  "group flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13px] text-white bg-[#2a2a2a] cursor-default";

export function Sidebar() {
  const editor = useEditorStore((s) => s.editor);
  const title = useEditorStore((s) => s.title);
  const setTitle = useEditorStore((s) => s.setTitle);
  const activeView = useEditorStore((s) => s.activeView);
  const setActiveView = useEditorStore((s) => s.setActiveView);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!editor) return;
    const md = (editor.storage as any).markdown?.getMarkdown?.() ?? "";
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const text = await file.text();
    editor.commands.setContent(text);
    setTitle(file.name.replace(/\.md$/i, ""));
    e.target.value = "";
  };

  const navItem = (view: ActiveView, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveView(view)}
      className={activeView === view ? itemActive : item + " w-full"}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-transparent text-[#c8c8c8]">
      {/* Top spacer (window controls area on macOS) */}
      <div className="h-[44px] shrink-0" />

      {/* Workspace switcher */}
      <div className="px-3 pb-2">
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-semibold text-[#e8e8e8] hover:bg-[#2f2f2f] active:scale-[0.99]">
          <span className="text-base leading-none">📁</span>
          <span className="flex-1 text-left">My Space</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#888]" />
        </button>
      </div>

      {/* Primary nav */}
      <nav className="px-2 space-y-0.5">
        {navItem("home", <FileText className="h-4 w-4 text-[#9a9a9a]" />, "Home")}
        {navItem("editor", <PenSquare className="h-4 w-4 text-[#9a9a9a]" />, "New Document")}
        {navItem("tasks", <CheckCircle2 className="h-4 w-4 text-[#9a9a9a]" />, "Tasks")}
        {navItem("calendar", <Calendar className="h-4 w-4 text-[#9a9a9a]" />, "Calendar")}
      </nav>

      <div className="mt-4 px-2 space-y-0.5">
        <div className={item + " justify-between"}>
          <span className="flex items-center gap-2.5">
            <ClipboardList className="h-4 w-4 text-[#9a9a9a]" />
            My Templates
          </span>
          <span className="text-[11px] text-[#666]">0</span>
        </div>
      </div>

      {/* Starred */}
      <div className="mt-5 px-3">
        <div className="px-1 pb-1.5 text-[12px] font-semibold text-[#e0e0e0]">Starred</div>
        <div className="px-1 text-[12px] italic text-[#666]">
          Star Docs to keep them close
        </div>
      </div>

      {/* Folders */}
      <div className="mt-5 px-3">
        <div className="px-1 pb-1.5 text-[12px] font-semibold text-[#e0e0e0]">Folders</div>
      </div>
      <div className="px-2 space-y-0.5">
        <div className={item}>
          <Hand className="h-4 w-4 text-[#e2a14b]" />
          How to use Craft
        </div>
        <div className={item}>
          <Inbox className="h-4 w-4 text-[#9a9a9a]" />
          Unsorted
        </div>
      </div>

      {/* Tags */}
      <div className="mt-5 px-3">
        <div className="px-1 pb-1.5 text-[12px] font-semibold text-[#e0e0e0]">Tags</div>
        <div className="px-1 text-[12px] italic text-[#666]">
          Pin your key tags for quick access
        </div>
      </div>

      <div className="flex-1" />

      {/* Bottom toolbar */}
      <div className="flex items-center gap-1 px-3 pb-3">
        <button
          aria-label="Display"
          className="rounded-md p-1.5 text-[#888] hover:bg-[#2f2f2f] hover:text-[#ddd] active:scale-95"
        >
          <Monitor className="h-4 w-4" />
        </button>
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
    </aside>
  );
}
