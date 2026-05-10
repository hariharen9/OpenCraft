import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MermaidView } from "./mermaid-view";

export const MermaidBlock = Node.create({
  name: "mermaidBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      code: {
        default: "graph TD;\n  A-->B;\n  B-->C;",
        parseHTML: (element) => element.getAttribute("data-code"),
        renderHTML: (attributes) => {
          return {
            "data-code": attributes.code,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='mermaid']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "mermaid" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidView);
  },
});
