import React from "react";
import { Editor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Code,
  Quote,
  Terminal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import clsx from "clsx";
import { useEditorStore } from "@/store/editor-store";

const barVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.85 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, damping: 14, stiffness: 200, mass: 0.6 },
  },
  exit: { y: 40, opacity: 0, scale: 0.9, transition: { duration: 0.15, ease: "easeIn" as const } },
};

const groupContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.15 },
  },
};

const groupVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" as const } },
};

interface Props {
  editor: Editor;
}

export function EditorToolbar({ editor }: Props) {
  const isFocused = editor.isFocused;
  const tick = useEditorStore((s) => s.tick);
  const accent = useEditorStore((s) => s.accentColor);

  return (
    <AnimatePresence>
      <motion.div
        variants={barVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={clsx(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-2",
          "rounded-2xl shadow-2xl backdrop-blur-xl ring-1 transition-colors duration-300",
          isFocused ? "bg-[#1f1f1f]/95 ring-[#333]" : "bg-[#1f1f1f]/60 ring-[#2a2a2a]",
        )}
      >


        <motion.div
          variants={groupContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-1.5"
        >
          {/* Undo/Redo */}
          <motion.div
            variants={groupVariants}
            className="flex items-center gap-1 pr-2 border-r border-[#333]"
          >
            <ToolbarBtn
              icon={<Undo size={14} />}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
              accent={accent}
            />
            <ToolbarBtn
              icon={<Redo size={14} />}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
              accent={accent}
            />
          </motion.div>

          {/* Headings & Paragraph */}
          <motion.div
            variants={groupVariants}
            className="flex items-center gap-1 px-2 border-r border-[#333]"
          >
            <ToolbarBtn
              icon={<Type size={14} />}
              isActive={editor.isActive("paragraph")}
              onClick={() => editor.chain().focus().setParagraph().run()}
              title="Paragraph"
              accent={accent}
            />
            <ToolbarBtn
              icon={<Heading1 size={14} />}
              isActive={editor.isActive("heading", { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
              accent={accent}
            />
            <ToolbarBtn
              icon={<Heading2 size={14} />}
              isActive={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
              accent={accent}
            />
            <ToolbarBtn
              icon={<Heading3 size={14} />}
              isActive={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
              accent={accent}
            />
          </motion.div>

          {/* Lists */}
          <motion.div
            variants={groupVariants}
            className="flex items-center gap-1 px-2 border-r border-[#333]"
          >
            <ToolbarBtn
              icon={<List size={14} />}
              isActive={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
              accent={accent}
            />
            <ToolbarBtn
              icon={<ListOrdered size={14} />}
              isActive={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
              accent={accent}
            />
            <ToolbarBtn
              icon={<CheckSquare size={14} />}
              isActive={editor.isActive("taskList")}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              title="Task List"
              accent={accent}
            />
          </motion.div>

          {/* Inline Formatting */}
          <motion.div
            variants={groupVariants}
            className="flex items-center gap-1 px-2 border-r border-[#333]"
          >
            <ToolbarBtn
              icon={<Bold size={14} />}
              isActive={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
              accent={accent}
            />
            <ToolbarBtn
              icon={<Italic size={14} />}
              isActive={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
              accent={accent}
            />
            <ToolbarBtn
              icon={<UnderlineIcon size={14} />}
              isActive={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
              accent={accent}
            />
            <ToolbarBtn
              icon={<Strikethrough size={14} />}
              isActive={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
              accent={accent}
            />
            <ToolbarBtn
              icon={<Code size={14} />}
              isActive={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Inline Code"
              accent={accent}
            />
          </motion.div>

          {/* Blocks */}
          <motion.div
            variants={groupVariants}
            className="flex items-center gap-1 px-2 border-r border-[#333]"
          >
            <ToolbarBtn
              icon={<Quote size={14} />}
              isActive={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
              accent={accent}
            />
            <ToolbarBtn
              icon={<Terminal size={14} />}
              isActive={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
              accent={accent}
            />
          </motion.div>

          {/* Text Align */}
          <motion.div variants={groupVariants} className="flex items-center gap-1 pl-2">
            <ToolbarBtn
              icon={<AlignLeft size={14} />}
              isActive={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="Align Left"
              accent={accent}
            />
            <ToolbarBtn
              icon={<AlignCenter size={14} />}
              isActive={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              title="Align Center"
              accent={accent}
            />
            <ToolbarBtn
              icon={<AlignRight size={14} />}
              isActive={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              title="Align Right"
              accent={accent}
            />
            <ToolbarBtn
              icon={<AlignJustify size={14} />}
              isActive={editor.isActive({ textAlign: "justify" })}
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              title="Justify"
              accent={accent}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ToolbarBtn({ icon, isActive, onClick, disabled, title, className, accent }: any) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={clsx(
        "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
        isActive && "accent-bg",
        !isActive && "text-[#9a9a9a] hover:text-[#e0e0e0] hover:bg-[#2a2a2a]",
        className,
      )}
      style={isActive ? { backgroundColor: `${accent}20`, color: accent } : undefined}
    >
      {icon}
    </button>
  );
}
