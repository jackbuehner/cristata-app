import type { HocuspocusProvider } from '@hocuspocus/provider';
import type { EditorOptions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Editor } from '@tiptap/react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useEffect, useRef, useState } from 'react';
import type { WebrtcProvider } from 'y-webrtc';
import type * as Y from 'yjs';

function useForceUpdate() {
  const [, setValue] = useState(0);

  // debounce the forced update by 30ms to avoid expensive state updates
  // when user does rapid changes such as holding the backspace key
  const increment = AwesomeDebouncePromise(() => {
    setValue((value) => value + 1);
  }, 30);

  return increment;
}

const useTipTapEditor = (options: Partial<EditorOptions> & EditorRequirements): Editor | null => {
  const editorRef = useRef<Editor | null>(null);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (typeof window === undefined) return; // server; ignore
    if (editorRef.current?.isDestroyed) return; // attempted to update options after editor was destroyed; this shouldn't occur.
    if (!options.document) return; // yjs doc is required; ignore
    if (!options.provider) return; // collaboration provider is required; ignore
    if (!options.field) return; // yjs shared type field name is required; ignore

    // construct editor options that include collaboration
    const editorOptions = {
      ...options,
      extensions: [
        ...(options.extensions || [])
          .filter((ext) => ext.name !== 'collaboration')
          .filter((ext) => ext.name !== 'collaborationCursor'),
        // support collaboration
        Collaboration.configure({
          document: options.document,
          field: options.field || 'default',
        }),
        // show cursor locations when collaborating
        CollaborationCursor.configure({
          provider: options.provider,
        }),
      ],
    };

    if (!editorRef.current) {
      // create editor on initial browser render
      editorRef.current = new Editor(editorOptions);

      // get the ydoc shared type
      const sharedType = options.document?.getXmlFragment(options.field);

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
    }

    if (editorRef.current) {
      // update options
      editorRef.current.setOptions(editorOptions);
    }
  }, [forceUpdate, options]);

  // destroy editor on unmount
  useEffect(() => {
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [options.document, options.field, options.provider]);

  return editorRef.current;
};

interface EditorRequirements {
  document: Y.Doc | undefined;
  provider: WebrtcProvider | HocuspocusProvider | undefined;
  field: string | undefined;
}

export type { EditorRequirements };
export { useTipTapEditor };
