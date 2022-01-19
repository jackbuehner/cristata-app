import { useQuery } from '@apollo/client';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Person24Regular, SignOut24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { ME_BASIC, ME_BASIC__TYPE } from '../../graphql/queries';
import { useDropdown } from '../../hooks/useDropdown';
import { genAvatar } from '../../utils/genAvatar';
import { themeType } from '../../utils/theme/theme';
import { Button } from '../Button';
import { Menu } from '../Menu';

function Profile() {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();

  const { data: profiles } = useQuery<ME_BASIC__TYPE>(ME_BASIC, { fetchPolicy: 'no-cache' });

  const [showDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.top - 124 - 8,
            left: triggerRect.left,
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
                    }}
                  >
                    {profiles?.me?.name}
                  </span>
                  <span
                    style={{
                      fontFamily: theme.font.headline,
                      fontWeight: 400,
                      fontSize: 12,
                      color: theme.color.neutral[theme.mode][1200],
                    }}
                  >
                    {profiles?.me?.current_title || 'Employee'}
                  </span>
                  <span
                    style={{
                      fontFamily: theme.font.headline,
                      fontWeight: 400,
                      fontSize: 12,
                      color: theme.color.neutral[theme.mode][1200],
                    }}
                  >
                    {profiles?.me?.email}
                  </span>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <Button
                      icon={<Person24Regular />}
                      cssExtra={css`
                        font-weight: 400;
                        background-color: transparent;
                      `}
                      onClick={() => {
                        navigate(`/profile/${profiles?.me._id}`);
                      }}
                    >
                      View profile
                    </Button>
                    <Button
                      icon={<SignOut24Regular />}
                      cssExtra={css`
                        font-weight: 400;
                        background-color: transparent;
                      `}
                      color={'red'}
                      onClick={() => navigate(`/sign-out`)}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              ),
              noEffect: true,
              height: 124,
            },
          ]}
        />
      );
    },
    [profiles?.me],
    true,
    true
  );

  return (
    <Button
      height={67}
      width={67}
      cssExtra={css`
        flex-direction: column;
        font-weight: 500;
        color: ${theme.color.primary[900]};
        background: transparent;
        margin: 6px 6px 0 6px;
        @media (max-width: 600px) {
          display: none;
        }
      `}
      colorShade={600}
      backgroundColor={{ base: 'white' }}
      border={{ base: '1px solid transparent' }}
      onClick={showDropdown}
      customIcon={
        <Icon
          photo={profiles?.me.photo ? profiles.me.photo : profiles?.me ? genAvatar(profiles?.me._id) : ''}
          theme={theme}
          onClick={showDropdown}
        />
      }
      disableLabelAlignmentFix
    ></Button>
  );
}

const Icon = styled.div<{ photo: string; theme: themeType }>`
  background: url(${({ photo }) => photo});
  background-position: center;
  background-size: cover;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none !important;
  box-shadow: inset 0 0 0 1.5px ${({ theme }) => theme.color.primary[800]};
`;

export { Profile };
