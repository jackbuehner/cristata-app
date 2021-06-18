import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import { Button, IconButton } from '../../../components/Button';
import { useParams } from 'react-router';
import useAxios from 'axios-hooks';
import { IProfile } from '../../../interfaces/cristata/profiles';
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
import { useState } from 'react';
import { AxiosError } from 'axios';
import { db } from '../../../utils/axios/db';
import { toast } from 'react-toastify';

function ProfilePage() {
  const theme = useTheme() as themeType;

  // get the url parameters from the route
  let { profile_id } =
    useParams<{
      profile_id: string;
    }>();

  const [{ data, loading, error }, refetch] = useAxios<IProfile>(`/users/${profile_id}`);

  const [showEditModal, hideEditModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [fieldData, setFieldData] = useState({
      phone: data?.phone,
      twitter: data?.twitter,
      biography: data?.biography,
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
     * @returns `true` if there were no errors; An `AxiosError` type if there was an error
     */
    const updateProfileData = async (): Promise<true | AxiosError<any>> => {
      return await db
        .patch(`/users/${profile_id}_${data?.github_id}`, {
          ...fieldData,
        })
        .then(async (): Promise<true> => {
          if (refetch) await refetch(); // refetch the profile so that it includes the new data
          setIsLoading(false);
          return true;
        })
        .catch((err: AxiosError): AxiosError => {
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
          title={data ? data.name : `Edit profile`}
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
        title={data ? `Profile: ${data.name}` : `Profile viewer`}
        description={data ? data.email || `contact@thepaladin.news` : undefined}
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
        <ContentWrapper>
          <TopBox>
            <Photo
              src={data.photo || 'https://avatars.githubusercontent.com/u/69555023'}
              alt={``}
              theme={theme}
            />
            <div>
              <Name theme={theme}>{data.name}</Name>
              <Title theme={theme}>{data.current_title || 'Employee'}</Title>
              <ButtonRow>
                {data.email ? (
                  <Button
                    onClick={() =>
                      window.open(
                        `https://teams.microsoft.com/l/chat/0/0?users=${data.email.split('@')[0]}@furman.edu`
                      )
                    }
                  >
                    Message
                  </Button>
                ) : null}
                {data.email ? (
                  <Button onClick={() => (window.location.href = `mailto:${data.email}`)}>Email</Button>
                ) : null}
                {data.phone ? (
                  <Button onClick={() => (window.location.href = `tel:${data.phone}`)}>Phone</Button>
                ) : null}
              </ButtonRow>
            </div>
          </TopBox>
          <SectionTitle theme={theme}>Contact Information</SectionTitle>
          <ItemGrid>
            <ItemLabel theme={theme}>Phone</ItemLabel>
            <Item theme={theme}>{data.phone}</Item>
            <ItemLabel theme={theme}>Email</ItemLabel>
            <Item theme={theme}>{data.email}</Item>
            <ItemLabel theme={theme}>Twitter</ItemLabel>
            <Item theme={theme}>{data.twitter ? `@${data.twitter}` : ``}</Item>
          </ItemGrid>
          <SectionTitle theme={theme}>Work Information</SectionTitle>
          <ItemGrid>
            <ItemLabel theme={theme}>Biography</ItemLabel>
            <Item theme={theme}>{data.biography}</Item>
            <ItemLabel theme={theme}>Current title</ItemLabel>
            <Item theme={theme}>{data.current_title || `Employee`}</Item>
            <ItemLabel theme={theme}>Join date</ItemLabel>
            <Item theme={theme}>
              {data.timestamps.joined_at
                ? DateTime.fromISO(data.timestamps.joined_at).toFormat(`dd LLLL yyyy`)
                : ``}
            </Item>
          </ItemGrid>
          <SectionTitle theme={theme}>Teams &amp; Groups</SectionTitle>
          {data.teams.map((team, index) => {
            return <Chip key={index} label={`${team}`} color={`neutral`} />;
          })}
          <LastEdited theme={theme}>
            Last edited on {DateTime.fromISO(data.timestamps.modified_at).toFormat(`dd LLLL yyyy 'at' h:mm a`)}
          </LastEdited>
        </ContentWrapper>
      ) : (
        <div>Something went wrong while trying retrieve this profile: {error}</div>
      )}
    </>
  );
}

const ContentWrapper = styled.div`
  padding: 20px;
  height: calc(100% - 64px);
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
  border: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
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
