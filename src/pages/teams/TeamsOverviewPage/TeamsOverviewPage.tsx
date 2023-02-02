import { PageSubtitle as PageSubtitleSvelte } from '$lib/common/PageTitle';
import { NetworkStatus, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Fragment, useEffect } from 'react';
import { reactify } from 'svelte-preprocess-react';
import { Offline } from '../../../components/Offline';
import { UserCard } from '../../../components/UserCard';
import type { TEAM_UNASSIGNED_USERS__TYPE } from '../../../graphql/queries';
import { TEAM_UNASSIGNED_USERS } from '../../../graphql/queries';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { getPasswordStatus } from '../../../utils/axios/getPasswordStatus';
import { genAvatar } from '../../../utils/genAvatar';
import type { themeType } from '../../../utils/theme/theme';

const PageSubtitle = reactify(PageSubtitleSvelte);

function TeamsOverviewPage() {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;

  // get the unassigned active users
  const {
    data: dataUA,
    error: errorUA,
    loading: loadingUA,
    networkStatus: networkStatusUA,
  } = useQuery<TEAM_UNASSIGNED_USERS__TYPE>(TEAM_UNASSIGNED_USERS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    variables: { limit: 100 },
  });
  const unassignedUsers = dataUA?.teamUnassignedUsers;

  // track whether anything is loading
  const isLoading = loadingUA || networkStatusUA === NetworkStatus.refetch;
  useEffect(() => {
    dispatch(setAppLoading(isLoading));
  }, [dispatch, isLoading]);

  // configure app bar
  useEffect(() => {
    // set name
    dispatch(setAppName('Teams'));
    // set actions
    dispatch(setAppActions([]));
  }, [dispatch]);

  if (!dataUA && !navigator.onLine) {
    return <Offline variant={'centered'} key={0} />;
  }

  return (
    <>
      {[[]].map(() => {
        if (errorUA) {
          return (
            <div key={0}>
              <h2>Error loading unassigned users.</h2>
              <pre>{errorUA.name}</pre>
              <pre>{errorUA.message}</pre>
            </div>
          );
        }

        return (
          <Fragment key={0}>
            {unassignedUsers && unassignedUsers.length > 0 ? (
              <Group theme={theme}>
                <div style={{ marginLeft: -20 }}>
                  <PageSubtitle>Active users without teams</PageSubtitle>
                </div>

                <UsersGrid>
                  {unassignedUsers?.map((user, index) => {
                    const { temporary, expired } = getPasswordStatus(user.flags);

                    return (
                      <UserCard
                        key={index}
                        name={user.name}
                        position={user.current_title}
                        email={user.email}
                        photo={user.photo || genAvatar(user._id)}
                        href={`/profile/${user._id}`}
                        status={expired ? 'invite_ignored' : temporary ? 'invited' : 'active'}
                      />
                    );
                  })}
                </UsersGrid>
              </Group>
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
}

export { TeamsOverviewPage, UsersGrid };

const Group = styled.div<{ theme: themeType }>`
  border-bottom: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, max-content));
  gap: 10px;
`;
