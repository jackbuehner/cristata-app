import { Node } from '@tiptap/core';
import { Command, ReactNodeViewRenderer } from '@tiptap/react';
import { PhotoWidgetNodeView } from './PhotoWidgetNodeView';

declare module '@tiptap/core' {
  interface Commands {
    photoWidget: {
      insertPhotoWidget: (photoId: string) => Command;
    };
  }
}

interface PhotoWidgetOptions {}

const PhotoWidget = Node.create<PhotoWidgetOptions>({
  name: 'photoWidget',

  // only allow zero or more inline nodes
  content: 'text*',

  group: 'block',

  draggable: false,

  allowGapCursor: false,

  /**
   *
   */
  addAttributes() {
    return {
      photoId: {
        default: '',
        renderHTML: (attributes) => ({
          'data-photo-id': attributes.photoId,
        }),
        parseHTML: (element) => ({
          photoId: element.getAttribute('data-photo-id') || '',
        }),
      },
      photoUrl: {
        default: '',
        renderHTML: (attributes) => ({
          'data-photo-url': attributes.photoUrl,
        }),
        parseHTML: (element) => ({
          photoUrl: element.getAttribute('data-photo-url') || '',
        }),
      },
      photoCredit: {
        default: '',
        renderHTML: (attributes) => ({
          'data-photo-credit': attributes.photoCredit,
        }),
        parseHTML: (element) => ({
          photoCredit: element.getAttribute('data-photo-credit') || '',
        }),
      },
      showCaption: {
        default: false,
        renderHTML: (attributes) => ({
          'data-show-caption': attributes.showCaption,
        }),
        parseHTML: (element) => ({
          showCaption: element.getAttribute('data-show-caption') || false,
        }),
      },
      position: {
        default: 'center',
        renderHTML: (attributes) => ({
          'data-wrap-position': attributes.position,
        }),
        parseHTML: (element) => ({
          position: element.getAttribute('data-wrap-position') || 'center',
        }),
      },
    };
  },

  /**
   *
   */
  renderHTML({ HTMLAttributes }) {
    return ['photoWidget', HTMLAttributes, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'photoWidget' }];
  },

  /**
   *
   */
  addCommands() {
    return {
      insertPhotoWidget:
        (photoId: string) =>
        ({ state, dispatch }) => {
          if (dispatch) {
            // remove anything within the selection
            state.tr.deleteRange(state.selection.from, state.selection.to);

            // split the node twice where the caret is located
            // (this creates an empty node between two nodes with content)
            state.tr.split(state.selection.from);
            state.tr.split(state.selection.from);

            // set the type of the empty node to the photo widget type
            state.tr.setBlockType(state.selection.from - 2, state.selection.to - 2, this.type, { photoId });

            return dispatch(state.tr);
          }

          return false;
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(PhotoWidgetNodeView);
  },
});

export { PhotoWidget };
export type { PhotoWidgetOptions };
