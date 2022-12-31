import { gql, NetworkStatus, useApolloClient, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ArrowClockwise16Regular,
  Briefcase16Regular,
  Delete16Regular,
  Dismiss16Regular,
  Person16Regular,
} from '@fluentui/react-icons';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { SectionHeading } from '../../../components/Heading';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { Spinner } from '../../../components/Loading';
import { Menu } from '../../../components/Menu';
import { MultiSelect } from '../../../components/Select';
import { TextInput } from '../../../components/TextInput';
import { UserCard } from '../../../components/UserCard';
import {
  DEACTIVATE_USER,
  DEACTIVATE_USER__TYPE,
  DELETE_TEAM,
  DELETE_TEAM__TYPE,
  MODIFY_TEAM,
  MODIFY_TEAM__TYPE,
  TEAM,
  TEAM__DOC_TYPE,
  TEAM__TYPE,
} from '../../../graphql/queries';
import { useInviteUserModal } from '../../../hooks/useCustomModal';
import { useDropdown } from '../../../hooks/useDropdown';
import { useWindowModal } from '../../../hooks/useWindowModal';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { getPasswordStatus } from '../../../utils/axios/getPasswordStatus';
import { genAvatar } from '../../../utils/genAvatar';
import { themeType } from '../../../utils/theme/theme';
import { selectProfile } from '../selectProfile';
import { UsersGrid } from '../TeamsOverviewPage/TeamsOverviewPage';

function TeamPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme() as themeType;
  const authUserState = useAppSelector((state) => state.authUser);
  const client = useApolloClient();

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
        .filter((m) => !!m)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((user) => JSON.stringify(user))
    )
  ).map((userJson) => JSON.parse(userJson));

  // track loading state
  const isLoading = loading || networkStatus === NetworkStatus.refetch;
  useEffect(() => {
    dispatch(setAppLoading(isLoading));
  }, [dispatch, isLoading]);

  // get the permissions for teams
  const { data: permissionsData } = useQuery(
    gql(
      jsonToGraphQLQuery({
        query: {
          __variables: {
            team_id: 'ObjectID',
          },
          teamActionAccess: {
            __args: {
              _id: new VariableType('team_id'),
            },
            modify: true,
            hide: true,
          },
          userActionAccess: {
            deactivate: true,
          },
        },
      })
    ),
    { variables: { team_id: team_id }, fetchPolicy: 'cache-and-network' }
  );
  const permissions: { modify: boolean; hide: boolean } | undefined = permissionsData?.teamActionAccess;
  const canManage =
    permissions?.modify ||
    team?.organizers
      ?.filter((m) => !!m)
      .map((user) => user._id)
      .includes(authUserState._id) ||
    false;
  const canDeactivate = permissionsData?.userActionAccess?.deactivate || false;

  // modal to invite new user
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [NewUserWindow, showNewUserModal] = useInviteUserModal();

  // modal for managing the team
  const [ManageWindow, showManageModal] = useWindowModal(() => {
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

    const members = data?.team?.members?.filter((m) => !!m).map((user) => user._id) || [];
    const organizers = data?.team?.organizers?.filter((m) => !!m) || [];

    const isLoading = isMutating || loading || networkStatus === NetworkStatus.refetch;

    const canManage =
      permissions?.modify ||
      data?.team?.organizers
        ?.filter((m) => !!m)
        .map((user) => user._id)
        .includes(authUserState._id) ||
      false;

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

    return {
      title: `Manage team`,
      isLoading: isLoading,
      cancelButton: error ? { text: 'Close' } : !data || !canManage ? null : undefined,
      continueButton: error
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
          },
      windowOptions: { name: 'manage team' },
      children: error ? (
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
                      color: theme.color.primary[theme.mode === 'light' ? 800 : 300],
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
                    navigate(`/profile/${organizer._id}`);
                  }}
                >
                  <ProfilePhoto src={organizer.photo || genAvatar(organizer._id)} />
                  <span>{organizer.name}</span>
                </Organizer>
              );
            })}
          </InputGroup>
        </>
      ),
    };
  }, [theme, permissions, team?._id]);

  // modal for deleting the team
  const [DeleteWindow, showDeleteModal] = useWindowModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [confirmText, setConfirmText] = useState<string>('');
    const textMatches = confirmText === `Delete ${team?.slug}`;

    const deleteTeam = async () => {
      setIsLoading(true);
      return await client
        .mutate<DELETE_TEAM__TYPE>({ mutation: DELETE_TEAM, variables: { _id: team?._id } })
        .then(() => {
          toast.success(`Successfully deleted team.`);
          navigate(`/teams`);
          return true;
        })
        .catch((error) => {
          console.error(error);
          toast.error(`Failed to delete team. \n ${error.message}`);
          return false;
        })
        .finally(() => setIsLoading(false));
    };

    return {
      title: `Delete team?`,
      isLoading: isLoading,
      continueButton: {
        text: 'Yes, Delete',
        color: 'danger',
        disabled: !textMatches,
        onClick: deleteTeam,
      },
      windowOptions: { name: `delete team`, height: 340 },
      children: (
        <>
          <div style={{ fontSize: 14, marginBottom: 16 }}>
            Danger! <strong>This cannot be undone.</strong> Users in the team will not be deleted, but users
            will not longer be able to access documents via this team.
          </div>
          <InputGroup type={`text`}>
            <Label
              htmlFor={'confirm-field'}
              description={`Type "Delete ${team?.slug}" to delete this team.`}
              disabled={isLoading}
            >
              Confirm delete
            </Label>
            <TextInput
              name={'name'}
              value={confirmText}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              isDisabled={isLoading}
            />
          </InputGroup>
        </>
      ),
    };
  }, [team]);

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
                organizers: team.organizers
                  ?.filter((m) => !!m)
                  .filter((user) => user._id !== _id)
                  .map((user) => user._id), // remove user from organizers
                members: Array.from(
                  new Set([...(team.members || []).filter((m) => !!m).map((user) => user._id), _id])
                ),
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
                organizers: Array.from(
                  new Set([...(team.organizers || []).filter((m) => !!m).map((user) => user._id), _id])
                ),
                members: team.members
                  ?.filter((m) => !!m)
                  .filter((user) => user._id !== _id)
                  .map((user) => user._id), // remove user from members
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
    (triggerRect, dropdownRef, _, { close }) => {
      return (
        <Menu
          ref={dropdownRef}
          afterClick={close}
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
            {
              label: 'Delete team',
              icon: <Delete16Regular />,
              onClick: () => showDeleteModal(),
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
              disabled: team?.members?.find((user) => user._id)?._id === props._id,
              onClick: async () => {
                if (props && props._id && props.currentRole) {
                  setRole(props._id, 'member', props.currentRole);
                }
              },
            },
            {
              label: `${props.currentRole === 'organizer' ? '✧ ' : ''}Organizer`,
              disabled: team?.organizers?.find((user) => user._id)?._id === props._id,
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
  const [RemoveUserWindow, showRemoveUserModal] = useWindowModal(() => {
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
              organizers: team?.organizers
                ?.filter((m) => !!m)
                .filter((user) => user._id !== userId)
                .map((user) => user._id), // remove user from organizers
              members: team?.members
                ?.filter((m) => !!m)
                .filter((user) => user._id !== userId)
                .map((user) => user._id), // remove user from organizers
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

    return {
      title: `Remove from team?`,
      isLoading: isLoading,
      continueButton: {
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
      },
      windowOptions: { name: 'remove from team', height: canDeactivate ? 272 : 180 },
      text: canDeactivate ? undefined : `You can re-add this user to this team if you change your mind.`,
      children: canDeactivate ? (
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
      ) : undefined,
    };
  }, [isDeactivateChecked, modalUser, team]);

  // configure app bar
  useEffect(() => {
    // set name
    dispatch(setAppName('Teams'));
    // set actions
    dispatch(
      setAppActions([
        {
          label: 'Manage team',
          type: 'button',
          icon: 'Settings24Regular',
          action: showManageModal,
        },
        {
          label: 'More team tools',
          type: 'icon',
          icon: 'MoreHorizontal24Regular',
          action: showToolsDropdown,
          onAuxClick: () => refetch(),
        },
      ])
    );
  }, [dispatch, refetch, showManageModal, showToolsDropdown]);

  return (
    <>
      {ManageWindow}
      {DeleteWindow}
      {RemoveUserWindow}
      {NewUserWindow}
      {[[]].map(() => {
        if (loading && !data) {
          // initial load only
          return (
            <ContentWrapper theme={theme} key={0}>
              <p>Loading team...</p>
            </ContentWrapper>
          );
        }

        if (error) {
          return (
            <ContentWrapper theme={theme} key={0}>
              <h2>Error loading team.</h2>
              <pre>{error.name}</pre>
              <pre>{error.message}</pre>
            </ContentWrapper>
          );
        }

        return (
          <ContentWrapper theme={theme} key={0}>
            <SectionHeading>{team?.name || `Team`}</SectionHeading>
            <UsersGrid>
              {allMembers.map((user, index) => {
                const isOrganizer =
                  team?.organizers?.filter((m) => !!m).findIndex((u) => u._id === user._id) !== -1;
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

                      <Button icon={<Person16Regular />} onClick={() => navigate(`/profile/${user._id}`)}>
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
