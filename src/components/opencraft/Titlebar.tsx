import { Minus, Square, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      setIsElectron(true);
      window.electronAPI.onMaximized((isMax: boolean) => setIsMaximized(isMax));
    }
  }, []);

  if (!isElectron) return null; // Only show in Electron

  return (
    <div className="h-[32px] flex shrink-0 items-center justify-between bg-[#161616] text-[#888] select-none drag-region z-[9999] relative w-full border-b border-black/20">
      <div className="pl-4 text-[11px] font-medium tracking-widest uppercase opacity-70 flex items-center gap-2">
        <img src="/assets/logo.png" alt="" className="w-4 h-4 opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
        OpenCraft
      </div>
      <div className="flex items-center h-full no-drag">
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="h-full px-4 hover:bg-[#2a2a2a] hover:text-[#e0e0e0] transition-colors flex items-center justify-center focus:outline-none"
        >
          <Minus className="w-[14px] h-[14px]" />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="h-full px-4 hover:bg-[#2a2a2a] hover:text-[#e0e0e0] transition-colors flex items-center justify-center focus:outline-none"
        >
          <Square className="w-[12px] h-[12px]" />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="h-full px-4 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center focus:outline-none"
        >
          <X className="w-[16px] h-[16px]" />
        </button>
      </div>
    </div>
  );
}
