import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorOptions } from '@tiptap/core';
import Collaboration, { CollaborationOptions } from '@tiptap/extension-collaboration';
import CollaborationCursor, { CollaborationCursorOptions } from '@tiptap/extension-collaboration-cursor';
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

const useTipTapEditor = (options: Partial<EditorOptions> & EditorRequirements): Editor | null => {
  const editorRef = useRef<Editor | null>(null);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (typeof window === undefined) return; // server; ignore
    if (editorRef.current?.isDestroyed) return; // attempted to update options after editor was destroyed; this shouldn't occur.

    if (
      !editorRef.current &&
      typeof window !== undefined &&
      options.document &&
      options.provider &&
      options.field
    ) {
      // create editor on initial browser render
      editorRef.current = new Editor({
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
      });

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
      editorRef.current.setOptions(options);

      // update collaboration extensions with latest document, field, and provider
      const extensions = editorRef.current.extensionManager.extensions;
      type CE = Extension<CollaborationOptions, any> | undefined;
      type CCE = Extension<CollaborationCursorOptions, any> | undefined;
      const collaborationExtension = extensions.find((ext) => ext.name === 'collaboration') as CE;
      const collaborationCursorExtension = extensions.find((ext) => ext.name === 'collaborationCursor') as CCE;
      if (collaborationExtension) {
        collaborationExtension.options.document = options.document;
        collaborationExtension.options.field = options.field || 'default';
      }
      if (collaborationCursorExtension) {
        collaborationCursorExtension.options.provider = options.provider;
      }
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
  provider: WebrtcProvider | HocuspocusProvider | undefined;
  field: string | undefined;
}

export type { EditorRequirements };
export { useTipTapEditor };
