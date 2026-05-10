import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { KanbanView } from "./kanban-view";

export const KanbanBlock = Node.create({
  name: "kanbanBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      columns: { 
        default: [
          { id: 'todo', title: 'To Do', cards: [{ id: '1', title: 'Research' }, { id: '2', title: 'Draft' }] },
          { id: 'doing', title: 'In Progress', cards: [] },
          { id: 'done', title: 'Done', cards: [] }
        ],
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='kanban']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "kanban" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(KanbanView);
  },
});
