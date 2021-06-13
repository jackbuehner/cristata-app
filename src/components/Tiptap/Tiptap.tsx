/** @jsxImportSource @emotion/react */
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button, IconButton } from '../Button';
import styled from '@emotion/styled';
import { css, SerializedStyles, useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import React, { useMemo, useState } from 'react';
import { BackIcon, RedoIcon, BoldIcon, ItalicsIcon, UnderlineIcon, StrikeIcon } from './Icons';
import {
  Code20Regular,
  ArrowMinimize20Regular,
  LineHorizontal120Regular,
  ArrowMaximize20Regular,
  TextBulletListLtr20Regular,
  TextNumberListLtr20Regular,
  Link20Regular,
  CommentAdd20Regular,
  CommentOff20Regular,
} from '@fluentui/react-icons';
import useDimensions from 'react-cool-dimensions';
import { useDropdown } from '../../hooks/useDropdown';
import { Menu } from '../Menu';
import { ButtonProps } from '../Button/Button';
import packageJson from '../../../package.json';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../Modal';
import { TextInput } from '../TextInput';
import { InputGroup } from '../InputGroup';
import { Label } from '../Label';
import { tiptapOptions } from '../../config';
import { StandardLayout } from './special-components/article/StandardLayout';
import { Comment } from './extension-comment';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const Toolbar = styled.div`
  position: relative;
  z-index: 10;
  box-shadow: rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px;
  width: 100%;
`;

const ToolbarTabRow = styled.div<{ theme: themeType }>`
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  display: flex;
  justify-content: flex-start;
  white-space: nowrap;
  height: 36px;
  position: relative;
`;

const ToolbarTabList = styled.div`
  position: relative;
  display: flex;
  flex-wrap: nowrap;
`;

const ToolbarMeta = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 0px 8px;
  gap: 6px;
`;

const ToolbarTabButton = styled(Button)<{ theme: themeType; isActive?: boolean }>`
  position: relative;
  border: 1px solid transparent;
  padding: 0px 21px;
  border-radius: 0px;
  height: 32px;
  background-color: transparent;
  ${({ theme, isActive }) =>
    isActive
      ? `
        &::after {
          content: '';
          position: absolute;
          width: calc(100% - 28px);
          height: 3px;
          background-color: ${theme.color.blue[800]};
          bottom: -1px;
          left: 14px;
          display: flex;
          transition: width 0.1s ease 0s, left 0.1s ease 0s;
        }
        &:hover:not(:active)::after {
          width: 100%;
          left: 0px;
        }
        `
      : null}
`;

const ToolbarMetaIconButton = styled(IconButton)`
  position: relative;
  border: 1px solid transparent;
  height: 32px;
  width: 32px;
  background-color: transparent;
`;

const ToolbarActionRowContainer = styled.div<{ theme: themeType }>`
  width: 100%;
  box-sizing: border-box;
  height: fit-content;
  min-height: 40px;
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  padding: 0px 8px;
  display: flex;
`;

const ToolbarRow = styled.div<{ isActive: boolean }>`
  display: flex;
  visibility: ${({ isActive }) => (isActive ? 'visible' : 'hidden')};
  width: ${({ isActive }) => (isActive ? 'auto' : '0px')};
  height: ${({ isActive }) => (isActive ? 'fit-content' : '0px')};
  transform: ${({ isActive }) => (isActive ? 'none' : 'translateX(-20px)')};
  opacity: ${({ isActive }) => (isActive ? 100 : 0)};
  transition: transform 0.15s ease 0s, opacity 0.15s ease 0s;
  white-space: nowrap;
  flex-wrap: wrap;
  align-content: flex-start;
`;

const ToolbarRowIconButton = styled(IconButton)<{ theme: themeType; isActive: boolean }>`
  height: 40px;
  width: 40px;
  border: 1px solid transparent;
  background-color: ${({ theme, isActive }) => (isActive ? '_' : 'transparent')};
`;

const ToolbarRowButton = styled(Button)<{ theme: themeType; isActive: boolean }>`
  height: 40px;
  min-width: 40px;
  border: 1px solid transparent;
  background-color: ${({ theme, isActive }) => (isActive ? '_' : 'transparent')};
`;

const Statusbar = styled.div`
  display: flex;
  flex-shrink: 0;
  position: relative;
  width: 100%;
  max-width: 100vw;
  padding: 0px 12px;
  height: 24px;
  border-top: 1px solid rgb(225, 223, 221);
  box-sizing: border-box;
  overflow: hidden;
  background-color: rgb(243, 242, 241);
`;

const StatusbarBlock = styled.div`
  height: 24px;
  background-color: transparent;
  color: rgb(96, 94, 92);
  padding: 0px 4px 2px;
  border: 1px solid transparent;
  display: inline-flex;
  text-decoration: none;
  border-radius: 0px;
  min-width: 40px;
  user-select: none;
  box-sizing: border-box;
  font-weight: 400;
  cursor: default;
  font-size: 12px;
  font-family: 'Lato';
  align-items: center;
`;

function ToolbarDivider() {
  const DividerWrapper = styled.span`
    display: inline-flex;
    height: 32px;
    align-items: center;
    padding: 4px;
  `;
  const Divider = styled.span`
    width: 1px;
    height: 100%;
    background-color: rgb(200, 200, 200);
  `;
  return (
    <DividerWrapper>
      <Divider />
    </DividerWrapper>
  );
}

interface ICombobox extends ButtonProps {
  width: string;
  cssContainerExtra?: SerializedStyles;
}

function Combobox(props: ICombobox) {
  const theme = useTheme() as themeType;
  const Box = styled(Button)<{ theme: themeType; width: string }>`
    background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
    height: 28px;
    min-width: 40px;
    box-shadow: none !important;
    border: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][800]} !important;
    width: ${({ width }) => width};
    justify-content: left;
  `;
  return (
    <ToolbarRowButton
      {...props}
      onClick={undefined}
      isActive={false}
      theme={theme}
      cssExtra={css`
        background: none !important;
        box-shadow: none !important;
        border: none !important;
        ${props.cssContainerExtra}
      `}
    >
      <Box
        {...props}
        theme={theme}
        cssExtra={css`
          overflow: hidden;
          ${props.cssExtra}
        `}
      ></Box>
    </ToolbarRowButton>
  );
}

interface IMenuBar {
  editor: Editor | null;
  isMax: boolean;
  setIsMax: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled?: boolean;
}

function MenuBar({ editor, isMax, setIsMax, ...props }: IMenuBar) {
  const theme = useTheme() as themeType;
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'layout' | 'utils'>('home');

  // DROPDOWNS
  // font family
  const [showFontFamilyDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left,
            width: 240,
          }}
          items={[
            {
              onClick: () => editor?.chain().focus().setFontFamily('Adamant BG').run(),
              label: 'Adamant BG (Headline)',
            },
            {
              onClick: () => editor?.chain().focus().setFontFamily('Arial').run(),
              label: 'Arial',
            },
            {
              onClick: () => editor?.chain().focus().setFontFamily('Calibri').run(),
              label: 'Calibri',
            },
            {
              onClick: () => editor?.chain().focus().setFontFamily('Consolas').run(),
              label: 'Consolas',
            },
            {
              onClick: () => editor?.chain().focus().setFontFamily('Georgia (Body)').run(),
              label: 'Georgia (Body)',
            },
            {
              onClick: () => editor?.chain().focus().setFontFamily('Times New Roman').run(),
              label: 'Times New Roman',
            },
          ]}
          noIcons
        />
      );
    },
    [],
    true,
    true
  );
  // text style
  const [showTextStyleDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left,
            width: 180,
          }}
          items={[
            {
              onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
              label: <h1>Heading 1</h1>,
            },
            {
              onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
              label: <h2>Heading 2</h2>,
            },
            {
              onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
              label: <h3>Heading 3</h3>,
            },
            {
              onClick: () => editor?.chain().focus().toggleBlockquote().run(),
              label: (
                <blockquote>
                  <p>Blockquote</p>
                </blockquote>
              ),
            },
            {
              onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
              label: (
                <pre>
                  <code>Code Block</code>
                </pre>
              ),
            },
            {
              onClick: () => editor?.chain().focus().setParagraph().run(),
              label: <p>Paragraph</p>,
            },
          ]}
          noIcons
        />
      );
    },
    [],
    true,
    true
  );

  // MODALS
  // insert link
  const [showLinkModal, hideLinkModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [link, setLink] = useState<string>('');

    /**
     * When the user types in the field, update `link` in state
     */
    const handleLinkValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLink(e.target.value);
    };

    return (
      <PlainModal
        hideModal={hideLinkModal}
        title={`Insert Link`}
        continueButton={{
          text: 'Insert',
          onClick: () => {
            const result = editor?.chain().focus().setLink({ href: link }).run();
            // return whether the action was successful
            if (result) return true;
            return false;
          },
          disabled: link.length < 1,
        }}
      >
        <InputGroup type={`text`}>
          <Label htmlFor={'insert-link'}>Location</Label>
          <TextInput
            name={'insert-link'}
            id={'insert-link'}
            font={'detail'}
            value={link}
            onChange={handleLinkValueChange}
          ></TextInput>
        </InputGroup>
      </PlainModal>
    );
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <Toolbar>
        <ToolbarTabRow theme={theme}>
          {props.isDisabled ? null : (
            <ToolbarTabList>
              <ToolbarTabButton
                theme={theme}
                color={'neutral'}
                isActive={activeTab === 'home'}
                onClick={() => setActiveTab('home')}
              >
                Home
              </ToolbarTabButton>
              <ToolbarTabButton
                theme={theme}
                color={'neutral'}
                isActive={activeTab === 'insert'}
                onClick={() => setActiveTab('insert')}
              >
                Insert
              </ToolbarTabButton>
              <ToolbarTabButton
                theme={theme}
                color={'neutral'}
                isActive={activeTab === 'layout'}
                onClick={() => setActiveTab('layout')}
              >
                Layout
              </ToolbarTabButton>
              <ToolbarTabButton
                theme={theme}
                color={'neutral'}
                isActive={activeTab === 'utils'}
                onClick={() => setActiveTab('utils')}
              >
                Utilities
              </ToolbarTabButton>
            </ToolbarTabList>
          )}
          <ToolbarMeta>
            <ToolbarMetaIconButton
              onClick={() => setIsMax(!isMax)}
              icon={isMax ? <ArrowMinimize20Regular /> : <ArrowMaximize20Regular />}
              color={'neutral'}
            ></ToolbarMetaIconButton>
          </ToolbarMeta>
        </ToolbarTabRow>
        {props.isDisabled ? null : (
          <ToolbarActionRowContainer theme={theme}>
            <ToolbarRow isActive={activeTab === 'home'}>
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().undo().run()}
                icon={<BackIcon />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().undo()}
                isActive={false}
              />
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().redo().run()}
                icon={<RedoIcon />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().redo()}
                isActive={false}
              />
              <ToolbarDivider />
              <Combobox
                onClick={showFontFamilyDropdown}
                color={'neutral'}
                disabled={true /*!editor.can().setFontFamily('Georgia')*/}
                width={`128px`}
                cssContainerExtra={css`
                  padding-right: 0;
                `}
                cssExtra={css`
                  border-top-right-radius: 0 !important;
                  border-bottom-right-radius: 0 !important;
                `}
              >
                {editor.getAttributes('textStyle').fontFamily || 'Georgia'}
              </Combobox>
              <Combobox
                onClick={showFontFamilyDropdown}
                color={'neutral'}
                disabled
                width={`52px`}
                cssContainerExtra={css`
                  padding-left: 0;
                `}
                cssExtra={css`
                  border-top-left-radius: 0 !important;
                  border-bottom-left-radius: 0 !important;
                  margin-left: -1px;
                `}
              >
                {editor.getAttributes('textStyle').fontSize || '17px'}
              </Combobox>
              <ToolbarRowIconButton
                onClick={() => editor.chain().toggleBold().run()}
                isActive={editor.isActive('bold')}
                icon={<BoldIcon />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().toggleBold()}
              />
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                icon={<ItalicsIcon />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().toggleItalic()}
              />
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                icon={<UnderlineIcon />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().toggleUnderline()}
              />
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                icon={<StrikeIcon />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().toggleStrike()}
              />
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                icon={<Code20Regular />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().toggleCode()}
              ></ToolbarRowIconButton>
              <ToolbarDivider />
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                icon={<TextBulletListLtr20Regular />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().toggleBulletList()}
              ></ToolbarRowIconButton>
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                icon={<TextNumberListLtr20Regular />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().toggleOrderedList()}
              ></ToolbarRowIconButton>
              <ToolbarDivider />
              <Combobox onClick={showTextStyleDropdown} color={'neutral'} width={`128px`}>
                {
                  // show the correct style name
                  editor.isActive('heading', { level: 1 }) ? (
                    <h1>Heading 1</h1>
                  ) : editor.isActive('heading', { level: 2 }) ? (
                    <h2>Heading 2</h2>
                  ) : editor.isActive('heading', { level: 3 }) ? (
                    <h3>Heading 3</h3>
                  ) : editor.isActive('blockquote') ? (
                    <blockquote>
                      <p>Blockquote</p>
                    </blockquote>
                  ) : editor.isActive('codeBlock') ? (
                    <pre>
                      <code>Code Block</code>
                    </pre>
                  ) : editor.isActive('paragraph') ? (
                    <p>Paragraph</p>
                  ) : (
                    ''
                  )
                }
              </Combobox>
            </ToolbarRow>
            <ToolbarRow isActive={activeTab === 'insert'}>
              <ToolbarRowButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                isActive={false}
                icon={<LineHorizontal120Regular />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().setHorizontalRule()}
              >
                Horizontal Line
              </ToolbarRowButton>
              <ToolbarRowButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                icon={<Code20Regular />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().toggleCodeBlock()}
              >
                Code Block
              </ToolbarRowButton>
              <ToolbarRowButton
                onClick={showLinkModal}
                isActive={false}
                icon={<Link20Regular />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().setTextSelection({ from: 0, to: 1 })}
              >
                Insert Link
              </ToolbarRowButton>
              <ToolbarRowButton
                onClick={() => editor.chain().focus().setComment().run()}
                isActive={false}
                icon={<CommentAdd20Regular />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().setComment()}
              >
                Insert Comment
              </ToolbarRowButton>
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().unsetComment().run()}
                isActive={false}
                icon={<CommentOff20Regular />}
                theme={theme}
                color={'neutral'}
                disabled={!editor.can().unsetComment()}
              />
            </ToolbarRow>
            <ToolbarRow isActive={activeTab === 'utils'}>
              <Button onClick={() => editor.chain().focus().unsetAllMarks().run()}>clear marks</Button>
              <Button onClick={() => editor.chain().focus().clearNodes().run()}>clear nodes</Button>
            </ToolbarRow>
          </ToolbarActionRowContainer>
        )}
      </Toolbar>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}></div>
    </>
  );
}

interface ITiptap {
  docName: string;
  user: {
    name: string;
    color: string;
  };
  options?: tiptapOptions;
  flatData?: { [key: string]: string | string[] | number };
  setFlatData?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string | string[] | number;
    }>
  >;
  isDisabled?: boolean;
}

const Tiptap = (props: ITiptap) => {
  const theme = useTheme() as themeType;

  // A new Y document
  const ydoc = useMemo(() => new Y.Doc(), []);
  // register with a WebSocket provider
  const providerWebsocket = useMemo(
    () =>
      new WebsocketProvider(
        process.env.NODE_ENV === 'production'
          ? `wss://api.thepaladin.cristata.app:1234`
          : 'ws://localhost:1234',
        props.docName,
        ydoc
      ),
    [props.docName, ydoc]
  );

  const editor = useEditor({
    editable: props.isDisabled === true ? false : true,
    extensions: [
      StarterKit.configure({ history: false }),
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
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
    ],
  });

  // whether the editor is maximized
  const [isMax, setIsMax] = useState<boolean>(false);

  // monitor the dimensions of the editor
  const { observe, width: tiptapWidth, height: tiptapHieght } = useDimensions();

  return (
    <div
      css={css`
        background-color: ${theme.color.neutral[theme.mode][100]};
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        height: 100%;
        ${isMax ? `position: fixed; inset: 0;` : ''};
        z-index: 1;
      `}
      ref={observe}
    >
      <MenuBar editor={editor} isMax={isMax} setIsMax={setIsMax} isDisabled={props.isDisabled} />
      <div
        css={css`
          overflow: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        `}
      >
        {
          // if it is an article type, show article metadata and photo
          props.options?.type === 'article' &&
          props.options.keys_article &&
          props.flatData &&
          props.setFlatData ? (
            <>
              <StandardLayout
                flatDataState={[props.flatData, props.setFlatData]}
                options={props.options}
                headline={(props.flatData[props.options.keys_article.headline] as string) || 'Article Headline'}
                description={
                  (props.flatData[props.options.keys_article.description] as string) ||
                  'A summary of the article, a notable quote from the interviewee, or a message to draw in a reader.'
                }
                categories={
                  (props.flatData[props.options.keys_article.categories] as string[]) || ['categories']
                }
                isDisabled={props.isDisabled}
                tiptapSize={{ width: tiptapWidth, height: tiptapHieght }}
              />
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
                margin-left: -1px;
                margin-right: -1px;
                border-left: 1px solid #0d0d0d;
                border-right: 1px solid #0d0d0d;
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
                color: #e0e0e0;
                padding: 0.1rem 0.3rem;
                border-radius: 3px 3px 3px 0;
                white-space: nowrap;
              }
            }
          `}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
      <Statusbar>
        <StatusbarBlock>{editor?.getCharacterCount()} characters</StatusbarBlock>
        <StatusbarBlock>
          {packageJson.dependencies['@tiptap/react']}__{packageJson.version}
        </StatusbarBlock>
      </Statusbar>
    </div>
  );
};

export { Tiptap };
