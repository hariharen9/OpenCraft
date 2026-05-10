import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
}

export function Select({ value, onChange, options, className = "", placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        !target.closest(".custom-select-dropdown")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-md bg-[#1f1f1f] px-2.5 py-1.5 text-[11px] text-[#ccc] ring-1 ring-[#333] transition-colors hover:bg-[#2a2a2a] focus:outline-none"
      >
        <div className="flex items-center gap-1.5 truncate">
          {selected?.icon}
          {selected ? selected.label : placeholder || "Select..."}
        </div>
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-[#888] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="custom-select-dropdown fixed z-[9999] mt-1 max-h-48 overflow-y-auto rounded-lg bg-[#262626] p-1 shadow-xl ring-1 ring-[#333]"
              style={{
                top: coords.top,
                left: coords.left,
                width: Math.max(coords.width, 140),
              }}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-[#333] ${
                    value === opt.value ? "bg-[#333] text-white font-medium" : "text-[#aaa]"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
