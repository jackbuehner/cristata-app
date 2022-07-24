import styled from '@emotion/styled/macro';
import IframeResizer from 'iframe-resizer-react';
import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../../redux/hooks';

interface ExternalFrameProps {
  src: string;
}

function ExternalFrame({ src }: ExternalFrameProps) {
  const state = useAppSelector(({ cmsItem }) => cmsItem);
  const iframe = useRef<any>(null);

  useEffect(() => {
    const reportMessages = (e: MessageEvent) => {
      if (e.origin !== new URL(src).origin) return;
      if (e.data === 'connected' && iframe.current) {
        iframe.current.sendMessage({
          type: 'fields',
          fields: state.fields,
        });
      }
    };

    window.addEventListener('message', reportMessages, false);
    return () => {
      window.removeEventListener('message', reportMessages);
    };
  }, [src, state.fields]);

  if (iframe.current) {
    iframe.current.sendMessage({
      type: 'fields',
      fields: state.fields,
    });
  }

  return (
    <Frame
      forwardRef={iframe}
      autoResize={true}
      resizeFrom={'child'}
      checkOrigin={false}
      contentEditable={false}
      inPageLinks={false}
      heightCalculationMethod={'documentElementOffset'}
      title={'tiptap-header'}
      src={src}
    />
  );
}

const Frame = styled(IframeResizer)`
  width: 100%;
  border: none;
  margin-bottom: -74px;
`;

export { ExternalFrame };
