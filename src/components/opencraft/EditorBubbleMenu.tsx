import { useState, useRef, useEffect } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Quote, Terminal, Link as LinkIcon, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editor-store';

export function EditorBubbleMenu({ editor }: { editor: Editor }) {
  const [isLinking, setIsLinking] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const tick = useEditorStore((s) => s.tick);
  const accent = useEditorStore((s) => s.accentColor);

  if (!editor) return null;

  useEffect(() => {
    if (isLinking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinking]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLinking) {
        setIsLinking(false);
        setLinkUrl('');
      }
    };
    if (isLinking) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLinking]);

  const setLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setIsLinking(false);
    setLinkUrl('');
  };

  const isLinkActive = editor.isActive('link');

  const handleLinkClick = () => {
    if (isLinkActive) {
      editor.chain().focus().unsetLink().run();
    } else {
      const existing = editor.getAttributes('link').href;
      setLinkUrl(existing || '');
      setIsLinking(true);
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] ring-1 ring-[#333] rounded-xl overflow-hidden bg-[#1f1f1f]/95 backdrop-blur-2xl"
      updateDelay={0}
    >
      <AnimatePresence mode="wait">
        {isLinking ? (
          <motion.div
            key="link-input"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 280 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center h-[42px] px-2"
          >
            <input
              ref={inputRef}
              type="url"
              placeholder="Paste a link..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
              className="flex-1 bg-transparent text-[13px] text-[#e0e0e0] placeholder:text-[#555] outline-none px-2 min-w-0"
            />
            <div className="flex items-center gap-1 pl-2 border-l border-[#333]">
              <button
                onClick={setLink}
                className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center transition-colors"
                style={{ color: accent }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${accent}10`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => { setIsLinking(false); setLinkUrl(''); }}
                className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[#666] hover:bg-[#2a2a2a] hover:text-[#e0e0e0] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="toolbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center h-[42px] px-1"
          >
            <ToolbarButton
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              accent={accent}
            >
              <Bold size={15} />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              accent={accent}
            >
              <Italic size={15} />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              accent={accent}
            >
              <UnderlineIcon size={15} />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              accent={accent}
            >
              <Strikethrough size={15} />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('code')}
              onClick={() => editor.chain().focus().toggleCode().run()}
              accent={accent}
            >
              <Code size={15} />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              accent={accent}
            >
              <Quote size={15} />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              accent={accent}
            >
              <Terminal size={15} />
            </ToolbarButton>

            <div className="w-px h-5 bg-[#333] mx-1" />

            <ToolbarButton
              active={isLinkActive}
              onClick={handleLinkClick}
              accent={accent}
            >
              <LinkIcon size={15} />
            </ToolbarButton>
          </motion.div>
        )}
      </AnimatePresence>
    </BubbleMenu>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all mx-0.5"
      style={
        active
          ? { backgroundColor: `${accent}20`, color: accent }
          : undefined
      }
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#2a2a2a';
          e.currentTarget.style.color = '#e0e0e0';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#9a9a9a';
        }
      }}
    >
      {children}
    </button>
  );
}
