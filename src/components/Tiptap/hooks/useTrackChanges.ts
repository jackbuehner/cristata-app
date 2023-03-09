import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import type * as Y from 'yjs';
import { SetDocAttrStep } from '../utilities/SetDocAttrStep';
import type { IYSettingsMap } from './useY';

function useTrackChanges({ editor, ydoc, ySettingsMap }: TrackChangesProps): ReturnType {
  // manage whether track changes is on
  const [isTracking, setIsTracking] = useState<boolean>(editor?.state.doc.attrs.trackChanges || false);

  /**
   * Toggle whether track changes is enabled. Sets the change to react state
   *  and stores the change in the ydoc.
   */
  const toggle = () => {
    // update track changes in react state
    setIsTracking(!isTracking);
    // update content of the ydoc
    ydoc?.transact(() => {
      // set a trackChanges key-value pair inside the settings map
      ySettingsMap?.set('trackChanges', !isTracking);
    });
  };

  // when the editor finishes loading, update track changes to match
  useEffect(() => {
    if (editor) {
      setIsTracking(ySettingsMap?.get('trackChanges'));
    }
  }, [setIsTracking, ySettingsMap, editor]);

  // if another editor changes the track changes setting, update the react state
  ySettingsMap?.observe(() => {
    setIsTracking(ySettingsMap.get('trackChanges'));
  });

  // when `trackChanges` is changed in state, also set it in the document attributes.
  // the document attributes do not sync, but they are available to tiptap extensions.
  useEffect(() => {
    if (editor) {
      editor.state.tr.step(new SetDocAttrStep('trackChanges', isTracking));
    }
  }, [editor, isTracking]);

  return [isTracking, toggle];
}

interface TrackChangesProps {
  editor: Editor | null;
  ydoc: Y.Doc | undefined;
  ySettingsMap: Y.Map<IYSettingsMap> | undefined;
}

type ReturnType = [boolean, () => void];

export { useTrackChanges };
