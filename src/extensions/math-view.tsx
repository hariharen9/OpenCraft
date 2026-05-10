import { useEffect, useRef } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import katex from "katex";
import "katex/dist/katex.min.css";

export function MathView({ node, updateAttributes, selected }: NodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(node.attrs.formula || "", containerRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [node.attrs.formula]);

  return (
    <NodeViewWrapper
      data-type="math"
      className={`my-4 rounded-lg border ${selected ? 'border-[#ff8a4c] ring-1 ring-[#ff8a4c]' : 'border-[#333]'} bg-[#1a1a1a] p-4 shadow-sm transition-all`}
    >
      <div className="mb-2 flex items-center justify-between text-[11px] text-[#666]">
        <span className="font-semibold uppercase tracking-wider text-[#888]">TeX Formula</span>
      </div>
      
      {selected && (
        <input
          value={node.attrs.formula}
          onChange={(e) => updateAttributes({ formula: e.target.value })}
          placeholder="E = mc^2"
          className="mb-3 w-full border-0 border-b border-[#333] bg-transparent pb-1 font-mono text-[13px] text-[#e0e0e0] outline-none placeholder:text-[#555] focus:border-[#555]"
          autoFocus
        />
      )}
      
      <div 
        ref={containerRef} 
        className={`min-h-[40px] text-center ${!node.attrs.formula ? 'text-[#555]' : 'text-[#e0e0e0]'}`}
      >
        {!node.attrs.formula && "Empty formula"}
      </div>
    </NodeViewWrapper>
  );
}
