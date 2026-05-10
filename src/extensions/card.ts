import { Node, mergeAttributes } from "@tiptap/core";

export const Card = Node.create({
  name: "card",
  group: "block",
  content: "block+",
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      style: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='card']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "card",
        class: "my-4 rounded-xl border border-[#333] bg-[#1a1a2e] p-4 shadow-sm",
      }),
      0,
    ];
  },
});
