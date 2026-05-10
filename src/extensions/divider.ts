import { Node, mergeAttributes } from "@tiptap/core";

export const CustomDivider = Node.create({
  name: "customDivider",
  group: "block",

  addAttributes() {
    return {
      variant: {
        default: "thin",
        parseHTML: (element) => element.getAttribute("data-variant"),
        renderHTML: (attributes) => {
          return {
            "data-variant": attributes.variant,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: "hr.divider-thin", attrs: { variant: "thin" } },
      { tag: "hr.divider-thick", attrs: { variant: "thick" } },
      { tag: "hr.divider-dotted", attrs: { variant: "dotted" } },
      { tag: "hr.divider-dashed", attrs: { variant: "dashed" } },
      { tag: "hr[data-variant]" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "hr",
      mergeAttributes(HTMLAttributes, { class: `divider-${HTMLAttributes["data-variant"]}` }),
    ];
  },

  addCommands() {
    return {
      setCustomDivider:
        (options: { variant: string }) =>
        ({ chain }) => {
          return chain().insertContent({ type: this.name, attrs: options }).run();
        },
    } as any;
  },
});
