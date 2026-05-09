import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Scissors, ClipboardPaste, ArrowLeft, ArrowRight, RotateCcw, MousePointerClick } from "lucide-react";

export function GlobalContextMenu() {
  const [pos, setPos] = useState<{ x: number, y: number } | null>(null);
  const [bypassNext, setBypassNext] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (bypassNext) {
        setBypassNext(false); // Let native menu show this one time, reset for next
        return; 
      }

      // Allow shift+right click to always show native menu
      if (e.shiftKey) return;

      // Don't intercept if clicking inside our own context menu
      const target = e.target as HTMLElement;
      if (target.closest('.custom-context-menu')) return;

      e.preventDefault();
      
      let x = e.clientX;
      let y = e.clientY;
      const menuW = 200;
      const menuH = 260; 
      
      if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 10;
      if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 10;
      
      setPos({ x, y });
    };

    const handleClick = () => {
      setPos(null);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
    };
  }, [bypassNext]);

  const handleAction = (action: () => void) => {
    action();
    setPos(null);
  };

  const requestNativeMenu = () => {
    setBypassNext(true);
    setPos(null);
    setToastMsg("Right-click again to view native menu");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <>
      <AnimatePresence>
        {pos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="custom-context-menu fixed z-[9999] w-48 rounded-xl bg-[#2a2a2a]/90 backdrop-blur-xl p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-[#444]"
            style={{ top: pos.y, left: pos.x }}
          >
            <div className="space-y-0.5">
              <ContextItem icon={<ArrowLeft className="h-3.5 w-3.5" />} label="Back" onClick={() => handleAction(() => window.history.back())} />
              <ContextItem icon={<ArrowRight className="h-3.5 w-3.5" />} label="Forward" onClick={() => handleAction(() => window.history.forward())} />
              <ContextItem icon={<RotateCcw className="h-3.5 w-3.5" />} label="Reload" onClick={() => handleAction(() => window.location.reload())} />
              <div className="my-1 border-t border-[#444]" />
              <ContextItem icon={<Copy className="h-3.5 w-3.5" />} label="Copy" onClick={() => handleAction(() => document.execCommand('copy'))} />
              <ContextItem icon={<Scissors className="h-3.5 w-3.5" />} label="Cut" onClick={() => handleAction(() => document.execCommand('cut'))} />
              <ContextItem icon={<ClipboardPaste className="h-3.5 w-3.5" />} label="Paste" onClick={() => handleAction(() => document.execCommand('paste'))} />
              <div className="my-1 border-t border-[#444]" />
              <ContextItem 
                icon={<MousePointerClick className="h-3.5 w-3.5 text-[#888]" />} 
                label="Native Browser Menu" 
                onClick={requestNativeMenu} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] rounded-full bg-[#e0e0e0] px-4 py-2 text-[12px] font-medium text-black shadow-lg"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ContextItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[12px] text-[#ccc] hover:bg-[#3b82f6] hover:text-white transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
