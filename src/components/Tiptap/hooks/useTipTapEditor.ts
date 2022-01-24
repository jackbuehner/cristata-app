import { useCallback, useState, useEffect, useRef } from 'react';
import { EditorOptions } from '@tiptap/core';
import { Editor } from '@tiptap/react';

function useForceUpdate() {
  const [, setValue] = useState(0);

  return useCallback(() => setValue((value) => value + 1), []);
}

const useTipTapEditor = (options: Partial<EditorOptions> = {}): Editor | null => {
  const editorRef = useRef<Editor | null>(null);
  const forceUpdate = useForceUpdate();

  if (!editorRef.current && typeof window !== 'undefined') {
    // create editor on initial browser render
    editorRef.current = new Editor(options);
    editorRef.current.on('transaction', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          forceUpdate();
        });
      });
    });
  } else if (!editorRef.current) {
    // server; ignore
  } else if (editorRef.current.isDestroyed) {
    // attempted to update options after editor was destroyed; this shouldn't occur.
  } else {
    editorRef.current.setOptions(options);
  }

  // destroy editor on unmount
  useEffect(() => {
    return () => {
      editorRef.current?.destroy();
    };
  }, []);

  return editorRef.current;
};

export { useTipTapEditor };
