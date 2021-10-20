import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Comment20Regular, CommentOff20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { NodeViewWrapper, NodeViewContent, NodeViewProps, Node } from '@tiptap/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { themeType } from '../../../utils/theme/theme';
import { IconButton } from '../../Button';
import { TextArea } from '../../TextArea';
import { CommentOptions } from './comment';
import { DateTime } from 'luxon';
import Color from 'color';

interface ICommentContainer extends NodeViewProps {
  extension: Node<CommentOptions>;
}

function CommentContainer(props: ICommentContainer) {
  const theme = useTheme() as themeType;
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const toggleRef = useRef<HTMLSpanElement>(null);

  /**
   * When the user types in the textarea, update the message attribute
   * with the new message AND make sure that the textarea height matches the message
   */
  const handleCommentMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.updateAttributes({
      ...props.node.attrs,
      message: event.currentTarget.value,
    });
    if (messageRef.current) {
      messageRef.current.style.height = `auto`;
      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
    }
  };

  // control whether the card is shown
  const [isShown, setIsShown] = useState<boolean>(true);

  // store the position and size information of the toggle button that executes `toggleCard()`
  const [triggerRect, setTriggerRect] = useState<DOMRect>();
  useEffect(() => {
    if (toggleRef?.current) setTriggerRect(toggleRef.current.getBoundingClientRect());
  }, [toggleRef, isShown]);

  // set the textarea height to match the current message height once messageRef is defined and comment is shown
  useEffect(() => {
    if (isShown && messageRef.current) {
      messageRef.current.style.height = `auto`;
      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
    }
  }, [isShown, messageRef]);

  /**
   * Removes the comment node while keeping the text inside the node.
   */
  const unsetComment = useCallback(() => {
    props.editor.commands.unsetComment(props.getPos() + props.node.nodeSize - 1);
  }, [props]);

  /**
   * Removes the comment if the comment text is empty.
   */
  const unsetEmptyComment = useCallback(() => {
    if (props.node.attrs.message?.length === 0) unsetComment();
  }, [props.node.attrs.message?.length, unsetComment]);

  /**
   * Toggle the card when a button is clicked
   */
  const toggleCard = (e: React.MouseEvent) => {
    setIsShown(!isShown);
  };

  /**
   * Listen for any scroll events on the page
   * and hide the comment card if they occur.
   */
  useEffect(() => {
    const closeOnScroll = () => {
      setIsShown(false);
    };
    document.addEventListener('scroll', closeOnScroll, true);
    return document.removeEventListener('scroll', closeOnScroll);
  }, [setIsShown]);

  /**
   * Unsets a comment if it does not contain any comment text and it is hidden.
   */
  useEffect(() => {
    if (!isShown) unsetEmptyComment();
  }, [isShown, unsetEmptyComment]);

  return (
    <NodeViewWrapper as={`span`}>
      <NodeViewContent
        as={`span`}
        style={{ backgroundColor: Color(props.node.attrs.color).alpha(0.4) }}
      ></NodeViewContent>
      <span style={{ position: 'absolute', marginLeft: -11, marginTop: 15 }} ref={toggleRef} />
      <ToggleCardButton icon={<Comment20Regular />} onClick={toggleCard} />
      {isShown ? (
        <Card theme={theme} contentEditable={false} triggerRect={triggerRect || new DOMRect()}>
          <div style={{ position: 'absolute', top: 0, right: 30 }}>
            <IconButton
              icon={<CommentOff20Regular />}
              backgroundColor={{ base: 'transparent' }}
              border={{ base: '1px solid transparent' }}
              onClick={unsetComment}
            />
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <IconButton
              icon={<Dismiss20Regular />}
              backgroundColor={{ base: 'transparent' }}
              border={{ base: '1px solid transparent' }}
              onClick={toggleCard}
            />
          </div>
          <Meta contentEditable={false}>
            <ProfilePhoto theme={theme} src={props.node.attrs.commenter.photo} contentEditable={false} />
            <div contentEditable={false}>
              <Commenter theme={theme} contentEditable={false}>
                {props.node.attrs.commenter.name}
              </Commenter>
              <Timestamp theme={theme} contentEditable={false}>
                {DateTime.fromISO(props.node.attrs.timestamp).toFormat(`LLL. dd, yyyy 'at' t`)}
              </Timestamp>
            </div>
          </Meta>
          <Message
            theme={theme}
            onChange={handleCommentMessageChange}
            rows={1}
            value={props.node.attrs.message}
            ref={messageRef}
            placeholder={`Type a comment`}
          />
        </Card>
      ) : null}
    </NodeViewWrapper>
  );
}

const ToggleCardButton = styled(IconButton)`
  height: 30px;
  width: 30px;
  position: absolute;
  display: inline-flex;
  margin-top: -15px;
  margin-left: -11px;
  padding: 2px;
  background-color: transparent;
  border-color: transparent;
  &:hover,
  &:active {
    background-color: #e0e0e0;
    border-color: rgba(148, 148, 148, 0.2);
  }
  &:hover:active {
    background-color: #dddddd;
    border-color: rgba(148, 148, 148, 0.25);
  }
`;

const Card = styled.div<{ theme: themeType; triggerRect: DOMRect }>`
  position: fixed;
  background: white;
  box-sizing: border-box;
  padding: 16px 20px;
  margin: 0;
  width: 280px;
  box-shadow: rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px;
  border: 1px solid lightgray;
  top: ${({ triggerRect }) => triggerRect.y + triggerRect.height}px;
  left: ${({ triggerRect }) =>
    triggerRect.x + 300 > document.body.offsetWidth ? document.body.offsetWidth - 300 : triggerRect.x}px;
  border-radius: ${({ theme }) => theme.radius};
  *::selection {
    background-color: transparent !important;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  gap: 10px;
  > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
`;

const ProfilePhoto = styled.img<{ theme: themeType }>`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radius};
`;

const Commenter = styled.span<{ theme: themeType }>`
  font-size: 14px;
  line-height: 14px;
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
`;

const Timestamp = styled.span<{ theme: themeType }>`
  font-size: 11px;
  line-height: 11px;
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][800]};
`;

const Message = styled(TextArea)<{ theme: themeType }>`
  resize: none;
  overflow-y: hidden;
  box-shadow: none !important;
  width: calc(100% + 40px);
  margin: 0 0 -24px -20px;
  padding: 10px 20px 18px;
  &::selection {
    background-color: #c4dffc !important;
  }
`;

export { CommentContainer };
