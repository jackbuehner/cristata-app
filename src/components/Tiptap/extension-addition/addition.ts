import { Mark } from '@tiptap/core';
import { Command } from '@tiptap/react';
import { v4 as uuidv4 } from 'uuid';

declare module '@tiptap/core' {
  interface Commands {
    addition: {
      /**
       * Toggle the addition mark for the selected range
       */
      toggleAddition: (color: string, user: string) => Command;
      /**
       * Add the addition mark to the provided range.
       */
      setAddition: (color: string, user: string) => Command;
      /**
       * Remove the addition mark from the provided range.
       */
      unsetAddition: () => Command;
    };
  }
}

interface AdditionOptions {}

const Addition = Mark.create<AdditionOptions>({
  name: 'addition',

  // the cursor at the edges of the mark should not be considered within the mark
  inclusive: false,

  excludes: 'deletion addition',

  group: 'inline markSupportsExits',

  /**
   *
   */
  addAttributes() {
    return {
      // use a color attrubute to define the color of text
      color: {
        // use this color by default
        default: '#d0021b',
        // apply these attributes to the rendered element in the editor
        renderHTML: (attributes) => {
          return {
            style: `color: ${attributes.color}; border-bottom: 1px solid ${attributes.color}`,
          };
        },
        parseHTML: (element) => ({
          color: element.style.color || '#d0021b',
        }),
      },
      user: {
        default: 'Unknown User',
        renderHTML: (attributes) => ({
          'data-user': attributes.user,
          title: `Change by ${attributes.user} at ${attributes.timestamp}`,
        }),
        parseHTML: (element) => {
          const user = element.getAttribute('data-user');
          return { user };
        },
      },
      timestamp: {
        default: new Date().toISOString(),
        renderHTML: (attributes) => ({
          'data-timestamp': attributes.timestamp,
        }),
        parseHTML: (element) => ({
          timestamp: element.getAttribute('data-timestamp') || new Date(0).toISOString(),
        }),
      },
      uuid: {
        default: uuidv4(),
        renderHTML: (attributes) => ({
          'data-uuid': attributes.uuid,
        }),
        parseHTML: (element) => ({
          uuid: element.getAttribute('data-uuid') || uuidv4(),
        }),
      },
    };
  },

  /**
   *
   */
  renderHTML({ HTMLAttributes }) {
    return ['addition', HTMLAttributes, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'addition' }];
  },

  /**
   *
   */
  addCommands() {
    return {
      toggleAddition:
        (color: string, user: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.type, { color, user, timestamp: new Date().toISOString() });
        },
      setAddition:
        (color: string, user: string) =>
        ({ commands }) => {
          return commands.setMark(this.type, { color, user, timestamp: new Date().toISOString() });
        },
      unsetAddition:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.type);
        },
    };
  },
});

export { Addition };
export type { AdditionOptions };
