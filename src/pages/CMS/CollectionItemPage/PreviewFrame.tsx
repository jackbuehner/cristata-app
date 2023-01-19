import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ArrowClockwise20Regular, ArrowDownload20Regular } from '@fluentui/react-icons';
import IframeResizer from 'iframe-resizer-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/Button';
import type { EntryY } from '../../../components/Tiptap/hooks/useY';
import { isJSON } from '../../../utils/isJSON';

interface ExternalFrameProps {
  src: string;
  y: EntryY;
}

function PreviewFrame({ src, ...props }: ExternalFrameProps) {
  const frameRef = useRef<any>(null);
  const [iframehtmlstring, setIframehtmlstring] = useState('');
  const theme = useTheme();
  const [key, setCount] = useState(0);

  useEffect(() => {
    const reportMessages = (e: MessageEvent) => {
      if (e.origin !== new URL(src).origin) return;
      if (e.data === 'connected' && frameRef.current) {
        frameRef.current.sendMessage({
          type: 'fields',
          fields: props.y.fullData,
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
  }, [src, props.y.fullData]);

  if (frameRef.current) {
    frameRef.current.sendMessage({
      type: 'fields',
      fields: props.y.fullData,
    });
  }

  return (
    <>
      <div
        style={{
          backgroundColor: theme.mode === 'dark' ? theme.color.neutral.dark[100] : 'white',
          padding: '10px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6,
        }}
      >
        <Button
          onClick={() =>
            downloadHTML(iframehtmlstring, `${props.y.fullData.name || props.y.fullData._id || 'document'}`)
          }
          icon={<ArrowDownload20Regular />}
        >
          Download HTML
        </Button>
        <Button onClick={() => setCount((count) => count + 1)} icon={<ArrowClockwise20Regular />}>
          Reload preview
        </Button>
      </div>
      <Frame
        key={key}
        forwardRef={frameRef}
        autoResize={true}
        resizeFrom={'child'}
        checkOrigin={false}
        contentEditable={false}
        inPageLinks={true}
        heightCalculationMethod={'documentElementOffset'}
        title={'tiptap-header'}
        src={src}
        allow={'clipboard-write'}
      />
    </>
  );
}

const Frame = styled(IframeResizer)`
  width: 100%;
  border: none;
`;

function downloadHTML(iframehtmlstring: string, title = 'document') {
  const constructed = `<html>
    <head>
      <title>${title} | Preview</title>
    </head>
    <body>
      <div>${iframehtmlstring}</div>
    </body>
  </html>`;

  // create blob
  const blob = new Blob([constructed], { type: 'text/plain;charset=utf-8' });

  // download
  const url = window.URL || window.webkitURL;
  const link = url.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = title + '.html';
  a.href = link;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export { PreviewFrame };
