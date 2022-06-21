import { useState } from 'react';
import { Titlebar } from '../../components/Titlebar';
import { Window } from './Window';

type UseWindow = [
  Modal: false | React.ReactNode,
  openWindow: () => void,
  closeWindow: () => void,
  more: UseWindowMore
];

interface UseWindowMore {}

interface UseWindowOptions {
  name?: string;
  title?: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
}

function useWindow(Node: React.ReactNode, options?: UseWindowOptions): UseWindow {
  const [open, setOpen] = useState(false);

  const openWindow = () => {
    setOpen(true);
  };

  const closeWindow = () => {
    setOpen(false);
  };

  const WindowModal = open && (
    <Window
      hideWindowModal={closeWindow}
      windowName={options?.name}
      width={options?.width}
      height={options?.height}
      top={options?.top}
      left={options?.left}
    >
      <Titlebar hideNavigation forceColor title={`Cristata`} />
      <div
        style={{ position: 'relative', width: '100%', height: 'calc(100% - env(titlebar-area-height, 33px))' }}
      >
        {Node}
      </div>
    </Window>
  );

  return [WindowModal, openWindow, closeWindow, {}];
}

export { useWindow };
export type { UseWindowOptions };
