import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';
import { Command } from '@tiptap/react';

type FontSizeOptions = {
  types: string[];
};

declare module '@tiptap/core' {
  interface Commands {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (fontSize: string) => Command;
      /**
       * Unset the font size
       */
      unsetFontSize: () => Command;
    };
  }
}

const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  defaultOptions: {
    types: ['textStyle'],
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
        },
    };
  },
});

export { FontSize };
