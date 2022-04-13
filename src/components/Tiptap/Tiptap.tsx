/** @jsxImportSource @emotion/react */
import { EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ClassName } from './extension-class-name';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { FontSize } from './extension-font-size';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { css, useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { useEffect, useMemo, useState } from 'react';
import useDimensions from 'react-cool-dimensions';
import packageJson from '../../../package.json';
import { tiptapOptions } from '../../config';
import { StandardLayout } from './special-components/article/StandardLayout';
import { PowerComment, CommentPanel } from './extension-power-comment';
import { Comment } from './extension-comment';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { FullBleedLayout } from './special-components/article/FullBleedLayout';
import './office-icon/colors1.css';
import { SetDocAttrStep } from './utilities/SetDocAttrStep';
import { TrackChanges } from './extension-track-changes';
import { Toolbar } from './components/Toolbar';
import { Statusbar, StatusbarBlock } from './components/Statusbar';
import { Sidebar } from './components/Sidebar';
import { Iaction, ItemDetailsPage } from '../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { useLocation, useNavigate } from 'react-router-dom';
import { Noticebar } from './components/Noticebar';
import { Titlebar } from './components/Titlebar';
import { ArrowRedo20Regular, ArrowUndo20Regular, Save20Regular } from '@fluentui/react-icons';
import { SweepwidgetWidget } from './extension-widget-sweepwidget';
import { YoutubeWidget } from './extension-widget-youtube';
import { PhotoWidget } from './extension-photo';
import { ErrorBoundary } from 'react-error-boundary';
import styled from '@emotion/styled';
import { LinearProgress } from '@rmwc/linear-progress';
import { useAppDispatch } from '../../redux/hooks';
import { setField } from '../../redux/slices/cmsItemSlice';
import {
  useAwareness,
  useDevTools,
  useSidebar,
  useTipTapEditor,
  useTrackChanges,
  useWordCount,
  useY,
} from './hooks';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { Spinner } from '../Loading';
import { CollectionItemPage } from '../../pages/CMS/CollectionItemPage';

interface ITiptap {
  docName: string;
  title?: string;
  user: {
    name: string;
    color: string;
    photo: string;
  };
  options?: tiptapOptions;
  isDisabled?: boolean;
  sessionId: string;
  onDebouncedChange?: (editorJson: string, currentJsonInState?: string | null) => void;
  currentJsonInState?: string | null;
  html?: string;
  actions?: Array<Iaction | null>;
  isMaximized?: boolean;
  forceMax?: boolean;
  message?: string;
  showLoading?: boolean;
  layout?: string;
  useNewCollectionItemPage?: boolean;
  compact?: boolean;
}

const Tiptap = (props: ITiptap) => {
  const api = `${process.env.REACT_APP_WS_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}`;
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const [ydoc, ySettingsMap, providerWebsocket, isConnected] = useY({
    ws: `${api}/hocuspocus/`,
    name: props.docName,
  }); // create a doc and connect it to the server
  const awarenessProfiles = useAwareness({ hocuspocus: providerWebsocket }); // get list of who is editing the doc
  const { observe, width: thisWidth, height: tiptapHieght } = useDimensions(); // monitor the dimensions of the editor

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
        ) : props.useNewCollectionItemPage ? (
          <CollectionItemPage isEmbedded />
        ) : (
          <ItemDetailsPage isEmbedded />
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
    editable: isConnected === true && !props.isDisabled,
    content: props.html,
    extensions: [
      StarterKit.configure({ history: false }),
      TrackChanges,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      PowerComment,
      Comment,
      ClassName.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        HTMLAttributes: {
          target: '_self',
          rel: 'noopener noreferrer nofollow',
        },
        openOnClick: false,
        linkOnPaste: true,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: providerWebsocket,
        user: {
          name: props.user.name,
          color: props.user.color,
          sessionId: props.sessionId,
          photo: props.user.photo,
        },
      }),
      Placeholder.configure({
        placeholder: ({ editor }) => {
          if (editor.state.selection.from <= 1) return 'Write something...';
          return '';
        },
      }),
      SweepwidgetWidget,
      YoutubeWidget,
      PhotoWidget,
    ],
    onUpdate() {
      const editor = this as unknown as Editor;
      if (props.html) editor.commands.setContent(props.html);
      onUpdateDelayed(editor);
    },
    onSelectionUpdate({ editor }) {
      const anchorIsInComment = editor.state.selection.$anchor
        .marks()
        .some((mark) => mark.type.name === 'powerComment');
      if (anchorIsInComment) {
        setSidebarTitle('Comments');
        setSidebarContent(<CommentPanel />);
        setIsSidebarOpen(true);
        searchParams.set('props', '0');
        searchParams.set('comments', '1');
        navigate(pathname + '?' + searchParams.toString() + hash, { replace: true });
      }
    },
  });

  if (editor) editor.storage.currentJson = props.currentJsonInState;

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
    if (props.options?.layouts) {
      dispatch(setField(layout, props.options.layouts.key));
    }
  };

  // make user name and color available to tiptap extensions via document attributes
  useEffect(() => {
    if (editor) {
      editor.state.tr.step(new SetDocAttrStep('user', props.user));
    }
  }, [editor, props.user]);

  return (
    <Container theme={theme} isMaximized={props.isMaximized || false} ref={observe}>
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
                disabled: false,
                action: props.actions?.find((action) => action?.label === 'Save')?.action || (() => null),
              },
              {
                label: 'Track changes',
                icon: (
                  <svg height='100%' width='100%' viewBox='0,0,2048,2048' focusable='false' fill='currentColor'>
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
            user={{ ...props.user, sessionId: props.sessionId }}
            toggleTrackChanges={toggleTrackChanges}
            trackChanges={trackChanges}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            setSidebarContent={setSidebarContent}
            sidebarTitle={sidebarTitle}
            setSidebarTitle={setSidebarTitle}
            actions={props.actions}
            options={props.options}
            useNewCollectionItemPage={props.useNewCollectionItemPage}
            compact={props.compact}
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
              display: flex;
              height: 100%;
              flex-direction: column;
              align-items: center;
              justify-content: ${isConnected !== true ? 'center' : 'unset'};
              flex-grow: 1;
            `}
          >
            {props.message ? <Noticebar theme={theme}>{props.message}</Noticebar> : null}
            {isConnected !== true ? (
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: theme.color.neutral[theme.mode][1500],
                  fontFamily: theme.font.detail,
                }}
              >
                {isConnected === undefined ? (
                  <>
                    <Spinner color={'neutral'} colorShade={1500} size={30} />
                    <div>Connecting...</div>
                  </>
                ) : (
                  <div>Failed to connect</div>
                )}
              </div>
            ) : null}
            {
              // if it is an article type, show article metadata and photo
              props.options?.type === 'article' &&
              props.options.keys_article &&
              isConnected === true &&
              !props.compact ? (
                <>
                  {layout === 'standard' ? (
                    <StandardLayout
                      options={props.options}
                      isDisabled={props.isDisabled}
                      tiptapSize={{ width: tiptapWidth, height: tiptapHieght }}
                    />
                  ) : layout === 'full' ? (
                    <FullBleedLayout
                      options={props.options}
                      isDisabled={props.isDisabled}
                      tiptapSize={{ width: tiptapWidth, height: tiptapHieght }}
                    />
                  ) : null}
                </>
              ) : null
            }
            {isConnected === true ? <Content editor={editor} theme={theme} tiptapwidth={tiptapWidth} /> : null}
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
              user={{ ...props.user, sessionId: props.sessionId }}
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
              {packageJson.dependencies['@tiptap/react']}__{packageJson.version}
            </StatusbarBlock>
            <StatusbarBlock>
              {isConnected === true
                ? 'Connected'
                : isConnected === undefined
                ? 'Connecting...'
                : 'Failed to connect'}
            </StatusbarBlock>
          </>
        </Statusbar>
      </ErrorBoundary>
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

const Content = styled(EditorContent)<{ tiptapwidth: number; theme: themeType }>`
  max-width: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `unset` : `768px`)};
  width: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `100%` : `calc(100% - 40px)`)};
  box-sizing: border-box;
  background-color: white;
  border: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `none` : `1px solid rgb(171, 171, 171)`)};
  padding: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `24px 20px` : `68px 88px`)};
  margin: ${({ tiptapwidth }) => (tiptapwidth <= 680 ? `0` : `20px`)};
  .ProseMirror {
    font-family: Georgia, Times, 'Times New Roman', serif;
    color: #3a3a3a;
    font-size: 17px;
    line-height: 1.7;
    font-weight: 400;
    font-variant-numeric: lining-nums;
    *::selection {
      background-color: #c4dffc;
    }
    // only use bottom margin for paragraphs
    p {
      margin-top: 0;
      margin-bottom: 10px;
    }
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
    .collaboration-cursor__caret {
      position: relative;
      margin-left: -0.5px;
      margin-right: -0.5px;
      border-left: 0.5px solid #0d0d0d;
      border-right: 0.5px solid #0d0d0d;
      word-break: normal;
      pointer-events: none;
    }
    .collaboration-cursor__label {
      position: absolute;
      top: -1.4em;
      left: -1px;
      font-size: 12px;
      font-style: normal;
      font-weight: 680;
      line-height: normal;
      user-select: none;
      color: ${({ theme }) => theme.color.neutral['light'][1500]};
      font-family: ${({ theme }) => theme.font.detail};
      padding: 0.1rem 0.3rem;
      border-radius: 0;
      white-space: nowrap;
    }
    addition {
      color: #d0021b;
      border-bottom: 1px solid #d0021b;
    }

    // headings
    h1 {
      font-size: 24px;
      font-weight: 400;
      margin: 10px 0;
    }
    h2 {
      font-size: 20px;
      font-weight: 400;
      margin: 10px 0;
    }
    h3 {
      font-size: 17px;
      font-weight: 400;
      margin: 10px 0;
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

    // divider
    hr::before {
      content: '•  •  •';
      display: flex;
      justify-content: center;
      white-space: pre;
      margin: 10px;
    }
    hr {
      border: none;
    }
  }
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
