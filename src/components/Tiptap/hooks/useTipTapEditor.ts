import { EditorOptions } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useEffect, useRef, useState } from 'react';

function useForceUpdate() {
  const [, setValue] = useState(0);

  // debounce the forced update by 30ms to avoid expensive state updates
  // when user does rapid changes such as holding the backspace key
  const increment = AwesomeDebouncePromise(() => {
    setValue((value) => value + 1);
  }, 30);

  return increment;
}

const useTipTapEditor = (options: Partial<EditorOptions> = {}): Editor | null => {
  const editorRef = useRef<Editor | null>(null);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!editorRef.current && typeof window !== 'undefined') {
      // create editor on initial browser render
      editorRef.current = new Editor(options);

      // keep editor updated
      const update = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            forceUpdate();
          });
        });
      };
      editorRef.current.on('transaction', update);
      return () => {
        editorRef?.current?.off('transaction', update);
      };
    } else if (!editorRef.current) {
      // server; ignore
    } else if (editorRef.current.isDestroyed) {
      // attempted to update options after editor was destroyed; this shouldn't occur.
    } else {
      editorRef.current.setOptions(options);
    }
  }, [forceUpdate, options]);

  // destroy editor on unmount
  useEffect(() => {
    return () => {
      editorRef.current?.destroy();
    };
  }, []);

  return editorRef.current;
};

export { useTipTapEditor };
