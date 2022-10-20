import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  ArrowReplyDown16Regular,
  Checkmark16Regular,
  Delete16Regular,
  Dismiss16Regular,
  Edit16Regular,
  MoreHorizontal16Regular,
} from '@fluentui/react-icons';
import { CommandProps, Editor } from '@tiptap/react';
import { DateTime } from 'luxon';
import { Transaction } from 'prosemirror-state';
import React, { useEffect, useRef, useState } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';
import { v4 as uuidv4 } from 'uuid';
import { useDropdown } from '../../../hooks/useDropdown';
import { genAvatar } from '../../../utils/genAvatar';
import { themeType } from '../../../utils/theme/theme';
import { Button, IconButton } from '../../Button';
import { Menu } from '../../Menu';
import { TextArea } from '../../TextArea';
import { CommentStorage } from './powerComment';

interface CommentPanelProps {
  editor?: Editor | null;
  user?: {
    name: string;
    color: string;
    sessionId: string;
    photo: string;
  };
}

function CommentPanel({ editor, user }: CommentPanelProps) {
  const storage = editor?.storage.powerComment as CommentStorage | undefined;
  const comments = storage?.comments;

  if (editor) {
    return (
      <div style={{ paddingBottom: 250 }}>
        {comments?.map((comment, index) => {
          return (
            <Comment
              comment={comment}
              tr={editor.state.tr}
              dispatch={editor.view.dispatch}
              state={editor.state}
              editor={editor}
              user={user}
              key={comment.attrs.uuid + comment.attrs.message}
            />
          );
        })}
      </div>
    );
  }

  return <span />;
}

interface CommentProps {
  comment: CommentStorage['comments'][0];
  tr: Transaction;
  dispatch: (tr: Transaction) => void;
  state: Editor['state'];
  editor: Editor;
  user?: {
    name: string;
    color: string;
    sessionId: string;
    photo: string;
  };
}

function Comment({ comment, tr, dispatch, state, editor, user }: CommentProps) {
  const theme = useTheme() as themeType;
  const cardRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  // control whether in edit mode
  const thisUserJustCreatedThisComment =
    comment.attrs.sessionId === user?.sessionId && comment.attrs.message === '';
  const [isEditMode, setIsEditMode] = useState<boolean>(thisUserJustCreatedThisComment);
  const [hideReplyButton, setHideReplyButton] = useState<boolean>(false);

  // exit edit mode if document is not editable
  if (isEditMode && !editor.isEditable) setIsEditMode(false);

  // track when the comment is focused
  const hasCursor = (() => {
    let start: number | undefined = undefined;
    let end: number | undefined = undefined;
    comment.nodes.forEach((node) => {
      if (!start) start = node.pos;
      else if (node.pos < start) start = node.pos;
      if (!end) end = node.pos + node.nodeSize;
      else if (node.pos + node.nodeSize > end) end = node.pos + node.nodeSize;
    });

    return (
      state.selection.from >= (start || 0) &&
      state.selection.from <= (end || 0) &&
      state.selection.to >= (start || 0) &&
      state.selection.to <= (end || 0)
    );
  })();

  // when the comment is focused, scroll into view
  useEffect(() => {
    if (cardRef.current && hasCursor) {
      scrollIntoView(cardRef.current, { block: 'nearest', scrollMode: 'if-needed' });
    }
  }, [cardRef, hasCursor]);

  // store message field in state
  const [message, setMessage] = useState(comment.attrs.message);

  // make sure that the textarea height matches the message
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.style.height = `auto`;
      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
    }
  }, [message, isEditMode]);

  /**
   * When the user types in the textarea, update the message attribute
   * with the new message.
   */
  const handleCommentMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.currentTarget.value);
    if (messageRef.current) {
      messageRef.current.style.height = `auto`;
      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
    }
  };

  /**
   * Save the comment message changes to the node attributes
   */
  const saveCommentMessage = () => {
    const saved = editor
      .chain()
      .command((cp) => selectCommentText(cp))
      .unsetMark('powerComment')
      .setComment({ ...comment.attrs, message })
      .focus()
      .scrollIntoView()
      .run();
    if (saved && message === '' && comment.attrs.replies.length === 0) deleteThread();
  };

  /**
   * Move's the client's cursor to the comment in the editor.
   */
  const focusComment = () => {
    editor
      .chain()
      .command((cp) => selectCommentText(cp))
      .focus()
      .scrollIntoView()
      .run();
  };

  /**
   * Selects the entire comment in the prosemirror editor.
   * @returns true if successful; false if error
   */
  const selectCommentText = ({ commands }: CommandProps): boolean => {
    try {
      // select the entire comment
      let start: number | undefined = undefined;
      let end: number | undefined = undefined;
      comment.nodes.forEach((node) => {
        if (!start) start = node.pos;
        else if (node.pos < start) start = node.pos;
        if (!end) end = node.pos + node.nodeSize;
        else if (node.pos + node.nodeSize > end) end = node.pos + node.nodeSize;
      });
      return commands.setTextSelection({ from: start || 0, to: end || 0 });
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const [newReplyUuid, setNewReplyUuid] = useState<string>('');

  /**
   * Adds an empty reply
   */
  const addNewReply = () => {
    if (user) {
      const uuid = uuidv4();
      const wasAdded = editor
        .chain()
        .command((cp) => selectCommentText(cp))
        .unsetMark('powerComment')
        .setComment({
          ...comment.attrs,
          replies: [
            ...comment.attrs.replies,
            {
              commenter: {
                name: user.name,
                photo: user.photo,
              },
              message: '',
              timestamp: new Date().toISOString(),
              uuid: uuid,
            },
          ],
        })
        .focus()
        .scrollIntoView()
        .run();
      if (wasAdded) setNewReplyUuid(uuid);
    }
  };

  const clearNewReplyUuid = () => {
    setNewReplyUuid('');
  };

  const deleteThread = () => {
    editor
      .chain()
      .command(({ commands }) => {
        const deleted = [];
        for (let i = 0; i < comment.nodes.length; i++) {
          deleted.push(commands.unsetComment(comment.nodes[i].pos + 1));
        }
        return deleted.every((elem) => elem === true);
      })
      .setTextSelection(state.selection.anchor)
      .focus()
      .scrollIntoView()
      .run();
  };

  // the dropdown for the comment menu
  const [showCommentDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.right - 200,
            width: 200,
          }}
          items={[
            {
              label: 'Edit comment',
              color: 'blue',
              icon: <Edit16Regular />,
              onClick: () => {
                setIsEditMode(true);
                setMessage(comment.attrs.message);
              },
              disabled: !user || !editor.isEditable,
            },
            {
              label: 'Delete thread',
              color: 'red',
              icon: <Delete16Regular />,
              onClick: () => deleteThread(),
              disabled: !user || !editor.isEditable,
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  return (
    <Card
      theme={theme}
      ref={cardRef}
      hasCursor={hasCursor}
      onFocusCapture={() => {
        if (!hasCursor) focusComment();
      }}
      onClick={() => {
        if (!hasCursor) focusComment();
      }}
    >
      {isEditMode ? null : (
        <>
          <CardButton
            icon={<MoreHorizontal16Regular />}
            color={'blue'}
            indexFromRight={0}
            onClick={showCommentDropdown}
          />
        </>
      )}
      <ProfilePhoto theme={theme} src={comment.attrs.commenter.photo} />
      <ProfilePhotoBorder theme={theme} hasCursor={hasCursor} />
      <Commenter theme={theme}>{comment.attrs.commenter.name}</Commenter>
      {isEditMode ? (
        <>
          <MessageField
            theme={theme}
            onChange={isEditMode ? handleCommentMessageChange : undefined}
            rows={1}
            value={message}
            ref={messageRef}
            placeholder={`Type a comment`}
            disabled={!user || !editor.isEditable}
          />
          <ButtonRow>
            <CommentIconButton
              theme={theme}
              color={'blue'}
              icon={<Dismiss16Regular />}
              onClick={() => {
                if (message === '' && comment.attrs.replies.length === 0) deleteThread();
                setIsEditMode(false);
              }}
              disabled={!user || !editor.isEditable}
            />
            <CommentIconButton
              theme={theme}
              color={'green'}
              icon={<Checkmark16Regular />}
              onClick={(e) => {
                setIsEditMode(false);
                saveCommentMessage();
              }}
              disabled={!user || !editor.isEditable}
            />
          </ButtonRow>
        </>
      ) : (
        <>
          <Message theme={theme}>{comment.attrs.message}</Message>
          <Timestamp theme={theme}>
            {DateTime.fromISO(comment.attrs.timestamp).toFormat(`LLL. dd, yyyy, t`)}
          </Timestamp>
        </>
      )}

      {comment.attrs.replies
        // filter out empty replies (this means that the person who created the reply is still editing it before sending it)
        .filter((reply) => {
          if (reply.uuid === newReplyUuid) return true;
          return reply.message !== '';
        })
        // sort with newest on bottom
        // (replies are not guarenteed to be in order)
        .sort((a, b) => {
          if (new Date(a.timestamp) > new Date(b.timestamp)) return 1;
          return -1;
        })
        .map((reply, index) => {
          return (
            <>
              <Reply
                editor={editor}
                selectCommentText={selectCommentText}
                comment={comment}
                uuid={reply.uuid}
                startInEditMode={reply.uuid === newReplyUuid}
                clearNewReplyUuid={clearNewReplyUuid}
                setHideReplyButton={setHideReplyButton}
                key={reply.message}
              />
            </>
          );
        })}

      {hideReplyButton || (isEditMode && comment.attrs.replies.length === 0) ? (
        <></>
      ) : (
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'right', marginRight: -2 }}>
          <Button
            height={28}
            color={'blue'}
            icon={<ArrowReplyDown16Regular />}
            onClick={() => addNewReply()}
            disabled={!user || !editor.isEditable}
          >
            Reply
          </Button>
        </div>
      )}
    </Card>
  );
}

interface ReplyProps {
  editor: Editor;
  selectCommentText: ({ commands }: CommandProps) => boolean;
  comment: CommentStorage['comments'][0];
  uuid: CommentStorage['comments'][0]['attrs']['replies'][0]['uuid'];
  startInEditMode: boolean;
  clearNewReplyUuid: () => void;
  setHideReplyButton: React.Dispatch<React.SetStateAction<boolean>>;
}

function Reply({ editor, setHideReplyButton, ...props }: ReplyProps) {
  const theme = useTheme() as themeType;
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const thisReply: CommentStorage['comments'][0]['attrs']['replies'][0] | undefined =
    props.comment.attrs.replies.filter((reply) => reply.uuid === props.uuid)[0];
  const [replyMessage, setMessage] = useState(thisReply?.message || '');
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  // control whether in edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(props.startInEditMode);

  // if in edit mode, hide the reply button
  useEffect(() => {
    if (isEditMode) setHideReplyButton(true);
    else setHideReplyButton(false);
  }, [isEditMode, setHideReplyButton]);

  // exit edit mode if document is not editable
  if (isEditMode && !editor.isEditable) setIsEditMode(false);

  // the dropdown for the comment menu
  const [showCommentDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.right - 200,
            width: 200,
          }}
          items={[
            {
              label: 'Edit comment',
              color: 'blue',
              icon: <Edit16Regular />,
              onClick: () => setIsEditMode(true),
              disabled: !editor.isEditable,
            },
            {
              label: 'Delete comment',
              color: 'red',
              icon: <Delete16Regular />,
              onClick: () => deleteCommentReply(),
              disabled: !editor.isEditable,
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  // make sure that the textarea height matches the message
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.style.height = `auto`;
      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
    }
  }, [replyMessage, isEditMode]);

  /**
   * When the user types in the textarea, update the message attribute
   * with the new message.
   */
  const handleCommentMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.currentTarget.value);
    if (messageRef.current) {
      messageRef.current.style.height = `auto`;
      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
    }
  };

  /**
   * Save the comment reply to the comment attributes
   */
  const saveCommentReply = () => {
    const saved = editor
      .chain()
      .command((cp) => props.selectCommentText(cp))
      .unsetMark('powerComment')
      .setComment({
        ...props.comment.attrs,
        replies: [
          ...props.comment.attrs.replies.filter((reply) => reply.uuid !== props.uuid),
          { ...thisReply, message: replyMessage },
        ],
      })
      .focus()
      .scrollIntoView()
      .run();
    if (saved && props.startInEditMode) props.clearNewReplyUuid();
    if (saved && replyMessage === '') deleteCommentReply();
  };

  /**
   * Delete the comment reply
   */
  const deleteCommentReply = () => {
    editor
      .chain()
      .command((cp) => props.selectCommentText(cp))
      .unsetMark('powerComment')
      .setComment({
        ...props.comment.attrs,
        replies: props.comment.attrs.replies.filter((reply) => reply.uuid !== props.uuid),
      })
      .focus()
      .scrollIntoView()
      .run();
  };

  return (
    <ReplyContainer onMouseOver={() => setIsMouseOver(true)} onMouseLeave={() => setIsMouseOver(false)}>
      <CardButton
        icon={<MoreHorizontal16Regular />}
        color={'blue'}
        isHidden={!isMouseOver}
        onClick={showCommentDropdown}
      />
      <ProfilePhoto
        theme={theme}
        src={thisReply.commenter?.photo || genAvatar(thisReply.commenter?.name || '')}
      />
      <Commenter theme={theme}>{thisReply.commenter?.name}</Commenter>
      {isEditMode ? (
        <>
          <MessageField
            theme={theme}
            onChange={isEditMode ? handleCommentMessageChange : undefined}
            rows={1}
            value={replyMessage}
            ref={messageRef}
            placeholder={`Type a comment`}
            disabled={!editor.isEditable}
          />
          <ButtonRow>
            <CommentIconButton
              theme={theme}
              color={'blue'}
              icon={<Dismiss16Regular />}
              onClick={() => {
                if (replyMessage === '') deleteCommentReply();
                setIsEditMode(false);
              }}
              disabled={!editor.isEditable}
            />
            <CommentIconButton
              theme={theme}
              color={'green'}
              icon={<Checkmark16Regular />}
              onClick={(e) => {
                setIsEditMode(false);
                saveCommentReply();
              }}
              disabled={!editor.isEditable}
            />
          </ButtonRow>
        </>
      ) : (
        <>
          <Message theme={theme}>{replyMessage}</Message>
          <Timestamp theme={theme}>
            {DateTime.fromISO(thisReply.timestamp).toFormat(`LLL. dd, yyyy, t`)}
          </Timestamp>
        </>
      )}
    </ReplyContainer>
  );
}

const ReplyContainer = styled.div`
  position: relative;
  padding: 12px 16px 0;
  margin: 6px -16px 2px 4px;
`;

const Card = styled.div<{ theme: themeType; hasCursor: boolean }>`
  position: relative;
  background: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral[theme.mode][200])};
  box-sizing: border-box;
  padding: 12px 16px;
  margin: ${({ hasCursor }) => (hasCursor ? `0 30px 10px 10px` : `0 20px 10px 20px`)};
  width: 270px;
  border: 1px solid
    ${({ theme, hasCursor }) =>
      hasCursor ? theme.color.blue[theme.mode === 'dark' ? 300 : 800] : theme.color.neutral[theme.mode][200]};
  border-radius: ${({ theme }) => theme.radius};
  *::selection {
    background-color: transparent !important;
  }
  transition: margin 120ms;
`;

const ProfilePhoto = styled.img<{ theme: themeType }>`
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) =>
    `calc(${theme.radius} - 0.6px) ${theme.radius} ${theme.radius} calc(${theme.radius} - 0.6px)`};
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0 0 0 0.6px;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(-12px) translateY(10px);
  z-index: 1;
`;

const ProfilePhotoBorder = styled.div<{ theme: themeType; hasCursor: boolean }>`
  position: absolute;
  border-radius: ${({ theme }) => `calc(${theme.radius} - 0.6px) 0 0 calc(${theme.radius} - 0.6px)`};
  box-shadow: ${({ theme, hasCursor }) =>
    hasCursor ? `${theme.color.blue[theme.mode === 'dark' ? 300 : 800]} 0px 0px 0px 1.5px` : ``};
  width: 10px;
  height: 20px;
  top: 0;
  left: 0;
  transform: translateX(-12px) translateY(10px);
`;

const Commenter = styled.div<{ theme: themeType }>`
  display: flex;
  font-size: 16px;
  line-height: 16px;
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
`;

const CardButton = styled(IconButton)<{ indexFromRight?: number; isHidden?: boolean }>`
  ${({ isHidden }) => (isHidden === true ? 'display: none;' : '')}
  position: absolute;
  top: 7px;
  right: ${({ indexFromRight }) => (indexFromRight && indexFromRight > 0 ? 7 + 30 * indexFromRight : 7)}px;
  border-color: transparent;
  background-color: transparent;
  width: 28px;
  height: 28px;
  span {
    display: flex;
  }
  svg {
    width: 18px !important;
    height: 18px !important;
  }
`;

const CommentIconButton = styled(IconButton)<{ theme: themeType }>`
  background-color: transparent;
  border-color: ${({ theme }) => theme.color.neutral[theme.mode][800]} !important;
  width: 40px;
  height: 28px;
  > span {
    display: flex;
    > svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const Timestamp = styled.div<{ theme: themeType }>`
  display: flex;
  font-size: 11px;
  line-height: 11px;
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][800]};
`;

const MessageField = styled(TextArea)<{ theme: themeType }>`
  display: flex;
  resize: none;
  overflow-y: hidden;
  width: calc(100%);
  margin: 10px 0;
  &::selection {
    background-color: #c4dffc !important;
  }
  &:focus {
    box-shadow: ${({ theme }) => theme.color.blue[theme.mode === 'dark' ? 300 : 800]} 0px 0px 0px 2px inset;
  }
`;

const Message = styled.div<{ theme: themeType }>`
  display: flex;
  font-size: 14px;
  line-height: 16px;
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  margin: 8px 0 6px 0;
  white-space: break-spaces;
  word-break: break-word;
  user-select: text;
`;

export { CommentPanel };
