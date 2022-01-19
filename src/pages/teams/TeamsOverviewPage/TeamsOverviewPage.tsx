import { NetworkStatus, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { PeopleAdd16Regular } from '@fluentui/react-icons';
import mongoose from 'mongoose';
import { Fragment, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useModal } from 'react-modal-hook';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../../components/Button';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { PlainModal } from '../../../components/Modal';
import { PageHead } from '../../../components/PageHead';
import { MultiSelect } from '../../../components/Select';
import { TeamCard } from '../../../components/TeamCard';
import { TextInput } from '../../../components/TextInput';
import { UserCard } from '../../../components/UserCard';
import { selectProfile } from '../../../config/collections/articles/selectProfile';
import { client } from '../../../graphql/client';
import {
  CREATE_TEAM,
  CREATE_TEAM__TYPE,
  TEAMS,
  TEAMS__DOC_TYPE,
  TEAMS__TYPE,
  TEAM_UNASSIGNED_USERS,
  TEAM_UNASSIGNED_USERS__TYPE,
} from '../../../graphql/queries';
import { useAppSelector } from '../../../redux/hooks';
import { getPasswordStatus } from '../../../utils/axios/getPasswordStatus';
import { genAvatar } from '../../../utils/genAvatar';
import { slugify } from '../../../utils/slugify';
import { themeType } from '../../../utils/theme/theme';

function TeamsOverviewPage() {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();

  const [showCreateModal, hideCreateModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const authUserState = useAppSelector((state) => state.authUser);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [name, setName] = useState('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [organizers, setOrganizers] = useState<string[]>([authUserState._id.toHexString()]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [members, setMembers] = useState<string[]>([]);
    const slug = slugify(name);

    const createTeam = async (): Promise<void> => {
      setIsLoading(true);
      client
        .mutate<CREATE_TEAM__TYPE>({ mutation: CREATE_TEAM, variables: { name, slug, organizers, members } })
        .then(({ data }) => {
          // stop loading
          setIsLoading(false);
          // navigate to the new document upon successful creation
          navigate(`/teams/${data?.teamCreate._id}`);
        })
        .catch((err) => {
          // stop loading
          setIsLoading(false);
          // log and show the errors
          console.error(err);
          toast.error(`Failed to create new team. \n ${err.message}`);
        });
    };

    return (
      <PlainModal
        hideModal={hideCreateModal}
        title={`New team`}
        isLoading={isLoading}
        continueButton={{
          text: 'Create',
          onClick: () => {
            createTeam();
            return false;
          },
        }}
      >
        <InputGroup type={`text`}>
          <Label htmlFor={'name'} disabled={isLoading}>
            Team name
          </Label>
          <TextInput
            name={'name'}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            isDisabled={isLoading}
          />
        </InputGroup>
        <InputGroup type={`display`}>
          <Label htmlFor={'slug'} disabled={isLoading}>
            Team slug
          </Label>
          <span style={{ opacity: 0.7 }}>{slug}&nbsp;</span>
        </InputGroup>
        <ErrorBoundary fallback={<div>Error loading field 'organizers'</div>}>
          <InputGroup type={`text`}>
            <Label
              htmlFor={'organizers'}
              description={'The people in charge of this team.'}
              disabled={isLoading}
            >
              Organizers
            </Label>
            <MultiSelect
              loadOptions={selectProfile}
              async
              val={organizers}
              onChange={(valueObjs) => {
                if (valueObjs)
                  setOrganizers(valueObjs.map((obj: { value: string; label: string }) => obj.value));
              }}
              isDisabled={isLoading}
            />
          </InputGroup>
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Error loading field 'members'</div>}>
          <InputGroup type={`text`}>
            <Label
              htmlFor={'members'}
              description={'The members of this team. Organizers are also members.'}
              disabled={isLoading}
            >
              Members
            </Label>
            <MultiSelect
              loadOptions={selectProfile}
              async
              val={members}
              onChange={(valueObjs) => {
                if (valueObjs) setMembers(valueObjs.map((obj: { value: string; label: string }) => obj.value));
              }}
              isDisabled={isLoading}
            />
          </InputGroup>
        </ErrorBoundary>
      </PlainModal>
    );
  });

  // get the teams
  const {
    data: dataTeams,
    error: errorTeams,
    loading: loadingTeams,
    networkStatus: networkStatusTeams,
  } = useQuery<TEAMS__TYPE>(TEAMS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-only',
    variables: { limit: 100 },
  });
  const teams = dataTeams?.teams.docs;

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
  const isLoading =
    loadingTeams ||
    networkStatusTeams === NetworkStatus.refetch ||
    loadingUA ||
    networkStatusUA === NetworkStatus.refetch;

  return (
    <>
      <PageHead
        title={`Teams`}
        description={`Group users to give access to features and manage team members.`}
        buttons={
          <>
            <Button onClick={showCreateModal} icon={<PeopleAdd16Regular />}>
              New team
            </Button>
          </>
        }
        isLoading={isLoading}
      />
      {[[]].map(() => {
        if (loadingTeams) {
          return <p key={0}>Loading teams...</p>;
        }

        if (errorTeams) {
          return (
            <div key={0}>
              <h2>Error loading teams.</h2>
              <pre>{errorTeams.name}</pre>
              <pre>{errorTeams.message}</pre>
            </div>
          );
        }

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
            <Group theme={theme}>
              <Heading theme={theme}>Teams</Heading>
              <TeamsGrid>
                {teams?.map((team, index) => {
                  const members: TEAMS__DOC_TYPE['members'] = Array.from(
                    new Set(
                      [...team.members, ...team.organizers].filter((m) => !!m).map((m) => JSON.stringify(m))
                    )
                  ).map((m) => JSON.parse(m)); // merge unique members and organizers
                  return (
                    <TeamCard
                      key={index}
                      name={team.name}
                      slug={team.slug}
                      members={members.map((m) => new mongoose.Types.ObjectId(m._id))}
                      href={`/teams/${team._id}`}
                    />
                  );
                })}
              </TeamsGrid>
            </Group>
            {unassignedUsers && unassignedUsers.length > 0 ? (
              <Group theme={theme}>
                <Heading theme={theme}>Active users without teams</Heading>
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
  padding: 20px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const Heading = styled.h1<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 0 0 16px 0;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  position: sticky;
  left: 0;
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, max-content));
  gap: 10px;
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, max-content));
  gap: 10px;
`;
