import { ApolloError, useApolloClient } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Checkbox } from '../../../components/Checkbox';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { TextArea } from '../../../components/TextArea';
import { TextInput } from '../../../components/TextInput';
import {
  DEACTIVATE_USER,
  DEACTIVATE_USER__TYPE,
  MUTATE_PROFILE,
  MUTATE_PROFILE__TYPE,
} from '../../../graphql/queries';
import { useWindowModal } from '../../../hooks/useWindowModal';

interface ProfileData {
  _id: string;
  name: string;
  email?: string;
  phone?: number;
  twitter?: string;
  biography?: string;
  current_title?: string;
  retired?: boolean;
}

function useEditProfileModal(data: ProfileData | undefined, canManage: boolean, refetch: () => Promise<void>) {
  const theme = useTheme();
  const navigate = useNavigate();
  const client = useApolloClient();

  const [fieldData, setFieldData] = useState({
    name: data?.name,
    email: data?.email,
    phone: data?.phone,
    twitter: data?.twitter,
    biography: data?.biography,
    current_title: data?.current_title,
    retired: data?.retired,
  });

  useEffect(() => {
    if (data?._id) {
      setFieldData({
        name: undefined,
        email: undefined,
        phone: undefined,
        twitter: undefined,
        biography: undefined,
        current_title: undefined,
        retired: undefined,
      });
    }
  }, [data?._id]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * When the user types in the field, update `fieldData` in state
   */
  const handleFieldChange = (newValue: string | boolean | number | null, field: string) => {
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
          _id: data?._id,
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
        } else if (res.data?.userDeactivate.retired === true || res.data?.userDeactivate.retired === false) {
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

  return useWindowModal(() => {
    return {
      title: data?.name || `Edit profile`,
      isLoading: isLoading,
      continueButton: {
        text: 'Save',
        onClick: async () => {
          setIsLoading(true);
          if (data && data.retired !== fieldData.retired) await deactivate(data._id);
          const updateStatus = await updateProfileData();
          setIsLoading(false);
          // return whether the action was successful
          if (updateStatus === true) return true;
          return false;
        },
      },
      windowOptions: { name: 'edit profile', height: 800 },
      children: data ? (
        <>
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
                  value={fieldData.name !== undefined ? fieldData.name : data.name}
                  onChange={(e) => handleFieldChange(e.currentTarget.value, `name`)}
                />
              </InputGroup>
              <InputGroup type={`text`}>
                <Label
                  htmlFor={`email-field`}
                  description={`The user's email. Try to only use your organizaion's email domain.`}
                >
                  Email
                </Label>
                <TextInput
                  name={`email-field`}
                  id={`email-field`}
                  value={fieldData.email !== undefined ? fieldData.email : data.email}
                  onChange={(e) => handleFieldChange(e.currentTarget.value, `email`)}
                />
              </InputGroup>
            </>
          ) : null}
          <InputGroup type={`text`}>
            <Label
              htmlFor={`phone-field`}
              description={`Add your number so coworkers can contact you about your work. It is only available to users with Cristata accounts.`}
            >
              Phone
            </Label>
            <TextInput
              name={`phone-field`}
              id={`phone-field`}
              value={(() => {
                const value = fieldData.phone !== undefined ? fieldData.phone : data.phone;
                return value === undefined || value === 0 ? '' : `${value}`;
              })()}
              onChange={(e) => handleFieldChange(parseInt(e.currentTarget.value) || null, `phone`)}
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
              value={(() => {
                const value = fieldData.twitter !== undefined ? fieldData.twitter : data.twitter;
                return value === undefined || value === null ? '' : `@${value}`;
              })()}
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
              value={fieldData.biography !== undefined ? fieldData.biography : data.biography}
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
                  value={fieldData.current_title !== undefined ? fieldData.current_title : data.current_title}
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
                  isChecked={(() => {
                    const value = fieldData.retired !== undefined ? fieldData.retired : data.retired;
                    return value === undefined || value === null ? false : value;
                  })()}
                  onChange={(e) => handleFieldChange(e.currentTarget.checked, `retired`)}
                />
              </InputGroup>
            </>
          ) : null}
          <Note theme={theme}>To change other fields, contact an administrator for your organization.</Note>
          <Note theme={theme}>
            Team memberships can be managed with the{' '}
            <a
              href={`/teams`}
              style={{
                color: theme.color.primary[theme.mode === 'light' ? 800 : 300],
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/teams`);
              }}
            >
              teams manager
            </a>
            .
          </Note>
        </>
      ) : undefined,
    };
  });
}

const Note = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-weight: 400;
  text-decoration: none;
  line-height: 20px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
`;

export { useEditProfileModal };
