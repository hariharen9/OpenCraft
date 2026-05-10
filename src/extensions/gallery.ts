import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { GalleryView } from "./gallery-view";

export const GalleryBlock = Node.create({
  name: "galleryBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      images: { 
        default: [],
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='gallery']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "gallery" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryView);
  },
});
