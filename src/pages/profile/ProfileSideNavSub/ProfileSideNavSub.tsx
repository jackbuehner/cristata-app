/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import useAxios from 'axios-hooks';
import { IProfile } from '../../../interfaces/cristata/profiles';
import { useHistory, useLocation } from 'react-router';
import Color from 'color';
import { Button } from '../../../components/Button';
import { themeType } from '../../../utils/theme/theme';
import { Chip } from '../../../components/Chip';
import { SideNavHeading } from '../../../components/Heading';

function ProfileSideNavSub() {
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme() as themeType;
  const [{ data, loading, error }] = useAxios<IProfile[]>('/users');

  if (loading)
    return (
      <>
        <SideNavHeading isLoading>Profiles</SideNavHeading>
      </>
    );
  if (error) {
    console.error(error);
    return <span>Error: {error.code}</span>;
  }
  if (data) {
    // if the current user ID is available, navigate to that profile ifno other profile is selected
    const currentUser = localStorage.getItem('auth.user');
    const currentUser_id: string | undefined = currentUser ? JSON.parse(currentUser)._id : undefined;
    if (currentUser_id && location.pathname === ('/profile' || '/profile/')) {
      history.push(`/profile/${currentUser_id}`);
    }
    return (
      <>
        <SideNavHeading>Profiles</SideNavHeading>
        {data.map((profile: IProfile, index: number) => {
          return (
            <Button
              key={index}
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
              onClick={() => history.push(`/profile/${profile._id}`)}
              customIcon={
                <img
                  src={profile.photo || 'https://avatars.githubusercontent.com/u/69555023'}
                  alt={``}
                  css={css`
                    width: 36px;
                    height: 36px;
                    border-radius: ${theme.radius};
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
                <div>
                  {profile.teams.map((team, index) => {
                    return <Chip key={index} label={`${team}`} color={'neutral'} />;
                  })}
                </div>
              </div>
            </Button>
          );
        })}
      </>
    );
  }
  return null;
}

export { ProfileSideNavSub };
