/** @jsxImportSource @emotion/react */
import { Editor } from '@tiptap/react';
import styled from '@emotion/styled/macro';
import { css, useTheme } from '@emotion/react';
import { themeType } from '../../../../utils/theme/theme';
import React, { useState } from 'react';
import { BackIcon, RedoIcon, BoldIcon, ItalicsIcon, UnderlineIcon, StrikeIcon } from './../../Icons';
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
  Database20Regular,
  Apps20Regular,
} from '@fluentui/react-icons';
import { useDropdown } from '../../../../hooks/useDropdown';
import { Menu } from '../../../Menu';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../../Modal';
import { TextInput } from '../../../TextInput';
import { InputGroup } from '../../../InputGroup';
import { Label } from '../../../Label';
import Color from 'color';
import {
  AcceptRevision20Icon,
  Editor20Icon,
  NextRevision20Icon,
  PreviousRevision20Icon,
  RejectRevision20Icon,
  TrackChanges20Icon,
  WordCountList20Icon,
} from './../../office-icon';
import './../../office-icon/colors1.css';
import { ToolbarTabRow } from './ToolbarTabRow';
import { ToolbarTabList } from './ToolbarTabList';
import { ToolbarMeta } from './ToolbarMeta';
import { ToolbarTabButton } from './ToolbarTabButton';
import { ToolbarMetaIconButton } from './ToolbarMetaIconButton';
import { ToolbarActionRowContainer } from './ToolbarActionRowContainer';
import { ToolbarRowIconButton } from './ToolbarRowIconButton';
import { ToolbarRow } from './ToolbarRow';
import { Combobox } from './Combobox';
import { ToolbarDivider } from './ToolbarDivider';
import { ToolbarRowButton } from './ToolbarRowButton';
import { Iaction } from '../../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { useHistory } from 'react-router-dom';
import { tiptapOptions } from '../../../../config';

const TOOLBAR = styled.div`
  position: relative;
  z-index: 10;
  box-shadow: rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px;
  width: 100%;
`;

interface IToolbar {
  editor: Editor | null;
  isMax: boolean;
  setIsMax: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled?: boolean;
  layout: 'standard' | 'full';
  setLayout: React.Dispatch<React.SetStateAction<'standard' | 'full'>>;
  awarenessProfiles?: { name: string; color: string; sessionId: string; photo: string }[];
  tiptapWidth: number;
  user: {
    name: string;
    color: string;
    photo: string;
  };
  toggleTrackChanges: () => void;
  trackChanges: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  sidebarTitle: string;
  setSidebarTitle: React.Dispatch<React.SetStateAction<string>>;
  flatData?: { [key: string]: string | string[] | number | number[] | boolean };
  setFlatData?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string | string[] | number | number[] | boolean;
    }>
  >;
  actions?: Array<Iaction | null>;
  forceMax?: boolean;
  options?: tiptapOptions;
}

function Toolbar({ editor, isMax, setIsMax, ...props }: IToolbar) {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'layout' | 'review' | 'actions'>('home');

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
          items={
            props.options?.features.fontFamilies?.map((family) => {
              return {
                onClick: () => editor?.chain().focus().setFontFamily(family.name).run(),
                label: family.label || family.name,
                color: 'neutral',
                disabled: family.disabled,
              };
            }) || []
          }
          noIcons
        />
      );
    },
    [],
    true,
    true
  );
  // font size
  const [showFontSizeDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left,
            width: 67,
          }}
          items={
            props.options?.features.fontSizes?.map((size) => {
              return {
                onClick: () => editor?.chain().focus().setFontSize(size).run(),
                label: size,
                color: 'neutral',
              };
            }) || []
          }
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

  // layout
  const [showLayoutDropdown] = useDropdown(
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
              onClick: () => props.setLayout('standard'),
              label: 'Standard',
            },
            {
              onClick: () => props.setLayout('full'),
              label: 'Full',
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
  // get Microsoft Editor
  const [showMSFTEditorModal, hideMSFTEditorModal] = useModal(() => {
    return (
      <PlainModal
        hideModal={hideLinkModal}
        title={`Microsoft Editor`}
        text={`Add the Microsoft Editor extension to your browser to recieve spelling, grammar, and refinement suggestions on the content of this document. You will need to sign in with your Microsoft 365 Account.`}
        continueButton={{
          text: 'Get Microsoft Editor',
          onClick: () => {
            window.open(`https://www.microsoft.com/en-us/microsoft-365/microsoft-editor`);
            return true;
          },
        }}
        cancelButton={{
          text: 'Close',
          onClick: () => {
            hideMSFTEditorModal();
            return true;
          },
        }}
      ></PlainModal>
    );
  }, [editor]);
  // insert sweepwidget widget
  const [showSweepwidgetModal, hideSweepwidgetModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [idValue, setIdValue] = useState<HTMLTextAreaElement['value']>('');

    /**
     * When the user types in the field, update `idValue` in state
     */
    const handleIdFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIdValue(e.target.value);
    };

    return (
      <PlainModal
        hideModal={hideSweepwidgetModal}
        title={`SweepWidget Giveaway`}
        continueButton={{
          text: 'Insert',
          onClick: () => {
            if (editor) {
              editor.chain().focus().insertSweepwidgetWidget('34804-gfbwtdns').run();
              return true;
            }
            return false;
          },
          disabled: idValue.length < 1,
        }}
      >
        <Label
          description={`The giveaway ID can be found on your <a href="https://sweepwidget.com/user">SweepWidget user page</a>.
            
            <b>Instructions</b>
            <ol style="margin: 0; padding: 0 0 0 12px; display: flex; flex-direction: column;">
              <li>Go to your <a href="https://sweepwidget.com/user">SweepWidget user page</a></li>
              <li>Click "Embed into your blog or website"</a></li>
              <li>Copy the ID from the code. For example: For <code style="background: #e0e0e0;">id="34804-gfbwtdns"</code>, the ID is <code style="background: #e0e0e0;">34804-gfbwtdns</code>.</li>
              <li>Paste the code into the field below these instructions.</a></li>
            </ol>
          `}
        >
          Giveaway ID
        </Label>
        <TextInput
          name={'sw-id'}
          id={'sw-id'}
          value={idValue}
          onChange={handleIdFieldChange}
          placeholder={`Type sweepwidget id...`}
        ></TextInput>
      </PlainModal>
    );
  }, [editor]);
  // insert youtube widget
  const [showYoutubeModal, hideYoutubeModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [idValue, setIdValue] = useState<HTMLTextAreaElement['value']>('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [videoUrl, setVideoUrl] = useState<HTMLTextAreaElement['value']>(``);

    /**
     * When the user types in the field, update `idValue` and `videoUrl` in state
     */
    const handleVideoUrlFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setVideoUrl(e.target.value);
        const { search } = new URL(e.target.value);
        const UrlSearch = new URLSearchParams(search);
        const videoId = UrlSearch.get('v');
        if (videoId) setIdValue(videoId);
        else setIdValue('');
      } catch (error) {
        setIdValue('');
      }
    };

    return (
      <PlainModal
        hideModal={hideYoutubeModal}
        title={`Insert YouTube video`}
        continueButton={{
          text: 'Insert',
          onClick: () => {
            if (editor) {
              editor.chain().focus().insertYoutubeWidget(idValue).run();
              return true;
            }
            return false;
          },
          disabled: idValue.length < 1,
        }}
      >
        <Label description={`Use the full video url instead of the shortened one.`}>Video URL</Label>
        <TextInput
          name={'video-url'}
          id={'video-url'}
          value={videoUrl}
          onChange={handleVideoUrlFieldChange}
          placeholder={`Type youtube video url...`}
        ></TextInput>
      </PlainModal>
    );
  }, [editor]);

  // widgets dropdown
  const [showWidgetsDropdown] = useDropdown(
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
              onClick: showSweepwidgetModal,
              label: 'SweepWidget Giveaway',
              color: 'neutral',
              disabled: !props.options?.features.widgets?.sweepwidget,
            },
            {
              onClick: showYoutubeModal,
              label: 'Youtube Video',
              color: 'neutral',
              disabled: !props.options?.features.widgets?.youtube,
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

  if (!editor) {
    return null;
  }

  return (
    <>
      <TOOLBAR>
        <ToolbarTabRow theme={theme} width={props.tiptapWidth}>
          {props.isDisabled ? null : (
            <ToolbarTabList width={props.tiptapWidth}>
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
                isActive={activeTab === 'review'}
                onClick={() => setActiveTab('review')}
              >
                Review
              </ToolbarTabButton>
              {props.actions ? (
                <ToolbarTabButton
                  theme={theme}
                  color={'neutral'}
                  isActive={activeTab === 'actions'}
                  onClick={() => setActiveTab('actions')}
                >
                  Actions
                </ToolbarTabButton>
              ) : null}
            </ToolbarTabList>
          )}
          <ToolbarMeta>
            <div
              css={css`
                display: flex;
                flex-direction: row;
                gap: 6px;
              `}
            >
              {props.awarenessProfiles?.map((profile, index) => {
                return (
                  <div
                    key={index}
                    css={css`
                      width: 24px;
                      height: 24px;
                      border: 2px solid ${profile.color};
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      font-family: ${theme.font.headline};
                      border-radius: 50%;
                      font-size: 14px;
                      background-color: ${Color(profile.color).alpha(0.4).string()};
                      background-image: url('${profile.photo}');
                      user-select: none;
                      color: ${theme.color.neutral[theme.mode][1200]};
                      background-position: center;
                      background-size: cover;
                    `}
                    title={profile.name}
                  ></div>
                );
              })}
            </div>
            <ToolbarMetaIconButton
              icon={<Database20Regular />}
              color={'neutral'}
              onClick={() => {
                if (props.isSidebarOpen && props.sidebarTitle === 'Document properties') {
                  props.setIsSidebarOpen(false);
                  props.setSidebarTitle('');
                  history.replace({
                    search: `?fs=${props.forceMax ? 'force' : Number(isMax)}&props=0`,
                  });
                } else {
                  props.setIsSidebarOpen(true);
                  props.setSidebarTitle('Document properties');
                  history.replace({
                    search: `?fs=${props.forceMax ? 'force' : Number(isMax)}&props=1`,
                  });
                }
              }}
              isActive={props.isSidebarOpen && props.sidebarTitle === 'Document properties'}
            />
            {!props.forceMax ? (
              <ToolbarMetaIconButton
                onClick={() => {
                  setIsMax(!isMax);
                  history.replace({
                    search: `?fs=${Number(!isMax)}&props=${Number(
                      props.sidebarTitle === 'Document properties'
                    )}`,
                  });
                }}
                icon={isMax ? <ArrowMinimize20Regular /> : <ArrowMaximize20Regular />}
                color={'neutral'}
              />
            ) : null}
          </ToolbarMeta>
        </ToolbarTabRow>
        {props.isDisabled ? null : (
          <ToolbarActionRowContainer theme={theme}>
            <ToolbarRow isActive={activeTab === 'home'}>
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().undo().run()}
                icon={<BackIcon />}
                disabled={!editor.can().undo()}
                isActive={false}
              />
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().redo().run()}
                icon={<RedoIcon />}
                disabled={!editor.can().redo()}
                isActive={false}
              />
              <ToolbarDivider />
              <Combobox
                onClick={showFontFamilyDropdown}
                color={'neutral'}
                disabled={
                  !editor.can().setFontFamily('Georgia') ||
                  (props.options?.features.fontFamilies || []).length === 0
                }
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
                onClick={showFontSizeDropdown}
                color={'neutral'}
                disabled={(props.options?.features.fontSizes || []).length === 0}
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
              {props.options?.features.bold ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().toggleBold().run()}
                  isActive={editor.isActive('bold')}
                  icon={<BoldIcon />}
                  disabled={!editor.can().toggleBold()}
                />
              ) : null}
              {props.options?.features.italic ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                  icon={<ItalicsIcon />}
                  disabled={!editor.can().toggleItalic()}
                />
              ) : null}
              {props.options?.features.underline ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editor.isActive('underline')}
                  icon={<UnderlineIcon />}
                  disabled={!editor.can().toggleUnderline()}
                />
              ) : null}
              {props.options?.features.strike ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  isActive={editor.isActive('strike')}
                  icon={<StrikeIcon />}
                  disabled={!editor.can().toggleStrike()}
                />
              ) : null}
              {props.options?.features.code ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  isActive={editor.isActive('code')}
                  icon={<Code20Regular />}
                  disabled={!editor.can().toggleCode()}
                />
              ) : null}
              <ToolbarDivider />
              {props.options?.features.bulletList ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  isActive={editor.isActive('bulletList')}
                  icon={<TextBulletListLtr20Regular />}
                  disabled={!editor.can().toggleBulletList()}
                />
              ) : null}
              {props.options?.features.orderedList ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive('orderedList')}
                  icon={<TextNumberListLtr20Regular />}
                  disabled={!editor.can().toggleOrderedList()}
                />
              ) : null}
              <ToolbarDivider />
              {props.options?.features.textStylePicker ? (
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
              ) : null}
            </ToolbarRow>
            <ToolbarRow isActive={activeTab === 'insert'}>
              {props.options?.features.horizontalRule ? (
                <ToolbarRowButton
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  isActive={false}
                  icon={<LineHorizontal120Regular />}
                  disabled={!editor.can().setHorizontalRule()}
                >
                  Horizontal Line
                </ToolbarRowButton>
              ) : null}
              {Object.values(props.options?.features.widgets || {}).includes(true) ? (
                <ToolbarRowButton onClick={showWidgetsDropdown} icon={<Apps20Regular />} showChevron>
                  Widgets
                </ToolbarRowButton>
              ) : null}
              {props.options?.features.link ? (
                <ToolbarRowButton
                  onClick={showLinkModal}
                  isActive={false}
                  icon={<Link20Regular />}
                  disabled={!editor.can().setTextSelection({ from: 0, to: 1 })}
                >
                  Link
                </ToolbarRowButton>
              ) : null}
              {props.options?.features.comment ? (
                <ToolbarRowButton
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .setComment(props.user.color, {
                        name: props.user.name,
                        photo: props.user.photo,
                      })
                      .run()
                  }
                  isActive={false}
                  icon={<CommentAdd20Regular />}
                  disabled={!editor.can().setComment('', { name: '', photo: '' })}
                >
                  Comment
                </ToolbarRowButton>
              ) : null}
              {props.options?.features.comment ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().unsetComment().run()}
                  isActive={false}
                  icon={<CommentOff20Regular />}
                  disabled={!editor.can().unsetComment()}
                />
              ) : null}
            </ToolbarRow>
            <ToolbarRow isActive={activeTab === 'layout'}>
              <Combobox onClick={showLayoutDropdown} color={'neutral'} width={`128px`}>
                {props.layout}
              </Combobox>
            </ToolbarRow>
            <ToolbarRow isActive={activeTab === 'review'}>
              <ToolbarRowButton
                onClick={() => showMSFTEditorModal()}
                isActive={false}
                icon={<Editor20Icon />}
                disabled={!editor}
              >
                Editor (spell check)
              </ToolbarRowButton>
              <ToolbarRowIconButton
                onClick={() => null}
                isActive={false}
                icon={<WordCountList20Icon />}
                disabled={true}
              />
              <ToolbarDivider />
              {props.options?.features.trackChanges ? (
                <>
                  <ToolbarRowButton
                    onClick={() => props.toggleTrackChanges()}
                    isActive={props.trackChanges}
                    icon={<TrackChanges20Icon />}
                    disabled={!editor}
                  >
                    Track changes (text only)
                  </ToolbarRowButton>
                  <ToolbarRowButton
                    onClick={() => editor.chain().focus().approveChange().run()}
                    isActive={false}
                    icon={<AcceptRevision20Icon />}
                    disabled={!editor}
                  >
                    Accept
                  </ToolbarRowButton>
                  <ToolbarRowButton
                    onClick={() => editor.chain().focus().rejectChange().run()}
                    isActive={false}
                    icon={<RejectRevision20Icon />}
                    disabled={!editor}
                  >
                    Reject
                  </ToolbarRowButton>
                  <ToolbarRowIconButton
                    onClick={() => editor.chain().focus().previousChange().run()}
                    isActive={false}
                    icon={<PreviousRevision20Icon />}
                    disabled={!editor}
                  />
                  <ToolbarRowIconButton
                    onClick={() => editor.chain().focus().nextChange().run()}
                    isActive={false}
                    icon={<NextRevision20Icon />}
                    disabled={!editor}
                  />
                  <ToolbarDivider />
                </>
              ) : null}
              {props.options?.features.comment ? (
                <>
                  <ToolbarRowButton
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setComment(props.user.color, {
                          name: props.user.name,
                          photo: props.user.photo,
                        })
                        .run()
                    }
                    isActive={false}
                    icon={<CommentAdd20Regular />}
                    disabled={!editor.can().setComment('', { name: '', photo: '' })}
                  >
                    Insert Comment
                  </ToolbarRowButton>
                  <ToolbarRowIconButton
                    onClick={() => editor.chain().focus().unsetComment().run()}
                    isActive={false}
                    icon={<CommentOff20Regular />}
                    disabled={!editor.can().unsetComment()}
                  />{' '}
                </>
              ) : null}
            </ToolbarRow>
            {props.actions ? (
              <ToolbarRow isActive={activeTab === 'actions'}>
                {props.actions.map((action, index) => {
                  if (action === null) {
                    return null;
                  }
                  return (
                    <ToolbarRowButton
                      key={index}
                      onClick={action.action}
                      color={action.color}
                      disabled={action.disabled}
                      icon={action.icon}
                      isActive={false}
                    >
                      {action.label}
                    </ToolbarRowButton>
                  );
                })}
              </ToolbarRow>
            ) : null}
          </ToolbarActionRowContainer>
        )}
      </TOOLBAR>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}></div>
    </>
  );
}

export { Toolbar };
