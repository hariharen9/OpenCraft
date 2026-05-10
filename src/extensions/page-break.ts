import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { PageBreakView } from "./page-break-view";

export const PageBreakBlock = Node.create({
  name: "pageBreakBlock",
  group: "block",
  atom: true,
  draggable: true,

  parseHTML() {
    return [{ tag: "div[data-type='pageBreak']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "pageBreak" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageBreakView);
  },
});
