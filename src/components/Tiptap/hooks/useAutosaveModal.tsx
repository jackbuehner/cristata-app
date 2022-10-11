import React from 'react';
import { useWindowModal } from '../../../hooks/useWindowModal';

function useAutosaveModal(): [React.ReactNode, () => void, () => void] {
  // create the modal
  const [Window, showModal, hideModal] = useWindowModal(() => {
    return {
      title: `No need to manually save`,
      continueButton: { text: `Close` },
      cancelButton: null,
      windowOptions: { name: `no autosave` },
      text: `Changes to all fields are synced and saved automatically.`,
    };
  }, []);

  // return the modal
  return [Window, showModal, hideModal];
}

export { useAutosaveModal };
