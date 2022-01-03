/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import { useHistory, useLocation } from 'react-router';
import Color from 'color';
import { Button, IconButton } from '../../../components/Button';
import { colorShade, colorType, themeType } from '../../../utils/theme/theme';
import { SideNavHeading } from '../../../components/Heading';
import { Call24Regular, Chat24Regular, Mail24Regular, MoreHorizontal20Regular } from '@fluentui/react-icons';
import { useDropdown } from '../../../hooks/useDropdown';
import { Menu } from '../../../components/Menu';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { genAvatar } from '../../../utils/genAvatar';
import { NetworkStatus, useQuery } from '@apollo/client';
import {
  PROFILES_BASIC,
  PROFILES_BASIC__TYPE,
  PROFILES_BASIC__DOC_TYPE,
  CREATE_USER,
  CREATE_USER__TYPE,
} from '../../../graphql/queries';
import styled from '@emotion/styled/macro';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../../components/Modal';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { TextInput } from '../../../components/TextInput';
import { slugify } from '../../../utils/slugify';
import { client } from '../../../graphql/client';
import { toast } from 'react-toastify';

interface IProfileSideNavSub {
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}

function ProfileSideNavSub(props: IProfileSideNavSub) {
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme() as themeType;
  const { data, loading, error, networkStatus, fetchMore } = useQuery<PROFILES_BASIC__TYPE>(PROFILES_BASIC);

  // dropdown/three-dot menu
  const [dropdownProfile, setDropdownProfile] = useState<PROFILES_BASIC__DOC_TYPE>(); // the profile of the menu that triggered the dropdown
  const [showDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      if (dropdownProfile) {
        // build the menu items based on the informtion available in the profile
        const items: Array<{
          label: string | React.ReactNode;
          icon?: React.ReactElement;
          onClick?: () => void;
          color?: colorType;
          colorShade?: colorShade;
        }> = [];
        if (dropdownProfile.email) {
          items.push({
            label: 'Message',
            icon: <Chat24Regular />,
            onClick: () =>
              window.open(
                `https://teams.microsoft.com/l/chat/0/0?users=${
                  dropdownProfile.email!.split('@')[0]
                }@furman.edu`
              ),
          });
          items.push({
            label: 'Email',
            icon: <Mail24Regular />,
            onClick: () => (window.location.href = `mailto:${dropdownProfile.email}`),
          });
        }
        if (dropdownProfile.phone)
          items.push({
            label: 'Phone',
            icon: <Call24Regular />,
            onClick: () => (window.location.href = `tel:${dropdownProfile.phone}`),
          });

        return (
          <Menu
            ref={dropdownRef}
            pos={{
              top: triggerRect.bottom,
              left: triggerRect.left + triggerRect.width - 240,
              width: 240,
            }}
            items={items}
          />
        );
      }

      // return an empty menu if - for some reason - the profile is not available
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left + triggerRect.width - 240,
            width: 240,
          }}
          items={[]}
        />
      );
    },
    [dropdownProfile],
    true,
    true
  );

  // create a ref for the spinner that appears when more items can be loaded
  const SpinnerRef = useRef<HTMLDivElement>(null);
  // also create a ref for the sidenav
  const SideNavRef = useRef<HTMLDivElement>(null);

  // use IntersectionObserver to detect when the load more items spinner is
  // intersecting in the sidenav, and then attempt to load more rows of the table
  useEffect(() => {
    let observer: IntersectionObserver;
    if (SpinnerRef.current && SideNavRef.current) {
      const options: IntersectionObserverInit = {
        root: SideNavRef.current,
        threshold: 0.75, // require at least 75% intersection
      };
      const callback: IntersectionObserverCallback = (entries, observer) => {
        entries.forEach((spinner) => {
          if (spinner.isIntersecting && !loading && networkStatus !== NetworkStatus.refetch) {
            // make spinner visible
            if (SpinnerRef.current) SpinnerRef.current.style.opacity = '1';
            // fetch more rows of data
            if (data?.profiles?.hasNextPage) {
              fetchMore({
                variables: {
                  page: data.profiles.nextPage,
                },
              });
            }
          } else {
            // make spinner invisible until it is intersecting enough
            if (SpinnerRef.current) SpinnerRef.current.style.opacity = '0';
          }
        });
      };
      observer = new IntersectionObserver(callback, options);
      observer.observe(SpinnerRef.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [
    data?.profiles?.docs,
    data?.profiles?.hasNextPage,
    data?.profiles?.nextPage,
    fetchMore,
    loading,
    networkStatus,
    SpinnerRef,
    SideNavRef,
  ]);

  // create/invite new user modal
  const [showNewUserModal, hideNewUserModal] = useModal(() => {
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
        hideModal={hideNewUserModal}
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

  if (loading)
    return (
      <>
        <SideNavHeading isLoading>Profiles</SideNavHeading>
      </>
    );
  if (error) {
    console.error(error);
    return <span>Error: {error.name}</span>;
  }
  if (data) {
    // if the current user ID is available, navigate to that profile ifno other profile is selected
    const currentUser = localStorage.getItem('auth.user');
    const currentUser_id: string | undefined = currentUser ? JSON.parse(currentUser)._id : undefined;
    if (currentUser_id && location.pathname === ('/profile' || '/profile/')) {
      history.push(`/profile/${currentUser_id}`);
    }
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <SideNavHeading>
          Profiles
          <Button
            cssExtra={css`
              position: absolute;
              top: 10px;
              right: 10px;
            `}
            onClick={showNewUserModal}
          >
            Invite
          </Button>
        </SideNavHeading>
        <div
          style={{
            overflow: 'auto',
            flexGrow: 1,
          }}
          ref={SideNavRef}
        >
          {data.profiles.docs.map((profile, index: number) => {
            return (
              <div style={{ position: 'relative', width: '100%' }} key={index}>
                <Button
                  height={`48px`}
                  width={`calc(100% - 12px)`}
                  cssExtra={css`
                    flex-direction: row;
                    font-weight: 500;
                    margin: 0 6px 2px 6px;
                    justify-content: flex-start;
                    background: ${location.pathname.indexOf(`/profile/${profile._id}`) !== -1
                      ? Color(theme.color.neutral[theme.mode][800]).alpha(0.15).string()
                      : 'unset'};
                    gap: 6px;
                    > span {
                      width: 100%;
                    }
                  `}
                  colorShade={600}
                  backgroundColor={{ base: 'white' }}
                  border={{ base: '1px solid transparent' }}
                  onClick={() => {
                    history.push(`/profile/${profile._id}`);
                    if (props.setIsNavVisibleM) props.setIsNavVisibleM(false);
                  }}
                  customIcon={
                    <img
                      src={profile.photo || genAvatar(profile._id)}
                      alt={``}
                      css={css`
                        width: 36px;
                        height: 36px;
                        border-radius: ${theme.radius};
                        ${profile.retired ? `filter: grayscale(1); opacity: 0.7;` : ``}
                      `}
                    />
                  }
                >
                  <div
                    css={css`
                      display: flex;
                      flex-direction: row;
                      gap: 6px;
                      justify-content: space-between;
                      width: 100%;
                      ${profile.retired ? `filter: grayscale(1); opacity: 0.7;` : ``}
                    `}
                  >
                    <div
                      css={css`
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                      `}
                    >
                      <span>{profile.name}</span>
                      <span
                        css={css`
                          font-size: 12px;
                        `}
                      >
                        {profile.email || 'contact@thepaladin.news'}
                      </span>
                    </div>
                  </div>
                </Button>
                <IconButton
                  icon={<MoreHorizontal20Regular />}
                  cssExtra={css`
                    position: absolute;
                    right: 15px;
                    top: 9px;
                  `}
                  onClick={(e) => {
                    setDropdownProfile(profile);
                    showDropdown(e);
                  }}
                />
              </div>
            );
          })}
          {data?.profiles?.hasNextPage ? (
            <div ref={SpinnerRef}>
              <Spinner theme={theme} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
  return null;
}

const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 20px !important;
  height: 20px !important;
  margin: 10px;
  font-family: ${({ theme }) => theme.color.primary[900]} !important;
`;

export { ProfileSideNavSub };
