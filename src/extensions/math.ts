import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MathView } from "./math-view";

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      formula: { 
        default: "E = mc^2",
        parseHTML: element => element.getAttribute('data-formula'),
        renderHTML: attributes => {
          return {
            'data-formula': attributes.formula,
          }
        }
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='math']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "math" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathView);
  },
});
