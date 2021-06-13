import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Command } from '@tiptap/react';
import { Node as ProsemirrorNode, Slice } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { CommentContainer } from './CommentContainer';
import { v4 as uuidv4 } from 'uuid';

declare module '@tiptap/core' {
  interface Commands {
    comment: {
      /**
       * Wrap text nodes in a comment node.
       */
      setComment: () => Command;
      /**
       * Remove the comment node included in the selection.
       *
       * Any child text nodes will be reinserted.
       *
       * This command will expand the selection to include the entiere comment node.
       */
      unsetComment: () => Command;
    };
  }
}

interface CommentOptions {}

const Comment = Node.create<CommentOptions>({
  name: 'comment',

  // add to 'inline' group
  group: 'inline',

  // renders comment nodes in line with the text
  inline: true,

  // only allow zero or more inline nodes
  content: 'text*',

  /**
   *
   */
  addAttributes() {
    return {
      // use a color attrubute to define the background color of text highlighted with a comment
      color: {
        // use this color by default
        default: '#faf0a2',
        // apply these attributes to the rendered element in the editor
        renderHTML: (attributes) => {
          return {
            style: `background-color: ${attributes.color}`,
          };
        },
        parseHTML: (element) => ({
          color: element.style.backgroundColor || '#faf0a2',
        }),
      },
      message: {
        default: '',
        renderHTML: (attributes) => ({
          'data-message': attributes.message,
        }),
        parseHTML: (element) => ({
          message: element.getAttribute('data-message') || '',
        }),
      },
      timestamp: {
        default: new Date().toISOString,
        renderHTML: (attributes) => ({
          'data-timestamp': attributes.timestamp,
        }),
        parseHTML: (element) => ({
          timestamp: element.getAttribute('data-timestamp') || new Date(0).toISOString(),
        }),
      },
      commenter: {
        default: {
          name: '',
          photo: 'https://avatars.githubusercontent.com/u/69555023',
        },
        renderHTML: (attributes) => ({
          'data-commenter': JSON.stringify(attributes.commenter),
        }),
        parseHTML: (element) => {
          const attr = element.getAttribute('data-commenter');
          const commenter = JSON.parse(
            attr || '{ "name": "hi", "photo": "https://avatars.githubusercontent.com/u/69555023" }'
          );
          return {
            commenter: commenter,
          };
        },
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
    return ['commment', HTMLAttributes, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'comment' }];
  },

  /**
   *
   */
  addCommands() {
    return {
      setComment:
        () =>
        ({ state, tr, dispatch }) => {
          try {
            // a slice containing the selected nodes
            const selectionSlice = state.selection.content();

            // keep track of whether the selection includes the comment so that we do no insert
            // overlapping comments
            let selectionIncludesComment = false;
            selectionSlice.content.descendants((node) => {
              if (node.type === this.type) selectionIncludesComment = true;
            });

            if (dispatch) {
              // dispatch is undefined when testing whether the command is possible with `can()`

              if (selectionSlice && selectionSlice.content.childCount === 1 && !selectionIncludesComment) {
                // obtain all text nodes located in the first child node of the slice
                // NOTES:
                // - only look in the first child node since comments cannot span
                //   more than one block node)
                // - only nodes that are children to the first child node will be
                //   text nodes)
                // - continuing when the slice contains more than one node would
                //   cause two block nodes to collapse into one since the
                //   `replaceSelectionWith` will remove and ends and starts to
                //   block nodes
                // - continuing when the slice contains an existing comment would
                //   result in overlapping comments
                textNodesFromSliceFirstChild(selectionSlice).then((textNodes) => {
                  if (textNodes) {
                    // create a new comment node that contains all of the text nodes
                    const newCommentNode = this.type.createAndFill({}, textNodes);
                    if (newCommentNode) {
                      // replace the current selection with the comment node that
                      // contains the text nodes in the selection
                      tr.replaceSelectionWith(newCommentNode, false);
                      this.editor.view.dispatch(tr);
                    }
                  }
                });
              }
            }

            // when the selection slice only contains one child,
            // tell tiptap that this command is possible
            return selectionSlice.content.childCount === 1 && !selectionIncludesComment;
          } catch (error) {
            console.error(error);
            return false;
          }
        },
      unsetComment:
        () =>
        ({ chain, commands, state, tr, dispatch }) => {
          return chain()
            .command(({ tr }) => {
              try {
                // get the parent node, which is the entire comment node if the anchor is inside the comment
                const parent = tr.selection.$anchor;
                // check whether the node is a comment node
                const isComment = parent.node().hasMarkup(this.type);
                return isComment;
              } catch (error) {
                console.error(error);
                return false;
              }
            })
            .command(({ tr, chain }) => {
              try {
                // get the entire comment node
                const parent = tr.selection.$anchor;

                // also store the start position of the parent
                const start = parent.start();

                // get the text nodes in the comment node
                const textNodes: ProsemirrorNode<any>[] = [];
                parent.node().content.descendants((textNode) => {
                  textNodes.push(textNode);
                });

                // select the entire comment node and delete it
                tr.setSelection(TextSelection.near(parent));
                chain().selectParentNode().deleteSelection().run();

                // get the type of the node that is the parent of the comment node
                // (usually a paragraph)
                const parentOfParentType = tr.doc.resolve(start).node().type;

                // create a new node that matches the new parent type
                const newNode = parentOfParentType.createAndFill({}, textNodes);

                if (newNode) {
                  // replace the empty space left after removing the comment and
                  // replace it with the slice, which has the text nodes inside
                  // of the comment node
                  const slice = new Slice(newNode.content, 0, 0);
                  tr.replace(start - 1, start - 1, slice);
                }
                return true;
              } catch (error) {
                console.error(error);
                return false;
              }
            })
            .run();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CommentContainer);
  },
});

/**
 * Get text nodes (recursively) from a slice.
 * @returns array of TextNodes; null if no nodes in slice
 */
async function textNodesFromSliceFirstChild(slice: Slice<any>) {
  // store any text noted that have been found
  let TextNodes: ProsemirrorNode<any>[] = [];

  /**
   * Find the text nodes in a slice.
   */
  const findTextNodes = async (node: ProsemirrorNode<any>) => {
    node.forEach(async (childNode) => {
      // if it is a text node, add it to the array
      if (childNode.isText) TextNodes.push(childNode);

      if (childNode.childCount !== 0) {
        childNode.forEach(async (child) => {
          await findTextNodes(child);
        });
      }
    });
  };

  // start the function that recursively looks for text nodes
  if (slice.content.firstChild) {
    await findTextNodes(slice.content.firstChild);
    return TextNodes;
  }
  return null;
}

export { Comment };
export type { CommentOptions };