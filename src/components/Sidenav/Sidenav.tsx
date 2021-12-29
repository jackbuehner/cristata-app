import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  Home32Regular,
  ContentView32Regular,
  Send28Regular,
  Board28Regular,
  Person32Regular,
  ChevronLeft24Regular,
  PeopleTeam28Regular,
} from '@fluentui/react-icons';
import { Dispatch, SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { IGridCols } from '../../App';
import { themeType } from '../../utils/theme/theme';
import { SideNavMainButton } from '../Button';
import { features as featuresConfig } from '../../config';
import { navigation as navigationConfig } from '../../config';

interface ISidenav {
  gridCols: IGridCols;
  toggleSideNavSub: () => void;
  isNavVisibleM: [boolean, Dispatch<SetStateAction<boolean>>];
}

function Sidenav(props: ISidenav) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const [, setIsNavVisibleM] = props.isNavVisibleM;

  return (
    <SidenavComponent theme={theme} gridCols={props.gridCols}>
      <SideNavMainButton Icon={<Home32Regular />} to={`/`} onClick={() => setIsNavVisibleM(false)}>
        Home
      </SideNavMainButton>
      {featuresConfig['cms'] ? (
        <SideNavMainButton
          Icon={<ContentView32Regular />}
          to={
            // use `to` from first CMS page that is not hidden
            navigationConfig.cms
              .filter((group) => {
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
      {featuresConfig['plans'] ? (
        <SideNavMainButton Icon={<Board28Regular />} to={`/plans`} setIsNavVisibleM={setIsNavVisibleM}>
          Plans
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
      <SideNavMainButton
        Icon={<ChevronLeft24Regular />}
        onClick={() => props.toggleSideNavSub()}
        cssExtra={css`
          display: ${location.pathname === '/' ? 'none' : 'flex'};
          @media (max-width: 600px) {
            display: none;
          }
          position: absolute;
          bottom: 0;
          height: 50px;
          svg {
            transform: ${props.gridCols.sideSub > 0 ? `rotate(0deg)` : `rotate(180deg)`};
            transition: transform 200ms;
          }
        `}
      >
        {' '}
      </SideNavMainButton>
    </SidenavComponent>
  );
}

const SidenavComponent = styled.div<{ theme: themeType; gridCols: IGridCols }>`
  display: flex;
  flex-direction: column;
  width: ${({ gridCols }) => gridCols.side}px;
  height: 100%;
  background: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  border-right: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
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

export { Sidenav };
