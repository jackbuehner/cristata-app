import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Home32Regular,
  ContentView32Regular,
  Send28Regular,
  Board28Regular,
  Person32Regular,
  ChevronLeft24Regular,
} from '@fluentui/react-icons';
import { useLocation } from 'react-router-dom';
import { IGridCols } from '../../App';
import { themeType } from '../../utils/theme/theme';
import { SideNavMainButton } from '../Button';

interface ISidenav {
  gridCols: IGridCols;
  toggleSideNavSub: () => void;
}

function Sidenav(props: ISidenav) {
  const theme = useTheme() as themeType;
  const location = useLocation();

  return (
    <SidenavComponent theme={theme} gridCols={props.gridCols}>
      <SideNavMainButton Icon={<Home32Regular />} to={`/`}>
        Home
      </SideNavMainButton>
      <SideNavMainButton Icon={<ContentView32Regular />} to={`/cms/articles/in-progress`}>
        CMS
      </SideNavMainButton>
      <SideNavMainButton Icon={<Send28Regular />} to={`/chat`}>
        Messages
      </SideNavMainButton>
      <SideNavMainButton Icon={<Board28Regular />} to={`/plans`}>
        Plans
      </SideNavMainButton>
      <SideNavMainButton Icon={<Person32Regular />} to={`/profile`}>
        Profiles
      </SideNavMainButton>
      <SideNavMainButton
        Icon={<ChevronLeft24Regular />}
        onClick={() => props.toggleSideNavSub()}
        cssExtra={css`
          display: ${location.pathname === '/' ? 'none' : 'flex'};
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
  width: ${({ gridCols }) => gridCols.side}px;
  height: 100%;
  background: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  border-right: 1px solid
    ${({ theme }) => (theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300])};
`;

export { Sidenav };
