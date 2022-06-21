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

function Window(props: WindowProps) {
  const [container] = useState<HTMLDivElement>(() => document.createElement('div'));
  const newWindow = useRef<Window | null>(window);

  useEffect(() => {
    if (container) {
      newWindow.current = window.open(
        '/popup.html',
        props.windowName || '',
        `width=${props.width || 480},height=${props.height || 240},left=${props.left || 200},top=${
          props.top || 200
        }`
      );

      container.style.width = '100%';
      container.style.height = '100%';

      const curWindow = newWindow.current;
      if (curWindow) {
        curWindow.onload = function () {
          curWindow.document.body.appendChild(container);

          curWindow.addEventListener('beforeunload', () => {
            props.hideWindowModal();
          });
        };
      }
      return () => curWindow?.close();
    }
  }, [container, props]);

  const windowCache = createCache({
    key: 'cristata-popup',
    container: container,
  });

  return (
    container &&
    ReactDOM.createPortal(<CacheProvider value={windowCache}>{props.children}</CacheProvider>, container)
  );
}

export { Window };
