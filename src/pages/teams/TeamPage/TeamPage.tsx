import { NetworkStatus, useQuery } from '@apollo/client';
import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { PageHead } from '../../../components/PageHead';
import { UserCard } from '../../../components/UserCard';
import { TEAM, TEAM__TYPE } from '../../../graphql/queries';
import { genAvatar } from '../../../utils/genAvatar';
import { UsersGrid } from '../TeamsOverviewPage/TeamsOverviewPage';

function TeamPage() {
  // get the url parameters from the route
  let { team_id } = useParams<{
    team_id: string;
  }>();

  // get the team data
  const { data, error, loading, networkStatus } = useQuery<TEAM__TYPE>(TEAM, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    variables: { _id: team_id },
  });
  const team = data?.team;
  const allMembers = [...(team?.members || []), ...(team?.organizers || [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // track loading state
  const isLoading = loading || networkStatus === NetworkStatus.refetch;

  return (
    <>
      <PageHead
        title={team?.name || `Team`}
        description={`${team?.members.length} members`}
        isLoading={isLoading}
      />
      {[[]].map(() => {
        if (loading) {
          // initial load only
          return <p key={0}>Loading teams...</p>;
        }

        if (error) {
          return (
            <div key={0}>
              <h2>Error loading teams.</h2>
              <pre>{error.name}</pre>
              <pre>{error.message}</pre>
            </div>
          );
        }

        return (
          <Fragment key={0}>
            <UsersGrid>
              {allMembers.map((user, index) => {
                return (
                  <UserCard
                    key={index}
                    name={user.name}
                    position={user.current_title}
                    email={user.email}
                    photo={user.photo || genAvatar(user._id)}
                    href={`/profile/${user._id}`}
                  />
                );
              })}
            </UsersGrid>
          </Fragment>
        );
      })}
    </>
  );
}

export { TeamPage };
