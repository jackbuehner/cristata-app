import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  Home32Regular,
  ContentView32Regular,
  Send28Regular,
  Person32Regular,
  ChevronLeft24Regular,
  PeopleTeam28Regular,
  DataUsage24Regular,
  Play24Regular,
} from '@fluentui/react-icons';
import { Dispatch, SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { IGridCols } from '../../App';
import { themeType } from '../../utils/theme/theme';
import { SideNavMainButton } from '../Button';
import { features as featuresConfig } from '../../config';
import { getNavigationConfig } from '../../config';
import Color from 'color';
import { Profile } from './Profile';
import { useAppSelector } from '../../redux/hooks';

interface ISidenav {
  gridCols: IGridCols;
  toggleSideNavSub: () => void;
  isNavVisibleM: [boolean, Dispatch<SetStateAction<boolean>>];
}

function Sidenav(props: ISidenav) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const authUserState = useAppSelector((state) => state.authUser);
  const [, setIsNavVisibleM] = props.isNavVisibleM;

  return (
    <SidenavComponent theme={theme} gridCols={props.gridCols}>
      <LogoSvg
        theme={theme}
        xmlns='http://www.w3.org/2000/svg'
        width='41.57'
        height='48'
        viewBox='0 0 31.1775 36'
      >
        <path d='m28.1553 10.7445-8.1515-4.7059v12.7647l8.1515-4.7059zM7.4376 8.1969l11.0557 6.3824V5.1667l-2.9039-1.676ZM12.683 30.8327l2.9064 1.677 8.081-4.665-10.9852-6.3409zM25.182 26.9724l2.9736-1.7166v-9.4132l-11.1275 6.424zM5.9264 9.0687l-2.903 1.6758-.0006 9.412 11.0544-6.3825zM3.0229 25.2555l8.1495 4.704.0028-12.764-8.1521 4.706z' />
        <path d='M15.589 0 .0006 8.9998 0 27.0002 15.5886 36l15.5885-8.9998V8.9998zm14.0775 26.1277L15.5897 34.255l-14.078-8.1273.0005-16.2554L15.5896 1.745l14.0767 8.1273z' />
      </LogoSvg>
      <SideNavMainButton Icon={<Home32Regular />} to={`/`} onClick={() => setIsNavVisibleM(false)}>
        Home
      </SideNavMainButton>
      {featuresConfig['cms'] ? (
        <SideNavMainButton
          Icon={<ContentView32Regular />}
          to={
            // use `to` from first CMS page that is not hidden
            getNavigationConfig(authUserState)
              .cms.filter((group) => {
                const enabledGroupItems = group.items.filter((item) => item.isHidden !== true);
                return enabledGroupItems.length !== 0;
              })[0]
              .items.filter((item) => item.isHidden !== true)[0].to
          }
          setIsNavVisibleM={setIsNavVisibleM}
        >
          CMS
        </SideNavMainButton>
      ) : null}
      {featuresConfig['messages'] ? (
        <SideNavMainButton Icon={<Send28Regular />} to={`/chat`} setIsNavVisibleM={setIsNavVisibleM}>
          Messages
        </SideNavMainButton>
      ) : null}
      {featuresConfig['teams'] ? (
        <SideNavMainButton Icon={<PeopleTeam28Regular />} to={`/teams`} setIsNavVisibleM={setIsNavVisibleM}>
          Teams
        </SideNavMainButton>
      ) : null}
      {featuresConfig['profiles'] ? (
        <SideNavMainButton Icon={<Person32Regular />} to={`/profile`} setIsNavVisibleM={setIsNavVisibleM}>
          Profiles
        </SideNavMainButton>
      ) : null}
      {['000000000000000000000001'].some((team) => authUserState.teams.includes(team)) ? (
        <SideNavMainButton Icon={<Play24Regular />} to={`/playground`} setIsNavVisibleM={setIsNavVisibleM}>
          API
        </SideNavMainButton>
      ) : null}
      {['000000000000000000000001'].some((team) => authUserState.teams.includes(team)) ? (
        <SideNavMainButton
          Icon={<DataUsage24Regular />}
          to={`/embed/fathom`}
          setIsNavVisibleM={setIsNavVisibleM}
        >
          Analytics
        </SideNavMainButton>
      ) : null}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
        }}
      >
        <SideNavMainButton
          Icon={<ChevronLeft24Regular />}
          onClick={() => props.toggleSideNavSub()}
          cssExtra={css`
            display: ${location.pathname === '/' ? 'none' : 'flex'};
            height: 40px;
            @media (max-width: 600px) {
              display: none;
            }
            svg {
              transform: ${props.gridCols.sideSub > 0 ? `rotate(0deg)` : `rotate(180deg)`};
              transition: transform 200ms;
            }
          `}
        >
          {' '}
        </SideNavMainButton>
        <Profile />
      </div>
    </SidenavComponent>
  );
}

const SidenavComponent = styled.div<{ theme: themeType; gridCols: IGridCols }>`
  display: flex;
  flex-direction: column;
  width: ${({ gridCols }) => gridCols.side}px;
  height: 100%;
  background: ${({ theme }) =>
    theme.mode === 'light'
      ? Color(theme.color.neutral[theme.mode][100]).lighten(0.5).string()
      : Color(theme.color.neutral[theme.mode][100]).string()};
  border-right: 1px solid;
  transition: border-color 200ms;
  border-color: ${({ theme, gridCols }) =>
    Color(theme.color.neutral[theme.mode][300])
      .alpha(gridCols.sideSub > 0 ? 0.5 : 0)
      .string()};
  @media (max-width: 600px) {
    flex-direction: row;
    justify-content: center;
    width: 100%;
    height: fit-content;
    border-right: none;
    border-top: 1px solid;
    border-color: ${({ theme }) =>
      theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
  }
`;

const LogoSvg = styled.svg<{ theme: themeType }>`
  fill: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
  width: 100%;
  height: 36px;
  padding: 38px 0 17px 0;
  @media (max-width: 600px) {
    display: none;
  }
`;

export { Sidenav };
