import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Dispatch, SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { IGridCols } from '../../App';
import { themeType } from '../../utils/theme/theme';

const SidenavSubComponent = styled.div<{
  theme: themeType;
  gridCols: IGridCols;
  isHome: boolean;
  isNavVisible: boolean;
}>`
  width: ${({ gridCols, isHome }) => (isHome ? 0 : gridCols.sideSub)}px;
  background: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100])};
  border-right: 1px solid
    ${({ theme }) => (theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300])};
  overflow-x: hidden;
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  height: 100%;
  @media (max-width: 600px) {
    width: ${({ gridCols, isHome }) => (isHome ? 0 : `100%`)};
    border-right: none;
    display: ${({ isNavVisible }) => (isNavVisible ? 'block' : 'none')};
  }
`;

interface ISubnavSub {
  gridCols: IGridCols;
  children: React.ReactNode;
  isNavVisibleM: [boolean, Dispatch<SetStateAction<boolean>>];
}

function SidenavSub({ gridCols, children, ...props }: ISubnavSub) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const [isNavVisibleM] = props.isNavVisibleM;

  return (
    <SidenavSubComponent
      theme={theme}
      gridCols={gridCols}
      isHome={location.pathname === '/'}
      isNavVisible={isNavVisibleM}
    >
      {children}
    </SidenavSubComponent>
  );
}

export { SidenavSub };
