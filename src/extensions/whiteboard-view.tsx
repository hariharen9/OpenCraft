import { useRef, useEffect } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Tldraw, Editor as TldrawEditor } from "tldraw";
import "tldraw/tldraw.css";

export function WhiteboardView({ node, updateAttributes, selected }: NodeViewProps) {
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const editorRef = useRef<TldrawEditor | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleMount = (editor: TldrawEditor) => {
    editorRef.current = editor;
    // Set dark mode to match OpenCraft
    editor.user.updateUserPreferences({ colorScheme: 'dark' });

    // If we have a saved snapshot, load it
    if (node.attrs.snapshot) {
      try {
        editor.store.loadSnapshot(node.attrs.snapshot);
      } catch (e) {
        console.error("Failed to load tldraw snapshot", e);
      }
    }
    
    // Listen for changes and update attributes (DEBOUNCED)
    editor.store.listen(() => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const snapshot = editor.store.getSnapshot();
        updateAttributes({ snapshot });
      }, 500);
    }, { scope: 'document', source: 'user' });
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = node.attrs.height;
    
    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startYRef.current;
      const newHeight = Math.max(200, startHeightRef.current + delta);
      updateAttributes({ height: newHeight });
    };
    
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <NodeViewWrapper
      data-type="whiteboard"
      className={`my-4 rounded-xl border ${selected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-[#333]'} bg-[#1a1a1a] shadow-sm transition-all overflow-hidden relative`}
    >
      <div className="flex items-center justify-between bg-[#1a1a1a] px-3 py-2 text-[11px] text-[#666]">
        <span className="font-semibold uppercase tracking-wider text-indigo-400">Whiteboard</span>
      </div>
      
      <div 
        style={{ height: node.attrs.height, width: "100%" }} 
        className="relative"
        onMouseDown={(e) => {
          // Stop propagation so TipTap doesn't think we're dragging the block itself
          e.stopPropagation();
        }} 
        onKeyDown={(e) => {
          // Prevent TipTap from intercepting backspace/delete inside Tldraw
          e.stopPropagation();
        }}
      >
        <Tldraw 
          onMount={handleMount} 
        />
      </div>

      {/* Resize Handle */}
      <div 
        className="h-4 w-full cursor-row-resize bg-[#1a1a1a] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
        onMouseDown={startResize}
      >
        <div className="h-1.5 w-12 rounded-full bg-[#444]" />
      </div>
    </NodeViewWrapper>
  );
}
