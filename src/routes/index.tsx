import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/opencraft/Sidebar";
import { EditorPane } from "@/components/opencraft/EditorPane";
import { Inspector } from "@/components/opencraft/Inspector";
import { useEditorStore } from "@/store/editor-store";

export const Route = createFileRoute("/")({
  component: OpenCraft,
  head: () => ({
    meta: [
      { title: "OpenCraft — A focused writing space" },
      {
        name: "description",
        content:
          "OpenCraft is an open-source, local-first markdown writing app inspired by Craft.",
      },
    ],
  }),
});

function OpenCraft() {
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const inspectorOpen = useEditorStore((s) => s.inspectorOpen);
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#161616] text-[#e0e0e0] antialiased">
      {sidebarOpen && <Sidebar />}
      <div className="flex min-w-0 flex-1 py-2 pr-2">
        <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-xl bg-[#1f1f1f] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-20px_rgba(0,0,0,0.6),0_8px_16px_-12px_rgba(0,0,0,0.5)] ring-1 ring-black/40">
          <EditorPane />
        </div>
      </div>
      {inspectorOpen && <Inspector />}
    </div>
  );
}
