/** @jsxImportSource @emotion/react */
import useAxios from 'axios-hooks';
import { css } from '@emotion/react';
import { SideNavSubButton } from '../../../components/Button';
import { NumberSymbol20Regular } from '@fluentui/react-icons';
import { IGetTeams } from '../../../interfaces/github/teams';
import { useHistory } from 'react-router';
import { SideNavHeading } from '../../../components/Heading';
import { useLocation } from 'react-router-dom';

function ChatSideNavSub() {
  const history = useHistory();
  const location = useLocation();
  const [{ data, loading, error }] = useAxios<IGetTeams>('/gh/teams');

  if (loading) return <SideNavHeading isLoading>Chat</SideNavHeading>;
  if (error) {
    console.error(error);
    return <span>Error: {error.code}</span>;
  }
  if (data) {
    // navigate to the first project in the navigation
    if (data.organization.teams.edges[0] && location.pathname === '/chat') {
      history.push(`/chat/${data.organization.teams.edges[0].node.slug}`);
    }
    return (
      <>
        {data.organization.teams.edges.map(({ node: team }, index: number) => {
          return (
            <>
              <SideNavHeading>{team.slug}</SideNavHeading>
              <SideNavSubButton
                key={index}
                Icon={
                  <span
                    css={css`
                      > svg {
                        width: 16px;
                      }
                    `}
                  >
                    <NumberSymbol20Regular />
                  </span>
                }
                to={`/chat/${team.slug}`}
              >
                general
              </SideNavSubButton>
              {team.childTeams.edges.map(({ node: childTeam }, index: number) => {
                return (
                  <SideNavSubButton
                    key={index}
                    Icon={
                      <span
                        css={css`
                          > svg {
                            width: 16px;
                          }
                        `}
                      >
                        <NumberSymbol20Regular />
                      </span>
                    }
                    to={`/chat/${childTeam.slug}`}
                  >
                    {childTeam.slug}
                  </SideNavSubButton>
                );
              })}
            </>
          );
        })}
      </>
    );
  }
  return null;
}

export { ChatSideNavSub };
