import { NetworkStatus, useQuery } from '@apollo/client';
import { PeopleTeam20Regular } from '@fluentui/react-icons';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, SideNavSubButton } from '../../../components/Button';
import { SideNavHeading } from '../../../components/Heading';
import { Spinner } from '../../../components/Loading';
import { Offline } from '../../../components/Offline';
import type { TEAMS__TYPE } from '../../../graphql/queries';
import { TEAMS } from '../../../graphql/queries';

interface ITeamsNav {
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}

function TeamsNav(props: ITeamsNav) {
  const { pathname } = useLocation();

  const { data, error, loading, refetch, fetchMore, networkStatus } = useQuery<TEAMS__TYPE>(TEAMS, {
    notifyOnNetworkStatusChange: true,
    variables: { limit: 10 },
  });
  const teams = [...(data?.teams.docs || [])].sort((a, b) => a.name.localeCompare(b.name));
  const isLoading = loading || networkStatus === NetworkStatus.refetch;

  // refetch teams list if location changes (always have updated list)
  useEffect(() => {
    if (pathname.includes('/teams')) refetch();
  }, [pathname, refetch]);

  // create a ref for the spinner that appears when more items can be loaded
  const SpinnerRef = useRef<HTMLDivElement>(null);
  // also create a ref for the sidenav
  const SideNavRef = useRef<HTMLDivElement>(null);

  // use IntersectionObserver to detect when the load more items spinner is
  // intersecting in the sidenav, and then attempt to load more rows of the table
  useEffect(() => {
    let observer: IntersectionObserver;
    if (SpinnerRef.current && SideNavRef.current) {
      const options: IntersectionObserverInit = {
        root: SideNavRef.current,
        threshold: 0.75, // require at least 75% intersection
      };
      const callback: IntersectionObserverCallback = (entries, observer) => {
        entries.forEach((spinner) => {
          if (spinner.isIntersecting && !loading && networkStatus !== NetworkStatus.refetch) {
            // make spinner visible
            if (SpinnerRef.current) SpinnerRef.current.style.opacity = '1';
            // fetch more rows of data
            if (data?.teams?.hasNextPage) {
              fetchMore({
                variables: {
                  page: data.teams.nextPage,
                },
              });
            }
          } else {
            // make spinner invisible until it is intersecting enough
            if (SpinnerRef.current) SpinnerRef.current.style.opacity = '0';
          }
        });
      };
      observer = new IntersectionObserver(callback, options);
      observer.observe(SpinnerRef.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [
    data?.teams?.docs,
    data?.teams?.hasNextPage,
    data?.teams?.nextPage,
    fetchMore,
    loading,
    networkStatus,
    SpinnerRef,
    SideNavRef,
  ]);

  if (!data && !navigator.onLine) {
    return <Offline variant={'small'} key={0} />;
  }

  return (
    <>
      <SideNavHeading isLoading={isLoading} className={'not-header'}>
        All teams
      </SideNavHeading>
      <div
        ref={SideNavRef}
        style={{
          overflow: 'auto',
          flexGrow: 1,
          marginTop: -10,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
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
            {data?.teams?.hasNextPage ? (
              <div ref={SpinnerRef}>
                <Spinner />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
}

export { TeamsNav };
