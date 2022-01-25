import { Editor } from '@tiptap/react';
import applyDevTools from 'prosemirror-dev-tools';
import { useLocation } from 'react-router-dom';

/**
 * Applies prosemirror dev tools to the editor. Returns whether dev tools have
 * been applied.
 *
 * _Only applies when `NODE_ENV` is `development`._
 */
function useDevTools({ editor }: DevToolsProps): boolean {
  const { search } = useLocation();
  const isDevMode = new URLSearchParams(search).get('dev') || false;

  if (editor && isDevMode) {
    applyDevTools(editor.view);
    return true;
  }

  return false;
}

interface DevToolsProps {
  editor: Editor | null;
}

export { useDevTools };
