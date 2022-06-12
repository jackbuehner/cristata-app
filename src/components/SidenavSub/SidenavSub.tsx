import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import Color from 'color';
import { Dispatch, SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { IGridCols } from '../../App';
import { useNavigationConfig } from '../../hooks/useNavigationConfig';
import { themeType } from '../../utils/theme/theme';

const SidenavSubComponent = styled.div<{
  theme: themeType;
  gridCols: IGridCols;
  isHome: boolean;
  isNavVisible: boolean;
  isCustomTitlebarVisible: boolean;
}>`
  width: ${({ gridCols, isHome }) => (isHome ? 0 : gridCols.sideSub)}px;
  background: ${({ theme, isCustomTitlebarVisible }) => {
    if (theme.mode === 'light') {
      if (isCustomTitlebarVisible) return Color(theme.color.primary[100]).lighten(0.04).string();
      return 'white';
    }
    return theme.color.neutral.dark[100];
  }};
  border-right: 1px solid
    ${({ theme }) => (theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[200])};
  overflow-x: hidden;
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  height: 100%;
  ${({ isCustomTitlebarVisible, theme }) =>
    isCustomTitlebarVisible
      ? `box-shadow: ${Color(theme.color.primary[800])
          .alpha(0.05)
          .string()} 0px 2px 4px 1px, rgb(0 0 0 / 5%) 0px 8px 16px -4px;`
      : ``}
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
  const [mainNav] = useNavigationConfig('main');

  const isCollapsedAtPath: boolean | undefined =
    mainNav?.find((item) => item.to === location.pathname)?.subNav === 'forceCollapseForRoute';

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  return (
    <SidenavSubComponent
      theme={theme}
      gridCols={gridCols}
      isHome={isCollapsedAtPath}
      isNavVisible={isNavVisibleM}
      isCustomTitlebarVisible={isCustomTitlebarVisible}
    >
      {children}
    </SidenavSubComponent>
  );
}

export { SidenavSub };
