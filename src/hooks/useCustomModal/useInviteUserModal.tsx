import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import { useModal } from 'react-modal-hook';
import { toast } from 'react-toastify';
import { InputGroup } from '../../components/InputGroup';
import { Label } from '../../components/Label';
import { PlainModal } from '../../components/Modal';
import { TextInput } from '../../components/TextInput';
import { CREATE_USER, CREATE_USER__TYPE } from '../../graphql/queries';
import { slugify } from '../../utils/slugify';

/**
 * Use a modal for inviting a new user.
 */
function useInviteUserModal() {
  const client = useApolloClient();

  // create the modal
  const [showModal, hideModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [name, setName] = useState<string>();
    const username = slugify(name || '', '.');
    const slug = slugify(name || '');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [email, setEmail] = useState<string>();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [phone, setPhone] = useState<string>();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [title, setTitle] = useState<string>();

    /**
     * Creates a new user.
     */
    const create = async (): Promise<boolean> => {
      setIsLoading(true);
      return await client
        .mutate<CREATE_USER__TYPE>({
          mutation: CREATE_USER,
          variables: {
            name,
            username,
            slug,
            email,
            current_title: title,
            phone,
          },
        })
        .then((res) => {
          if (res.data?.userCreate._id) {
            toast.success(`Sent the user an invitation.`);
            return true;
          }
          return false;
        })
        .catch((error) => {
          console.error(error);
          toast.error(`Failed to create user account. \n ${error.message}`);
          return false;
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    return (
      <PlainModal
        hideModal={hideModal}
        title={`Invite new user`}
        isLoading={isLoading}
        continueButton={{
          text: `Invite`,
          onClick: async () => {
            return await create();
          },
        }}
      >
        <>
          <InputGroup type={`text`}>
            <Label
              htmlFor={'name'}
              disabled={isLoading}
              description={`The name of the person you want to invite. A username will be automatically generated based on this name.<div style="margin-top: 6px;">Username: ${username}</div><div>Slug: ${slug}</div>`}
            >
              Name
            </Label>
            <TextInput
              name={'name'}
              id={'name'}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              isDisabled={isLoading}
            />
          </InputGroup>
          <InputGroup type={`text`}>
            <Label
              htmlFor={'email'}
              disabled={isLoading}
              description={`The email of the person to invite. The person will receive an invitation to sign in to Cristata with their new account.`}
            >
              Email
            </Label>
            <TextInput
              name={'email'}
              id={'email'}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              isDisabled={isLoading}
            />
          </InputGroup>
          <InputGroup type={`text`}>
            <Label
              htmlFor={'phone'}
              disabled={isLoading}
              description={`The phone of the person to invite. This information does not appear on the website.`}
            >
              Phone (optional)
            </Label>
            <TextInput
              name={'phone'}
              id={'phone'}
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
              type={`number`}
              isDisabled={isLoading}
            />
          </InputGroup>
          <InputGroup type={`text`}>
            <Label
              htmlFor={'title'}
              disabled={isLoading}
              description={`The person's job title.\n\n <b>Guidelines</b> \n <i>Paid Writer</i>: Writer \n <i>Unpaid writer or single-time writer</i>: Contributor \n <i>Writer with specific, recurring focus</i>: Columnist \n <i>Section editor</i>: {section name} Editor \n <i>Assistant section editor</i>: Assistant {section name} Editor \n <i>Photographer</i>: Photographer \n <i>Former Editor-in-Chief (graduated)</i>: Editor-in-Chief, {year}  \n <i>Former Editor-in-Chief (student)</i>: Editor-in-Chief Emeritus  \n <i>Social Media</i>: Social Media Manager  \n <i>Web Editor</i>: Web Editor  \n <i>Producer of printed content</i>: Print Publisher, {publication name}  \n <i>Distributor of printed content</i>: Distributer, {publication name}  \n <i>Video media director</i>: Video Media Director`}
            >
              Title
            </Label>
            <TextInput
              name={'title'}
              id={'title'}
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              isDisabled={isLoading}
            />
          </InputGroup>
        </>
      </PlainModal>
    );
  }, []);

  // return the modal
  return [showModal, hideModal];
}

export { useInviteUserModal };
