import styled from '@emotion/styled/macro';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import { Button, IconButton } from '../../../components/Button';
import { useParams } from 'react-router';
import { PageHead } from '../../../components/PageHead';
import { Chip } from '../../../components/Chip';
import { DateTime } from 'luxon';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../../components/Modal';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { TextInput } from '../../../components/TextInput';
import { TextArea } from '../../../components/TextArea';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { genAvatar } from '../../../utils/genAvatar';
import { ApolloError, useQuery } from '@apollo/client';
import { MUTATE_PROFILE, MUTATE_PROFILE__TYPE, PROFILE, PROFILE__TYPE } from '../../../graphql/queries';
import { client } from '../../../graphql/client';

function ProfilePage() {
  const theme = useTheme() as themeType;

  // get the url parameters from the route
  let { profile_id } = useParams<{
    profile_id: string;
  }>();

  const { data, loading, error, refetch } = useQuery<PROFILE__TYPE>(PROFILE, {
    fetchPolicy: 'no-cache',
    variables: { _id: profile_id },
  });

  // set document title
  useEffect(() => {
    document.title = `${data ? data.profile.name + ' - ' : ''} Profile - Cristata`;
  }, [data]);

  const [showEditModal, hideEditModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [fieldData, setFieldData] = useState({
      phone: data?.profile.phone,
      twitter: data?.profile.twitter,
      biography: data?.profile.biography,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * When the user types in the field, update `fieldData` in state
     */
    const handleFieldChange = (newValue: string, field: string) => {
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
            _id: data?.profile._id,
            input: fieldData,
          },
        })
        .then(async (): Promise<true> => {
          if (refetch) await refetch(); // refetch the profile so that it includes the new data
          setIsLoading(false);
          return true;
        })
        .catch((err: ApolloError): ApolloError => {
          console.error(err);
          toast.error(`Failed to update profile. \n ${err.message}`);
          setIsLoading(false);
          return err;
        });
    };

    if (data) {
      return (
        <PlainModal
          hideModal={hideEditModal}
          title={data ? data.profile.name : `Edit profile`}
          continueButton={{
            text: 'Save',
            onClick: async () => {
              setIsLoading(true);
              const updateStatus = await updateProfileData();
              // return whether the action was successful
              if (updateStatus === true) return true;
              return false;
            },
          }}
          isLoading={isLoading}
        >
          <InputGroup type={`text`}>
            <Label htmlFor={`phone-field`}>Phone</Label>
            <TextInput
              name={`phone-field`}
              id={`phone-field`}
              value={`${fieldData.phone === undefined ? '' : fieldData.phone}`}
              onChange={(e) => handleFieldChange(e.currentTarget.value, `phone`)}
              type={`number`}
            />
          </InputGroup>
          <InputGroup type={`text`}>
            <Label htmlFor={`twitter-field`}>Twitter</Label>
            <TextInput
              name={`twitter-field`}
              id={`twitter-field`}
              value={fieldData.twitter === undefined ? '' : `@${fieldData.twitter}`}
              onChange={(e) => handleFieldChange(e.currentTarget.value.replace(`@`, ``), `twitter`)}
            />
          </InputGroup>
          <InputGroup type={`text`}>
            <Label htmlFor={`bio-field`}>Biography</Label>
            <TextArea
              name={`bio-field`}
              id={`bio-field`}
              value={fieldData.biography}
              theme={theme}
              rows={8}
              onChange={(e) => handleFieldChange(e.currentTarget.value, `biography`)}
            />
          </InputGroup>
          <Note theme={theme}>To change other fields, contact a Web Editor.</Note>
          <Note theme={theme}>
            Team memberships can be managed on <a href={`https://github.com/orgs/paladin-news/teams`}>GitHub</a>
            .
          </Note>
        </PlainModal>
      );
    }
    return null;
  }, [data]);

  return (
    <>
      <PageHead
        title={data ? `Profile: ${data.profile.name}` : `Profile viewer`}
        description={data ? data.profile.email || `contact@thepaladin.news` : undefined}
        isLoading={loading}
        buttons={
          <>
            <IconButton onClick={() => refetch()} icon={<ArrowClockwise24Regular />}>
              Refetch
            </IconButton>
            <Button onClick={showEditModal}>Edit</Button>
          </>
        }
      />
      {loading ? null : data ? (
        <ContentWrapper theme={theme}>
          <TopBox>
            <Photo src={data.profile.photo || genAvatar(data.profile._id)} alt={``} theme={theme} />
            <div>
              <Name theme={theme}>{data.profile.name}</Name>
              <Title theme={theme}>{data.profile.current_title || 'Employee'}</Title>
              <ButtonRow>
                {data.profile.email ? (
                  <Button
                    onClick={() =>
                      window.open(
                        `https://teams.microsoft.com/l/chat/0/0?users=${
                          data.profile.email!.split('@')[0]
                        }@furman.edu`
                      )
                    }
                  >
                    Message
                  </Button>
                ) : null}
                {data.profile.email ? (
                  <Button onClick={() => (window.location.href = `mailto:${data.profile.email}`)}>Email</Button>
                ) : null}
                {data.profile.phone ? (
                  <Button onClick={() => (window.location.href = `tel:${data.profile.phone}`)}>Phone</Button>
                ) : null}
              </ButtonRow>
            </div>
          </TopBox>
          <SectionTitle theme={theme}>Contact Information</SectionTitle>
          <ItemGrid>
            <ItemLabel theme={theme}>Phone</ItemLabel>
            <Item theme={theme}>{data.profile.phone}</Item>
            <ItemLabel theme={theme}>Email</ItemLabel>
            <Item theme={theme}>{data.profile.email}</Item>
            <ItemLabel theme={theme}>Twitter</ItemLabel>
            <Item theme={theme}>{data.profile.twitter ? `@${data.profile.twitter}` : ``}</Item>
          </ItemGrid>
          <SectionTitle theme={theme}>Work Information</SectionTitle>
          <ItemGrid>
            <ItemLabel theme={theme}>Biography</ItemLabel>
            <Item theme={theme}>{data.profile.biography}</Item>
            <ItemLabel theme={theme}>Current title</ItemLabel>
            <Item theme={theme}>{data.profile.current_title || `Employee`}</Item>
            <ItemLabel theme={theme}>Join date</ItemLabel>
            <Item theme={theme}>
              {data.profile.timestamps.joined_at
                ? DateTime.fromISO(data.profile.timestamps.joined_at).toFormat(`dd LLLL yyyy`)
                : ``}
            </Item>
          </ItemGrid>
          <SectionTitle theme={theme}>Teams &amp; Groups</SectionTitle>
          {data.profile.teams.docs.map((team) => {
            return <Chip key={team._id} label={team.slug} color={`neutral`} />;
          })}
          <LastEdited theme={theme}>
            Last edited on{' '}
            {DateTime.fromISO(data.profile.timestamps.modified_at).toFormat(`dd LLLL yyyy 'at' h:mm a`)}
          </LastEdited>
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

const Photo = styled.img<{ theme: themeType }>`
  width: 92px;
  height: 92px;
  border: 0px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  border-radius: ${({ theme }) => theme.radius};
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

export { ProfilePage };
