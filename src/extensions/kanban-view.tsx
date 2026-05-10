import { useState } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Plus, X, AlignLeft } from "lucide-react";

type Card = { id: string, title: string };
type Column = { id: string, title: string, cards: Card[] };

export function KanbanView({ node, updateAttributes, selected }: NodeViewProps) {
  const columns: Column[] = node.attrs.columns;
  const [dragInfo, setDragInfo] = useState<{ colId: string, cardId: string } | null>(null);

  const setCols = (newCols: Column[]) => updateAttributes({ columns: newCols });

  const addCard = (colId: string) => {
    const text = window.prompt("Card title");
    if (!text) return;
    const newCols = columns.map(c => {
      if (c.id === colId) {
        return { ...c, cards: [...c.cards, { id: Math.random().toString(), title: text }] };
      }
      return c;
    });
    setCols(newCols);
  };

  const deleteCard = (colId: string, cardId: string) => {
    const newCols = columns.map(c => {
      if (c.id === colId) {
        return { ...c, cards: c.cards.filter(card => card.id !== cardId) };
      }
      return c;
    });
    setCols(newCols);
  };

  const handleDragStart = (e: React.DragEvent, colId: string, cardId: string) => {
    setDragInfo({ colId, cardId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    if (!dragInfo) return;
    if (dragInfo.colId === targetColId) return;

    let cardToMove: Card | undefined;
    const colsWithoutCard = columns.map(c => {
      if (c.id === dragInfo.colId) {
        cardToMove = c.cards.find(card => card.id === dragInfo.cardId);
        return { ...c, cards: c.cards.filter(card => card.id !== dragInfo.cardId) };
      }
      return c;
    });

    if (cardToMove) {
      const finalCols = colsWithoutCard.map(c => {
        if (c.id === targetColId) {
          return { ...c, cards: [...c.cards, cardToMove!] };
        }
        return c;
      });
      setCols(finalCols);
    }
    setDragInfo(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <NodeViewWrapper
      data-type="kanban"
      className={`my-6 rounded-xl border ${selected ? 'border-[#a78bfa] ring-1 ring-[#a78bfa]' : 'border-[#333]'} bg-[#161616] shadow-sm transition-all overflow-hidden p-4`}
    >
      <div className="mb-4 flex items-center justify-between text-[11px] text-[#666]">
        <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[#a78bfa]">
          <AlignLeft className="h-3.5 w-3.5 rotate-90" /> Kanban Board
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map(col => (
          <div 
            key={col.id} 
            className="flex w-[260px] shrink-0 flex-col rounded-lg bg-[#1f1f1f] p-3 ring-1 ring-[#333]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#e0e0e0]">{col.title}</span>
              <span className="rounded-full bg-[#333] px-2 py-0.5 text-[10px] text-[#aaa]">{col.cards.length}</span>
            </div>
            
            <div className="flex min-h-[50px] flex-col gap-2">
              {col.cards.map(card => (
                <div 
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id, card.id)}
                  className="group relative cursor-grab rounded-md border border-[#333] bg-[#262626] p-3 shadow-sm hover:border-[#444] hover:bg-[#2a2a2a] active:cursor-grabbing"
                >
                  <p className="text-[13px] text-[#d0d0d0] leading-snug">{card.title}</p>
                  <button 
                    onClick={() => deleteCard(col.id, card.id)}
                    className="absolute right-1.5 top-1.5 opacity-0 text-[#666] hover:text-[#ef4444] group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => addCard(col.id)}
              className="mt-3 flex items-center gap-1.5 text-[12px] text-[#888] hover:text-[#d0d0d0] transition-colors p-1"
            >
              <Plus size={14} /> Add card
            </button>
          </div>
        ))}
      </div>
    </NodeViewWrapper>
  );
}
