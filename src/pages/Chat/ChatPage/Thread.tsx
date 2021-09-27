import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { themeType } from '../../../utils/theme/theme';
import { PageHead } from '../../../components/PageHead';
import { IconButton } from '../../../components/Button';
import { PaneClose16Regular } from '@fluentui/react-icons';
import useAxios from 'axios-hooks';
import {
  IGetDiscussionComments,
  IGetDiscussionSingle,
} from '../../../interfaces/github/discussions';
import { Message } from './Message';
import { DateTime } from 'luxon';
import { useHistory, useLocation } from 'react-router-dom';

const ThreadComponent = styled.div<{ theme: themeType }>`
  width: 360px;
  flex-shrink: 0;
  border-left: ${({ theme }) =>
    `1px solid ${theme.color.neutral[theme.mode][300]}`};
`;

interface IThread {
  discussionNumber: string;
  teamSlug: string;
}

function Thread(props: IThread) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const history = useHistory();

  // get the data
  const [{ data, loading }, refetch] = useAxios<IGetDiscussionComments>(
    `/gh/teams/discussions/${props.teamSlug}/${props.discussionNumber}/comments`
  );

  const [{ data: parentData, loading: parentLoading }, parentRefetch] =
    useAxios<IGetDiscussionSingle>(
      `/gh/teams/discussions/${props.teamSlug}/${props.discussionNumber}`
    );

  return (
    <ThreadComponent theme={theme}>
      <PageHead
        title={`Thread`}
        isLoading={loading || parentLoading}
        buttons={
          <>
            <IconButton
              icon={<PaneClose16Regular />}
              onClick={() => {
                // close thread pane by removing the discussion number from the location path
                history.push(
                  location.pathname.replace(`/${props.discussionNumber}`, '')
                );
              }}
            />
            <IconButton
              icon={<div>refresh</div>}
              onClick={() => {
                refetch();
                parentRefetch();
              }}
            />
          </>
        }
      />
      {parentData ? (
        <Message
          author={parentData.organization.team.discussion.author.login}
          bodyHTML={parentData.organization.team.discussion.bodyHTML}
          time={
            `${
              DateTime.fromISO(
                parentData.organization.team.discussion.publishedAt
              )
                .toRelativeCalendar()!
                .charAt(0)
                .toUpperCase() +
              DateTime.fromISO(
                parentData.organization.team.discussion.publishedAt
              )
                .toRelativeCalendar()
                ?.slice(1)
            } at ${DateTime.fromISO(
              parentData.organization.team.discussion.publishedAt
            ).toLocaleString(DateTime.TIME_SIMPLE)}` || ''
          }
          discussionNumber={parentData.organization.team.discussion.number}
          reactionGroups={
            parentData.organization.team.discussion.reactions.totalCount > 0
              ? parentData.organization.team.discussion.reactionGroups
              : undefined
          }
          replyCount={0}
          isPinned={parentData.organization.team.discussion.isPinned}
          isSubscribed={
            parentData.organization.team.discussion.viewerSubscription ===
            'SUBSCRIBED'
          }
          canPin={parentData.organization.team.discussion.viewerCanPin}
          canSubscribe={
            parentData.organization.team.discussion.viewerCanSubscribe
          }
          canReact={parentData.organization.team.discussion.viewerCanReact}
          canReply={false}
          isThreadView={true}
        />
      ) : null}
      {data?.organization.team.discussion.comments.edges.map(
        ({ node: discussion }, index: number) => {
          return (
            <Message
              key={index}
              author={discussion.author.login}
              bodyHTML={discussion.bodyHTML}
              time={DateTime.fromISO(discussion.publishedAt).toRelative() || ''}
              discussionNumber={discussion.number}
              reactionGroups={
                discussion.reactions.totalCount > 0
                  ? discussion.reactionGroups
                  : undefined
              }
              replyCount={0}
              isPinned={false}
              isSubscribed={false}
              canPin={false}
              canSubscribe={false}
              canReact={discussion.viewerCanReact}
              canReply={false}
              isThreadView={true}
            />
          );
        }
      )}
    </ThreadComponent>
  );
}

export { Thread };
