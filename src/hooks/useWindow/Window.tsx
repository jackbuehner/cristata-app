import { CacheProvider } from '@emotion/react';
import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import createCache from '@emotion/cache';

interface WindowProps {
  children: React.ReactNode;
  hideWindowModal: () => void;
  windowName?: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
}

function Window({ width, height, top, left, windowName, hideWindowModal, children }: WindowProps) {
  const [container] = useState<HTMLDivElement>(() => document.createElement('div'));
  const newWindow = useRef<Window | null>(window);

  useEffect(() => {
    container.style.width = '100%';
    container.style.height = '100%';
  }, [container]);

  useEffect(() => {
    newWindow.current = window.open(
      '/popup.html',
      windowName || '',
      `width=${width || 480},height=${height || 240},left=${left || 200},top=${top || 200}`
    );

    if (newWindow.current) {
      newWindow.current.onload = () => {
        newWindow.current!.document.body.appendChild(container);

        newWindow.current!.addEventListener('beforeunload', () => {
          hideWindowModal();
        });
      };
    }

    return () => {
      newWindow.current?.close();
    };
    // hideWindowModal needlessly triggers the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, height, left, top, width, windowName]);

  const windowCache = createCache({
    key: 'cristata-popup',
    container: container,
  });

  return (
    container && ReactDOM.createPortal(<CacheProvider value={windowCache}>{children}</CacheProvider>, container)
  );
}

export { Window };
