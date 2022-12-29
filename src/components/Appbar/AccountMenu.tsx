import { useQuery } from '@apollo/client';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Person24Regular, PersonAdd24Regular, SignOut24Regular } from '@fluentui/react-icons';
import Color from 'color';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ME_BASIC, ME_BASIC__TYPE } from '../../graphql/queries';
import { useDropdown } from '../../hooks/useDropdown';
import { useAppSelector } from '../../redux/hooks';
import { server } from '../../utils/constants';
import { genAvatar } from '../../utils/genAvatar';
import { themeType } from '../../utils/theme/theme';
import { Button } from '../Button';
import { MenuList } from '../Menu';

interface AccountMenuProps {}

function AccountMenu(props: AccountMenuProps) {
  const otherAccounts = useAppSelector((state) => state.authUser.otherUsers);
  const { data } = useQuery<ME_BASIC__TYPE>(ME_BASIC, { fetchPolicy: 'cache-and-network' });
  const theme = useTheme() as themeType;
  const navigate = useNavigate();

  const profile = data?.me;
  const photo = profile ? profile.photo || genAvatar(profile._id) : '';

  const [height, setHeight] = useState(0);

  const [showDropdown] = useDropdown(
    (triggerRect, _dropdownRef) => {
      const dropdownRef = (el: HTMLOListElement) => {
        if (el) {
          _dropdownRef(el);
          el.classList.remove('open');
          setTimeout(() => el.classList.add('open'), 10);
          console.log((el.firstElementChild as HTMLDivElement | undefined)?.offsetHeight);
          setHeight((el.firstElementChild as HTMLDivElement | undefined)?.offsetHeight || 0);
        }
      };

      return (
        <MenuList
          top={triggerRect.top + 30}
          left={triggerRect.right - 300}
          width={300}
          ref={dropdownRef}
          style={
            {
              '--height': height + 'px',
              maxHeight: `calc(100vh - ${triggerRect.top + 30}px - 16px)`,
              overflowY: 'auto',
              border: `1px solid ${theme.color.neutral[theme.mode][theme.mode === 'light' ? 300 : 400]}`,
              boxSizing: 'content-box',
            } as React.CSSProperties
          }
        >
          <div id='account-switcher-content'>
            <div
              style={{
                padding: '20px 20px 0 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img style={{ borderRadius: '50%', margin: '0 auto' }} src={photo} width={60} />
              <span
                style={{
                  fontFamily: theme.font.headline,
                  fontWeight: 500,
                  fontSize: 18,
                  color: theme.color.neutral[theme.mode][1400],
                  marginTop: 12,
                  marginBottom: 6,
                  display: 'block',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {profile?.name}
              </span>
              <span
                style={{
                  fontFamily: theme.font.headline,
                  fontWeight: 400,
                  fontSize: 12,
                  color: theme.color.neutral[theme.mode][1200],
                  display: 'block',
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 2,
                }}
              >
                {profile?.current_title || 'Employee'}
              </span>
              <span
                style={{
                  fontFamily: theme.font.headline,
                  fontWeight: 400,
                  fontSize: 12,
                  color: theme.color.neutral[theme.mode][1200],
                  display: 'block',
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 2,
                }}
              >
                {profile?.email}
              </span>
              <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                {window.name === '' ? (
                  <Button
                    icon={<Person24Regular />}
                    cssExtra={css`
                      font-weight: 400;
                      background-color: transparent;
                    `}
                    onClick={() => {
                      navigate(`/profile/${profile?._id}`);
                    }}
                  >
                    View profile
                  </Button>
                ) : null}
              </div>
            </div>

            <Divider />

            {otherAccounts ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0 20px',
                  }}
                >
                  {otherAccounts.map((acc, i) => {
                    return (
                      <OtherProfile key={i}>
                        <img
                          src={
                            `${server.location}/v3/${acc.tenant}/user-photo/${acc._id}` || genAvatar(acc._id)
                          }
                          width={40}
                        />
                        <div>
                          <div>{acc.name}</div>
                          <div>{acc.tenant}</div>
                        </div>
                      </OtherProfile>
                    );
                  })}
                </div>

                <Divider />
              </>
            ) : null}

            <div
              style={{
                marginTop: 0,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                paddingBottom: 16,
              }}
            >
              <Button
                icon={<PersonAdd24Regular />}
                cssExtra={css`
                  font-weight: 400;
                  background-color: transparent;
                `}
                onClick={() => (window.location.href = `https://${import.meta.env.VITE_AUTH_BASE_URL}`)}
                disabled={!navigator.onLine}
              >
                Add account
              </Button>
              <Button
                icon={<SignOut24Regular />}
                cssExtra={css`
                  font-weight: 400;
                  background-color: transparent;
                `}
                color={'red'}
                onClick={() => navigate(`/sign-out`)}
                disabled={!navigator.onLine}
              >
                Sign out
              </Button>
            </div>
          </div>
        </MenuList>
      );
    },
    [profile, height],
    true,
    true
  );

  return <ACCOUNT_MENU_ICON_COMPONENT theme={theme} photo={photo} onClick={showDropdown} isOpen={false} />;
}

const ACCOUNT_MENU_ICON_COMPONENT = styled.div<{ photo: string; theme: themeType; isOpen: boolean }>`
  background: url(${({ photo }) => photo});
  background-position: center;
  background-size: cover;
  width: 30px;
  height: 30px;
  border-radius: ${({ theme, isOpen }) => (isOpen ? theme.radius : '50%')};
  border: none !important;
  margin: 8px 20px 8px 15px;
  flex-grow: 0;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1.5px ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
  transition: 120ms;
  background-blend-mode: overlay;
  -webkit-app-region: no-drag;
  app-region: no-drag;
  &:hover {
    border-radius: ${({ theme }) => theme.radius};
    box-shadow: inset 0 0 0 1.5px ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 700 : 400]},
      0 0 3px 0.5px
        ${({ theme }) =>
          Color(theme.color.primary[theme.mode === 'light' ? 700 : 400])
            .darken(0.3)
            .string()};
    background-color: ${({ theme }) =>
      Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
        .alpha(0.45)
        .string()};
  }
  &:active {
    background-color: ${({ theme }) =>
      Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
        .alpha(0.7)
        .string()};
  }
`;

const OtherProfile = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 10px;
  padding: 10px 0;

  > img {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: contain;
  }

  > div {
    display: flex;
    flex-direction: column;

    > div:first-of-type {
      font-family: ${({ theme }) => theme.font.headline};
      color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
      font-size: 15px;
    }

    > div:nth-of-type(2) {
      font-family: ${({ theme }) => theme.font.detail};
      color: ${({ theme }) => theme.color.neutral[theme.mode][1100]};
      font-size: 13px;
    }
  }
`;

const Divider = styled.hr`
  width: 100%;
  height: 0;
  appearance: none;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][theme.mode === 'light' ? 300 : 400]};
  margin-block: 20px;
`;

export { AccountMenu };
