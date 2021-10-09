import { Node } from '@tiptap/core';
import { Command, ReactNodeViewRenderer } from '@tiptap/react';
import { YoutubeVideoEmbed } from './YoutubeVideoEmbed';

declare module '@tiptap/core' {
  interface Commands {
    youtubeWidget: {
      insertYoutubeWidget: (videoId: string) => Command;
    };
  }
}

interface YoutubeWidgetOptions {}

const YoutubeWidget = Node.create<YoutubeWidgetOptions>({
  name: 'youtubeWidget',

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
      videoId: {
        default: 'undefined',
        renderHTML: (attributes) => ({
          'data-video-id': attributes.videoId,
        }),
        parseHTML: (element) => ({
          videoId: element.getAttribute('data-video-id') || 'undefined',
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
    };
  },

  /**
   *
   */
  renderHTML({ HTMLAttributes }) {
    return ['youtubeWidget', HTMLAttributes, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'youtubeWidget' }];
  },

  /**
   *
   */
  addCommands() {
    return {
      insertYoutubeWidget:
        (videoId: string) =>
        ({ state, dispatch }) => {
          if (dispatch) {
            // remove anything within the selection
            state.tr.deleteRange(state.selection.from, state.selection.to);

            // split the node twice where the caret is located
            // (this creates an empty node between two nodes with content)
            state.tr.split(state.selection.from);
            state.tr.split(state.selection.from);

            // set the type of the empty node to the youtube video type
            state.tr.setBlockType(state.selection.from - 2, state.selection.to - 2, this.type, { videoId });

            return dispatch(state.tr);
          }

          return false;
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeVideoEmbed);
  },
});

export { YoutubeWidget };
export type { YoutubeWidgetOptions };
