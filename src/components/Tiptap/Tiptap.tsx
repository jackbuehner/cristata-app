/** @jsxImportSource @emotion/react */
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
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
import { IProfile } from '../../interfaces/cristata/profiles';
import { db } from '../../utils/axios/db';
import applyDevTools from 'prosemirror-dev-tools';
import './office-icon/colors1.css';
import { SetDocAttrStep } from './utilities/SetDocAttrStep';
import { TrackChanges } from './extension-track-changes';
import { Toolbar } from './components/Toolbar';
import { Statusbar, StatusbarBlock } from './components/Statusbar';
import { Sidebar } from './components/Sidebar';
import { DocPropertiesSidebar } from './sidebar-content/DocPropertiesSidebar';
import { Iaction } from '../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useHistory, useLocation } from 'react-router-dom';

interface ITiptap {
  docName: string;
  user: {
    name: string;
    color: string;
  };
  options?: tiptapOptions;
  flatData?: { [key: string]: string | string[] | number | number[] | boolean };
  setFlatData?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string | string[] | number | number[] | boolean;
    }>
  >;
  isDisabled?: boolean;
  sessionId: string;
  onChange?: (editorJson: string) => void;
  html?: string;
  actions?: Array<Iaction | null>;
  isMaximized?: boolean;
}

const Tiptap = (props: ITiptap) => {
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
    editable: props.isDisabled === true ? false : true,
    content: props.html,
    extensions: [
      StarterKit.configure({ history: false }),
      TrackChanges,
      Underline,
      TextStyle,
      FontFamily,
      Comment,
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
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
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
  const [layout, setLayout] = useState<'standard' | 'full'>('standard');

  // get the authors
  const [authors, setAuthors] = useState<IProfile[]>();
  useEffect(() => {
    if (props.options && props.options.type === 'article' && props.options.keys_article && props.flatData) {
      let full: IProfile[] = [];
      (props.flatData[props.options.keys_article.authors] as number[])?.forEach((author_github_id) => {
        db.get(`/users/${author_github_id}`).then(({ data }: { data: IProfile }) => {
          full.push(data);
        });
      });
      setAuthors(full);
    }
  }, [props.flatData, props.options]);

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
    console.log(!!new URLSearchParams(location.search).get('props'));
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
        ${isMax ? `position: fixed; inset: 0; z-index: 1000` : 'z-index: 1'};
      `}
      ref={observe}
    >
      <Toolbar
        editor={editor}
        isMax={isMax}
        setIsMax={setIsMax}
        isDisabled={props.isDisabled}
        layout={layout}
        setLayout={setLayout}
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
        flatData={props.flatData}
        setFlatData={props.setFlatData}
        actions={props.actions}
      />

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
          {
            // if it is an article type, show article metadata and photo
            props.options?.type === 'article' &&
            props.options.keys_article &&
            props.flatData &&
            props.setFlatData ? (
              <>
                {layout === 'standard' ? (
                  <StandardLayout
                    flatDataState={[props.flatData, props.setFlatData]}
                    options={props.options}
                    headline={
                      (props.flatData[props.options.keys_article.headline] as string) || 'Article Headline'
                    }
                    description={
                      (props.flatData[props.options.keys_article.description] as string) ||
                      'A summary of the article, a notable quote from the interviewee, or a message to draw in a reader.'
                    }
                    categories={
                      (props.flatData[props.options.keys_article.categories] as string[]) || ['categories']
                    }
                    caption={props.flatData[props.options.keys_article.caption] as string}
                    isDisabled={props.isDisabled}
                    tiptapSize={{ width: tiptapWidth, height: tiptapHieght }}
                    photoUrl={props.flatData[props.options.keys_article.photo_url] as string}
                    authors={authors}
                    target_publish_at={props.flatData[props.options.keys_article.target_publish_at] as string}
                  />
                ) : layout === 'full' ? (
                  <FullBleedLayout
                    flatDataState={[props.flatData, props.setFlatData]}
                    options={props.options}
                    headline={
                      (props.flatData[props.options.keys_article.headline] as string) || 'Article Headline'
                    }
                    description={
                      (props.flatData[props.options.keys_article.description] as string) ||
                      'A summary of the article, a notable quote from the interviewee, or a message to draw in a reader.'
                    }
                    categories={
                      (props.flatData[props.options.keys_article.categories] as string[]) || ['categories']
                    }
                    caption={props.flatData[props.options.keys_article.caption] as string}
                    isDisabled={props.isDisabled}
                    tiptapSize={{ width: tiptapWidth, height: tiptapHieght }}
                    photoUrl={props.flatData[props.options.keys_article.photo_url] as string}
                    authors={authors}
                    target_publish_at={props.flatData[props.options.keys_article.target_publish_at] as string}
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
                p.is-editor-empty:first-child::before {
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
              }
            `}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
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
          {sidebarTitle === 'Document properties' ? (
            <DocPropertiesSidebar flatData={props.flatData} setFlatData={props.setFlatData} />
          ) : (
            sidebarContent
          )}
        </Sidebar>
      </div>
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
    </div>
  );
};

export { Tiptap };
