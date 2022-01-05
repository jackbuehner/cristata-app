import { gql, NetworkStatus, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  ArrowClockwise16Regular,
  Briefcase16Regular,
  Dismiss16Regular,
  MoreHorizontal24Regular,
  Person16Regular,
  Settings24Regular,
} from '@fluentui/react-icons';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useModal } from 'react-modal-hook';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, IconButton } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { Spinner } from '../../../components/Loading';
import { Menu } from '../../../components/Menu';
import { PlainModal } from '../../../components/Modal';
import { PageHead } from '../../../components/PageHead';
import { MultiSelect } from '../../../components/Select';
import { TextInput } from '../../../components/TextInput';
import { UserCard } from '../../../components/UserCard';
import { selectProfile } from '../../../config/collections/articles/selectProfile';
import { client } from '../../../graphql/client';
import {
  DEACTIVATE_USER,
  DEACTIVATE_USER__TYPE,
  MODIFY_TEAM,
  MODIFY_TEAM__TYPE,
  TEAM,
  TEAM__DOC_TYPE,
  TEAM__TYPE,
} from '../../../graphql/queries';
import { useInviteUserModal } from '../../../hooks/useCustomModal';
import { useDropdown } from '../../../hooks/useDropdown';
import { getPasswordStatus } from '../../../utils/axios/getPasswordStatus';
import { genAvatar } from '../../../utils/genAvatar';
import { themeType } from '../../../utils/theme/theme';
import { UsersGrid } from '../TeamsOverviewPage/TeamsOverviewPage';

function TeamPage() {
  const history = useHistory();
  const theme = useTheme() as themeType;

  // get the url parameters from the route
  let { team_id } = useParams<{
    team_id: string;
  }>();

  // get the team data
  const { data, error, loading, networkStatus, refetch } = useQuery<TEAM__TYPE>(TEAM, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    variables: { _id: team_id },
  });
  const team = data?.team;
  const allMembers: TEAM__DOC_TYPE['members'] = Array.from(
    new Set(
      [...(team?.members || []), ...(team?.organizers || [])]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((user) => JSON.stringify(user))
    )
  ).map((userJson) => JSON.parse(userJson));

  // track loading state
  const isLoading = loading || networkStatus === NetworkStatus.refetch;

  // get the permissions for teams
  const { data: permissionsData } = useQuery(
    gql(
      jsonToGraphQLQuery({
        query: {
          teamActionAccess: {
            modify: true,
            hide: true,
          },
          userActionAccess: {
            deactivate: true,
          },
        },
      })
    )
  );
  const permissions: { modify: boolean; hide: boolean } | undefined = permissionsData?.teamActionAccess;
  const canManage =
    JSON.parse(localStorage.getItem('auth.user') as string)?.teams.includes('MDQ6VGVhbTQ2NDI0MTc=') ||
    (permissions?.modify &&
      (team?.organizers
        ?.map((user) => user._id)
        .includes(JSON.parse(localStorage.getItem('auth.user') as string)?._id) ||
        false));
  const canDeactivate = permissionsData?.userActionAccess?.deactivate || false;

  // modal for managing the team
  const [showManageModal, hideManageModal] = useModal(() => {
    // get fresh data
    const {
      data,
      error,
      loading,
      networkStatus,
      refetch: retry,
      // eslint-disable-next-line react-hooks/rules-of-hooks
    } = useQuery<TEAM__TYPE>(TEAM, {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
      variables: { _id: team_id },
    });
    const team = data?.team;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isMutating, setIsMutating] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [name, setName] = useState<string | undefined>(team?.name);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (team?.name) setName(team.name);
    }, [team?.name]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [membersToAdd, setMembersToAdd] = useState<string[]>([]);

    const members = data?.team.members.map((user) => user._id) || [];
    const organizers = data?.team.organizers || [];

    const isLoading = isMutating || loading || networkStatus === NetworkStatus.refetch;

    const canManage =
      JSON.parse(localStorage.getItem('auth.user') as string)?.teams.includes('MDQ6VGVhbTQ2NDI0MTc=') ||
      (permissions?.modify &&
        (data?.team.organizers
          ?.map((user) => user._id)
          .includes(JSON.parse(localStorage.getItem('auth.user') as string)?._id) ||
          false));

    const modifyTeam = async (): Promise<boolean> => {
      setIsMutating(true);
      return await client
        .mutate<MODIFY_TEAM__TYPE>({
          mutation: MODIFY_TEAM,
          variables: {
            _id: team_id,
            input: { name, members: Array.from(new Set([...members, ...membersToAdd])) },
          },
        })
        .then(({ data }) => {
          // stop loading
          setIsMutating(false);
          // refresh page team data
          refetch();
          // tell modal to close
          return true;
        })
        .catch((err) => {
          // stop loading
          setIsMutating(false);
          // log and show the errors
          console.error(err);
          toast.error(`Failed to create new team. \n ${err.message}`);
          // tell modal to remain open
          return false;
        });
    };

    // modal to invite new user
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [showNewUserModal] = useInviteUserModal();

    return (
      <PlainModal
        hideModal={hideManageModal}
        title={`Manage team`}
        isLoading={isLoading}
        cancelButton={error ? { text: 'Close' } : !data || !canManage ? null : undefined}
        continueButton={
          error
            ? {
                text: 'Retry',
                onClick: () => {
                  retry();
                  return false;
                },
              }
            : !data || !canManage
            ? {
                text: 'Close',
                onClick: () => true,
              }
            : {
                text: 'Save',
                onClick: async () => {
                  return await modifyTeam();
                },
              }
        }
      >
        {error ? (
          <div>Failed to load 'Manage team' modal.</div>
        ) : (
          <>
            {canManage ? null : (
              <div style={{ fontSize: 14, fontStyle: 'italic', marginBottom: 10 }}>
                You do not have permission to manage this team. If you think you should have permission, contact
                one of the team organizers.
              </div>
            )}
            {canManage ? (
              <InputGroup type={`text`}>
                <Label
                  htmlFor={'name'}
                  description={`The display name of the team. Changing this will not affect the team ID or the team slug.`}
                  disabled={isLoading}
                >
                  Team name
                </Label>
                <TextInput
                  name={'name'}
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  isDisabled={isLoading}
                />
              </InputGroup>
            ) : (
              <InputGroup type={`text`}>
                <Label htmlFor={'name'} disabled={isLoading}>
                  Team name
                </Label>
                <span style={{ opacity: 0.7 }}>{team?.name}&nbsp;</span>
              </InputGroup>
            )}
            <InputGroup type={canManage ? `display` : `text`}>
              <Label htmlFor={'slug'} disabled={isLoading}>
                Team slug
              </Label>
              <span style={{ opacity: 0.7 }}>{team?.slug}&nbsp;</span>
            </InputGroup>
            {canManage ? (
              <ErrorBoundary fallback={<div>Error loading field 'members'</div>}>
                <InputGroup type={`text`}>
                  <Label
                    htmlFor={'membersToAdd'}
                    description={'Select users to add to this team.'}
                    disabled={isLoading}
                  >
                    Members to add
                  </Label>
                  <MultiSelect
                    loadOptions={selectProfile}
                    async
                    val={membersToAdd}
                    onChange={(valueObjs) => {
                      if (valueObjs)
                        setMembersToAdd(valueObjs.map((obj: { value: string; label: string }) => obj.value));
                    }}
                    isDisabled={isLoading}
                  />
                  <div
                    style={{
                      fontFamily: theme.font.detail,
                      fontSize: 13,
                      color: theme.color.neutral[theme.mode][1200],
                      marginTop: 6,
                    }}
                  >
                    Don't see the member you want to add?{' '}
                    <span
                      style={{
                        color: theme.color.primary[800],
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                      onClick={showNewUserModal}
                    >
                      Invite a new user
                    </span>
                  </div>
                </InputGroup>
              </ErrorBoundary>
            ) : null}
            <InputGroup type={`text`}>
              <Label description={'This team is managed by the following organizers:'} disabled={isLoading}>
                Organizers
              </Label>
              {organizers?.map((organizer) => {
                return (
                  <Organizer
                    theme={theme}
                    href={`/profile/${organizer._id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      history.push(`/profile/${organizer._id}`);
                    }}
                  >
                    <ProfilePhoto src={organizer.photo || genAvatar(organizer._id)} />
                    <span>{organizer.name}</span>
                  </Organizer>
                );
              })}
            </InputGroup>
          </>
        )}
      </PlainModal>
    );
  }, [theme, permissions, team?._id]);

  /**
   * Sets user role.
   */
  const setRole = (_id: string, role: 'member' | 'organizer', currentRole: 'member' | 'organizer') => {
    if (team) {
      // move user to members
      if (role === 'member' && currentRole !== 'member') {
        setShowDropdownSpinner(true);
        client
          .mutate<MODIFY_TEAM__TYPE>({
            mutation: MODIFY_TEAM,
            variables: {
              _id: team_id,
              input: {
                organizers: team.organizers.filter((user) => user._id !== _id).map((user) => user._id), // remove user from organizers
                members: Array.from(new Set([...team.members.map((user) => user._id), _id])),
              },
            },
          })
          .then(() => refetch())
          .catch((error) => {
            console.error(error);
            toast.error(`Failed to change role. \n ${error.message}`);
          })
          .finally(() => {
            setShowDropdownSpinner(false);
          });
      }

      // move user to organizers
      if (role === 'organizer' && currentRole !== 'organizer') {
        setShowDropdownSpinner(true);
        client
          .mutate<MODIFY_TEAM__TYPE>({
            mutation: MODIFY_TEAM,
            variables: {
              _id: team_id,
              input: {
                organizers: Array.from(new Set([...team.organizers.map((user) => user._id), _id])),
                members: team.members.filter((user) => user._id !== _id).map((user) => user._id), // remove user from members
              },
            },
          })
          .then(() => refetch())
          .catch((error) => {
            console.error(error);
            toast.error(`Failed to change role. \n ${error.message}`);
          })
          .finally(() => {
            setShowDropdownSpinner(false);
          });
      }
    }
  };

  // tools dropdown
  const [showToolsDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left + triggerRect.width - 240,
            width: 240,
          }}
          items={[
            {
              label: 'Refresh data',
              icon: <ArrowClockwise16Regular />,
              onClick: () => refetch(),
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  // role dropdown
  const [showDropdownSpinner, setShowDropdownSpinner] = useState<boolean>(false);
  const [showRoleDropdown] = useDropdown<{ _id: string; currentRole: 'member' | 'organizer' }>(
    (triggerRect, dropdownRef, props) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left,
            width: 148,
          }}
          noIcons
          items={[
            {
              label: `${props.currentRole === 'member' ? '✧ ' : ''}Member`,
              disabled: team?.members.find((user) => user._id)?._id === props._id,
              onClick: async () => {
                if (props && props._id && props.currentRole) {
                  setRole(props._id, 'member', props.currentRole);
                }
              },
            },
            {
              label: `${props.currentRole === 'organizer' ? '✧ ' : ''}Organizer`,
              disabled: team?.organizers.find((user) => user._id)?._id === props._id,
              onClick: () => {
                if (props && props._id && props.currentRole) {
                  setRole(props._id, 'organizer', props.currentRole);
                }
              },
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  // remove user modal
  const [isDeactivateChecked, setIsDeactivateChecked] = useState<boolean>(false);
  const [modalUser, setModalUser] = useState<string>();
  const [showRemoveUserModal, hideRemoveUserModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Deactivate a given user.
     * @param userId
     * @returns whether the user was successfully deactivated
     */
    const deactivate = async (userId: string) => {
      setIsLoading(true);
      return await client
        .mutate<DEACTIVATE_USER__TYPE>({
          mutation: DEACTIVATE_USER,
          variables: { _id: userId, deactivate: true },
        })
        .then((res) => {
          if (res.errors?.[0]) {
            console.error(res.errors[0]);
            toast.error(`Failed to deactivate user. \n ${res.errors[0].message}`);
          } else if (res.data?.userDeactivate.retired === true) {
            toast.success(`Successfully deactivated user.`);
            return true;
          }
          toast.error(`Failed to deactivate user.`);
          return false;
        })
        .catch((error) => {
          console.error(error);
          toast.error(`Failed to deactivate user. \n ${error.message}`);
          return false;
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    const remove = async (userId: string) => {
      setIsLoading(true);
      return await client
        .mutate<MODIFY_TEAM__TYPE>({
          mutation: MODIFY_TEAM,
          variables: {
            _id: team_id,
            input: {
              organizers: team?.organizers.filter((user) => user._id !== userId).map((user) => user._id), // remove user from organizers
              members: team?.members.filter((user) => user._id !== userId).map((user) => user._id), // remove user from organizers
            },
          },
        })
        .then(() => {
          refetch();
          return true;
        })
        .catch((error) => {
          console.error(error);
          toast.error(`Failed to remove user from team. \n ${error.message}`);
          return false;
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    return (
      <PlainModal
        hideModal={hideRemoveUserModal}
        title={`Remove from team?`}
        isLoading={isLoading}
        continueButton={{
          text: `Yes, remove${isDeactivateChecked ? ` and deactivate` : ``}`,
          color: 'danger',
          onClick: async () => {
            if (modalUser && modalUser.length > 0) {
              if (isDeactivateChecked) deactivate(modalUser); // don't wait for deactivation
              const removed = await remove(modalUser); // wait for removal
              return removed; // return whether it worked
            }
            return false;
          },
        }}
      >
        {canDeactivate ? (
          <>
            <InputGroup type={`checkbox`}>
              <Label
                htmlFor={'deactivate'}
                description={`Deactivate an account if this person no longer needs to access Cristata.`}
                disabled={isLoading}
              >
                Also deactivate this account.
              </Label>
              <Checkbox
                name={'deactivate'}
                id={'deactivate'}
                isChecked={isDeactivateChecked}
                isDisabled={isLoading}
                onChange={() => setIsDeactivateChecked(!isDeactivateChecked)}
              />
            </InputGroup>
          </>
        ) : null}
      </PlainModal>
    );
  }, [isDeactivateChecked, modalUser, team]);

  return (
    <>
      <PageHead
        title={team?.name || `Team`}
        description={`${allMembers.length} members`}
        isLoading={isLoading}
        buttons={
          <>
            <Button icon={<Settings24Regular />} onClick={showManageModal}>
              Manage
            </Button>
            <IconButton
              icon={<MoreHorizontal24Regular />}
              onClick={showToolsDropdown}
              onAuxClick={() => refetch()}
            />
          </>
        }
      />
      {[[]].map(() => {
        if (loading && !data) {
          // initial load only
          return (
            <ContentWrapper theme={theme} key={0}>
              <p>Loading teams...</p>
            </ContentWrapper>
          );
        }

        if (error) {
          return (
            <ContentWrapper theme={theme} key={0}>
              <h2>Error loading teams.</h2>
              <pre>{error.name}</pre>
              <pre>{error.message}</pre>
            </ContentWrapper>
          );
        }

        return (
          <ContentWrapper theme={theme} key={0}>
            <UsersGrid>
              {allMembers.map((user, index) => {
                const isOrganizer = team?.organizers.findIndex((u) => u._id === user._id) !== -1;
                const { temporary, expired } = getPasswordStatus(user.flags);

                return (
                  <UserCard
                    key={index}
                    name={user.name}
                    position={`${user.current_title + ' ' || ''}${isOrganizer ? `(organizer)` : `(member)`}`}
                    email={user.email}
                    photo={user.photo || genAvatar(user._id)}
                    status={
                      user.retired
                        ? 'deactivated'
                        : expired
                        ? 'invite_ignored'
                        : temporary
                        ? 'invited'
                        : 'active'
                    }
                  >
                    <UserButtons>
                      {permissions?.modify && canManage ? (
                        <>
                          <Button
                            showChevron
                            icon={showDropdownSpinner ? <Spinner size={16} /> : <Briefcase16Regular />}
                            onClick={(e) =>
                              showRoleDropdown(e, {
                                _id: user._id,
                                currentRole: isOrganizer ? 'organizer' : 'member',
                              })
                            }
                          >
                            Role
                          </Button>
                          <Button
                            icon={<Dismiss16Regular />}
                            onClick={() => {
                              setModalUser(user._id);
                              setIsDeactivateChecked(false);
                              showRemoveUserModal();
                            }}
                            onAuxClick={() => {
                              setModalUser(user._id);
                              if (canDeactivate) setIsDeactivateChecked(true);
                              else setIsDeactivateChecked(false);
                              showRemoveUserModal();
                            }}
                          >
                            Remove
                          </Button>
                        </>
                      ) : null}

                      <Button icon={<Person16Regular />} onClick={() => history.push(`/profile/${user._id}`)}>
                        Profile
                      </Button>
                    </UserButtons>
                  </UserCard>
                );
              })}
            </UsersGrid>
          </ContentWrapper>
        );
      })}
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

const UserButtons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  margin: 10px 0 0 0;
  flex-flow: wrap;
  justify-content: center;
`;

const ProfilePhoto = styled.div<{ src?: string }>`
  width: 24px;
  height: 24px;
  background: ${({ src }) => `url(${src})`};
  background-position: center;
  background-size: cover;
  box-shadow: inset 0 0 0 2px black;
  border-radius: 50%;
`;

const Organizer = styled.a<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  &:hover {
    text-decoration: underline;
  }
  margin-bottom: 3px;
`;

export { TeamPage };
