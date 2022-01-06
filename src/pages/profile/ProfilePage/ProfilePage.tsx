import { ApolloError, gql, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import Color from 'color';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { Chip } from '../../../components/Chip';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { PlainModal } from '../../../components/Modal';
import { PageHead } from '../../../components/PageHead';
import { TextArea } from '../../../components/TextArea';
import { TextInput } from '../../../components/TextInput';
import { client } from '../../../graphql/client';
import {
  DEACTIVATE_USER,
  DEACTIVATE_USER__TYPE,
  MUTATE_PROFILE,
  MUTATE_PROFILE__TYPE,
  PROFILE,
  PROFILE__TYPE,
  REINVITE_USER,
  REINVITE_USER__TYPE,
} from '../../../graphql/queries';
import { getPasswordStatus } from '../../../utils/axios/getPasswordStatus';
import { genAvatar } from '../../../utils/genAvatar';
import { themeType } from '../../../utils/theme/theme';

function ProfilePage() {
  const theme = useTheme() as themeType;
  const history = useHistory();

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
  const canEdit =
    permissions?.modify || profile_id === JSON.parse(localStorage.getItem('auth.user') as string)?._id;
  const canManage = (permissions?.modify && permissions?.deactivate) || false;

  // set document title
  useEffect(() => {
    document.title = `${profile?.name ? profile.name + ' - ' : ''} Profile - Cristata`;
  }, [profile?.name]);

  const [showEditModal, hideEditModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [fieldData, setFieldData] = useState({
      name: profile?.name,
      email: profile?.email,
      phone: profile?.phone,
      twitter: profile?.twitter,
      biography: profile?.biography,
      current_title: profile?.current_title,
      retired: profile?.retired,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * When the user types in the field, update `fieldData` in state
     */
    const handleFieldChange = (newValue: string | boolean, field: string) => {
      setFieldData({
        ...fieldData,
        [field]: newValue,
      });
    };

    /**
     * Update the user data by posting it to the API.
     *
     * @returns `true` if there were no errors; An `ApolloError` type if there was an error
     */
    const updateProfileData = async (): Promise<true | ApolloError> => {
      return await client
        .mutate<MUTATE_PROFILE__TYPE>({
          mutation: MUTATE_PROFILE,
          variables: {
            _id: profile?._id,
            input: { ...fieldData, retired: undefined },
          },
        })
        .then(async (): Promise<true> => {
          if (refetch) await refetch(); // refetch the profile so that it includes the new data
          return true;
        })
        .catch((err: ApolloError): ApolloError => {
          console.error(err);
          toast.error(`Failed to update profile. \n ${err.message}`);
          return err;
        });
    };

    /**
     * Deactivate a given user.
     * @param userId
     * @returns whether the user was successfully deactivated
     */
    const deactivate = async (userId: string) => {
      return await client
        .mutate<DEACTIVATE_USER__TYPE>({
          mutation: DEACTIVATE_USER,
          variables: { _id: userId, deactivate: fieldData.retired || false },
        })
        .then((res) => {
          if (res.errors?.[0]) {
            console.error(res.errors[0]);
            toast.error(`Failed to deactivate user. \n ${res.errors[0].message}`);
          } else if (res.data?.userDeactivate.retired === true) {
            return true;
          }
          toast.error(`Failed to deactivate user.`);
          return false;
        })
        .catch((error) => {
          console.error(error);
          toast.error(`Failed to deactivate user. \n ${error.message}`);
          return false;
        });
    };

    if (data) {
      return (
        <PlainModal
          hideModal={hideEditModal}
          title={profile?.name || `Edit profile`}
          continueButton={{
            text: 'Save',
            onClick: async () => {
              setIsLoading(true);
              const updateStatus = await updateProfileData();
              if (profile && profile.retired !== fieldData.retired) await deactivate(profile._id);
              setIsLoading(false);
              // return whether the action was successful
              if (updateStatus === true) return true;
              return false;
            },
          }}
          isLoading={isLoading}
        >
          {canManage ? (
            <>
              <InputGroup type={`text`}>
                <Label
                  htmlFor={`name-field`}
                  description={`The name of this user. This does not change the username or slug.`}
                >
                  Name
                </Label>
                <TextInput
                  name={`name-field`}
                  id={`name-field`}
                  value={fieldData.name}
                  onChange={(e) => handleFieldChange(e.currentTarget.value, `name`)}
                />
              </InputGroup>
              <InputGroup type={`text`}>
                <Label
                  htmlFor={`email-field`}
                  description={`The user's email. Try to use an @furman or @thepaladin.news email address.`}
                >
                  Email
                </Label>
                <TextInput
                  name={`email-field`}
                  id={`email-field`}
                  value={fieldData.email}
                  onChange={(e) => handleFieldChange(e.currentTarget.value, `email`)}
                />
              </InputGroup>
            </>
          ) : null}
          <InputGroup type={`text`}>
            <Label
              htmlFor={`phone-field`}
              description={`Add your number so managing editors of the newspaper can contact you about your work. It is only available to users with Cristata accounts.`}
            >
              Phone
            </Label>
            <TextInput
              name={`phone-field`}
              id={`phone-field`}
              value={`${fieldData.phone === undefined ? '' : fieldData.phone}`}
              onChange={(e) => handleFieldChange(e.currentTarget.value, `phone`)}
              type={`number`}
            />
          </InputGroup>
          <InputGroup type={`text`}>
            <Label htmlFor={`twitter-field`} description={`Let everyone know where to follow you.`}>
              Twitter
            </Label>
            <TextInput
              name={`twitter-field`}
              id={`twitter-field`}
              value={
                fieldData.twitter === undefined || fieldData.twitter === null ? '' : `@${fieldData.twitter}`
              }
              onChange={(e) => handleFieldChange(e.currentTarget.value.replace(`@`, ``), `twitter`)}
            />
          </InputGroup>
          <InputGroup type={`text`}>
            <Label
              htmlFor={`bio-field`}
              description={`A short biography highlighting accomplishments and qualifications. It should be in paragraph form and written in the third person.`}
            >
              Biography
            </Label>
            <TextArea
              name={`bio-field`}
              id={`bio-field`}
              value={fieldData.biography}
              theme={theme}
              rows={8}
              onChange={(e) => handleFieldChange(e.currentTarget.value, `biography`)}
            />
          </InputGroup>
          {canManage ? (
            <>
              <InputGroup type={`text`}>
                <Label htmlFor={`title-field`} description={`The position or job title for the user.`}>
                  Title
                </Label>
                <TextInput
                  name={`title-field`}
                  id={`title-field`}
                  value={fieldData.current_title}
                  onChange={(e) => handleFieldChange(e.currentTarget.value, `current_title`)}
                />
              </InputGroup>
              <InputGroup type={`checkbox`}>
                <Label htmlFor={`deactivate-field`} description={`Whether this user can sign in to Cristata.`}>
                  Deactivated
                </Label>
                <Checkbox
                  name={'deactivate-field'}
                  id={'deactivate-field'}
                  isChecked={fieldData.retired}
                  onChange={() => handleFieldChange(!fieldData.retired, `retired`)}
                />
              </InputGroup>
            </>
          ) : null}
          <Note theme={theme}>To change other fields, contact a Managing Editor.</Note>
          <Note theme={theme}>
            Team memberships can be managed with the{' '}
            <a
              href={`/teams`}
              onClick={(e) => {
                e.preventDefault();
                history.push(`/teams`);
              }}
            >
              teams manager
            </a>
            .
          </Note>
        </PlainModal>
      );
    }
    return null;
  }, [data]);

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

  return (
    <>
      <PageHead
        title={`Profile: ${profile?.name || `Profile viewer`}`}
        description={profile?.email || `contact@thepaladin.news`}
        isLoading={loading}
        buttons={<>{canEdit ? <Button onClick={showEditModal}>Edit</Button> : null}</>}
      />
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
                  <Button
                    onClick={() =>
                      window.open(
                        `https://teams.microsoft.com/l/chat/0/0?users=${
                          profile.email!.split('@')[0]
                        }@furman.edu`
                      )
                    }
                  >
                    Message
                  </Button>
                ) : null}
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
            <Item theme={theme}>{profile?.phone}</Item>
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
                    onClick={() => history.push(`/teams/${team._id}`)}
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
  margin: 20px 0px 0px;
  align-items: center;
`;

const Photo = styled.img<{ theme: themeType; retired: boolean }>`
  width: 92px;
  height: 92px;
  border: 0px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  border-radius: ${({ theme }) => theme.radius};
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

const Note = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-weight: 400;
  text-decoration: none;
  line-height: 20px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
`;

const Notice = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  background-color: ${({ theme }) => Color(theme.color.orange[800]).lighten(0.64).hex()};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  padding: 10px 20px;
  position: sticky;
  top: -20px;
  margin: -20px 0 20px -20px;
  width: 100%;
  z-index: 99;
`;

export { ProfilePage };
