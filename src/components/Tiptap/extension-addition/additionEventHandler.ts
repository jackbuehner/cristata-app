import { Extension } from '@tiptap/core';
import { getMarkType } from '@tiptap/react';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Addition } from '.';

const AdditionEventHandler = Extension.create({
  name: 'additionEventHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('additionEventHandler'),
        props: {
          handleTextInput({ state, dispatch }, from, to, text) {
            if (!state.doc.attrs?.trackChanges) {
              // typing inside a node with the addition mark should insert text without the additon mark
              if (state.doc.rangeHasMark(from - 1, to, getMarkType(Addition.name, state.schema))) {
                dispatch(
                  state.tr
                    .insertText(text, from, to)
                    .removeMark(from, from + 1, getMarkType(Addition.name, state.schema))
                );
                return true;
              }
            } else {
              // typing anywhere with tracked changes turned on should insert text with the addition mark
              dispatch(
                state.tr
                  .insertText(text, from, to)
                  .addMark(from, from + 1, getMarkType(Addition.name, state.schema).create())
              );
              return true;
            }

            return false;
          },
          handlePaste({ state, dispatch }, _event, slice) {
            if (state.doc.attrs?.trackChanges) {
              const tr = state.tr;

              const range = {
                from: state.selection.from,
                to: state.selection.to,
              };

              tr.replaceSelection(slice).addMark(
                range.from,
                range.from + slice.size,
                getMarkType(Addition.name, state.schema).create()
              );
              dispatch(tr);

              return true;
            }

            return false;
          },
          handleDOMEvents: {
            keydown: ({ state, dispatch }, event) => {
              const tr = state.tr;

              const range = {
                from: state.selection.from,
                to: state.selection.to,
              };

              // when track changes is on, add a pilcrow to the text when the Enter key is pressed
              if (state.doc.attrs?.trackChanges && event.key === 'Enter') {
                tr.insertText('¶', range.from, range.from).addMark(
                  range.from,
                  range.from + 1,
                  getMarkType(Addition.name, state.schema).create()
                );
                dispatch(tr);
                return true;
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});

export { AdditionEventHandler };
