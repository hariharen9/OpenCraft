import { useCallback } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

export function SubpageView({ node, updateAttributes }: NodeViewProps) {
  const setTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateAttributes({ title: e.target.value }),
    [updateAttributes],
  );

  return (
    <NodeViewWrapper
      data-type="subpage"
      className="subpage-root my-6 rounded-lg border border-[#4a4a5a] bg-[#1c1c2e] p-4 shadow-md"
    >
      <div className="subpage-header mb-3 flex items-center gap-2 border-b border-[#3a3a4a] pb-2">
        <span className="subpage-fold flex h-4 w-4 items-center justify-center rounded-sm bg-[#3a3a4a] text-[8px]">
          📄
        </span>
        <input
          value={node.attrs.title}
          onChange={setTitle}
          placeholder="Sub-page name"
          className="subpage-title flex-1 border-0 bg-transparent text-[11px] font-semibold uppercase tracking-wider text-[#888] outline-none placeholder:text-[#555]"
        />
      </div>
      <div className="subpage-content">
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
}
