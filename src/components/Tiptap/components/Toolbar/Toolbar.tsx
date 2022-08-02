/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  Apps20Regular,
  ArrowMaximize20Regular,
  ArrowMinimize20Regular,
  Code20Regular,
  CommentAdd20Regular,
  CommentMultiple20Regular,
  CommentOff20Regular,
  Database20Regular,
  LineHorizontal120Regular,
  Link20Regular,
  Share20Regular,
  TextBulletListLtr20Regular,
  TextNumberListLtr20Regular,
  TextQuote20Regular,
} from '@fluentui/react-icons';
import { Editor } from '@tiptap/react';
import Color from 'color';
import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useModal } from 'react-modal-hook';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { tiptapOptions } from '../../../../config';
import { ClientConsumer } from '../../../../graphql/client';
import {
  PHOTOS_BASIC_BY_REGEXNAME_OR_URL,
  PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE,
} from '../../../../graphql/queries';
import { useDropdown } from '../../../../hooks/useDropdown';
import { CollectionItemPage } from '../../../../pages/CMS/CollectionItemPage';
import { Action } from '../../../../pages/CMS/CollectionItemPage/useActions';
import { themeType } from '../../../../utils/theme/theme';
import { Text } from '../../../ContentField';
import { InputGroup } from '../../../InputGroup';
import { Label } from '../../../Label';
import { Menu } from '../../../Menu';
import { PlainModal } from '../../../Modal';
import { Select } from '../../../Select';
import { CommentPanel } from '../../extension-power-comment';
import { BackIcon, BoldIcon, ItalicsIcon, RedoIcon, StrikeIcon, UnderlineIcon } from './../../Icons';
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
import { Combobox } from './Combobox';
import { SendToolbarRow } from './SendToolbarRow';
import { ToolbarActionRowContainer } from './ToolbarActionRowContainer';
import { ToolbarDivider } from './ToolbarDivider';
import { ToolbarMeta } from './ToolbarMeta';
import { ToolbarMetaIconButton } from './ToolbarMetaIconButton';
import { ToolbarRow } from './ToolbarRow';
import { ToolbarRowButton } from './ToolbarRowButton';
import { ToolbarRowIconButton } from './ToolbarRowIconButton';
import { ToolbarTabButton } from './ToolbarTabButton';
import { ToolbarTabList } from './ToolbarTabList';
import { ToolbarTabRow } from './ToolbarTabRow';
import { useFontFamilyDropdown } from './useCustomDropdown';

const TOOLBAR = styled.div`
  position: relative;
  z-index: 10;
  box-shadow: rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px;
  width: 100%;
`;

interface IToolbar {
  editor: Editor | null;
  isMax: boolean;
  isDisabled?: boolean;
  layouts?: {
    layout?: string;
    options: { value: string; label: string }[];
    setLayout: (layout: string) => void;
  };
  awarenessProfiles?: { name: string; color: string; sessionId: string; photo: string }[];
  tiptapWidth: number;
  user: {
    name: string;
    color: string;
    sessionId: string;
    photo: string;
  };
  toggleTrackChanges: () => void;
  trackChanges: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarContent: React.Dispatch<React.SetStateAction<React.ReactElement>>;
  sidebarTitle: string;
  setSidebarTitle: React.Dispatch<React.SetStateAction<string>>;
  setIsBackstageOpen: React.Dispatch<React.SetStateAction<boolean>>;
  actions?: Array<Action | null>;
  forceMax?: boolean;
  options?: tiptapOptions;
  compact?: boolean;
  iframehtmlstring?: string;
}

function Toolbar({ editor, isMax, ...props }: IToolbar) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'layout' | 'review' | 'email'>('home');
  const { pathname, search, hash } = useLocation();
  const params = new URLSearchParams(search);
  const shareAction = props.actions?.find((action) => action?.label === 'Share') || undefined;

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // DROPDOWNS
  const [showFontFamilyDropdown] = useFontFamilyDropdown({
    editor,
    fontFamilies: props.options?.features.fontFamilies,
  });

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
                color: 'blue',
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
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.headline)
                  .setHeading({ level: 1 })
                  .setClassName('title')
                  .setBold()
                  .selectParentNode()
                  .run(),
              label: <h1 className={'title'}>Title</h1>,
              color: 'blue',
            },
            {
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.body)
                  .setParagraph()
                  .setClassName('subtitle')
                  .setItalic()
                  .run(),
              label: <p className={'subtitle'}>Subtitle</p>,
              color: 'blue',
            },
            {
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.headline)
                  .setHeading({ level: 1 })
                  .setClassName('')
                  .setBold()
                  .selectParentNode()
                  .run(),
              label: <h1>Heading 1</h1>,
              color: 'blue',
            },
            {
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.headline)
                  .toggleHeading({ level: 2 })
                  .setClassName('')
                  .setBold()
                  .selectParentNode()
                  .run(),
              label: <h2>Heading 2</h2>,
              color: 'blue',
            },
            {
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.headline)
                  .toggleHeading({ level: 3 })
                  .setClassName('')
                  .setBold()
                  .selectParentNode()
                  .run(),
              label: <h3>Heading 3</h3>,
              color: 'blue',
            },
            {
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.body)
                  .toggleBlockquote()
                  .setClassName('')
                  .selectParentNode()
                  .run(),
              label: (
                <blockquote>
                  <p>Blockquote</p>
                </blockquote>
              ),
              color: 'blue',
            },
            {
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.body)
                  .toggleCodeBlock()
                  .setClassName('')
                  .selectParentNode()
                  .run(),
              label: (
                <pre>
                  <code>Code Block</code>
                </pre>
              ),
              color: 'blue',
            },
            {
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.body)
                  .setParagraph()
                  .setClassName('hanging')
                  .selectParentNode()
                  .run(),
              label: <p>Hanging Indent</p>,
              color: 'blue',
            },
            {
              onClick: () =>
                editor
                  ?.chain()
                  .focus()
                  .selectParentNode()
                  .setFontFamily(theme.font.body)
                  .setParagraph()
                  .setClassName('')
                  .selectParentNode()
                  .run(),
              label: <p>Paragraph</p>,
              color: 'blue',
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
          items={
            props.layouts?.options.map((option) => {
              return {
                onClick: () => props.layouts?.setLayout(option.value),
                label: option.label,
                color: 'blue',
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

  // MODALS
  // insert link
  const [showLinkModal, hideLinkModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [link, setLink] = useState<string>('');

    /**
     * When the user types in the field, update `link` in state
     */
    const handleLinkValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLink(e.target.value);
    };

    return (
      <PlainModal
        hideModal={hideLinkModal}
        title={`Insert Link`}
        cancelButton={{ color: 'blue' }}
        continueButton={{
          text: 'Insert',
          color: 'blue',
          onClick: () => {
            const result = editor?.chain().focus().setLink({ href: link }).run();
            // return whether the action was successful
            if (result) return true;
            return false;
          },
          disabled: link.length < 1,
        }}
      >
        <Text
          label={'Location'}
          color={'blue'}
          name={'insert-link'}
          id={'insert-link'}
          font={'detail'}
          value={link}
          isEmbedded
          onChange={handleLinkValueChange}
        />
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
          color: 'blue',
          onClick: () => {
            window.open(`https://www.microsoft.com/en-us/microsoft-365/microsoft-editor`);
            return true;
          },
        }}
        cancelButton={{
          text: 'Close',
          color: 'blue',
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
    const handleIdFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setIdValue(e.target.value);
    };

    return (
      <PlainModal
        hideModal={hideSweepwidgetModal}
        title={`SweepWidget Giveaway`}
        cancelButton={{ color: 'blue' }}
        continueButton={{
          text: 'Insert',
          color: 'blue',
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
        <Text
          label={'Giveaway Id'}
          description={`The giveaway ID can be found on your <a href="https://sweepwidget.com/user">SweepWidget user page</a>.
            
            <b>Instructions</b>
            <ol style="margin: 0; padding: 0 0 0 12px; display: flex; flex-direction: column;">
              <li>Go to your <a href="https://sweepwidget.com/user">SweepWidget user page</a></li>
              <li>Click "Embed into your blog or website"</a></li>
              <li>Copy the ID from the code. For example: For <code style="background: ${
                theme.mode === 'light' ? '#e0e0e0' : '#212121'
              };">id="34804-gfbwtdns"</code>, the ID is <code style="background: ${
            theme.mode === 'light' ? '#e0e0e0' : '#212121'
          };">34804-gfbwtdns</code>.</li>
              <li>Paste the code into the field below these instructions.</a></li>
            </ol>
          `}
          name={'sw-id'}
          id={'sw-id'}
          value={idValue}
          onChange={handleIdFieldChange}
          placeholder={`Type sweepwidget id...`}
          color={'blue'}
          isEmbedded
        />
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
    const handleVideoUrlFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        cancelButton={{ color: 'blue' }}
        continueButton={{
          text: 'Insert',
          color: 'blue',
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
        <Text
          label={'Video URL'}
          description={`Use the full video url instead of the shortened one.`}
          name={'video-url'}
          id={'video-url'}
          value={videoUrl}
          onChange={handleVideoUrlFieldChange}
          placeholder={`Type youtube video url...`}
          color={'blue'}
          isEmbedded
        />
      </PlainModal>
    );
  }, [editor]);

  // insert photo widget
  const [showPhotoWidgetModal, hidePhotoWidgetModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [photoId, setPhotoId] = useState<HTMLTextAreaElement['value']>(``);

    return (
      <PlainModal
        hideModal={hidePhotoWidgetModal}
        title={`Insert photo`}
        continueButton={{
          text: 'Insert',
          onClick: () => {
            if (editor) {
              editor.chain().focus().insertPhotoWidget(photoId).run();
              return true;
            }
            return false;
          },
          disabled: photoId.length < 1,
        }}
      >
        <ErrorBoundary fallback={<div>Error loading async select field</div>}>
          <InputGroup type={`text`}>
            <Label
              description={`Select from photos uploaded to the photo library. Photos only appear if they have proper photo attribution.`}
            >
              Select photo
            </Label>
            <ClientConsumer>
              {(client) => (
                <Select
                  client={client}
                  loadOptions={async (inputValue: string) => {
                    // get the photos that best match the current input
                    const { data } = await client.query<PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE>({
                      query: PHOTOS_BASIC_BY_REGEXNAME_OR_URL(inputValue),
                      fetchPolicy: 'no-cache',
                    });

                    // with the photo data, create the options array
                    const options = data?.photos.docs.map((photo) => ({
                      value: photo._id,
                      label: photo.name,
                    }));

                    // return the options array
                    return options || [];
                  }}
                  async
                  val={photoId}
                  onChange={(valueObj) => (valueObj ? setPhotoId(valueObj.value) : null)}
                />
              )}
            </ClientConsumer>
          </InputGroup>
        </ErrorBoundary>
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
              onClick: showPhotoWidgetModal,
              label: 'Photo',
              color: 'blue',
              disabled: !props.options?.features.widgets?.photoWidget,
            },
            {
              onClick: showSweepwidgetModal,
              label: 'SweepWidget Giveaway',
              color: 'blue',
              disabled: !props.options?.features.widgets?.sweepwidget,
            },
            {
              onClick: showYoutubeModal,
              label: 'Youtube Video',
              color: 'blue',
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
        <ToolbarTabRow theme={theme} width={props.tiptapWidth} compact={props.compact}>
          {props.compact ? null : (
            <ToolbarTabList width={props.tiptapWidth}>
              <ToolbarTabButton theme={theme} color={'blue'} onClick={() => props.setIsBackstageOpen(true)}>
                File
              </ToolbarTabButton>
              <ToolbarTabButton
                theme={theme}
                color={'blue'}
                isActive={activeTab === 'home'}
                onClick={() => setActiveTab('home')}
              >
                Home
              </ToolbarTabButton>
              <ToolbarTabButton
                theme={theme}
                color={'blue'}
                isActive={activeTab === 'insert'}
                onClick={() => setActiveTab('insert')}
              >
                Insert
              </ToolbarTabButton>
              <ToolbarTabButton
                theme={theme}
                color={'blue'}
                isActive={activeTab === 'layout'}
                onClick={() => setActiveTab('layout')}
              >
                Layout
              </ToolbarTabButton>
              <ToolbarTabButton
                theme={theme}
                color={'blue'}
                isActive={activeTab === 'review'}
                onClick={() => setActiveTab('review')}
              >
                Review
              </ToolbarTabButton>
              <ToolbarTabButton
                theme={theme}
                color={'blue'}
                isActive={activeTab === 'email'}
                onClick={() => setActiveTab('email')}
              >
                Email
              </ToolbarTabButton>
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
            {props.compact ? null : (
              <>
                <ToolbarMetaIconButton
                  icon={<Database20Regular />}
                  color={'blue'}
                  onClick={() => {
                    if (props.isSidebarOpen && props.sidebarTitle === 'Document properties') {
                      props.setIsSidebarOpen(false);
                      props.setSidebarTitle('');
                      params.set('props', '0');
                      navigate(pathname + '?' + params.toString() + hash, { replace: true });
                    } else {
                      props.setIsSidebarOpen(true);
                      props.setSidebarTitle('Document properties');
                      props.setSidebarContent(<CollectionItemPage isEmbedded />);
                      params.set('props', '1');
                      params.set('comments', '0');
                      navigate(pathname + '?' + params.toString() + hash, { replace: true });
                    }
                  }}
                  isActive={props.isSidebarOpen && props.sidebarTitle === 'Document properties'}
                  data-tip={`${
                    props.isSidebarOpen && props.sidebarTitle === 'Document properties' ? 'Hide' : 'Show'
                  } document properties`}
                />
                <ToolbarMetaIconButton
                  icon={<CommentMultiple20Regular />}
                  color={'blue'}
                  onClick={() => {
                    if (props.isSidebarOpen && props.sidebarTitle === 'Comments') {
                      props.setIsSidebarOpen(false);
                      props.setSidebarTitle('');
                      params.set('comments', '0');
                      navigate(pathname + '?' + params.toString() + hash, { replace: true });
                    } else {
                      props.setIsSidebarOpen(true);
                      props.setSidebarTitle('Comments');
                      props.setSidebarContent(<CommentPanel />);
                      params.set('props', '0');
                      params.set('comments', '1');
                      navigate(pathname + '?' + params.toString() + hash, { replace: true });
                    }
                  }}
                  isActive={props.isSidebarOpen && props.sidebarTitle === 'Comments'}
                  data-tip={`${
                    props.isSidebarOpen && props.sidebarTitle === 'Comments' ? 'Hide' : 'Show'
                  } comments`}
                />
                {shareAction ? (
                  <ToolbarMetaIconButton
                    icon={<Share20Regular />}
                    color={'blue'}
                    onClick={(e) => shareAction.action(e)}
                    isActive={false}
                    data-tip={`Share this document`}
                  />
                ) : null}
              </>
            )}
            {!props.forceMax ? (
              <ToolbarMetaIconButton
                onClick={() => {
                  params.set('fs', `${Number(!isMax)}`);
                  navigate(pathname + '?' + params.toString() + hash, { replace: true });
                }}
                icon={isMax ? <ArrowMinimize20Regular /> : <ArrowMaximize20Regular />}
                color={'blue'}
                data-tip={(isMax ? 'Minimize' : 'Maximize') + ' editor'}
              />
            ) : null}
          </ToolbarMeta>
        </ToolbarTabRow>
        {props.compact ? null : (
          <ToolbarActionRowContainer theme={theme}>
            <ToolbarRow isActive={activeTab === 'home'}>
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().undo().run()}
                icon={<BackIcon />}
                disabled={props.isDisabled || !editor.can().undo()}
                isActive={false}
                data-tip={'Undo'}
              />
              <ToolbarRowIconButton
                onClick={() => editor.chain().focus().redo().run()}
                icon={<RedoIcon />}
                disabled={props.isDisabled || !editor.can().redo()}
                isActive={false}
                data-tip={'Redo'}
              />
              <ToolbarDivider />
              <Combobox
                onClick={showFontFamilyDropdown}
                color={'blue'}
                disabled={
                  props.isDisabled ||
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
                color={'blue'}
                disabled={props.isDisabled || (props.options?.features.fontSizes || []).length === 0}
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
                  disabled={props.isDisabled || !editor.can().toggleBold()}
                  data-tip={'Bold'}
                />
              ) : null}
              {props.options?.features.italic ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                  icon={<ItalicsIcon />}
                  disabled={props.isDisabled || !editor.can().toggleItalic()}
                  data-tip={'Italic'}
                />
              ) : null}
              {props.options?.features.underline ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editor.isActive('underline')}
                  icon={<UnderlineIcon />}
                  disabled={props.isDisabled || !editor.can().toggleUnderline()}
                  data-tip={'Underline'}
                />
              ) : null}
              {props.options?.features.strike ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  isActive={editor.isActive('strike')}
                  icon={<StrikeIcon />}
                  disabled={props.isDisabled || !editor.can().toggleStrike()}
                  data-tip={'Strikethrough'}
                />
              ) : null}
              {props.options?.features.code ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  isActive={editor.isActive('code')}
                  icon={<Code20Regular />}
                  disabled={props.isDisabled || !editor.can().toggleCode()}
                  data-tip={'Code'}
                />
              ) : null}
              <ToolbarDivider />
              {props.options?.features.bulletList ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  isActive={editor.isActive('bulletList')}
                  icon={<TextBulletListLtr20Regular />}
                  disabled={props.isDisabled || !editor.can().toggleBulletList()}
                  data-tip={'Bullets'}
                />
              ) : null}
              {props.options?.features.orderedList ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive('orderedList')}
                  icon={<TextNumberListLtr20Regular />}
                  disabled={props.isDisabled || !editor.can().toggleOrderedList()}
                  data-tip={'Numbering'}
                />
              ) : null}
              <ToolbarDivider />
              {props.options?.features.textStylePicker ? (
                <Combobox
                  onClick={showTextStyleDropdown}
                  color={'blue'}
                  width={`128px`}
                  disabled={props.isDisabled}
                >
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
                  disabled={props.isDisabled || !editor.can().setHorizontalRule()}
                >
                  Horizontal Line
                </ToolbarRowButton>
              ) : null}
              {Object.values(props.options?.features.widgets || {}).includes(true) ? (
                <ToolbarRowButton
                  onClick={showWidgetsDropdown}
                  icon={<Apps20Regular />}
                  showChevron
                  disabled={props.isDisabled}
                >
                  Widgets
                </ToolbarRowButton>
              ) : null}
              {props.options?.features.link ? (
                <ToolbarRowButton
                  onClick={showLinkModal}
                  isActive={false}
                  icon={<Link20Regular />}
                  disabled={props.isDisabled || !editor.can().setTextSelection({ from: 0, to: 1 })}
                >
                  Link
                </ToolbarRowButton>
              ) : null}
              {props.options?.features.pullQuote ? (
                <ToolbarRowButton
                  onClick={() => editor.chain().focus().insertPullQuote().setBold().run()}
                  isActive={false}
                  icon={<TextQuote20Regular />}
                  disabled={props.isDisabled}
                >
                  Pull quote
                </ToolbarRowButton>
              ) : null}
              {props.options?.features.comment ? (
                <ToolbarRowButton
                  onClick={() => {
                    // insert comment
                    editor
                      .chain()
                      .focus()
                      .setComment({
                        color: props.user.color,
                        commenter: {
                          name: props.user.name,
                          photo: props.user.photo,
                        },
                        sessionId: props.user.sessionId,
                      })
                      .run();

                    // open comment panel
                    props.setIsSidebarOpen(true);
                    props.setSidebarTitle('Comments');
                    props.setSidebarContent(<CommentPanel />);
                    params.set('props', '0');
                    params.set('comments', '1');
                    navigate(pathname + '?' + params.toString() + hash, { replace: true });
                  }}
                  isActive={false}
                  icon={<CommentAdd20Regular />}
                  disabled={
                    props.isDisabled ||
                    !editor.can().setComment({
                      color: '',
                      commenter: {
                        name: '',
                        photo: '',
                      },
                      sessionId: props.user.sessionId,
                    })
                  }
                >
                  Comment
                </ToolbarRowButton>
              ) : null}
              {props.options?.features.comment ? (
                <ToolbarRowIconButton
                  onClick={() => editor.chain().focus().unsetComment().run()}
                  isActive={false}
                  icon={<CommentOff20Regular />}
                  disabled={props.isDisabled || !editor.can().unsetComment()}
                  data-tip={'Delete comment'}
                />
              ) : null}
            </ToolbarRow>
            {props.layouts && props.layouts.layout ? (
              <ToolbarRow isActive={activeTab === 'layout'}>
                <Combobox
                  onClick={showLayoutDropdown}
                  color={'blue'}
                  width={`128px`}
                  disabled={props.isDisabled}
                >
                  {props.layouts.options.find((option) => option.value === props.layouts!.layout)?.label}
                </Combobox>
              </ToolbarRow>
            ) : null}
            <ToolbarRow isActive={activeTab === 'review'}>
              <ToolbarRowButton
                onClick={() => showMSFTEditorModal()}
                isActive={false}
                icon={<Editor20Icon />}
                disabled={props.isDisabled || !editor}
              >
                Editor (spell check)
              </ToolbarRowButton>
              <ToolbarRowIconButton
                onClick={() => null}
                isActive={false}
                icon={<WordCountList20Icon />}
                disabled={props.isDisabled || true}
                data-tip={'Word count'}
              />
              <ToolbarDivider />
              {props.options?.features.trackChanges ? (
                <>
                  <ToolbarRowButton
                    onClick={() => props.toggleTrackChanges()}
                    isActive={props.trackChanges}
                    icon={<TrackChanges20Icon />}
                    disabled={props.isDisabled || !editor}
                  >
                    Track changes (text only)
                  </ToolbarRowButton>
                  <ToolbarRowButton
                    onClick={() => editor.chain().focus().approveChange().nextChange().run()}
                    isActive={false}
                    icon={<AcceptRevision20Icon />}
                    disabled={props.isDisabled || !editor}
                  >
                    Accept
                  </ToolbarRowButton>
                  <ToolbarRowButton
                    onClick={() => editor.chain().focus().rejectChange().nextChange().run()}
                    isActive={false}
                    icon={<RejectRevision20Icon />}
                    disabled={props.isDisabled || !editor}
                  >
                    Reject
                  </ToolbarRowButton>
                  <ToolbarRowIconButton
                    onClick={() => editor.chain().focus().previousChange().run()}
                    isActive={false}
                    icon={<PreviousRevision20Icon />}
                    disabled={props.isDisabled || !editor}
                    data-tip={'Previous change'}
                  />
                  <ToolbarRowIconButton
                    onClick={() => editor.chain().focus().nextChange().run()}
                    isActive={false}
                    icon={<NextRevision20Icon />}
                    disabled={props.isDisabled || !editor}
                    data-tip={'Next change'}
                  />
                  <ToolbarDivider />
                </>
              ) : null}
              {props.options?.features.comment ? (
                <>
                  <ToolbarRowButton
                    onClick={() => {
                      // insert comment
                      editor
                        .chain()
                        .focus()
                        .setComment({
                          color: props.user.color,
                          commenter: {
                            name: props.user.name,
                            photo: props.user.photo,
                          },
                          sessionId: props.user.sessionId,
                        })
                        .run();

                      // open comment panel
                      props.setIsSidebarOpen(true);
                      props.setSidebarTitle('Comments');
                      props.setSidebarContent(<CommentPanel />);
                      params.set('props', '0');
                      params.set('comments', '1');
                      navigate(pathname + '?' + params.toString() + hash, { replace: true });
                    }}
                    isActive={false}
                    icon={<CommentAdd20Regular />}
                    disabled={
                      props.isDisabled ||
                      !editor.can().setComment({
                        color: '',
                        commenter: {
                          name: '',
                          photo: '',
                        },
                        sessionId: props.user.sessionId,
                      })
                    }
                  >
                    Insert Comment
                  </ToolbarRowButton>
                  <ToolbarRowIconButton
                    onClick={() => editor.chain().focus().unsetComment().run()}
                    isActive={false}
                    icon={<CommentOff20Regular />}
                    disabled={props.isDisabled || !editor.can().unsetComment()}
                    data-tip={'Delete comment'}
                  />{' '}
                </>
              ) : null}
            </ToolbarRow>
            <SendToolbarRow
              isActive={activeTab === 'email'}
              editor={editor}
              iframehtmlstring={props.iframehtmlstring || ''}
              isDisabled={props.isDisabled || !editor}
            />
          </ToolbarActionRowContainer>
        )}
      </TOOLBAR>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}></div>
    </>
  );
}

export { Toolbar };
