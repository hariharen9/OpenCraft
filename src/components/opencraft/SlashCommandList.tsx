import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";

export const SlashCommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return;

    const activeItem = listRef.current.children[selectedIndex] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="z-50 min-w-[280px] overflow-hidden rounded-xl border border-[#333] bg-[#1a1a1a] p-1.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur-md">
      {props.items.length > 0 ? (
        <div ref={listRef} className="max-h-[320px] overflow-y-auto custom-scrollbar">
          {props.items.map((item: any, index: number) => (
            <button
              key={index}
              onClick={() => selectItem(index)}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-all ${
                index === selectedIndex
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#a0a0a0] hover:bg-[#222] hover:text-[#d0d0d0]"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#333] ${index === selectedIndex ? "bg-[#333] text-white" : "bg-[#222] text-[#888]"}`}
              >
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium leading-tight">{item.title}</span>
                <span className="truncate text-[11px] text-[#666] leading-normal">
                  {item.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-3 py-2 text-[12px] text-[#666]">No results found</div>
      )}
    </div>
  );
});

SlashCommandList.displayName = "SlashCommandList";
