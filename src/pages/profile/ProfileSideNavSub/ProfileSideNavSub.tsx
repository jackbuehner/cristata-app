import { NetworkStatus, useQuery } from '@apollo/client';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ArrowClockwise20Regular,
  Call24Regular,
  CheckboxChecked20Regular,
  CheckboxUnchecked20Regular,
  Mail24Regular,
  MoreHorizontal20Regular,
  PersonAdd20Regular,
} from '@fluentui/react-icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import Color from 'color';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button, IconButton } from '../../../components/Button';
import { SideNavHeading } from '../../../components/Heading';
import { Menu } from '../../../components/Menu';
import { Offline } from '../../../components/Offline';
import type { PROFILES_BASIC__DOC_TYPE, PROFILES_BASIC__TYPE } from '../../../graphql/queries';
import { PROFILES_BASIC } from '../../../graphql/queries';
import { useInviteUserModal } from '../../../hooks/useCustomModal';
import { useDropdown } from '../../../hooks/useDropdown';
import { useAppSelector } from '../../../redux/hooks';
import { getPasswordStatus } from '../../../utils/axios/getPasswordStatus';
import { genAvatar } from '../../../utils/genAvatar';
import type { colorShade, colorType, themeType } from '../../../utils/theme/theme';

interface IProfileSideNavSub {
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}

function ProfileSideNavSub(props: IProfileSideNavSub) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme() as themeType;
  const authUserState = useAppSelector((state) => state.authUser);
  const { data, loading, error, networkStatus, refetch, fetchMore } = useQuery<PROFILES_BASIC__TYPE>(
    PROFILES_BASIC,
    { notifyOnNetworkStatusChange: true }
  );
  const tenant = location.pathname.split('/')[1];

  // dropdown/three-dot menu
  const [dropdownProfile, setDropdownProfile] = useState<PROFILES_BASIC__DOC_TYPE>(); // the profile of the menu that triggered the dropdown
  const [showDropdown] = useDropdown(
    (triggerRect, dropdownRef, _, { close }) => {
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
            onEscape={close}
            afterClick={close}
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
          onEscape={close}
          afterClick={close}
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

  // whether inactive users should be hidden
  const [hideInactive, setHideInactive] = useState<boolean>(false);

  // sidenav header dropdown
  const [showMainDropdown] = useDropdown(
    (triggerRect, dropdownRef, _, { close }) => {
      return (
        <Menu
          ref={dropdownRef}
          onEscape={close}
          afterClick={close}
          pos={{
            top: triggerRect.top - 8 - 3 * 32,
            left: triggerRect.left + triggerRect.width - 240,
            width: 240,
          }}
          items={[
            {
              label: 'Refresh',
              icon: <ArrowClockwise20Regular />,
              onClick: () => refetch(),
            },
            {
              label: 'Invite new user',
              icon: <PersonAdd20Regular />,
              onClick: () => showNewUserModal(),
            },
            {
              label: 'Hide inactive users',
              icon: hideInactive ? <CheckboxChecked20Regular /> : <CheckboxUnchecked20Regular />,
              onClick: () => setHideInactive(!hideInactive),
            },
          ]}
        />
      );
    },
    [dropdownProfile],
    true,
    true
  );

  // create/invite new user modal
  const [NewUserWindow, showNewUserModal] = useInviteUserModal();

  // navigate to the current user's profile if no other profile is selected
  useEffect(() => {
    if (location.pathname === ('/profile' || '/profile/')) {
      navigate(`/${tenant}/profile/${authUserState._id}`);
    }
  }, [authUserState._id, location, navigate]);

  if (!data && !navigator.onLine) {
    return <Offline variant={'small'} key={0} />;
  }

  if (loading && !data) return <></>;
  if (error) {
    console.error(error);
    return (
      <>
        <SideNavHeading>Profiles</SideNavHeading>
        <div style={{ fontFamily: theme.font.detail, padding: 10 }}>
          <div style={{ marginBottom: 10 }}>Error: {error?.clientErrors?.[0]?.message || error?.message}</div>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </>
    );
  }
  if (data) {
    // sort out in active users
    const filteredProfiles = data.profiles.docs.filter((profile) => (hideInactive ? !profile.retired : true));

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {NewUserWindow}
        <div
          style={{
            overflow: 'auto',
            flexGrow: 1,
            padding: '20px 0',
          }}
          ref={SideNavRef}
        >
          {filteredProfiles.map((profile, index: number) => {
            const { temporary, expired } = getPasswordStatus(profile.flags);

            return (
              <div style={{ position: 'relative', width: '100%' }} key={index}>
                <Button
                  height={`48px`}
                  width={`calc(100% - 24px)`}
                  cssExtra={css`
                    flex-direction: row;
                    font-weight: 500;
                    margin: 0 12px 2px 12px;
                    justify-content: flex-start;
                    background: ${location.pathname.indexOf(`/profile/${profile._id}`) !== -1
                      ? Color(theme.color.neutral[theme.mode][800]).alpha(0.15).string()
                      : 'unset'};
                    gap: 6px;
                    > span {
                      width: 100%;
                    }
                  `}
                  colorShade={theme.mode === 'light' ? 600 : 200}
                  backgroundColor={{ base: 'white' }}
                  border={{ base: '1px solid transparent' }}
                  onClick={() => {
                    navigate(`/${tenant}/profile/${profile._id}`);
                    if (props.setIsNavVisibleM) props.setIsNavVisibleM(false);
                  }}
                  customIcon={
                    <img
                      src={profile.photo || genAvatar(profile._id)}
                      alt={``}
                      css={css`
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
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
                          ${temporary || (expired && !profile.retired)
                            ? `color: ${theme.color.danger[800]};`
                            : ``}
                        `}
                      >
                        {profile.retired
                          ? 'RETIRED'
                          : expired
                          ? 'INVITATION EXPIRED'
                          : temporary
                          ? 'PENDING INVITATION'
                          : profile.email || 'contact@thepaladin.news'}
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
                  backgroundColor={{ base: 'transparent' }}
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            flexShrink: 0,
            padding: '0 20px',
            borderTop: `1px solid ${
              theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[200]
            }`,
          }}
        >
          {loading || networkStatus === NetworkStatus.refetch ? <Spinner theme={theme} /> : <div></div>}
          <Button onClick={showMainDropdown} onAuxClick={() => refetch()} showChevron flipChevron>
            Options
          </Button>
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
  color: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 900 : 300]} !important;
`;

export { ProfileSideNavSub };
