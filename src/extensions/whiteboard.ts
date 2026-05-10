import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { WhiteboardView } from "./whiteboard-view";

export const WhiteboardBlock = Node.create({
  name: "whiteboardBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      snapshot: {
        default: null,
      },
      height: {
        default: 400,
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='whiteboard']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "whiteboard" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WhiteboardView);
  },
});
