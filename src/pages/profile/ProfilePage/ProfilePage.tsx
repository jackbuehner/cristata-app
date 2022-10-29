import { gql, useApolloClient, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import Color from 'color';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from '../../../components/Button';
import { Chip } from '../../../components/Chip';
import { Offline } from '../../../components/Offline';
import { PROFILE, PROFILE__TYPE, REINVITE_USER, REINVITE_USER__TYPE } from '../../../graphql/queries';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { getPasswordStatus } from '../../../utils/axios/getPasswordStatus';
import { genAvatar } from '../../../utils/genAvatar';
import { themeType } from '../../../utils/theme/theme';
import { useEditProfileModal } from './useEditProfileModal';

function ProfilePage() {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const authUserState = useAppSelector((state) => state.authUser);
  const dispatch = useAppDispatch();
  const client = useApolloClient();

  // get the url parameters from the route
  let { profile_id } = useParams<{
    profile_id: string;
  }>();

  const { data, loading, error, refetch } = useQuery<PROFILE__TYPE>(PROFILE, {
    fetchPolicy: 'no-cache',
    variables: { _id: profile_id },
  });
  const profile = data?.profile;
  const { temporary, expired, expiresAt } = getPasswordStatus(profile?.flags || []);

  const { data: permissionsData } = useQuery(
    gql(jsonToGraphQLQuery({ query: { userActionAccess: { modify: true, deactivate: true } } })),
    {
      fetchPolicy: 'no-cache',
    }
  );
  const permissions: Record<string, boolean> | undefined = permissionsData?.userActionAccess;
  const isSelf = profile_id === authUserState._id;
  const canEdit = permissions?.modify || isSelf;
  const canManage = (permissions?.modify && permissions?.deactivate) || false;

  // set document title
  useEffect(() => {
    document.title = `${profile?.name ? profile.name + ' - ' : ''} Profile - Cristata`;
  }, [profile?.name]);

  const [EditWindow, showEditModal] = useEditProfileModal(
    profile
      ? {
          _id: profile._id,
          email: profile.email,
          name: profile.name,
          biography: profile.biography,
          current_title: profile.current_title,
          phone: profile.phone,
          retired: profile.retired,
          twitter: profile.twitter,
        }
      : undefined,
    canManage,
    async () => {
      await refetch();
    }
  );

  const reinvite = () => {
    client
      .mutate<REINVITE_USER__TYPE>({ mutation: REINVITE_USER, variables: { _id: profile?._id } })
      .then(() => {
        toast.success(`Re-sent invite to ${profile?.email}`);
        refetch();
      })
      .catch((error) => {
        console.error(error);
        toast.error(`Failed to re-send the invitation. \n ${error.message}`);
        refetch();
      });
  };

  // keep loading state synced
  useEffect(() => {
    dispatch(setAppLoading(loading));
  }, [dispatch, loading]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName('Profiles'));
    dispatch(
      setAppActions([
        canEdit
          ? {
              label: 'Edit',
              type: isSelf ? 'icon' : 'button',
              icon: 'Edit20Regular',
              action: showEditModal,
              disabled: !canEdit || loading,
            }
          : null,
        isSelf
          ? {
              label: 'Change password',
              type: 'button',
              icon: 'Key20Regular',
              action: () => {
                const tenant = localStorage.getItem('tenant');
                window.location.href = `https://${process.env.REACT_APP_AUTH_BASE_URL}/${
                  tenant || ''
                }/change-password?return=${encodeURIComponent(window.location.href)}`;
              },
            }
          : null,
      ])
    );
  }, [canEdit, dispatch, isSelf, loading, navigate, showEditModal]);

  if (!data && !navigator.onLine) {
    return <Offline variant={'centered'} key={0} />;
  }

  return (
    <>
      {EditWindow}
      {loading ? null : data ? (
        <ContentWrapper theme={theme}>
          {profile?.retired ? (
            <Notice theme={theme}>
              This account is deactivated. This user will not be able to sign in to Cristata.
            </Notice>
          ) : expired ? (
            <Notice theme={theme}>
              This user never accepted their invitation and will not be able to sign in to Cristata.{' '}
              {expiresAt
                ? `It expired on ${DateTime.fromISO(expiresAt.toISOString()).toFormat(
                    `LLL. dd, yyyy 'at' t`
                  )}. `
                : null}
              {canManage ? (
                <span onClick={reinvite} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                  Reinvite user
                </span>
              ) : null}
            </Notice>
          ) : temporary ? (
            <Notice theme={theme}>
              This user has not accepted their invitation.{' '}
              {expiresAt
                ? `It will expire on ${DateTime.fromISO(expiresAt.toISOString()).toFormat(
                    `LLL. dd, yyyy 'at' t`
                  )}. `
                : null}
              {canManage ? (
                <span onClick={reinvite} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                  Reinvite user
                </span>
              ) : null}
            </Notice>
          ) : null}
          <TopBox>
            <Photo
              src={profile?.photo || genAvatar(profile?._id || Math.random().toString())}
              alt={``}
              theme={theme}
              retired={!!profile?.retired}
            />
            <div>
              <Name theme={theme}>{profile?.name}</Name>
              <Title theme={theme}>{profile?.retired ? 'RETIRED' : profile?.current_title || 'Employee'}</Title>
              <ButtonRow>
                {profile?.email ? (
                  <Button onClick={() => (window.location.href = `mailto:${profile.email}`)}>Email</Button>
                ) : null}
                {profile?.phone ? (
                  <Button onClick={() => (window.location.href = `tel:${profile.phone}`)}>Phone</Button>
                ) : null}
              </ButtonRow>
            </div>
          </TopBox>
          <SectionTitle theme={theme}>Contact Information</SectionTitle>
          <ItemGrid>
            <ItemLabel theme={theme}>Phone</ItemLabel>
            <Item theme={theme}>{profile?.phone !== 0 ? profile?.phone : ''}</Item>
            <ItemLabel theme={theme}>Email</ItemLabel>
            <Item theme={theme}>{profile?.email}</Item>
            <ItemLabel theme={theme}>Twitter</ItemLabel>
            <Item theme={theme}>{profile?.twitter ? `@${profile.twitter}` : ``}</Item>
          </ItemGrid>
          <SectionTitle theme={theme}>Work Information</SectionTitle>
          <ItemGrid>
            <ItemLabel theme={theme}>Biography</ItemLabel>
            <Item theme={theme}>{profile?.biography}</Item>
            <ItemLabel theme={theme}>{profile?.retired ? 'Last title' : 'Current title'}</ItemLabel>
            <Item theme={theme}>{profile?.current_title || `Employee`}</Item>
            <ItemLabel theme={theme}>Join date</ItemLabel>
            <Item theme={theme}>
              {profile?.timestamps.joined_at
                ? DateTime.fromISO(profile.timestamps.joined_at).toFormat(`dd LLLL yyyy`)
                : ``}
            </Item>
          </ItemGrid>
          <SectionTitle theme={theme}>Account Information</SectionTitle>
          <ItemGrid>
            <ItemLabel theme={theme}>Username</ItemLabel>
            <Item theme={theme}>{profile?.username}</Item>
            <ItemLabel theme={theme}>Slug</ItemLabel>
            <Item theme={theme}>{profile?.slug}</Item>
          </ItemGrid>
          <SectionTitle theme={theme}>Teams &amp; Groups</SectionTitle>
          {
            // if this person is part of at least one team, show the teams as a list of chips
            profile && profile.teams.docs.length > 0 ? (
              profile.teams.docs.map((team) => {
                return (
                  <Chip
                    key={team._id}
                    label={team.slug}
                    color={`neutral`}
                    onClick={() => navigate(`/teams/${team._id}`)}
                  />
                );
              })
            ) : (
              // otherwise, show a message stating that the person has no teams
              <Item theme={theme}>This person is not part of any teams or groups.</Item>
            )
          }
          {profile?.timestamps.modified_at ? (
            <LastEdited theme={theme}>
              Last edited on{' '}
              {DateTime.fromISO(profile.timestamps.modified_at).toFormat(`dd LLLL yyyy 'at' h:mm a`)}
            </LastEdited>
          ) : null}
        </ContentWrapper>
      ) : (
        <div>
          Something went wrong while trying retrieve this profile: <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </>
  );
}

const ContentWrapper = styled.div<{ theme: themeType }>`
  padding: 20px;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
  overflow: auto;
`;

const TopBox = styled.div`
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 20px;
  margin: 0;
  align-items: center;
`;

const Photo = styled.img<{ theme: themeType; retired: boolean }>`
  width: 92px;
  height: 92px;
  border: 0px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  border-radius: 50%;
  ${({ retired }) => (retired ? `filter: grayscale(1); opacity: 0.7;` : ``)}
  &:hover {
    ${({ retired }) => (retired ? `filter: grayscale(0); opacity: 1;` : ``)}
  }
`;

const Name = styled.h1<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 24px;
  font-weight: 500;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  line-height: 36px;
  margin: 0px;
`;

const Title = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  line-height: 18px;
  margin: 0px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  margin: 10px 0px;
`;

const SectionTitle = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][800]};
  line-height: 48px;
  margin: 0px;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
`;

const ItemLabel = styled.span<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;
  line-height: 24px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const Item = styled.span<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;
  line-height: 20px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const LastEdited = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][800]};
  margin-top: 32px;
`;

const Notice = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  background-color: ${({ theme }) =>
    theme.mode === 'light' ? Color(theme.color.orange[800]).lighten(0.64).hex() : theme.color.orange[1400]};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  padding: 10px 20px;
  position: sticky;
  top: -20px;
  margin: -20px 0 20px -20px;
  width: 100%;
  z-index: 99;
`;

export { ProfilePage };
