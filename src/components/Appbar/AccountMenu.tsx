import { useQuery } from '@apollo/client';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { FluentIcon } from '../../components/FluentIcon';
import Color from 'color';
import { useNavigate } from 'react-router-dom';
import { ME_BASIC, ME_BASIC__TYPE } from '../../graphql/queries';
import { useDropdown } from '../../hooks/useDropdown';
import { genAvatar } from '../../utils/genAvatar';
import { themeType } from '../../utils/theme/theme';
import { Button } from '../Button';
import { Menu } from '../Menu';

interface AccountMenuProps {}

function AccountMenu(props: AccountMenuProps) {
  const { data } = useQuery<ME_BASIC__TYPE>(ME_BASIC, { fetchPolicy: 'cache-and-network' });
  const theme = useTheme() as themeType;
  const navigate = useNavigate();

  const profile = data?.me;
  const photo = profile ? profile.photo || genAvatar(profile._id) : '';

  const [showDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.top + 30,
            left: triggerRect.right - 261,
            width: 261,
          }}
          items={[
            {
              label: (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: theme.font.headline,
                      fontWeight: 500,
                      fontSize: 20,
                      color: theme.color.neutral[theme.mode][1400],
                      marginBottom: 4,
                      display: 'block',
                      textAlign: 'center',
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
                    }}
                  >
                    {profile?.email}
                  </span>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    {window.name === '' ? (
                      <Button
                        icon={<FluentIcon name={'Person24Regular'} />}
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
                    <Button
                      icon={<FluentIcon name={'SignOut24Regular'} />}
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
              ),
              noEffect: true,
              height: profile?.current_title.length > 36 ? 140 : 124,
            },
          ]}
        />
      );
    },
    [profile],
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

export { AccountMenu };
