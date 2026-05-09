import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, parseISO, isValid } from "date-fns";

interface DatePickerProps {
  value: string | null;
  onChange: (val: string | null) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, className = "", placeholder = "No date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => value ? parseISO(value) : new Date());
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
        !target.closest('.custom-datepicker-dropdown')
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedDate = value ? parseISO(value) : null;
  const isValidDate = selectedDate && isValid(selectedDate);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md bg-[#1f1f1f] px-2.5 py-1.5 text-[11px] text-[#ccc] ring-1 ring-[#333] transition-colors hover:bg-[#2a2a2a] focus:outline-none"
      >
        <CalendarIcon className="h-3 w-3 shrink-0 text-[#888]" />
        <span className="truncate">
            {isValidDate ? format(selectedDate, "MMM d, yyyy") : placeholder}
        </span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="custom-datepicker-dropdown fixed z-[9999] mt-1 w-60 rounded-xl bg-[#262626] p-3 shadow-xl ring-1 ring-[#333]"
              style={{ 
                top: coords.top, 
                left: Math.min(coords.left, window.innerWidth - 250) // Basic edge detection
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCursor(subMonths(cursor, 1))}
                  className="rounded-md p-1 hover:bg-[#333] active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4 text-[#888]" />
                </button>
                <span className="text-[12px] font-semibold text-[#e0e0e0]">
                  {format(cursor, "MMMM yyyy")}
                </span>
                <button
                  type="button"
                  onClick={() => setCursor(addMonths(cursor, 1))}
                  className="rounded-md p-1 hover:bg-[#333] active:scale-95"
                >
                  <ChevronRight className="h-4 w-4 text-[#888]" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[#777]">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const isCurMonth = isSameMonth(day, cursor);
                  const isSel = isValidDate && isSameDay(day, selectedDate);
                  const isTod = isToday(day);

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        onChange(format(day, "yyyy-MM-dd"));
                        setOpen(false);
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] transition-all
                        ${isSel ? "bg-[#0e3a72] text-white font-bold" : "hover:bg-[#333] text-[#ccc]"}
                        ${!isCurMonth && !isSel ? "text-[#555]" : ""}
                        ${isTod && !isSel ? "ring-1 ring-[#555]" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
              
              {value && (
                 <button
                   type="button"
                   onClick={() => { onChange(null); setOpen(false); }}
                   className="mt-2 w-full rounded-md py-1.5 text-center text-[10px] text-[#888] hover:bg-[#333] hover:text-[#ccc]"
                 >
                   Clear Date
                 </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
