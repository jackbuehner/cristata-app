import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import { IGridCols } from '../../App';
import { themeType } from '../../utils/theme/theme';

const SidenavSubComponent = styled.div<{ theme: themeType; gridCols: IGridCols; isHome: boolean }>`
  width: ${({ gridCols, isHome }) => (isHome ? 0 : gridCols.sideSub)}px;
  background: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  border-right: ${({ gridCols, isHome }) => (isHome ? 0 : gridCols.sideSub > 0 ? 1 : 0)}px solid
    ${({ theme }) => (theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300])};
  overflow-x: hidden;
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  height: 100%;
`;

interface ISubnavSub {
  gridCols: IGridCols;
  children: React.ReactNode;
}

function SidenavSub({ gridCols, children }: ISubnavSub) {
  const theme = useTheme() as themeType;
  const location = useLocation();

  return (
    <SidenavSubComponent theme={theme} gridCols={gridCols} isHome={location.pathname === '/'}>
      {children}
    </SidenavSubComponent>
  );
}

export { SidenavSub };
