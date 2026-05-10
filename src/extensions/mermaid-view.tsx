import { useEffect, useRef, useState } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import mermaid from "mermaid";

export function MermaidView({ node, updateAttributes, selected }: NodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      fontFamily: 'inherit',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      if (!containerRef.current || !node.attrs.code) return;
      
      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, node.attrs.code);
        
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Syntax error");
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [node.attrs.code]);

  return (
    <NodeViewWrapper
      data-type="mermaid"
      className={`my-4 rounded-lg border ${selected ? 'border-amber-500/50 ring-1 ring-amber-500/50' : 'border-[#333]'} bg-[#1a1a1a] p-4 shadow-sm transition-all`}
    >
      <div className="mb-2 flex items-center justify-between text-[11px] text-[#666]">
        <span className="font-semibold uppercase tracking-wider text-amber-500/70">Mermaid Diagram</span>
      </div>
      
      {selected && (
        <textarea
          value={node.attrs.code}
          onChange={(e) => updateAttributes({ code: e.target.value })}
          placeholder="graph TD..."
          className="mb-3 w-full resize-none rounded-md border border-[#333] bg-[#222] p-2 font-mono text-[12px] text-[#e0e0e0] outline-none placeholder:text-[#555] focus:border-[#555]"
          rows={5}
        />
      )}
      
      {error && (
        <div className="mb-3 rounded border border-rose-500/20 bg-rose-500/10 p-2 text-[11px] text-rose-400">
          {error}
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="flex min-h-[100px] items-center justify-center overflow-x-auto text-[#e0e0e0]"
      >
        {!node.attrs.code && <span className="text-[#555]">Empty diagram</span>}
      </div>
    </NodeViewWrapper>
  );
}
