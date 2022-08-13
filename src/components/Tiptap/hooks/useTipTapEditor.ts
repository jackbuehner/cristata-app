import { EditorOptions } from '@tiptap/core';
import { CollaborationOptions } from '@tiptap/extension-collaboration';
import { Editor, Extension } from '@tiptap/react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useEffect, useRef, useState } from 'react';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

function useForceUpdate() {
  const [, setValue] = useState(0);

  // debounce the forced update by 30ms to avoid expensive state updates
  // when user does rapid changes such as holding the backspace key
  const increment = AwesomeDebouncePromise(() => {
    setValue((value) => value + 1);
  }, 30);

  return increment;
}

interface CollaborationOptions2 extends CollaborationOptions {
  document: Y.Doc | undefined;
}

const useTipTapEditor = (options: Partial<EditorOptions> & EditorRequirements): Editor | null => {
  const editorRef = useRef<Editor | null>(null);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!editorRef.current && typeof window !== 'undefined' && options.document && options.provider) {
      // create editor on initial browser render
      editorRef.current = new Editor(options);

      // get the ydoc shared type
      const CollaborationExtension = options.extensions?.find((ext) => ext.name === 'collaboration') as
        | Extension<CollaborationOptions2>
        | undefined;
      const sharedType = CollaborationExtension?.options?.document?.getXmlFragment(
        CollaborationExtension.options.field
      );

      // trigger update in editor
      const update = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            forceUpdate();
          });
        });
      };

      // listen for transactions AND ydoc shared type change
      editorRef.current.on('transaction', update);
      sharedType?.observe(update);
      return () => {
        editorRef?.current?.off('transaction', update);
        sharedType?.unobserve(update);
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
      editorRef.current = null;
    };
  }, []);

  return editorRef.current;
};

interface EditorRequirements {
  document: Y.Doc | undefined;
  provider: WebrtcProvider | undefined;
}

export type { EditorRequirements };
export { useTipTapEditor };
