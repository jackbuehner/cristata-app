/** @jsxImportSource @emotion/react */
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import { Button, IconButton } from '../Button';
import styled from '@emotion/styled';
import { css, SerializedStyles, useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import React, { useState } from 'react';
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
  height: 40px;
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  padding: 0px 8px;
  display: flex;
`;

const ToolbarRow = styled.div<{ isActive: boolean }>`
  display: flex;
  visibility: ${({ isActive }) => (isActive ? 'visible' : 'hidden')};
  width: ${({ isActive }) => (isActive ? 'auto' : '0px')};
  transform: ${({ isActive }) => (isActive ? 'none' : 'translateX(-20px)')};
  opacity: ${({ isActive }) => (isActive ? 100 : 0)};
  transition: transform 0.15s ease 0s, opacity 0.15s ease 0s;
  white-space: nowrap;
  flex-wrap: wrap;
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
}

function MenuBar({ editor, isMax, setIsMax }: IMenuBar) {
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
          <ToolbarMeta>
            <ToolbarMetaIconButton
              onClick={() => setIsMax(!isMax)}
              icon={isMax ? <ArrowMinimize20Regular /> : <ArrowMaximize20Regular />}
              color={'neutral'}
            ></ToolbarMetaIconButton>
          </ToolbarMeta>
        </ToolbarTabRow>
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
      </Toolbar>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}></div>
    </>
  );
}

interface ITiptap {
  options?: tiptapOptions;
  flatData?: { [key: string]: string | string[] };
  setFlatData?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string | string[];
    }>
  >;
}

const Tiptap = (props: ITiptap) => {
  const theme = useTheme() as themeType;

  const editor = useEditor({
    extensions: [
      StarterKit,
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
    ],
    content: `<p>On Apr. 21, members of <em>The Paladin’s </em>Editorial Board met with President Elizabeth Davis to reflect on the school year, and to learn more about what the administration has in store for the 2021-2022 academic year. Here is what we learned:</p><p><strong>The administration acted in “good faith”. </strong>When making decisions about COVID-19 protocols, Davis shared the administration relied heavily on information made available by organizations such as the CDC and DHEC. For this reason, <comment data-commenter='{ "name": "Jack Buehner", "photo": "" }'>Davis shared she had “no regrets” when it came to the decisions made</comment> throughout this past year. Over 200 faculty, staff, or students were involved in the process as the administration frequently requested feedback and insight from members of the Furman community. If there was one thing she could change, Davis noted that she “wished she had gotten students involved in the process earlier.” After expressing her thanks to the students who were involved with the COVID-19 taskforce, Davis acknowledged that as the administration began receiving more requests from students, they were able to say “yes” more often as the spring semester progressed. Noting that over 200 events have taken place this year, Davis said none of it would not have been possible had it not been for the efforts of the student body to keep us on campus.</p><p><strong>Communication can be difficult. </strong>In following through with its promise to listen to feedback, the administration addressed issues with its communication practices. Noting that most people read updates on their own timeline, Davis mentioned that communication, especially under extreme circumstances, is a great challenge. But after meeting with students or student groups, Davis said the administration’s communication improved after listening to suggestions and feedback members of the community offered. An important part of communication comes thanks to students who serve as advocates, “message carriers” as Davis called them. In fact, it was thanks to the students that “we never shutdown” like other schools had to, said Davis. Although we started this semester even more restrictive than the Fall, the Furman community worked together to keep campus safe and open.</p><p><strong>The Furman Family is stronger than ever. </strong>When asked about the strength of the Furman community throughout the COVID-19pandemic, Davis first addressed the efforts of faculty and staff who have assisted in keeping campus safe. Whether it was those delivering meals or medicine to students in quarantine, or those answering questions via email, the significant amount of time and energy invested into campus operations “proves how much we care,” said Davis. But in addition to the students on campus, Davis also noted how much the administration cares about those who opted to learn virtually this year. “This place is dedicated to student success,” Davis said after acknowledging how campus resources such as the Internship Office or various departmental research programs still worked diligently to ensure students got the most out of the school year. &nbsp;</p><p>These efforts prove that “we rose to the occasion,” to make the most out of what we had. Although no one was perfect during COVID-19, “we are kind of a huggy place,” after all noted Davis, the fact that we never shutdown is “a testament of the students.” Davis does worry about first year students who started college during the oddest of times but moving forward she remains excited for the opportunities they have yet to discover. </p><p><strong>Technology in the classrooms may be a long-term resource. &nbsp;</strong>Once the administration realized COVID-19 was not going away any time soon, it purchased camera equipment for every single classroom to accommodate virtual learning needs. When questioned about what will be done with this technology equipment once the pandemic ends, Davis did not intend to get rid of it anytime soon. While hybrid learning posed some early challenges, it also offered opportunities we had not previously considered. When athletes need to travel, or when students find themselves with an interview or shadowing opportunity, Zoom may be the solution to missing class. While no decisions have been made yet, the Academic Affairs Team will begin considering the future of Zoom in our curriculum in the near future. &nbsp;</p><p><strong>In-person Commencement will honor the Class of 2021. </strong>When considering the plans for a Commencement ceremony, Davis noted that she encouraged the planning committee to “find a way to have graduation.” After careful contemplation, the administration settled on an outside ceremony at the football field, with a setup slightly different from year’s past. As of now, graduation will be held in the football stadium, with the stage rotated so that both sides of the stadium can be used for attendees. Typical COVID-19 protocols will be in place in order to maximize the health and safety of those in attendance. Davis urged seniors to remain diligent and responsible as they finish up the semester. “We don’t want to have something happen that jeopardizes someone’s shot at attending the ceremony,” she noted. </p><p><strong>Vaccine decisions are still underway. </strong>Although other universities such as Duke and Notre Dame have already announced their decisions to make COVID-19 vaccinations mandatory for students returning in the Fall, Furman has yet to reach its final decision. According to Davis, “There is no specific timeline about the vaccine decision,” but students are still encouraged to get the COVID-19 vaccine. In fact, at least half of the student body has already received at least the first dose of the vaccine according to the survey sent to students earlier this month. Still, the administration is unable to announce its final decision about a vaccine requirement as “the CDC has not provided perfect clarity about herd immunity” and the administration will base its decision on information available at the time, according to Davis. </p><p><strong>A message to the students.</strong> As graduation approaches, Davis had a few words of advice for graduating seniors and the remainder of the student body. “Don’t underestimate what you’ve learned this year,” said Davis, who added that “You’re going to have struggles, but making it through something like this (the pandemic) is a testament.” Davis remarked that one’s ability to manage disappointment and continue to thrive speaks to one’s strength. Specifically addressing the Class of 2021, Davis encouraged seniors to reflect on the challenges they faced throughout their entire time at Furman, and to “turn those challenges into valuable traits.” </p><p><em>The Paladin </em>extends its congratulations to all students graduating this year, and its thanks to every student who played a role in ensuring campus remained safe, open and healthy this year. </p>`,
  });

  // whether the editor is maximized
  const [isMax, setIsMax] = useState<boolean>(false);

  return (
    <div
      css={css`
        background-color: ${theme.color.neutral[theme.mode][100]};
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        height: 100%;
        ${isMax ? `position: fixed; inset: 0;` : ''}
      `}
    >
      <MenuBar editor={editor} isMax={isMax} setIsMax={setIsMax} />
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
              />
            </>
          ) : null
        }
        <div
          css={css`
            max-width: 590px;
            background-color: white;
            border: 1px solid rgb(171, 171, 171);
            padding: 68px 88px;
            margin: 20px;
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
              p {
                margin-top: 0;
                margin-bottom: 10px;
              }
              comment-card {
                position: absolute;
                background: white;
                padding: 10px 20px;
                margin: 0;
                width: 240px;
                box-shadow: rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px;
                border: 1px solid lightgray;
                right: -410px;
                border-radius: ${theme.radius};

                comment-meta {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: left;
                  gap: 10px;
                  img {
                    width: 28px;
                    height: 28px;
                    border-radius: ${theme.radius};
                  }
                  comment-author-date {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    comment-author {
                      font-size: 14px;
                      line-height: 14px;
                      font-family: ${theme.font.detail};
                      font-weight: 600;
                      color: ${theme.color.neutral[theme.mode][1200]};
                    }
                    comment-timestamp {
                      font-size: 11px;
                      line-height: 11px;
                      font-family: ${theme.font.detail};
                      color: ${theme.color.neutral[theme.mode][800]};
                    }
                  }
                }
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
