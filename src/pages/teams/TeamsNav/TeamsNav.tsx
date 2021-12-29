import { Button, SideNavSubButton } from '../../../components/Button';
import { PeopleTeam20Regular } from '@fluentui/react-icons';
import { SideNavHeading } from '../../../components/Heading';
import { Dispatch, SetStateAction } from 'react';
import { TEAMS, TEAMS__TYPE } from '../../../graphql/queries';
import { NetworkStatus, useQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';

interface ITeamsNav {
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}

function TeamsNav(props: ITeamsNav) {
  const history = useHistory();

  const { data, error, loading, refetch, networkStatus } = useQuery<TEAMS__TYPE>(TEAMS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    variables: { limit: 100 },
  });
  const teams = [...(data?.teams.docs || [])].sort((a, b) => a.name.localeCompare(b.name));
  const isLoading = loading || networkStatus === NetworkStatus.refetch;

  // refetch teams list if location changes
  history.listen((location) => {
    if (location.pathname.includes('/teams')) refetch();
  });

  return (
    <>
      <SideNavHeading isLoading={isLoading}>Teams</SideNavHeading>
      {error ? (
        <>
          <span>Error: {error.message}</span>
          <Button onClick={refetch}>Try again</Button>
        </>
      ) : null}
      {data ? (
        <>
          {teams?.map((team, index) => {
            return (
              <SideNavSubButton
                key={index}
                Icon={<PeopleTeam20Regular />}
                to={`/teams/${team._id}`}
                setIsNavVisibleM={props.setIsNavVisibleM}
              >
                {team.name}
              </SideNavSubButton>
            );
          })}
        </>
      ) : null}
    </>
  );
}

export { TeamsNav };
