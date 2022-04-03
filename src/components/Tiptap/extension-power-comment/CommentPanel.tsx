import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Checkmark16Regular, Delete16Regular, Dismiss16Regular, Edit16Regular } from '@fluentui/react-icons';
import { Editor } from '@tiptap/react';
import { DateTime } from 'luxon';
import { Transaction } from 'prosemirror-state';
import React, { useEffect, useRef, useState } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';
import { themeType } from '../../../utils/theme/theme';
import { IconButton } from '../../Button';
import { TextArea } from '../../TextArea';
import { CommentStorage } from './powerComment';

interface CommentPanelProps {
  editor?: Editor | null;
}

function CommentPanel({ editor }: CommentPanelProps) {
  const { comments } = editor?.storage.powerComment as CommentStorage;

  if (editor) {
    return (
      <div style={{ paddingBottom: 250 }}>
        {comments.map((comment, index) => {
          return (
            <Comment
              comment={comment}
              tr={editor.state.tr}
              dispatch={editor.view.dispatch}
              state={editor.state}
              editor={editor}
              key={index}
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
}

function Comment({ comment, tr, dispatch, state, editor }: CommentProps) {
  const theme = useTheme() as themeType;
  const cardRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // control whether in edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

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
      scrollIntoView(cardRef.current, { block: 'center', scrollMode: 'if-needed' });
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
    editor
      .chain()
      .command(({ commands }) => {
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
      })
      .unsetMark('powerComment')
      .setComment({ ...comment.attrs, message })
      .focus()
      .scrollIntoView()
      .run();
  };

  /**
   * Move's the client's cursor to the comment in the editor.
   */
  const focusComment = () => {
    editor
      .chain()
      .command(({ commands }) => {
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
      })
      .focus()
      .scrollIntoView()
      .run();
  };

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
          <IconButton
            icon={<Edit16Regular />}
            color={'neutral'}
            cssExtra={css`
              position: absolute;
              top: 9px;
              right: 37px;
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
            `}
            onClick={() => {
              setMessage(comment.attrs.message);
              setIsEditMode(true);
            }}
          />
          <IconButton
            icon={<Delete16Regular />}
            color={'red'}
            cssExtra={css`
              position: absolute;
              top: 9px;
              right: 9px;
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
            `}
            onClick={() =>
              editor
                .chain()
                .unsetComment(comment.nodes[0].pos + 1)
                .setTextSelection(state.selection.anchor)
                .focus()
                .scrollIntoView()
                .run()
            }
          />
        </>
      )}
      <ProfilePhoto theme={theme} src={comment.attrs.commenter.photo} contentEditable={false} />
      <ProfilePhotoBorder theme={theme} contentEditable={false} hasCursor={hasCursor} />
      <Commenter theme={theme} contentEditable={false}>
        {comment.attrs.commenter.name}
      </Commenter>

      {isEditMode ? (
        <>
          <MessageField
            theme={theme}
            onChange={isEditMode ? handleCommentMessageChange : undefined}
            rows={1}
            value={message}
            ref={messageRef}
            placeholder={`Type a comment`}
          />
          <ButtonRow>
            <CommentIconButton
              theme={theme}
              color={'neutral'}
              icon={<Dismiss16Regular />}
              onClick={() => {
                setIsEditMode(false);
              }}
            />
            <CommentIconButton
              theme={theme}
              color={'blue'}
              icon={<Checkmark16Regular />}
              onClick={(e) => {
                setIsEditMode(false);
                saveCommentMessage();
              }}
            />
          </ButtonRow>
        </>
      ) : (
        <>
          <Message theme={theme}>{comment.attrs.message}</Message>
          <Timestamp theme={theme} contentEditable={false}>
            {DateTime.fromISO(comment.attrs.timestamp).toFormat(`LLL. dd, yyyy, t`)}
          </Timestamp>
        </>
      )}
    </Card>
  );
}

const Card = styled.div<{ theme: themeType; hasCursor: boolean }>`
  position: relative;
  background: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral[theme.mode][200])};
  box-sizing: border-box;
  padding: 12px 16px;
  margin: ${({ hasCursor }) => (hasCursor ? `0 30px 10px 10px` : `0 20px 10px 20px`)};
  width: 270px;
  border: 1px solid
    ${({ theme, hasCursor }) =>
      hasCursor
        ? theme.color.primary[theme.mode === 'dark' ? 300 : 800]
        : theme.color.neutral[theme.mode][200]};
  border-radius: ${({ theme }) => theme.radius};
  *::selection {
    background-color: transparent !important;
  }
  transition: margin 120ms;
`;

const ProfilePhoto = styled.img<{ theme: themeType }>`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) =>
    `calc(${theme.radius} - 0.6px) ${theme.radius} ${theme.radius} calc(${theme.radius} - 0.6px)`};
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0 0 0 0.6px;
  position: absolute;
  top: 9px;
  left: -12px;
  z-index: 1;
`;

const ProfilePhotoBorder = styled.div<{ theme: themeType; hasCursor: boolean }>`
  position: absolute;
  border-radius: ${({ theme }) => `calc(${theme.radius} - 0.6px) 0 0 calc(${theme.radius} - 0.6px)`};
  box-shadow: ${({ theme, hasCursor }) =>
    hasCursor ? `${theme.color.primary[theme.mode === 'dark' ? 300 : 800]} 0px 0px 0px 1.4px` : ``};
  width: 10px;
  height: 24px;
  top: 9px;
  left: -12px;
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
`;

export { CommentPanel };
