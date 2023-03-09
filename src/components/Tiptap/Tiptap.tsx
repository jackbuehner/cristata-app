import { get as getProperty } from '$utils/objectPath';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useEffect, useMemo, useRef, useState } from 'react';
import useDimensions from 'react-cool-dimensions';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation } from 'svelte-preprocess-react/react-router';
import './office-icon/colors1.css';

/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ArrowRedo20Regular, ArrowUndo20Regular, Save20Regular } from '@fluentui/react-icons';
import { WebSocketStatus } from '@hocuspocus/provider';
import { LinearProgress } from '@rmwc/linear-progress';
import Placeholder from '@tiptap/extension-placeholder';
import type { Editor, PureEditorContent } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';
import type { tiptapOptions } from '../../config';
import { CollectionItemPageContent } from '../../pages/CMS/CollectionItemPage';
import type { Action } from '../../pages/CMS/CollectionItemPage/useActions';
import type { themeType } from '../../utils/theme/theme';
import { editorExtensions } from '../CollaborativeFields/editorExtensions';
import utils from '../CollaborativeFields/utils';
import { Spinner } from '../Loading';
import { Backstage } from './components/Backstage';
import { ExternalFrame } from './components/ExternalFrame';
import { Noticebar } from './components/Noticebar';
import { Sidebar } from './components/Sidebar';
import { Statusbar, StatusbarBlock } from './components/Statusbar';
import { Titlebar } from './components/Titlebar';
import { Toolbar } from './components/Toolbar';
import { CommentPanel } from './extension-power-comment';
import type { useAwareness } from './hooks';
import {
  useAutosaveModal,
  useDevTools,
  useSidebar,
  useTipTapEditor,
  useTrackChanges,
  useWordCount,
} from './hooks';
import type { FieldY, IYSettingsMap } from './hooks/useY';
import { SetDocAttrStep } from './utilities/SetDocAttrStep';

interface ITiptap {
  y: FieldY;
  docName: string;
  title?: string;
  options?: tiptapOptions;
  isDisabled?: boolean;
  onDebouncedChange?: (editorJson: string, currentJsonInState?: string | null) => void;
  currentJsonInState?: string | null;
  html?: string;
  actions?: Array<Action | null>;
  isMaximized?: boolean;
  forceMax?: boolean;
  message?: string;
  showLoading?: boolean;
  layout?: string;
  compact?: boolean;
  user: ReturnType<typeof useAwareness>[0];
}

const Tiptap = (props: ITiptap) => {
  const theme = useTheme() as themeType;
  const { search } = useLocation();
  const { ydoc, wsProvider: provider, awareness: awarenessProfiles } = props.y;
  const ySettingsMap = ydoc?.getMap<IYSettingsMap>('__settings');
  const { observe, width: thisWidth } = useDimensions(); // monitor the dimensions of the editor

  // manage sidebar content
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const [
    { isOpen: isSidebarOpen, content: sidebarContent, title: sidebarTitle },
    { setIsOpen: setIsSidebarOpen, setContent: setSidebarContent, setTitle: setSidebarTitle },
  ] = useSidebar({
    defaults: {
      // open the sidebar to document properties if the url contains the correct search param
      isOpen: searchParams.get('props') === '1' || searchParams.get('comments') === '1',
      title: searchParams.get('comments') === '1' ? 'Comments' : 'Document properties',
      content:
        searchParams.get('comments') === '1' ? (
          <CommentPanel />
        ) : (
          <CollectionItemPageContent isEmbedded y={props.y} user={props.user} />
        ),
    },
  });

  // create a debounced update function
  const onUpdateDelayed = AwesomeDebouncePromise(async (editor: Editor) => {
    if (props.onDebouncedChange) {
      // get the json for the editor and send it to the parent component via `onChange()`
      const json = JSON.stringify(editor.getJSON().content);
      props.onDebouncedChange(json, editor.storage.currentJson);
    }
  }, 1000);

  // create the editor
  const editor = useTipTapEditor({
    document: ydoc,
    field: props.y.field,
    provider: provider,
    editable: !props.isDisabled,
    extensions: [
      ...editorExtensions.tiptap,
      Placeholder.configure({
        placeholder: ({ editor }) => {
          if (editor.state.selection.from <= 1) return 'Write something...';
          return '';
        },
      }),
    ],
    onUpdate() {
      const editor = this as unknown as Editor;
      onUpdateDelayed(editor);
    },
    editorProps: {
      handleKeyDown(view, event) {
        return false;
      },
      handleTextInput() {
        return false;
      },
    },
    onSelectionUpdate({ editor }) {
      const anchorIsInComment = editor.state.selection.$anchor
        .marks()
        .some((mark) => mark.type.name === 'powerComment');
      if (anchorIsInComment) {
        setSidebarTitle('Comments');
        setSidebarContent(<CommentPanel />);
        setIsSidebarOpen(true);
        if (window?.location) {
          // use window.location because it is always up-to-date
          // and functions in `useEditor` do not reflect the current state
          const { pathname, search, hash } = window.location;
          const searchParams = new URLSearchParams(search);
          searchParams.set('props', '0');
          searchParams.set('comments', '1');
          window.history.replaceState(undefined, '', pathname + '?' + searchParams.toString() + hash);
        }
      }
    },
  });

  if (editor) editor.storage.currentJson = props.currentJsonInState;

  // do not consider connected until editor is created, ydoc is available, and the provider is connected
  const isConnected = props.y.wsStatus === WebSocketStatus.Connected && ydoc && editor !== null;
  const isConnecting = props.y.wsStatus === WebSocketStatus.Connecting;
  const [hasConnectedBefore, setHasConnectedBefore] = useState(false);
  useEffect(() => {
    if (props.y.wsStatus === WebSocketStatus.Connected && ydoc && editor !== null && props.y.synced) {
      setHasConnectedBefore(true);
    }
  }, [editor, props.y.synced, props.y.wsStatus, ydoc]);

  // if the document is empty, use the json/html from the api instead (if available)
  if (editor && ydoc) {
    const ydocString = ydoc.getXmlFragment('default').toJSON();
    const isEmpty = ydocString === `<paragraph></paragraph>` || ydocString === ``;
    if (isEmpty && props.html) {
      editor.commands.setContent(props.html);
    }
    if (isEmpty && props.currentJsonInState) {
      // if the json cannot be parsed for some reason, at least insert
      // the string value (which may actually be html if it was not
      // correctly marked)
      try {
        editor.commands.setContent(JSON.parse(props.currentJsonInState));
      } catch (e) {
        editor.commands.setContent(props.currentJsonInState);
      }
    }
  }

  const [trackChanges, toggleTrackChanges] = useTrackChanges({ editor, ydoc, ySettingsMap }); // enable track changes management for the document
  useDevTools({ editor }); // show prosemirror developer tools when url query has dev=1
  const wordCount = useWordCount({ editor }); // gets the word count of the editor (debounced by five seconds)

  // store width minus sidebar width
  const [tiptapWidth, setTipTapWidth] = useState(thisWidth);
  useEffect(() => {
    if (isSidebarOpen) setTipTapWidth(thisWidth - 301);
    else setTipTapWidth(thisWidth);
  }, [thisWidth, isSidebarOpen]);

  // layout picker
  const layout: string | undefined = props.layout || 'standard';
  const layoutOptions = props.options?.layouts?.options || [];
  const setLayout = (layout: string) => {
    if (props.options?.layouts && props.y.ydoc) {
      const string = new utils.shared.String(props.y.ydoc);
      string.set(props.options.layouts.key, [layout], props.options.layouts.options);
    }
  };

  // make user name and color available to tiptap extensions via document attributes
  useEffect(() => {
    if (editor) {
      editor.state.tr.step(new SetDocAttrStep('user', props.y.user));
    }
  }, [editor, props.y.user]);

  // track whether the backstage view is shown
  const [isBackstageOpen, setIsBackstageOpen] = useState<boolean>(false);

  // track iframe html content when it sends a copy
  const [iframehtmlstring, setIframehtmlstring] = useState<string>('');

  const [AutosaveWindow, showAutosaveModal] = useAutosaveModal();

  const contentRef = useRef<PureEditorContent>(null);

  // set data attributes for fields specified in `pmAttrFields`
  (props.options?.pmAttrFields || []).forEach((fieldKey) => {
    const value = getProperty(props.y.data, fieldKey);

    if (value > 24) return;
    if (typeof value !== 'string' && typeof value !== 'number') return;

    contentRef.current?.editorContentRef.current
      ?.querySelector('.ProseMirror')
      ?.setAttribute(`data-${fieldKey}`, value);
  });

  return (
    <Container theme={theme} isMaximized={props.isMaximized || false} ref={observe}>
      {AutosaveWindow}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ErrorBoundary
          fallback={
            <div
              style={{
                background: 'black',
                color: 'white',
                left: 'env(titlebar-area-x, 0)',
                top: 'env(titlebar-area-y, 0)',
                width: 'env(titlebar-area-width, 100%)',
                height: 'env(titlebar-area-height, 33px)',
                //@ts-expect-error this is a (currently) nonstandard property
                webkitAppRegion: 'drag',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'sans-serif',
                fontSize: 14,
              }}
            >
              Error loading titlebar
            </div>
          }
        >
          {props.isMaximized ? (
            <Titlebar
              title={props.title}
              actions={[
                {
                  label: 'Undo',
                  icon: <ArrowUndo20Regular />,
                  disabled: !editor?.can().undo(),
                  action: () => editor?.chain().focus().undo().run(),
                },
                {
                  label: 'Redo',
                  icon: <ArrowRedo20Regular />,
                  disabled: !editor?.can().redo(),
                  action: () => editor?.chain().focus().redo().run(),
                },
                {
                  label: 'Save',
                  icon: <Save20Regular />,
                  disabled: props.actions?.find((action) => action?.label === 'Save')?.disabled || false,
                  action:
                    props.actions?.find((action) => action?.label === 'Save')?.action || showAutosaveModal,
                },
                {
                  label: 'Track changes',
                  icon: (
                    <svg
                      height='100%'
                      width='100%'
                      viewBox='0,0,2048,2048'
                      focusable='false'
                      fill='currentColor'
                    >
                      <path
                        type='path'
                        d='M 921 717 h -307 v -103 h 307 m 284 410 h -386 v -102 h 409 v 79 m -330 330 h -284 v -102 h 386 m -454 717 h -239 v -1844 h 920 l 456 456 q -15 10 -29 21 q -14 10 -27 23 l -115 115 h -387 v -512 h -716 v 1638 h 177 m 642 -1229 h 366 l -366 -366 m 511 1108 v 590 h -594 l 103 -103 h 389 v -386 m 351 -783 q 30 30 45 68 q 15 38 15 77 q 0 40 -15 78 q -15 37 -45 67 l -916 910 l -454 167 l 183 -468 l 898 -899 q 29 -29 67 -44 q 38 -15 77 -15 q 40 0 78 15 q 37 15 67 44 m -1064 921 q 90 53 145 144 l 759 -759 l -145 -145 m -889 1032 l 190 -69 q -43 -76 -119 -119 m 1051 -787 q 15 -15 23 -33 q 7 -19 7 -39 q 0 -21 -8 -39 q -8 -19 -22 -33 q -15 -15 -33 -23 q -19 -8 -40 -8 q -20 0 -38 8 q -19 7 -34 22 l -16 16 l 145 144 z'
                      ></path>
                      <path
                        type='path'
                        fill='transparent'
                        d='M 569 1886 h -211 v -1732 h 840 l 443 436 q -3 3 -7 6 q -4 2 -7 6 l -913 914 m 974 -110 v 480 h -483 z'
                      ></path>
                      <path
                        type='path'
                        d='M 921 717 h -307 v -103 h 307 m 284 410 h -386 v -102 h 409 v 79 m -330 330 h -284 v -102 h 386 z'
                      ></path>
                      <path
                        type='path'
                        d='M 546 1946 h -239 v -1844 h 920 l 456 456 q -15 10 -29 21 q -14 10 -27 23 l -115 115 h -387 v -512 h -716 v 1638 h 177 m 642 -1229 h 366 l -366 -366 m 511 1108 v 590 h -594 l 103 -103 h 389 v -386 z'
                      ></path>
                      <path
                        type='path'
                        fill='transparent'
                        d='M 820 1634 q 240 -270 448 -482 q 59 -60 119 -119 q 60 -60 118 -113 q 57 -54 111 -100 q 53 -46 99 -79 q 45 -34 82 -53 q 36 -19 60 -19 q 8 0 12 1 q 41 11 68 28 q 26 17 41 37 q 15 20 21 42 q 6 21 6 41 q 0 17 -3 33 q -3 15 -7 26 q -4 13 -9 25 l -957 950 z'
                      ></path>
                      <path type='path' d='M 837 1609 q 77 27 134 84 q 56 57 83 133 l -362 145 z'></path>
                      <path
                        type='path'
                        d='M 1988 674 q 30 30 45 68 q 15 38 15 77 q 0 40 -15 78 q -15 37 -45 67 l -916 910 l -454 167 l 183 -468 l 898 -899 q 29 -29 67 -44 q 38 -15 77 -15 q 40 0 78 15 q 37 15 67 44 m -1064 921 q 90 53 145 144 l 759 -759 l -145 -145 m -889 1032 l 190 -69 q -43 -76 -119 -119 m 1051 -787 q 15 -15 23 -33 q 7 -19 7 -39 q 0 -21 -8 -39 q -8 -19 -22 -33 q -15 -15 -33 -23 q -19 -8 -40 -8 q -20 0 -38 8 q -19 7 -34 22 l -16 16 l 145 144 z'
                      ></path>
                    </svg>
                  ),
                  disabled: false,
                  action: () => toggleTrackChanges(),
                  isActive: trackChanges,
                },
              ]}
              isDisabled={props.isDisabled}
              isBackstageOpen={isBackstageOpen}
            />
          ) : null}
        </ErrorBoundary>
        <div
          css={css`
            flex-grow: 0;
            flex-shrink: 0;
            width: 100%;
            position: relative;
          `}
        >
          <ErrorBoundary fallback={<div>Error loading toolbar</div>}>
            <Toolbar
              editor={editor}
              isMax={props.isMaximized || false}
              forceMax={props.forceMax}
              isDisabled={props.isDisabled}
              layouts={{ layout, options: layoutOptions, setLayout }}
              awarenessProfiles={awarenessProfiles}
              tiptapWidth={tiptapWidth}
              y={props.y}
              user={props.user}
              toggleTrackChanges={toggleTrackChanges}
              trackChanges={trackChanges}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              setSidebarContent={setSidebarContent}
              sidebarTitle={sidebarTitle}
              setSidebarTitle={setSidebarTitle}
              setIsBackstageOpen={setIsBackstageOpen}
              actions={props.actions}
              options={props.options}
              compact={props.compact}
              iframehtmlstring={iframehtmlstring}
            />
          </ErrorBoundary>
          {props.showLoading ? <IndeterminateProgress theme={theme} /> : null}
        </div>
        <div
          css={css`
            display: flex;
            flex-direction: row;
            gap: 0;
            overflow: auto;
            width: 100%;
            height: 100%;
          `}
        >
          <ErrorBoundary fallback={<div>Error loading document content</div>}>
            <div
              css={css`
                scroll-behavior: smooth;
                overflow: auto;
                width: 100%;
                height: 100%;
                flex-grow: 1;
              `}
            >
              {props.message ? <Noticebar z={1}>{props.message}</Noticebar> : null}
              {hasConnectedBefore && !isConnected ? (
                <Noticebar z={1}>
                  Connection lost. You may lose data if you close the editor before reconnecting.{' '}
                  {isConnecting ? 'Attempting to reconnect...' : ''}
                </Noticebar>
              ) : null}
              {!hasConnectedBefore ? (
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: theme.color.neutral[theme.mode][1500],
                    fontFamily: theme.font.detail,
                    height: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {isConnecting ? (
                    <>
                      <Spinner color={'neutral'} colorShade={1500} size={30} />
                      <div>Connecting...</div>
                    </>
                  ) : (
                    <div>Failed to connect</div>
                  )}
                </div>
              ) : null}
              {props.options?.metaFrame && isConnected === true && !props.compact ? (
                <ExternalFrame
                  src={props.options.metaFrame}
                  tiptapwidth={tiptapWidth}
                  setIframehtmlstring={setIframehtmlstring}
                  y={props.y}
                />
              ) : null}

              {hasConnectedBefore ? (
                <Content
                  editor={editor}
                  theme={theme}
                  tiptapwidth={tiptapWidth}
                  ref={contentRef}
                  ProseMirrorCSS={props.options?.css}
                />
              ) : null}
            </div>
          </ErrorBoundary>
          <ErrorBoundary fallback={<div>Error loading sidebar</div>}>
            {props.compact ? null : (
              <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                header={sidebarTitle}
                setHeader={setSidebarTitle}
                editor={editor}
                y={props.y}
                user={props.user}
              >
                {sidebarContent}
              </Sidebar>
            )}
          </ErrorBoundary>
        </div>
        <ErrorBoundary fallback={<div>Error loading statusbar</div>}>
          <Statusbar>
            <>
              {isConnected === true ? (
                <>
                  <StatusbarBlock>
                    {wordCount} word{wordCount !== 1 ? 's' : ''}
                  </StatusbarBlock>
                  <StatusbarBlock>{editor?.storage.characterCount?.characters()} characters</StatusbarBlock>
                </>
              ) : null}
              <StatusbarBlock>
                {/* {packageJson.dependencies['@tiptap/react']} */}
                {'__'}
                {__APP_VERSION__}
              </StatusbarBlock>
              <StatusbarBlock>
                {isConnected === true ? 'Connected' : isConnecting ? 'Connecting...' : 'Failed to connect'}
              </StatusbarBlock>
            </>
          </Statusbar>
        </ErrorBoundary>
        <Backstage
          editor={editor}
          isOpen={isBackstageOpen}
          setIsOpen={setIsBackstageOpen}
          actions={props.actions || []}
          iframehtmlstring={iframehtmlstring}
        />
      </div>
    </Container>
  );
};

const Container = styled.div<{ theme: themeType; isMaximized: boolean }>`
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  height: 100%;
  ${({ isMaximized }) =>
    isMaximized ? `position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1000` : 'z-index: 1'};
`;

const Content = styled(EditorContent)<{ tiptapwidth: number; theme: themeType; ProseMirrorCSS?: string }>`
  max-width: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `unset` : `768px`)};
  width: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `100%` : `calc(100% - 40px)`)};
  box-sizing: border-box;
  background-color: white;
  border: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `none` : `1px solid rgb(171, 171, 171)`)};
  padding: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `24px 20px` : `68px 88px`)};
  margin: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `0 auto` : `20px auto`)};
  .ProseMirror {
    *::selection {
      background-color: #c4dffc;
    }

    // only use bottom margin for paragraphs
    p {
      margin-top: 0;
      margin-bottom: 10px;
    }

    // no paragraph margin for list items
    li > p {
      margin-bottom: 0;
    }

    // show placeholder message when the editor is empty
    p.is-empty:first-of-type::before {
      content: attr(data-placeholder);
      float: left;
      color: ${({ theme }) => theme.color.neutral[theme.mode][600]};
      pointer-events: none;
      height: 0;
    }

    addition {
      color: #d0021b;
      border-bottom: 1px solid #d0021b;
    }

    // title and subtitle
    h1.title {
      font-size: 48px;
      font-weight: 400;
      margin: 15px 0;
      text-align: center;
      line-height: 1.3;
    }
    p.subtitle {
      font-size: 18px;
      text-align: center;
      margin: 15px 0;
    }
    h1.title + p.subtitle {
      font-size: 18px;
      text-align: center;
      margin-top: -15px;
    }

    // hanging indent paragraph
    p.hanging {
      padding-left: 20px;
      text-indent: -20px;
    }

    // tables
    table {
      border-collapse: collapse;
      margin: 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;

      td,
      th {
        border: 2px solid #ced4da;
        box-sizing: border-box;
        min-width: 1em;
        position: relative;
        vertical-align: top;

        > * {
          margin-bottom: 0;
        }
      }

      th {
        background-color: #f1f3f5;
        font-weight: bold;
        text-align: left;
      }

      .selectedCell:after {
        background: rgba(200, 200, 255, 0.4);
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        position: absolute;
        z-index: 2;
      }

      .column-resize-handle {
        background-color: #adf;
        bottom: -2px;
        position: absolute;
        right: -2px;
        pointer-events: none;
        top: 0;
        width: 4px;
      }

      p {
        margin: 0;
      }
    }

    .tableWrapper {
      padding: 10px 0;
      overflow-x: auto;
    }

    &.resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
  }
  ${({ ProseMirrorCSS }) => {
    if (ProseMirrorCSS?.indexOf('.ProseMirror') === 0) return ProseMirrorCSS;
    return '';
  }}
`;

const IndeterminateProgress = styled(LinearProgress)<{ theme: themeType }>`
  --mdc-theme-primary: ${({ theme }) => theme.color.blue[theme.mode === 'light' ? 800 : 300]};
  left: 0;
  bottom: 0;
  position: absolute;
  z-index: 10;
  .mdc-linear-progress__buffer,
  .mdc-linear-progress__buffering-dots {
    background: none;
  }
`;

export { Tiptap };
