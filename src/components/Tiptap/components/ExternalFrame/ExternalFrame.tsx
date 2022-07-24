import styled from '@emotion/styled/macro';
import IframeResizer from 'iframe-resizer-react';
import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import { isJSON } from '../../../../utils/isJSON';

interface ExternalFrameProps {
  src: string;
  tiptapwidth: number;
  setIframehtmlstring: React.Dispatch<React.SetStateAction<string>>;
}

function ExternalFrame({ src, tiptapwidth, setIframehtmlstring }: ExternalFrameProps) {
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
      if (isJSON(e.data)) {
        const parsed = JSON.parse(e.data);
        if (
          parsed?.contentTag &&
          typeof parsed.contentTag === 'string' &&
          parsed.styleString &&
          typeof parsed.styleString === 'string'
        ) {
          const frameString = `
            <div id="iframeTop">
              <style>${parsed.styleString}</style>
              ${parsed.contentTag}
            </div>
          `;
          setIframehtmlstring(frameString);
        }
      }
    };

    window.addEventListener('message', reportMessages, false);
    return () => {
      window.removeEventListener('message', reportMessages);
    };
  }, [setIframehtmlstring, src, state.fields]);

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
      tiptapwidth={tiptapwidth}
    />
  );
}

const Frame = styled(IframeResizer)<{ tiptapwidth: number }>`
  width: 100%;
  border: none;
  margin-bottom: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? -6 : -74)}px;
`;

export { ExternalFrame };
