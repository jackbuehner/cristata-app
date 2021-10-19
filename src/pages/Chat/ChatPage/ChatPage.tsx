import { css, useTheme } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { themeType } from '../../../utils/theme/theme';
import { PageHead } from '../../../components/PageHead';
import useAxios from 'axios-hooks';
import { IGetDiscussion } from '../../../interfaces/github/discussions';
import { Message } from './Message';
import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled/macro';
import { TextArea } from '../../../components/TextArea';
import { Button } from '../../../components/Button';
import { Thread } from './Thread';
import axios from 'axios';

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
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
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
  const [{ data, loading }, refetch] = useAxios<IGetDiscussion>(`/gh/teams/discussions/${team_slug}?last=10`);

  // store the data in state so that it can be mutated
  const [messages, setMessages] = useState(data);
  useEffect(() => {
    setMessages(data);
  }, [data]);

  // store loading as state so that we can also set loading
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  /**
   * Load new messages from the API
   */
  const test = () => {
    setIsLoading(true);
    let messagesCopy = JSON.parse(JSON.stringify(messages)) as IGetDiscussion | undefined;

    if (messagesCopy) {
      const cursorNext = messagesCopy.organization.team.discussions.edges[0].cursor;

      axios
        .get(`/gh/teams/discussions/${team_slug}?before=${cursorNext}?last=10`, {
          baseURL: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/api/v2`,
          withCredentials: true,
        })
        .then(({ data }) => {
          if (messagesCopy) {
            messagesCopy.organization.team.discussions.edges = [
              ...data.organization.team.discussions.edges,
              ...messagesCopy.organization.team.discussions.edges,
            ];

            setMessages(messagesCopy);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  };

  // scroll to the correct message when the disccusions state is updated
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // if there are more than the starting amount of discussions (10), scroll to the last discussion that was previously loaded before new discussions were added
    const elemID = messages?.organization.team.discussions.edges[10]?.node.id; // scroll to the 11th element since 10 are added on each fetch in front of the previous elements
    if (elemID) {
      const elem = document.getElementById(elemID);
      elem?.scrollIntoView();
    } else {
      // otherwise, it is the first load, so scroll messages container to bottom
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
      });
    }
  }, [messages]);

  useEffect(() => {}, [messages]);

  // set document title
  useEffect(() => {
    document.title = `#paladin-news/${team_slug} - Cristata`;
  }, [team_slug]);

  return (
    <WholePageContentWrapper>
      <div style={{ flexGrow: 1 }}>
        <PageHead
          title={`#paladin-news/${team_slug}`}
          description={`discussion`}
          isLoading={isLoading}
          buttons={
            <>
              <Button onClick={() => refetch()}>Refetch</Button>
            </>
          }
        />
        <DiscussionsListWrapper theme={theme}>
          <ChatAreaWrapper theme={theme}>
            <div style={{ overflow: 'auto', flexGrow: 1 }} ref={messagesContainerRef}>
              {
                // if there are more messages to load, show the load more button
                messages?.organization.team.discussions.edges.length !==
                messages?.organization.team.discussions.totalCount ? (
                  <div
                    style={{
                      margin: 10,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Button onClick={() => test()}>Load more</Button>
                  </div>
                ) : null
              }
              {messages?.organization.team.discussions.edges.map(({ node: discussion }, index: number) => {
                return (
                  <React.Fragment key={index}>
                    {
                      // if this is the discussion at the top of the page
                      // OR if this is the FIRST discussion with this date,
                      // show a divider and date
                      index === 0 ||
                      discussion.publishedAt.substr(0, 10) !==
                        messages?.organization.team.discussions.edges[index - 1].node.publishedAt.substr(
                          0,
                          10
                        ) ? (
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
                      id={discussion.id}
                      cssExtra={css`
                        scroll-margin-top: 91px;
                      `}
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
