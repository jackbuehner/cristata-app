import styled from '@emotion/styled/macro';
import { css, SerializedStyles, useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import Color from 'color';
import { Chip } from '../../../components/Chip';
import {
  IGetDiscussionReactionGroup,
  IGetDiscussionReplyDetails,
} from '../../../interfaces/github/discussions';
import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { IconButton } from '../../../components/Button';
import {
  Pin16Regular,
  Comment16Regular,
  Alert16Regular,
  Emoji16Regular,
} from '@fluentui/react-icons';
import { useHistory } from 'react-router-dom';

const MessageComponent = styled.div<{
  theme: themeType;
  isPinned: boolean;
  cssExtra?: SerializedStyles;
}>`
  display: grid;
  grid-template-columns: 36px 1fr;
  padding: 4px 20px;
  gap: 8px;
  background-color: ${({ isPinned, theme }) =>
    isPinned
      ? Color(theme.color.orange[800]).alpha(0.25).string()
      : theme.mode === 'light'
      ? 'white'
      : 'black'};
  &:hover {
    background-color: ${({ isPinned, theme }) =>
      isPinned
        ? Color(theme.color.orange[800]).alpha(0.35).string()
        : Color(theme.color.neutral[theme.mode][100]).alpha(0.5).string()};
  }
  ${({ cssExtra }) => (cssExtra ? cssExtra : null)};
`;

const AuthorName = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 15px;
  font-weight: 900;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  line-height: 22px;
`;
const Timestamp = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.neutral[theme.mode][900]};
  line-height: 22px;
  margin-left: 6px;
`;

const MessageBody = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 15px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  margin-bottom: 4px;
  > h1,
  > h2,
  > h3,
  > h4,
  > h5,
  > h6,
  > p,
  > ol,
  > ul {
    margin: 0;
    line-height: 1.5;
  }
  > h1 {
    font-size: 18px;
    font-weight: 900;
    line-height: 1.3;
    margin: 6px 0;
  }
  > h2 {
    font-size: 17px;
    font-weight: 900;
    font-style: italic;
    line-height: 1.3;
    margin: 6px 0;
  }
  > h3,
  > h4,
  > h5,
  > h6 {
    font-size: 16px;
    font-weight: 900;
    text-decoration: underline;
    line-height: 1.3;
    margin: 6px 0;
  }
`;

interface IMessage {
  id?: string;
  author: string;
  bodyHTML: string;
  time: string;
  reactionGroups?: IGetDiscussionReactionGroup[];
  replyCount: number;
  recentReplyDetails?: IGetDiscussionReplyDetails[];
  isPinned: boolean;
  isSubscribed: boolean;
  canPin: boolean;
  canSubscribe: boolean;
  canReact: boolean;
  canReply: boolean;
  discussionNumber?: number;
  isThreadView?: boolean;
  cssExtra?: SerializedStyles;
}

function Message(props: IMessage) {
  const theme = useTheme() as themeType;
  const history = useHistory();

  const recentReplyAuthors = useMemo(
    () =>
      Array.from(
        new Set(
          props.recentReplyDetails?.map((reply) => reply.node.author.login)
        )
      ),
    [props.recentReplyDetails]
  );

  const [isMouseOverMessage, setIsMouseOverMessage] = useState<boolean>(false);

  return (
    <MessageComponent
      theme={theme}
      onMouseOver={() => setIsMouseOverMessage(true)}
      onMouseOut={() => setIsMouseOverMessage(false)}
      isPinned={props.isPinned}
      id={props.id}
      cssExtra={props.cssExtra}
    >
      <img
        alt={``}
        style={{
          background: 'lightblue',
          borderRadius: theme.radius,
          height: 30,
          width: 30,
          marginTop: 5,
        }}
      ></img>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'baseline',
          }}
        >
          <AuthorName theme={theme}>{props.author}</AuthorName>
          <Timestamp theme={theme}>{props.time}</Timestamp>
        </div>
        <MessageBody
          theme={theme}
          dangerouslySetInnerHTML={{ __html: props.bodyHTML }}
        />
        {
          // if there are provided reaction groups, show the applied reactions as chips
          props.reactionGroups ? (
            <div style={{ marginBottom: 8 }}>
              {props.reactionGroups
                // filter out reactions that have not been applied to this message
                .filter((reactionGroup) => reactionGroup.users.totalCount > 0)
                // show the reactions applied to this message as chips
                .map((reactionGroup, index: number) => {
                  const emoji = {
                    THUMBS_UP: '👍',
                    THUMBS_DOWN: '👎',
                    LAUGH: '😄',
                    HOORAY: '🎉',
                    CONFUSED: '😕',
                    HEART: '❤',
                    ROCKET: '🚀',
                    EYES: '👀',
                  };
                  return (
                    <Chip
                      key={index}
                      label={`${emoji[reactionGroup.content]} ${
                        reactionGroup.users.totalCount
                      }`}
                      color={'neutral'}
                      onClick={() => console.log('hi')}
                      cssExtra={css`
                        font-family: Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
                      `}
                    />
                  );
                })}
            </div>
          ) : null
        }
        {
          // if there are replies, show the number of replies, the first three profile images, and the last reply time
          props.replyCount > 0 && props.discussionNumber ? (
            <MessageReply.DetailsWrapper
              onClick={() =>
                history.push(`/chat/admin/${props.discussionNumber}`)
              }
            >
              <MessageReply.DetailsProfilePhotosWrapper>
                {recentReplyAuthors.map((author, index: number) => {
                  return (
                    <MessageReply.DetailsProfilePhoto
                      theme={theme}
                      key={index}
                      alt={``}
                    />
                  );
                })}
              </MessageReply.DetailsProfilePhotosWrapper>
              <MessageReply.DetailsCount theme={theme}>
                {props.replyCount === 1
                  ? `${props.replyCount} reply`
                  : `${props.replyCount} replies`}
              </MessageReply.DetailsCount>
              <MessageReply.DetailsTimestamp theme={theme}>
                {props.replyCount > 1 ? `Last reply ` : ``}
                {props.recentReplyDetails
                  ? DateTime.fromISO(
                      props.recentReplyDetails[0].node.createdAt
                    ).toRelative()
                  : null}
              </MessageReply.DetailsTimestamp>
            </MessageReply.DetailsWrapper>
          ) : null
        }
        <MessageActionsGroup theme={theme} isVisible={isMouseOverMessage}>
          {props.canReact ? (
            <IconButton
              icon={<Emoji16Regular />}
              height={`28px`}
              width={`28px`}
              backgroundColor={{ base: 'transparent' }}
              border={{ base: '1px solid transparent' }}
            />
          ) : null}
          {props.discussionNumber && props.canReply ? (
            <IconButton
              icon={<Comment16Regular />}
              height={`28px`}
              width={`28px`}
              backgroundColor={{ base: 'transparent' }}
              border={{ base: '1px solid transparent' }}
              onClick={() =>
                history.push(`/chat/admin/${props.discussionNumber}`)
              }
            />
          ) : null}

          {props.canPin ? (
            <IconButton
              icon={<Pin16Regular />}
              height={`28px`}
              width={`28px`}
              backgroundColor={{
                base: props.isPinned
                  ? Color(theme.color.neutral[theme.mode][800])
                      .alpha(0.15)
                      .string()
                  : 'transparent',
              }}
              border={{ base: '1px solid transparent' }}
            />
          ) : null}
          {props.canSubscribe ? (
            <IconButton
              icon={<Alert16Regular />}
              height={`28px`}
              width={`28px`}
              backgroundColor={{
                base: props.isSubscribed
                  ? Color(theme.color.neutral[theme.mode][800])
                      .alpha(0.15)
                      .string()
                  : 'transparent',
              }}
              border={{ base: '1px solid transparent' }}
            />
          ) : null}
        </MessageActionsGroup>
      </div>
    </MessageComponent>
  );
}

const MessageActionsGroup = styled.div<{
  theme: themeType;
  isVisible: boolean;
}>`
  width: fit-content;
  background: white;
  position: absolute;
  top: calc(-4px - 15px); // -4 for messagepadding; -17 for half of action group height
  right: 0;
  border: ${({ theme }) => `1px solid ${theme.color.neutral[theme.mode][200]}`};
  border-radius: ${({ theme }) => theme.radius};
  box-sizing: border-box;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  flex-direction: row;
  align-items: center;
  padding: 1px;
`;

const MessageReply = {
  DetailsWrapper: styled.div`
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
    margin-bottom: 4px;
  `,
  DetailsCount: styled.span<{ theme: themeType }>`
    font-family: ${({ theme }) => theme.font.detail};
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) =>
      Color(theme.color.primary[800]).desaturate(0.36).string()};
    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  `,
  DetailsTimestamp: styled.span<{ theme: themeType }>`
    font-family: ${({ theme }) => theme.font.detail};
    font-size: 13px;
    font-weight: 400;
    color: ${({ theme }) => theme.color.neutral[theme.mode][900]};
  `,
  DetailsProfilePhotosWrapper: styled.div`
    display: flex;
    gap: 3px;
  `,
  DetailsProfilePhoto: styled.img<{ theme: themeType }>`
    background-color: lightblue;
    border-radius: ${({ theme }) => theme.radius};
    height: 20px;
    width: 20px;
  `,
};

export { Message };
