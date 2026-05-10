import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Scissors } from "lucide-react";

export function PageBreakView({ selected }: NodeViewProps) {
  return (
    <NodeViewWrapper
      data-type="pageBreak"
      className={`my-12 flex items-center justify-center relative ${selected ? 'opacity-100 ring-2 ring-[#ff8a4c] rounded-full' : 'opacity-80'}`}
    >
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#555] to-transparent" />
      <div className="relative bg-[#1f1f1f] px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#777] border border-[#333] rounded-full py-1.5 shadow-sm flex items-center gap-2">
        <Scissors className="h-3 w-3" />
        {/* Page Break */}
      </div>
    </NodeViewWrapper>
  );
}
