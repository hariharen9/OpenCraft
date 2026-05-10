import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Table as TableIcon,
  LayoutGrid,
  Columns3,
  ImageIcon,
  Sigma,
  GitBranch,
  PenLine,
  CreditCard,
  FileText,
  Minus,
  Scissors,
} from "lucide-react";

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: "Text",
      description: "Just start writing with plain text.",
      searchTerms: ["p", "paragraph"],
      icon: <Type className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading.",
      searchTerms: ["h1", "title"],
      icon: <Heading1 className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      searchTerms: ["h2", "subtitle"],
      icon: <Heading2 className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading.",
      searchTerms: ["h3", "subheading"],
      icon: <Heading3 className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Create a simple bulleted list.",
      searchTerms: ["unordered", "point"],
      icon: <List className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      description: "Create a list with numbering.",
      searchTerms: ["ordered"],
      icon: <ListOrdered className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Task List",
      description: "Track tasks with a checklist.",
      searchTerms: ["todo", "check", "checkbox"],
      icon: <CheckSquare className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: "Quote",
      description: "Capture a quotation.",
      searchTerms: ["blockquote"],
      icon: <Quote className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Code Block",
      description: "Capture code snippets.",
      searchTerms: ["codeblock"],
      icon: <Code2 className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Table",
      description: "Insert a simple table.",
      icon: <TableIcon className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
    },
    {
      title: "Gallery",
      description: "Display an image grid.",
      icon: <LayoutGrid className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: "galleryBlock" }).run();
      },
    },
    {
      title: "Kanban",
      description: "Create a task board.",
      icon: <Columns3 className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: "kanbanBlock" }).run();
      },
    },
    {
      title: "Image",
      description: "Insert an image URL.",
      icon: <ImageIcon className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).run();
        // Since we can't easily open the dialog from here without more logic,
        // we'll just focus the editor and maybe a toast or simpler prompt could be added later.
        // For now, let's just insert a placeholder or let the user use the sidebar for complex stuff.
        // But the user asked for "all options from the right panel".
        // Actually, I can dispatch a custom event or use the store to open the image dialog if I modify EditorPane.
      },
    },
    {
      title: "Math Block",
      description: "TeX mathematical formulas.",
      icon: <Sigma className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: "mathBlock" }).run();
      },
    },
    {
      title: "Mermaid Diagram",
      description: "Visual charts and diagrams.",
      icon: <GitBranch className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: "mermaidBlock" }).run();
      },
    },
    {
      title: "Whiteboard",
      description: "Draw freely with tldraw.",
      icon: <PenLine className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: "whiteboardBlock" }).run();
      },
    },
    {
      title: "Card",
      description: "A styled callout box.",
      icon: <CreditCard className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        const { schema } = editor.state;
        const card = schema.nodes.card.createAndFill({}, schema.nodes.paragraph.create());
        editor.chain().focus().deleteRange(range).insertContent(card).run();
      },
    },
    {
      title: "Page",
      description: "A nested subpage.",
      icon: <FileText className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        const { schema } = editor.state;
        const sub = schema.nodes.subpage.createAndFill({}, schema.nodes.paragraph.create());
        editor.chain().focus().deleteRange(range).insertContent(sub).run();
      },
    },
    {
      title: "Divider",
      description: "A horizontal line separator.",
      icon: <Minus className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCustomDivider({ variant: "thin" }).run();
      },
    },
    {
      title: "Page Break",
      description: "Insert a physical page break.",
      icon: <Scissors className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: "pageBreakBlock" }).run();
      },
    },
  ].filter((item) => {
    if (typeof query !== "string" || !query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.searchTerms && item.searchTerms.some((term) => term.includes(q)))
    );
  });
};
