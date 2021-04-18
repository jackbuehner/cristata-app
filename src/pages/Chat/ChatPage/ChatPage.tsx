import { useTheme } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { themeType } from '../../../utils/theme/theme';
import { PageHead } from '../../../components/PageHead';
import useAxios from 'axios-hooks';
import { IGetDiscussion } from '../../../interfaces/github/discussions';
import { Message } from './Message';
import React from 'react';
import styled from '@emotion/styled';
import { TextArea } from '../../../components/TextArea';
import { Button } from '../../../components/Button';
import { Thread } from './Thread';

const WholePageContentWrapper = styled.div<{ theme?: themeType }>`
  padding: 0;
  box-sizing: border-box;
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const DiscussionsListWrapper = styled.div<{ theme?: themeType }>`
  padding: 0;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  box-sizing: border-box;
  overflow: auto;
`;

const ChatAreaWrapper = styled.div<{ theme?: themeType }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

function ChatPage() {
  const theme = useTheme() as themeType;

  // get the url parameters from the route
  let { team_slug, thread_discussion_number } = useParams<{
    team_slug: string;
    thread_discussion_number: string;
  }>();

  // get the data
  const [{ data, loading }, refetch] = useAxios<IGetDiscussion>(`/gh/teams/discussions/${team_slug}`);

  return (
    <WholePageContentWrapper>
      <div style={{ flexGrow: 1 }}>
        <PageHead
          title={`#paladin-news/${team_slug}`}
          description={`discussion`}
          isLoading={loading}
          buttons={
            <>
              <Button onClick={() => refetch()}>Refetch</Button>
            </>
          }
        />
        <DiscussionsListWrapper theme={theme}>
          <ChatAreaWrapper theme={theme}>
            <div style={{ overflow: 'auto', flexGrow: 1 }}>
              {data?.organization.team.discussions.edges.map(({ node: discussion }, index: number) => {
                return (
                  <React.Fragment key={index}>
                    {
                      // if this is the discussion at the top of the page
                      // OR if this is the FIRST discussion with this date,
                      // show a divider and date
                      index === 0 ||
                      discussion.publishedAt.substr(0, 10) !==
                        data?.organization.team.discussions.edges[index - 1].node.publishedAt.substr(0, 10) ? (
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              margin: '20px 0',
                              borderBottom: `1px solid ${theme.color.neutral[theme.mode][300]}`,
                            }}
                          />
                          <div
                            style={{
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              position: 'absolute',
                              top: '-6.5px',
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: 'white',
                                fontFamily: theme.font.detail,
                                fontSize: 13,
                                lineHeight: '13px',
                                color: theme.color.neutral[theme.mode][900],
                                padding: '0 10px',
                              }}
                            >
                              {new Date(discussion.publishedAt).toLocaleDateString('en-US', {
                                dateStyle: 'long',
                              })}
                            </span>
                          </div>
                        </div>
                      ) : null
                    }
                    <Message
                      author={discussion.author.login}
                      bodyHTML={discussion.bodyHTML}
                      time={new Date(discussion.publishedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                      discussionNumber={discussion.number}
                      reactionGroups={
                        discussion.reactions.totalCount > 0 ? discussion.reactionGroups : undefined
                      }
                      replyCount={discussion.comments.totalCount}
                      recentReplyDetails={
                        discussion.comments.totalCount > 0 ? discussion.comments.edges : undefined
                      }
                      isPinned={discussion.isPinned}
                      isSubscribed={discussion.viewerSubscription === 'SUBSCRIBED'}
                      canPin={discussion.viewerCanPin}
                      canSubscribe={discussion.viewerCanSubscribe}
                      canReact={discussion.viewerCanReact}
                      canReply={true}
                    />
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{ padding: '20px' }}>
              <TextArea theme={theme} />
            </div>
          </ChatAreaWrapper>
        </DiscussionsListWrapper>
      </div>
      {thread_discussion_number ? (
        <Thread discussionNumber={thread_discussion_number} teamSlug={team_slug} />
      ) : null}
    </WholePageContentWrapper>
  );
}

export { ChatPage };
