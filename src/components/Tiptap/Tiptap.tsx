/** @jsxImportSource @emotion/react */
import { useEditor, EditorContent, Editor } from '@tiptap/react';
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
import React, { useEffect, useMemo, useState } from 'react';
import useDimensions from 'react-cool-dimensions';
import packageJson from '../../../package.json';
import { tiptapOptions } from '../../config';
import { StandardLayout } from './special-components/article/StandardLayout';
import { Comment } from './extension-comment';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { FullBleedLayout } from './special-components/article/FullBleedLayout';
import applyDevTools from 'prosemirror-dev-tools';
import './office-icon/colors1.css';
import { SetDocAttrStep } from './utilities/SetDocAttrStep';
import { TrackChanges } from './extension-track-changes';
import { Toolbar } from './components/Toolbar';
import { Statusbar, StatusbarBlock } from './components/Statusbar';
import { Sidebar } from './components/Sidebar';
import { Iaction, ItemDetailsPage } from '../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useHistory, useLocation } from 'react-router-dom';
import { Noticebar } from './components/Noticebar';
import { Titlebar } from './components/Titlebar';
import { ArrowRedo20Regular, ArrowUndo20Regular, Save20Regular } from '@fluentui/react-icons';
import { SweepwidgetWidget } from './extension-widget-sweepwidget';
import { YoutubeWidget } from './extension-widget-youtube';
import { PhotoWidget } from './extension-photo';
import { ErrorBoundary } from 'react-error-boundary';
import styled from '@emotion/styled';
import { LinearProgress } from '@rmwc/linear-progress';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setField } from '../../redux/slices/cmsItemSlice';

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
  onChange?: (editorJson: string) => void;
  html?: string;
  actions?: Array<Iaction | null>;
  isMaximized?: boolean;
  forceMax?: boolean;
  message?: string;
  showLoading?: boolean;
}

const Tiptap = (props: ITiptap) => {
  const state = useAppSelector((state) => state.cmsItem);
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const history = useHistory();
  const location = useLocation();

  // A new Y document
  const ydoc = useMemo(() => new Y.Doc(), []);
  // create a setting map for this document (used to sync settings accross all editors)
  const ySettingsMap = useMemo(() => ydoc.getMap('settings'), [ydoc]);
  // register with a WebSocket provider
  const providerWebsocket = useMemo(
    () =>
      new WebsocketProvider(
        `${process.env.REACT_APP_WS_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/hocuspocus/`,
        props.docName,
        ydoc,
        {
          params: {
            version: packageJson.version,
          },
        }
      ),
    [props.docName, ydoc]
  );

  // store awareness profiles info in state
  // (these are the profiles of users with the editor open)
  interface IAwarenessProfile {
    name: string;
    color: string;
    sessionId: string;
    photo: string;
  }
  const [awarenessProfiles, setAwarenessProfiles] = useState<IAwarenessProfile[]>();
  useEffect(() => {
    const { awareness } = providerWebsocket;

    /**
     * Whenever somebody updates their awareness information,
     * process and store awareness information from each unique user.
     */
    function saveAwarenessProfiles() {
      // get all current awareness information and filter it to only include
      // sessions with defined users
      const awarenessValues: IAwarenessProfile[] = Array.from(awareness.getStates().values())
        .filter((value) => value.user)
        .map((value) => value.user);

      // remove duplicate awareness information by only adding objects with
      // unique sessionIds to the array
      let awarenessSessions: IAwarenessProfile[] = [];
      awarenessValues.forEach((value: IAwarenessProfile) => {
        const containsSessionId =
          awarenessSessions.findIndex((session) => session.sessionId === value.sessionId) === -1 ? false : true;
        if (!containsSessionId) {
          awarenessSessions.push(value);
        }
      });

      // save the array of unique and complete awareness objects to state
      setAwarenessProfiles(awarenessSessions);
    }

    awareness.on('change', saveAwarenessProfiles); // add the listener
    return () => awareness.off('change', saveAwarenessProfiles); // remove the listener when useEffect changes
  }, [providerWebsocket]);

  const editor = useEditor({
    editable: props.isDisabled ? false : true,
    content: props.html,
    extensions: [
      StarterKit.configure({ history: false }),
      TrackChanges,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
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
      if (props.onChange) {
        // get the json for the editor and send it to the parent component via `onChange()`
        const json = JSON.stringify(editor.getJSON().content);
        props.onChange(json);
      }
    },
  });

  // change whether the editor is editable based on prop change
  useEffect(() => {
    editor?.setEditable(props.isDisabled ? false : true);
  }, [editor, props.isDisabled]);

  // whether the editor is maximized
  const [isMax, setIsMax] = useState<boolean>(props.isMaximized || false);

  // manage whether sidebar is open
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // monitor the dimensions of the editor
  const { observe, width: thisWidth, height: tiptapHieght } = useDimensions();

  // store width minus sidebar width
  const [tiptapWidth, setTipTapWidth] = useState(thisWidth);
  useEffect(() => {
    if (isSidebarOpen) setTipTapWidth(thisWidth - 301);
    else setTipTapWidth(thisWidth);
  }, [thisWidth, isSidebarOpen]);

  // layout picker
  const layout: string | undefined = state.fields[props.options?.layouts?.key || ''];
  const layoutOptions = props.options?.layouts?.options || [];
  const setLayout = (layout: string) => {
    if (props.options?.layouts) {
      dispatch(setField(layout, props.options.layouts.key));
    }
  };

  // manage whether track changes is on
  const [trackChanges, setTrackChanges] = useState<boolean>(editor?.state.doc.attrs.trackChanges);

  /**
   * Toggle whether track changes is enabled. Sets the change to react state
   *  and stores the change in the ydoc.
   */
  const toggleTrackChanges = () => {
    // update track changes in react state
    setTrackChanges(!trackChanges);
    // update content of the ydoc
    ydoc.transact(() => {
      // set a trackChanges key-value pair inside the settings map
      ySettingsMap.set('trackChanges', !trackChanges);
    });
  };

  // when the editor finishes loading, update track changes to match
  useEffect(() => {
    if (editor) {
      setTrackChanges(ySettingsMap.get('trackChanges'));
    }
  }, [setTrackChanges, ySettingsMap, editor]);

  // if another editor changes the track changes setting, update the react state
  ySettingsMap.observe(() => {
    setTrackChanges(ySettingsMap.get('trackChanges'));
  });

  // when `trackChanges` is changed in state, also set it in the document attributes.
  // the document attributes do not sync, but they are available to tiptap extensions.
  useEffect(() => {
    if (editor) {
      editor.state.tr.step(new SetDocAttrStep('trackChanges', trackChanges));
    }
  }, [editor, trackChanges]);

  // show prosemirror developer tools when in development mode
  useEffect(() => {
    if (editor && process.env.NODE_ENV === 'development') applyDevTools(editor.view);
  }, [editor]);

  // make user name and color available to tiptap extensions via document attributes
  useEffect(() => {
    if (editor) {
      editor.state.tr.step(new SetDocAttrStep('user', props.user));
    }
  }, [editor, props.user]);

  // manage the content of the sidebar
  const [sidebarContent, setSidebarContent] = useState<React.ReactNode>(<p>Sidebar</p>);

  // manage the sidebar title
  const [sidebarTitle, setSidebarTitle] = useState<string>('');

  type content = { type: string; text?: string; content?: content[] };
  /**
   * Calculate the word count of the the content found in prosemirror JSON.
   * @param content content value from prosemirror JSON
   * @returns number of words
   */
  async function getWordCount(content: content[]) {
    let wordCount = 0;

    // loop through array of content
    for (let i = 0; i < content.length; i++) {
      const chunk = content[i];

      // if the chunk is text add to the word count
      if (chunk.text) {
        // (1) remove extra white space
        // (2) split at space characters
        // (3) get the length of the resultant array
        const chunkWordCount = chunk.text.replace(/\s+/g, ' ').split(' ').length;
        // add the word count for the chunk to the overall word count
        wordCount += chunkWordCount;
      } else if (chunk.content) {
        wordCount += await getWordCount(chunk.content);
      }
    }

    return wordCount;
  }

  // store the editor word count
  const [wordCount, setWordCount] = useState<number>(0);

  // keep the editor word count up to date (debounce with 5 second delay)
  const updateWordCount = AwesomeDebouncePromise(async (content: content[]) => {
    const count = await getWordCount(content);
    setWordCount(count);
  }, 5000);
  editor?.on('update', ({ editor }: { editor: Editor }) => {
    updateWordCount(editor.getJSON().content);
  });

  // open the sidebar to document properties if the url contains the correct search param
  useEffect(() => {
    if (new URLSearchParams(location.search).get('props') === '1') {
      setSidebarTitle('Document properties');
      setIsSidebarOpen(true);
    }
  }, [location.search]);

  return (
    <div
      css={css`
        background-color: ${theme.color.neutral[theme.mode][100]};
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        height: 100%;
        ${isMax ? `position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1000` : 'z-index: 1'};
      `}
      ref={observe}
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
        {isMax ? (
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
            isMax={isMax}
            setIsMax={setIsMax}
            forceMax={props.forceMax}
            isDisabled={props.isDisabled}
            layouts={{ layout, options: layoutOptions, setLayout }}
            awarenessProfiles={awarenessProfiles}
            tiptapWidth={tiptapWidth}
            user={props.user}
            toggleTrackChanges={toggleTrackChanges}
            trackChanges={trackChanges}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            setSidebarContent={setSidebarContent}
            sidebarTitle={sidebarTitle}
            setSidebarTitle={setSidebarTitle}
            actions={props.actions}
            options={props.options}
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
              overflow: auto;
              width: 100%;
              display: flex;
              height: ${providerWebsocket.wsconnected ? '100%' : '0'};
              flex-direction: column;
              align-items: center;
              flex-grow: 1;
            `}
          >
            {props.message ? <Noticebar theme={theme}>{props.message}</Noticebar> : null}
            {
              // if it is an article type, show article metadata and photo
              props.options?.type === 'article' && props.options.keys_article ? (
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
            <div
              css={css`
                max-width: ${tiptapWidth <= 680 ? `unset` : `768px`};
                width: ${tiptapWidth <= 680 ? `100%` : `calc(100% - 40px)`};
                box-sizing: border-box;
                background-color: white;
                border: ${tiptapWidth <= 680 ? `none` : `1px solid rgb(171, 171, 171)`};
                padding: ${tiptapWidth <= 680 ? `24px 20px` : `68px 88px`};
                margin: ${tiptapWidth <= 680 ? `0` : `20px`};
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
                  // show placeholder message when the editor is empty
                  p.is-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: ${theme.color.neutral[theme.mode][600]};
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
                    color: ${theme.color.neutral['light'][1500]};
                    font-family: ${theme.font.detail};
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
                }
              `}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Error loading sidebar</div>}>
          <Sidebar
            isOpen={isSidebarOpen}
            closeFunction={() => {
              setIsSidebarOpen(false);
              setSidebarTitle('');
              history.replace({
                search: `?fs=${Number(isMax)}&props=0`,
              });
            }}
            header={sidebarTitle}
          >
            {sidebarTitle === 'Document properties' ? <ItemDetailsPage isEmbedded /> : sidebarContent}
          </Sidebar>
        </ErrorBoundary>
      </div>
      <ErrorBoundary fallback={<div>Error loading statusbar</div>}>
        <Statusbar>
          {providerWebsocket.wsconnected ? (
            <>
              <StatusbarBlock>
                {wordCount} word{wordCount !== 1 ? 's' : ''}
              </StatusbarBlock>
              <StatusbarBlock>{editor?.getCharacterCount()} characters</StatusbarBlock>
            </>
          ) : null}
          <StatusbarBlock>
            {packageJson.dependencies['@tiptap/react']}__{packageJson.version}
          </StatusbarBlock>
          <StatusbarBlock>
            {providerWebsocket.wsconnected
              ? 'Connected'
              : providerWebsocket.wsconnecting
              ? 'Connecting...'
              : 'Failed to connect'}
          </StatusbarBlock>
        </Statusbar>
      </ErrorBoundary>
    </div>
  );
};

const IndeterminateProgress = styled(LinearProgress)<{ theme: themeType }>`
  --mdc-theme-primary: ${({ theme }) => theme.color.blue[800]};
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
