import Collaboration from '@tiptap/extension-collaboration';
import { Editor, Extensions } from '@tiptap/react';
import * as Y from 'yjs';

function getTipTapEditorJson(field: string, document: Y.Doc, extensions: Extensions): string {
  // get current value
  const current = document.getXmlFragment(field);

  // set value in tiptap
  const tiptap = new Editor({
    extensions: [...extensions, Collaboration.configure({ fragment: current })],
  });

  // get the current json from the editor
  const json = JSON.stringify(tiptap.getJSON().content);

  // destroy tiptap editor
  tiptap.destroy();

  // return json
  return json;
}

export { getTipTapEditorJson };
