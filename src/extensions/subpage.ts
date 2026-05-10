import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SubpageView } from "./subpage-view";

export const Subpage = Node.create({
  name: "subpage",
  group: "block",
  content: "block+",
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      title: { default: "Sub-page" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='subpage']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "subpage",
        class: "subpage-root my-6 rounded-lg border border-[#4a4a5a] bg-[#1c1c2e] p-4 shadow-md",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SubpageView);
  },
});
