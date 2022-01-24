import { Editor } from '@tiptap/react';
import applyDevTools from 'prosemirror-dev-tools';

/**
 * Applies prosemirror dev tools to the editor. Returns whether dev tools have
 * been applied.
 *
 * _Only applies when `NODE_ENV` is `development`._
 */
function useDevTools({ editor }: DevToolsProps): boolean {
  if (editor && process.env.NODE_ENV === 'development') {
    applyDevTools(editor.view);
    return true;
  }
  return false;
}

interface DevToolsProps {
  editor: Editor | null;
}

export { useDevTools };
